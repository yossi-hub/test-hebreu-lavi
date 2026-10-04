const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function setup(getUserMedia) {
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.events = {}; this.style = {}; this.hidden = false; this.disabled = false; }
    append(...children) { this.children.push(...children); }
    replaceChildren() { this.children = []; }
    addEventListener(event, callback) { this.events[event] = callback; }
    setAttribute() {} removeAttribute() {} pause() {} load() {}
  }
  const tracks = [{ stopped: false, stop() { this.stopped = true; } }];
  const documentEvents = {}; const windowEvents = {};
  const nodes = [], timeouts = [], submissions = [];
  let activeContext, pendingSubmission;
  class AudioContext {
    constructor() { this.sampleRate = 48000; this.state = 'running'; activeContext = this; }
    resume() { this.resumed = true; return Promise.resolve(); }
    close() { this.state = 'closed'; return Promise.resolve(); }
    createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
    createScriptProcessor() { this.processor = { connect() {}, disconnect() {} }; return this.processor; }
    createGain() { return { gain: {}, connect() {}, disconnect() {} }; }
  }
  const sandbox = vm.createContext({
    Blob, URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} }, AudioContext,
    Float32Array, DataView, ArrayBuffer, Date, Promise, isSecureContext: true,
    navigator: { mediaDevices: { getUserMedia: getUserMedia || (async () => ({ getTracks: () => tracks })) } },
    document: { hidden: false, createElement(tag) { const node = new Element(tag); nodes.push(node); return node; },
      addEventListener(event, callback) { documentEvents[event] = callback; }, removeEventListener(event) { delete documentEvents[event]; } },
    addEventListener(event, callback) { windowEvents[event] = callback; }, removeEventListener(event) { delete windowEvents[event]; },
    setInterval: () => 1, clearInterval() {}, setTimeout(callback, milliseconds) { timeouts.push({ callback, milliseconds }); return timeouts.length; }, clearTimeout() {},
  });
  vm.runInContext(fs.readFileSync('audio-recorder.js', 'utf8'), sandbox);
  const container = new Element('div');
  const control = sandbox.createAudioAnswer(container, async blob => {
    submissions.push(blob); return pendingSubmission ? pendingSubmission : { status: 'uncertain' };
  });
  return {
    sandbox, tracks, control, nodes, timeouts, submissions, documentEvents,
    status: () => nodes.find(node => node.tag === 'p').textContent,
    button: label => nodes.find(node => node.textContent === label),
    feed() { activeContext.processor.onaudioprocess({ inputBuffer: { getChannelData: () => Float32Array.from({ length: 48000 }, (_, index) => 0.2 * Math.sin(index / 15)) } }); },
    pending(value) { pendingSubmission = value; },
  };
}

test('record, stop, replay, resubmit after uncertain; double validation makes one request', async () => {
  const ui = setup();
  await ui.button('🎙️ Enregistrer ma réponse').events.click(); ui.feed();
  assert.equal(ui.button('⏹ Arrêter').hidden, false);
  ui.button('⏹ Arrêter').events.click(); assert.equal(ui.tracks[0].stopped, true);
  assert.equal(ui.nodes.find(node => node.className === 'voice-player').hidden, false);
  assert.equal(ui.button('Valider ma réponse').hidden, false);
  let resolve; ui.pending(new Promise(done => { resolve = done; }));
  const first = ui.button('Valider ma réponse').events.click();
  const second = ui.button('Valider ma réponse').events.click();
  assert.equal(ui.submissions.length, 1); assert.equal(ui.button('Recommencer').disabled, true);
  resolve({ status: 'uncertain' }); await Promise.all([first, second]);
  assert.match(ui.status(), /Merci de réessayer/); assert.equal(ui.button('🎙️ Enregistrer ma réponse').hidden, false);
  assert.equal(ui.nodes.find(node => node.className === 'voice-player').hidden, true);
  assert.equal(ui.submissions[0].type, 'audio/wav'); assert.equal(ui.submissions[0].size, 32044);
  ui.control.dispose(); assert.deepEqual(ui.documentEvents, {});
});

test('permission denial gives instructions and can be tried again', async () => {
  let attempts = 0;
  const ui = setup(async () => { attempts += 1; throw Object.assign(new Error(), { name: 'NotAllowedError' }); });
  await ui.button('🎙️ Enregistrer ma réponse').events.click();
  assert.match(ui.status(), /microphone est refusé/); assert.equal(ui.button('🎙️ Enregistrer ma réponse').disabled, false);
  await ui.button('🎙️ Enregistrer ma réponse').events.click(); assert.equal(attempts, 2); ui.control.dispose();
});

test('recording stops at 30 seconds; backgrounding the page discards the raw recording', async () => {
  const ui = setup(); await ui.button('🎙️ Enregistrer ma réponse').events.click(); ui.feed();
  const timeout = ui.timeouts.find(item => item.milliseconds === 30000); assert.ok(timeout);
  timeout.callback(); assert.equal(ui.button('Valider ma réponse').hidden, false);
  ui.control.dispose();
  const background = setup(); await background.button('🎙️ Enregistrer ma réponse').events.click(); background.feed();
  background.sandbox.document.hidden = true; background.documentEvents.visibilitychange();
  assert.equal(background.tracks[0].stopped, true); assert.match(background.status(), /interrompu/);
  assert.equal(background.button('Valider ma réponse').hidden, true); background.control.dispose();
});

test('leaving while permission is pending releases a late microphone grant', async () => {
  let grant; const track = { stopped: false, stop() { this.stopped = true; } };
  const ui = setup(() => new Promise(resolve => { grant = resolve; }));
  const opening = ui.button('🎙️ Enregistrer ma réponse').events.click(); ui.control.dispose();
  grant({ getTracks: () => [track] }); await opening; assert.equal(track.stopped, true);
});

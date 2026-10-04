/* Capture WAV mono : même format sur Safari iPhone et sur ordinateur. */
(function (root) {
  const MAX_SECONDS = 30;
  const RETRY_MESSAGE = '🎙️ Nous n’avons pas réussi à analyser correctement votre réponse. Merci de réessayer.';
  const ICONS = {
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    play: '<path d="m8 4 12 8-12 8Z"/>',
    pause: '<path d="M8 4v16M16 4v16"/>',
    send: '<path d="m3 3 19 9-19 9 4-9-4-9ZM7 12h15"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  };
  const formatTime = seconds => {
    const time = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`;
  };
  function icon(name) {
    const element = document.createElement('span'); element.className = 'voice-icon-art'; element.setAttribute('aria-hidden', 'true');
    element.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
    return element;
  }
  function iconButton(label, name, action) {
    const element = document.createElement('button'); element.type = 'button'; element.className = 'voice-icon-button';
    element.textContent = label; element.setAttribute('aria-label', label); element.setAttribute('title', label);
    const description = document.createElement('span'); description.className = 'sr-only'; description.textContent = label;
    element.replaceChildren(icon(name), description); element.addEventListener('click', action); return element;
  }
  function waveform() {
    const element = document.createElement('span'); element.className = 'voice-waveform'; element.setAttribute('aria-hidden', 'true');
    const heights = [8, 13, 19, 11, 24, 30, 18, 10, 22, 27, 15, 8, 14, 23, 30, 19, 12, 25, 18, 10, 16, 23, 13, 7];
    heights.forEach(height => { const bar = document.createElement('i'); bar.style.height = `${height}px`; element.append(bar); });
    return element;
  }
  function createVoicePlayer(url, label) {
    const element = document.createElement('div'); element.className = 'voice-player';
    const audio = document.createElement('audio'); audio.preload = 'metadata'; audio.hidden = true;
    if (url) audio.src = url;
    const play = iconButton(label, 'play', async () => {
      if (audio.paused) { try { await audio.play(); } catch { message.textContent = 'Lecture indisponible. Réessaie.'; } }
      else audio.pause();
    });
    const timeline = document.createElement('div'); timeline.className = 'voice-timeline';
    const bars = waveform();
    const seek = document.createElement('input'); seek.type = 'range'; seek.min = '0'; seek.max = '1'; seek.step = '0.01'; seek.value = '0';
    seek.setAttribute('aria-label', 'Position du message vocal');
    const time = document.createElement('span'); time.className = 'voice-time'; time.textContent = '0:00';
    const message = document.createElement('span'); message.className = 'voice-player-error'; message.setAttribute('role', 'status');
    timeline.append(bars, seek); element.append(play, timeline, time, audio, message);
    const update = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      seek.max = String(duration || 1); seek.value = String(audio.currentTime || 0);
      seek.setAttribute('aria-valuetext', `${formatTime(audio.currentTime)} sur ${formatTime(duration)}`);
      time.textContent = formatTime(audio.currentTime || duration);
    };
    audio.addEventListener('loadedmetadata', update); audio.addEventListener('timeupdate', update);
    audio.addEventListener('play', () => { play.replaceChildren(icon('pause')); play.setAttribute('aria-label', 'Mettre le message vocal en pause'); });
    const paused = () => { play.replaceChildren(icon('play')); play.setAttribute('aria-label', label); };
    audio.addEventListener('pause', paused); audio.addEventListener('ended', paused);
    seek.addEventListener('input', () => { if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value); });
    return { element, audio, bars, time };
  }
  function createSentVoiceNote(seconds) {
    const element = document.createElement('span'); element.className = 'sent-voice-note';
    const duration = document.createElement('span'); duration.className = 'voice-time'; duration.textContent = formatTime(seconds);
    const receipt = document.createElement('span'); receipt.className = 'voice-receipt'; receipt.textContent = '✓✓'; receipt.setAttribute('aria-label', 'Message envoyé');
    element.append(icon('mic'), waveform(), duration, receipt); element.setAttribute('aria-label', `Message vocal envoyé, ${Math.round(seconds || 0)} secondes`);
    return element;
  }

  function encodeWave(chunks, sourceRate) {
    const count = Math.min(chunks.reduce((sum, chunk) => sum + chunk.length, 0), sourceRate * MAX_SECONDS);
    const samples = new Float32Array(count);
    let cursor = 0;
    for (const chunk of chunks) {
      const part = chunk.subarray(0, Math.max(0, count - cursor));
      samples.set(part, cursor); cursor += part.length;
    }
    const rate = 16000;
    const length = Math.floor(count * rate / sourceRate);
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    const tag = (offset, text) => [...text].forEach((letter, index) => view.setUint8(offset + index, letter.charCodeAt(0)));
    tag(0, 'RIFF'); view.setUint32(4, buffer.byteLength - 8, true); tag(8, 'WAVE');
    tag(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    tag(36, 'data'); view.setUint32(40, length * 2, true);
    for (let index = 0; index < length; index += 1) {
      // Moyenne des échantillons pour éviter de replier les fréquences au rééchantillonnage.
      const start = Math.floor(index * sourceRate / rate);
      const end = Math.min(count, Math.max(start + 1, Math.floor((index + 1) * sourceRate / rate)));
      let sum = 0;
      for (let pos = start; pos < end; pos += 1) sum += samples[pos];
      const value = Math.max(-1, Math.min(1, sum / (end - start)));
      view.setInt16(44 + index * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
    }
    return buffer;
  }

  function microphoneError(error) {
    if (['NotAllowedError', 'PermissionDeniedError'].includes(error.name)) return 'Le microphone est refusé. Autorise son accès dans les réglages de Safari ou de ton navigateur, puis réessaie.';
    if (error.name === 'NotFoundError') return 'Aucun microphone détecté. Connecte un microphone puis réessaie.';
    return 'Le microphone est indisponible. Vérifie qu’aucune autre application ne l’utilise, puis réessaie.';
  }

  function createAudioAnswer(container, onSubmit) {
    let stream, context, source, processor, mute, timer, stopTimer, objectUrl, blob;
    let chunks = [], captured = 0, disposed = false, recording = false, busy = false, generation = 0;
    const status = document.createElement('p'); status.className = 'voice-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const playback = createVoicePlayer('', 'Réécouter ma réponse'); const player = playback.audio; playback.element.hidden = true;
    const idle = document.createElement('span'); idle.className = 'voice-placeholder'; idle.textContent = 'Message vocal en hébreu';
    const limit = document.createElement('small'); limit.textContent = '30 s maximum'; idle.append(limit);
    const live = document.createElement('span'); live.className = 'voice-recording'; live.hidden = true;
    const light = document.createElement('span'); light.className = 'voice-recording-dot'; light.setAttribute('aria-hidden', 'true');
    const elapsed = document.createElement('span'); elapsed.className = 'voice-time'; elapsed.textContent = '0:00';
    live.append(light, elapsed, waveform());
    const start = iconButton('🎙️ Enregistrer ma réponse', 'mic', begin); start.className += ' voice-primary';
    const stop = iconButton('⏹ Arrêter', 'stop', () => finish()); stop.hidden = true; stop.className += ' voice-stop';
    const retry = iconButton('Recommencer', 'trash', () => { clearAudio(); status.textContent = ''; }); retry.hidden = true;
    const submit = iconButton('Valider ma réponse', 'send', send); submit.hidden = true; submit.className += ' voice-primary';
    const body = document.createElement('div'); body.className = 'voice-body'; body.append(idle, live, playback.element);
    const actions = document.createElement('div'); actions.className = 'voice-row'; actions.append(retry, body, start, stop, submit);
    container.replaceChildren(); container.append(actions, status);

    function clearAudio() {
      player.pause(); player.removeAttribute('src'); player.load(); playback.element.hidden = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = null; blob = null; chunks = [];
      retry.hidden = submit.hidden = true; start.hidden = false;
      live.hidden = true; idle.hidden = false;
    }
    function release() {
      clearInterval(timer); clearTimeout(stopTimer);
      if (processor) { processor.onaudioprocess = null; processor.disconnect(); }
      source?.disconnect(); mute?.disconnect(); stream?.getTracks().forEach(track => track.stop());
      if (context && context.state !== 'closed') void context.close().catch(() => {});
      stream = context = source = processor = mute = null;
    }
    async function begin() {
      if (disposed || recording || busy) return;
      document.querySelectorAll?.('.question-audio audio').forEach(audio => audio.pause());
      const ticket = ++generation;
      if (!root.isSecureContext || !root.navigator?.mediaDevices?.getUserMedia) {
        status.textContent = 'Pour enregistrer, ouvre le test en HTTPS (ou sur localhost sur ordinateur).'; return;
      }
      const AudioContextClass = root.AudioContext || root.webkitAudioContext;
      if (!AudioContextClass) { status.textContent = 'Ce navigateur ne prend pas en charge l’enregistrement audio.'; return; }
      clearAudio(); busy = true; start.disabled = true;
      status.textContent = 'Autorise le microphone pour enregistrer ta réponse…';
      try {
        // Activation pendant le clic : nécessaire pour Safari iPhone.
        context = new AudioContextClass();
        const activation = context.resume().then(() => null, error => error);
        const granted = await root.navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true }, video: false });
        if (disposed || ticket !== generation) { granted.getTracks().forEach(track => track.stop()); return; }
        stream = granted;
        const activationError = await activation;
        if (activationError) throw activationError;
        if (disposed || ticket !== generation) return;
        source = context.createMediaStreamSource(stream);
        processor = context.createScriptProcessor(4096, 1, 1);
        mute = context.createGain(); mute.gain.value = 0;
        source.connect(processor); processor.connect(mute); mute.connect(context.destination);
        captured = 0; chunks = []; recording = true;
        const rate = context.sampleRate;
        processor.onaudioprocess = event => {
          if (!recording) return;
          const input = event.inputBuffer.getChannelData(0);
          const remaining = Math.max(0, Math.floor(rate * MAX_SECONDS) - captured);
          const part = new Float32Array(input.subarray(0, remaining));
          chunks.push(part); captured += part.length;
          if (captured >= rate * MAX_SECONDS) finish();
        };
        busy = false; start.hidden = true; stop.hidden = false; idle.hidden = true; live.hidden = false;
        const startedAt = Date.now();
        const update = () => { elapsed.textContent = formatTime((Date.now() - startedAt) / 1000); status.textContent = 'Enregistrement en cours…'; };
        update(); timer = setInterval(update, 250); stopTimer = setTimeout(() => finish(), 30000);
      } catch (error) {
        if (!disposed) status.textContent = microphoneError(error);
        release();
      } finally { busy = false; start.disabled = false; }
    }
    function finish(cancel = false) {
      if (!recording) return;
      recording = false;
      const rate = context.sampleRate;
      release(); stop.hidden = true;
      if (cancel || disposed) { clearAudio(); return; }
      blob = new Blob([encodeWave(chunks, rate)], { type: 'audio/wav' }); chunks = [];
      if (blob.size <= 44) { clearAudio(); status.textContent = RETRY_MESSAGE; return; }
      objectUrl = URL.createObjectURL(blob); player.src = objectUrl; playback.element.hidden = false;
      live.hidden = true; idle.hidden = true; playback.time.textContent = formatTime((blob.size - 44) / 32000);
      retry.hidden = submit.hidden = false; start.hidden = true;
      status.textContent = 'Réécoute, puis appuie sur la flèche pour envoyer.';
    }
    async function send() {
      if (disposed || busy || !blob) return;
      busy = true; submit.disabled = retry.disabled = true; player.pause();
      status.textContent = 'Analyse de ta réponse…';
      try {
        const result = await onSubmit(blob);
        if (disposed) return;
        clearAudio();
        if (result?.status === 'correct' || result?.status === 'incorrect') {
          status.textContent = result.status === 'correct' ? '✅ Juste' : '❌ Faux'; start.hidden = true;
        } else status.textContent = RETRY_MESSAGE;
      } catch { if (!disposed) { clearAudio(); status.textContent = RETRY_MESSAGE; } }
      finally { busy = false; submit.disabled = retry.disabled = false; }
    }
    function visibilityChanged() {
      if (document.hidden && recording) { finish(true); status.textContent = 'Enregistrement interrompu. Recommence lorsque tu es prêt.'; }
    }
    document.addEventListener('visibilitychange', visibilityChanged);
    const dispose = () => {
      disposed = true; generation += 1;
      if (recording) finish(true); else release();
      clearAudio();
      document.removeEventListener('visibilitychange', visibilityChanged);
      root.removeEventListener('pagehide', dispose);
    };
    root.addEventListener('pagehide', dispose);
    return { dispose };
  }
  Object.assign(root, { createAudioAnswer, createVoicePlayer, createSentVoiceNote, encodeAudioWave: encodeWave, audioRetryMessage: RETRY_MESSAGE });
  if (typeof module !== 'undefined') module.exports = { encodeWave, microphoneError, RETRY_MESSAGE };
})(globalThis);

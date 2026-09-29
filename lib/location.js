const emptyLocation = () => ({
  country: null, countryCode: null, region: null,
  city: null, postalCode: null, timezone: null,
});

const optionalText = value => typeof value === 'string' ? value.trim().slice(0, 160) || null : null;

// Only trust Cloudflare's request metadata, never client JSON or IP headers.
export function locationFromRequest(request) {
  const location = emptyLocation();
  try {
    const cf = request.cf;
    if (!cf) return location;
    const code = optionalText(cf.country)?.toUpperCase();
    if (code && /^[A-Z]{2}$/.test(code) && !['XX', 'ZZ'].includes(code)) {
      location.countryCode = code;
      try {
        location.country = new Intl.DisplayNames(['fr'], { type: 'region', fallback: 'none' }).of(code) || null;
      } catch { /* A missing country label must not interrupt a submission. */ }
    }
    for (const key of ['region', 'city', 'postalCode', 'timezone']) {
      location[key] = optionalText(cf[key]);
    }
  } catch { /* Cloudflare metadata is optional, including in local development. */ }
  return location;
}

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

export function internalLocationHtml(location) {
  const fields = [
    ['Pays', location.country], ['Code pays', location.countryCode],
    ['Région', location.region], ['Ville', location.city],
    ['Code postal', location.postalCode], ['Fuseau horaire', location.timezone],
  ];
  return '<h3>Localisation approximative (Cloudflare)</h3><p>'
    + fields.map(([label, value]) => `${label} : ${escapeHtml(value ?? 'Non disponible')}`).join('<br>')
    + '</p><p><small>Estimation par le réseau, susceptible de refléter un VPN ou un opérateur. Aucune adresse IP enregistrée par l’application.</small></p>';
}

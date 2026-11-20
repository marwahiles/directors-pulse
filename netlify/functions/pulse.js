// Director's Pulse data endpoint.
// Checks the dashboard password, then fetches the Apps Script API with the secret key.
// Netlify environment variables: DASH_PASSWORD, PULSE_API_URL, PULSE_API_KEY

const crypto = require('crypto');

function same(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

const reply = (code, obj) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: typeof obj === 'string' ? obj : JSON.stringify(obj),
});

exports.handler = async (event) => {
  const { DASH_PASSWORD, PULSE_API_URL, PULSE_API_KEY } = process.env;
  if (!DASH_PASSWORD || !PULSE_API_URL || !PULSE_API_KEY) {
    return reply(500, { error: 'Site is missing its settings. Check the Netlify environment variables.' });
  }

  const pw = event.headers['x-pulse-password'] || '';
  if (!same(pw, DASH_PASSWORD)) {
    await new Promise(r => setTimeout(r, 400)); // slow down guessing
    return reply(401, { error: 'Wrong password' });
  }

  const q = event.queryStringParameters || {};
  const fresh = q.fresh === '1' ? '&fresh=1' : '';
  const id = q.id ? '&id=' + encodeURIComponent(String(q.id).replace(/[^0-9]/g, '')) : '';
  const url = PULSE_API_URL + '?key=' + encodeURIComponent(PULSE_API_KEY) + fresh + id;

  try {
    const res = await fetch(url, { redirect: 'follow' });
    const text = await res.text();
    if (!res.ok || text.trim().startsWith('<')) {
      return reply(502, { error: 'Could not reach the data. Check the Apps Script deployment.' });
    }
    const data = JSON.parse(text);
    if (data.error) return reply(502, { error: 'Data source said: ' + data.error });
    return reply(200, text);
  } catch (e) {
    return reply(502, { error: 'Could not reach the data: ' + e.message });
  }
};

# Director's Pulse

Next 21 days for The Astorian, Le Tesserae and Jackson & Company, with flags.

- `public/index.html`: the dashboard page
- `netlify/functions/pulse.js`: checks the password and fetches the data from Apps Script
- Data: the "Director's Pulse API" Apps Script web app (PulseApi.gs), which reads the
  "Events Data (Director's Pulse)" sheet that PulseData.gs fills every night

Netlify environment variables:
- `DASH_PASSWORD`: the dashboard password
- `PULSE_API_URL`: the Apps Script web app URL (ends in /exec)
- `PULSE_API_KEY`: the key printed by setupPulseApi()

# Scorpion Sting CRF — Mobile Data Entry App

An offline-first web app for your thesis RCT (local chloroquine vs 2% lidocaine
for scorpion sting pain). Built to run on your phone, work with zero signal,
and export straight to Excel.

## What it does

- **Guided sequential intake**: a 7-step wizard walks you through enrollment
  (Study Identifiers → Screening/Consent → Eligibility → Sting & Baseline →
  Baseline Vitals → Randomization → Intervention/T0), one screen at a time,
  matching your CRF exactly.
- **After enrollment**, each patient record opens into tabs for the parts of
  the CRF that unfold over hours: Pain (NRS timepoints), Rescue Analgesia,
  Vitals Monitoring (q30min grid), and the 12h/24h follow-up calls. Rows
  highlight in amber-red when a timepoint is due (based on elapsed time
  since T0) and green once filled.
- **Fully offline**: every field autosaves to the phone's local database
  (IndexedDB) as you type. No internet is needed to enter data, resume a
  record, or export.
- **Excel export**: "Export All to Excel" (or per-record) generates a real
  `.xlsx` file — no internet required, no external library — with sheets for
  Records, NRS_Timepoints, Rescue_Analgesia, Vitals_Monitoring, and
  FollowUp_Calls (long format, ready for stats software).
- **Optional sync**: when you're back online, "Sync Now" pushes every record
  to a Google Sheet via a small Apps Script backend, so you have a live
  backup beyond the phone.

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire app (UI + logic + offline Excel writer) |
| `manifest.json` | Makes it installable as an app icon on your home screen |
| `sw.js` | Service worker — caches the app so it loads with zero signal |
| `icon.svg` | App icon |
| `sync-backend.gs` | Paste into Google Apps Script for the optional sync |

## Setting it up on your phone

A PWA's offline install only works reliably when the files are served from a
real (HTTPS) address — opening the HTML file directly from a Files app
mostly works too, but installing to your home screen and full offline
caching are more dependable once hosted. Two free, no-signup-hassle options:

1. **GitHub Pages** (recommended, free): create a repo, upload these files,
   turn on Pages in repo settings, and you'll get a URL like
   `https://<you>.github.io/scorpion-crf/`.
2. **Netlify Drop**: go to app.netlify.com/drop and drag the folder in — it
   gives you a live URL in seconds, no account required for a quick test.

Once hosted:
1. Open the URL on your phone in Chrome (Android) or Safari (iOS).
2. Use "Add to Home Screen" — it now behaves like an installed app.
3. Open it once while online so the service worker caches everything, then
   it works with the phone in airplane mode from then on.

## Setting up sync (optional but recommended for backup)

1. Open (or create) a Google Sheet you want records backed up to.
2. Extensions → Apps Script, paste the contents of `sync-backend.gs`.
3. Deploy → New deployment → "Web app" → Execute as **Me** → Who has
   access **Anyone** → Deploy. Copy the `/exec` URL it gives you.
4. In the app, tap the gear icon → paste that URL → Save.
5. Tap "Sync Now" whenever you have signal. Each patient's record becomes
   (or updates) one row in a "MobileSync" sheet tab, so re-syncing an
   edited record just updates that row rather than duplicating it.

Sync is entirely optional — data entry, viewing, editing, and Excel export
all work with sync never configured.

## Notes on the data

- The wizard enforces the two hard required fields per CRF (Study ID,
  age, sex, baseline NRS, T0 date/time) plus flags — but doesn't block —
  exclusion criteria being checked, since edge cases sometimes need
  documenting rather than hiding.
- "Due" highlighting on the Pain and Vitals grids compares the current
  time to your recorded T0 time — no clock-syncing needed beyond that.
- Nothing leaves the phone until you tap "Sync Now" (or "Export All").

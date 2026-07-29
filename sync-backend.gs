/**
 * Paste this function into a Google Apps Script project bound to (or
 * connected to) the Google Sheet you want synced records written to,
 * then deploy it as a Web App:
 *   Deploy > New deployment > type "Web app"
 *   Execute as: Me
 *   Who has access: Anyone (needed so the phone can reach it without login)
 * Copy the resulting /exec URL into the app's Settings screen.
 *
 * Each synced record arrives as one flat-ish JSON object (see the app's
 * data model). This writes one row per Study ID to a sheet called
 * "MobileSync", creating header columns from the first record's keys
 * and updating the same row on later syncs (upsert by Study ID).
 */
function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('MobileSync');
  if (!sheet) sheet = ss.insertSheet('MobileSync');

  // Flatten nested objects (inclusion, exclusion, nrs, vitals, rescues,
  // followup) into dotted-key columns so every field gets its own column.
  const flat = flatten(payload);

  let headers = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    : [];

  // Add any new columns this record introduces.
  Object.keys(flat).forEach((k) => {
    if (headers.indexOf(k) === -1) headers.push(k);
  });
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Find existing row for this Study ID (column "id"), else append.
  const idCol = headers.indexOf('id') + 1;
  let targetRow = -1;
  if (sheet.getLastRow() > 1) {
    const ids = sheet.getRange(2, idCol, sheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === flat.id) { targetRow = i + 2; break; }
    }
  }
  if (targetRow === -1) targetRow = sheet.getLastRow() + 1;

  const row = headers.map((h) => (flat[h] !== undefined ? flat[h] : ''));
  sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);

  return ContentService.createTextOutput('OK');
}

function flatten(obj, prefix, out) {
  out = out || {};
  prefix = prefix || '';
  Object.keys(obj || {}).forEach((k) => {
    const val = obj[k];
    const key = prefix ? prefix + '.' + k : k;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      flatten(val, key, out);
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => flatten(item || {}, key + i, out));
    } else {
      out[key] = val;
    }
  });
  return out;
}

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { google } = require("googleapis");

admin.initializeApp();
const db = admin.firestore();
const SHEET_ID = functions.config().telemetry && functions.config().telemetry.sheet_id;

async function appendRowToSheet(rowArray) {
  if (!SHEET_ID) {
    console.error("SHEET_ID not set in functions config (telemetry.sheet_id).");
    return;
  }
  const auth = new google.auth.GoogleAuth({ scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "events!A1",
    valueInputOption: "RAW",
    requestBody: { values: [rowArray] }
  });
}

exports.onLogCreate = functions.firestore
  .document("logs/{logId}")
  .onCreate(async (snap, context) => {
    const data = snap.data() || {};
    const ts = data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString();
    const level = data.level || "";
    const event = data.event || "";
    const actor = data.actor || "";
    const spaceId = data.spaceId || "";
    const accessoryId = data.accessoryId || "";
    const payload = JSON.stringify(data.payload || {});
    const source = data.source || "";

    try {
      await appendRowToSheet([ts, level, event, actor, spaceId, accessoryId, payload, source]);
      console.log("Appended log to sheet:", event);
    } catch (err) {
      console.error("Error appending to sheet:", err);
    }
  });
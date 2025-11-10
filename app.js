"use strict";

require("dotenv").config(); // for .env support

// WhatsApp token (from Meta Developer Dashboard → App → WhatsApp → API setup)
const token = process.env.WHATSAPP_TOKEN;

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios").default;

const app = express().use(bodyParser.json());

// Start Server
app.listen(process.env.PORT || 10000, () => {
  console.log("Webhook server running...");
});


// ✅ POST Webhook (Incoming Messages)
app.post("/webhook", async (req, res) => {
  try {
    console.log("Incoming webhook payload:");
console.log(JSON.stringify(req.body, null, 2));

// Validate structure
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const messageObj = entry?.messages?.[0];

if (!entry || !messageObj) {
  console.log("Invalid WhatsApp structure received");
  return res.sendStatus(200);
}

const phone_number_id = entry.metadata.phone_number_id;
const from = messageObj.from;
const msg_body = messageObj.text?.body || "";

// ✅ Reply back on WhatsApp (Simple ACK)
await axios.post(
    `https://graph.facebook.com/v20.0/${phone_number_id}/messages`,
    {
      messaging_product: "whatsapp",
      to: from,
      text: { body: "Ack: " + msg_body },
    },
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
);

console.log("WhatsApp ACK sent successfully");

// ✅ Forward data to your external URL
await axios.post(
    "https://linkup:newlink_up34@linkup.software/whatsappchat-receive-message",
    { app_data: req.body },
    { headers: { "Content-Type": "application/json" } }
);

console.log("Message forwarded to your server successfully");

return res.sendStatus(200);

} catch (err) {
  console.error("Webhook error:", err.response?.data || err.message);
  return res.sendStatus(500);
}
});


// ✅ GET Webhook Verification (Meta Setup)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "9b988263f14deca34e84435b6e8e1d0e";  // ✅ MUST BE STRING

const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED SUCCESSFULLY");
    return res.status(200).send(challenge);
  } else {
    console.log("Verification token mismatch");
    return res.sendStatus(403);
  }
}

res.sendStatus(403);
});

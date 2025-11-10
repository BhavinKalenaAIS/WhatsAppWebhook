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
    if (
        req.body.object === "whatsapp_business_account" &&
  req.body.entry &&
  req.body.entry[0].changes &&
  req.body.entry[0].changes[0].value &&
  req.body.entry[0].changes[0].value.messages &&
  req.body.entry[0].changes[0].value.messages[0]
) {
  const value = req.body.entry[0].changes[0].value;
  const message = value.messages[0];
  const phone_number_id = value.metadata.phone_number_id;
  const from = message.from;
  const msg_body = message.text.body;

  // ✅ Reply to WhatsApp user (optional)
  await axios.post(
      `https://graph.facebook.com/v20.0/${phone_number_id}/messages?access_token=${WHATSAPP_TOKEN}`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: "Received: " + msg_body }
      },
      { headers: { "Content-Type": "application/json" } }
  );

  // ✅ Forward the message to your domain URL
  await axios.post(
      "https://linkup:newlink_up34@linkup.software/whatsappchat-receive-message",
      {
        app_data: req.body,
        text_message: msg_body,
        sender: from
      },
      { headers: { "Content-Type": "application/json" } }
  );

  console.log("✅ Forwarded message to your domain");
}

res.sendStatus(200);

} catch (err) {
  console.error("❌ ERROR:", err.response?.data || err.message);
  res.sendStatus(500);
}
});


// ✅ GET Webhook Verification (Meta Setup)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = 9b988263f14deca34e84435b6e8e1d0e;  // ✅ MUST BE STRING

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

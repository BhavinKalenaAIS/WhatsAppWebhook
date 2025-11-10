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
app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

// Check the Incoming webhook message
console.log(JSON.stringify(req.body, null, 2));

// info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
if (req.body.object) {
  if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
  ) {
    let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
    let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
    let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
    /*axios({
      method: "POST", // Required, HTTP method, a string, e.g. POST, GET
      url:
      "https://graph.facebook.com/v12.0/" +
      phone_number_id +
      "/messages?access_token=" +
      token,
      data: {
        messaging_product: "whatsapp",
        to: from,
        //text: { body: "Ack: " + msg_body },
      },
      headers: { "Content-Type": "application/json" },
    });*/
    axios({
      method: "POST", // Required, HTTP method, a string, e.g. POST, GET https://developer.leaddial.co/developer/tenant/whatsapp-message-receive
      url:
          "https://linkup:newlink_up34@linkup.software/whatsappchat-receive-message",
      data: {
        app_data : req.body
      },
      headers: { "Content-Type": "application/json" },
    });
    /*axios({
     method: "POST", // Required, HTTP method, a string, e.g. POST, GET https://developer.leaddial.co/developer/tenant/whatsapp-message-receive
     url:
     "https://snapit:mysnapit22@tweetstage.tweetsoftware.co/whatsappchat-receive-message",
     data: {
     app_data : req.body
     },
     headers: { "Content-Type": "application/json" },
     });*/
  }
  res.sendStatus(200);
} else {
  // Return a '404 Not Found' if event is not from a WhatsApp API
  res.sendStatus(404);
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

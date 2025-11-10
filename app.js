/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */

"use strict";

// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
const token = process.env.WHATSAPP_TOKEN;

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 10000, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    console.log("📥 Incoming Meta Webhook:");
console.log(JSON.stringify(req.body, null, 2));

// Validate structure
if (
    req.body.object !== "whatsapp_business_account" ||
    !req.body.entry ||
    !req.body.entry[0].changes ||
    !req.body.entry[0].changes[0].value
) {
  return res.sendStatus(200);
}

const value = req.body.entry[0].changes[0].value;

// Ensure messages array exists
if (!value.messages || !value.messages[0]) {
  return res.sendStatus(200);
}

const message = value.messages[0];

// ✅ Process only TEXT messages
if (message.type !== "text") {
  console.log("Non-text message received. Ignored.");
  return res.sendStatus(200);
}

const phone_number_id = value.metadata.phone_number_id;
const from = message.from;
const msg_body = message.text.body;

console.log("TEXT MESSAGE:", msg_body);
console.log("SENDER:", from);

// ✅ Reply to text
await axios.post(
    `https://graph.facebook.com/v20.0/${phone_number_id}/messages?access_token=${WHATSAPP_TOKEN}`,
    {
      messaging_product: "whatsapp",
      to: from,
      text: { body: "Received your message: " + msg_body }
    },
    { headers: { "Content-Type": "application/json" } }
);

console.log("Reply sent");

// ✅ Forward payload to your URL
await axios.post(
    "https://linkup:newlink_up34@linkup.software/whatsappchat-receive-message",
    {
      app_data: req.body,
      sender: from,
      text_message: msg_body
    },
    { headers: { "Content-Type": "application/json" } }
);

console.log("Payload forwarded to your server");

res.sendStatus(200);

} catch (err) {
  console.error("ERROR:", err.response?.data || err.message);
  res.sendStatus(500);
}
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
app.get("/webhook", (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
  **/
  const verify_token = 9b988263f14deca34e84435b6e8e1d0e;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

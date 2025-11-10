const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "9b988263f14deca34e84435b6e8e1d0e";

// ✅ 1. GET (Verification)
app.get("/webhook", (req, res) => {
  if (
      req.query["hub.mode"] === "subscribe" &&
req.query["hub.verify_token"] === VERIFY_TOKEN
) {
  return res.status(200).send(req.query["hub.challenge"]);
}
return res.sendStatus(403);
});

// ✅ 2. POST (Receive and forward)
app.post("/webhook", async (req, res) => {
  try {
    console.log("Incoming body:", JSON.stringify(req.body, null, 2));

// ✅ Extract text message
const entry = req.body.entry?.[0]?.changes?.[0]?.value;
const message = entry?.messages?.[0];

if (message && message.type === "text") {
  const msg_body = message.text.body;

  console.log("Forwarding message:", msg_body);

  // ✅ DIRECT SEND TO LINKUP — minimum structure
  await axios.post(
      "https://linkup:newlink_up34@linkup.software/whatsappchat-receive-message",
      {
        message: msg_body,
        from: message.from
      }
  );

  console.log("✅ Message forwarded successfully");
}

return res.sendStatus(200);
} catch (err) {
  console.error("Forwarding error:", err.response?.data || err);
  return res.sendStatus(500);
}
});

// ✅ Render port
app.listen(process.env.PORT || 10000, () =>
console.log("Webhook running...")
);
const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const app = express();
const port = 3000;

// Use JSON middleware to parse incoming requests
app.use(express.json());

let whatsappClient;
let isClientReady = false;

// Initialize WhatsApp Client
const initializeWhatsAppClient = () => {
  whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: "/snap/bin/chromium", // Replace with your Chromium path
    },
  });

  whatsappClient.on("qr", (qr) => {
    console.log("QR Code generated");
    qrcode.generate(qr, { small: true }, (qrCode) => {
      app.locals.qrCode = qr; // Store the QR code for API response
    });
  });

  whatsappClient.on("ready", () => {
    console.log("Client is ready!");
    isClientReady = true;
  });

  whatsappClient.on("authenticated", () => {
    console.log("Authenticated successfully!");
    app.locals.qrCode = null; // Clear the QR code after successful authentication
  });

  whatsappClient.on("auth_failure", (message) => {
    console.log("Authentication failed:", message);
    isClientReady = false;
  });

  whatsappClient.on("disconnected", (reason) => {
    console.log("Disconnected:", reason);
    isClientReady = false;
    app.locals.qrCode = null; // Reset QR code on disconnection
  });

  whatsappClient.initialize();
};

// Start the WhatsApp client
initializeWhatsAppClient();

// API to fetch QR code
app.get("/api/qr-code", (req, res) => {
  if (app.locals.qrCode) {
    res.json({ success: true, qr: app.locals.qrCode });
  } else if (isClientReady) {
    res.json({
      success: false,
      message: "Client is already authenticated and ready.",
    });
  } else {
    res.json({ success: false, message: "QR code not generated yet." });
  }
});

// API to send a message
app.post("/api/send-message", async (req, res) => {
  const { phone, message } = req.body;

  if (!isClientReady) {
    return res
      .status(400)
      .json({ success: false, message: "WhatsApp client is not ready." });
  }

  try {
    const formattedPhone = `${phone}@c.us`; // Format phone number
    await whatsappClient.sendMessage(formattedPhone, message);
    res.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to send message.",
        error: error.message,
      });
  }
});

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});

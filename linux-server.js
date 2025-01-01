const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");

const app = express();
app.use(express.json());

let whatsappClient;
let isClientReady = false;

// API to initialize the WhatsApp client and return the QR code
app.get("/api/init", async (req, res) => {
  try {
    // Disconnect the existing client if already initialized
    if (whatsappClient) {
      console.log("Disconnecting existing client...");
      await whatsappClient.destroy();
    }

    whatsappClient = new Client({
      authStrategy: new LocalAuth({
        clientId: "whatsapp-client", // Ensure unique client ID
      }),
      puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: "/snap/bin/chromium", // Replace with your Chromium path
      },
    });

    // Use a promise to wait for the QR code event
    const getQRCode = new Promise((resolve, reject) => {
      whatsappClient.on("qr", (qr) => {
        console.log("QR Code received");
        resolve(qr);
      });

      whatsappClient.on("ready", () => {
        console.log("Client is ready");
        isClientReady = true;
      });

      whatsappClient.on("auth_failure", (message) => {
        console.log("Authentication failed:", message);
        reject(`Authentication failed: ${message}`);
      });

      whatsappClient.on("disconnected", (reason) => {
        console.log("Disconnected:", reason);
        isClientReady = false;
        reject(`Disconnected: ${reason}`);
      });
    });

    // Initialize the client
    whatsappClient.initialize();

    // Send the QR code in the response
    res.send({ success: true, qr: await getQRCode });
  } catch (error) {
    console.error("Error initializing client:", error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// API to check client readiness
app.get("/api/status", (req, res) => {
  res.send({ success: true, ready: isClientReady });
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
    res.status(500).json({
      success: false,
      message: "Failed to send message.",
      error: error.message,
    });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

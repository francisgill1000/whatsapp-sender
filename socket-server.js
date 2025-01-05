const express = require("express");
const cors = require("cors");
const path = require("path");

const http = require("http");
const { WebSocketServer } = require("ws");
const { Client, LocalAuth } = require("whatsapp-web.js");

const server = http.createServer();
const wss = new WebSocketServer({ server });

const app = express();

app.use(express.json());
app.use(cors());

let clients = {}; // Store clients by client id

wss.on("connection", async (ws) => {
  const clientId = generateClientId(); // Generate a unique client ID for each connection
  await init(ws, clientId);

  console.log("Client connected");

  ws.on("close", () => {
    console.log("Client disconnected.");
    if (clients[clientId]) {
      clients[clientId].whatsappClient.destroy();
      delete clients[clientId];
    }
  });

  ws.send(JSON.stringify({ message: "Hello from server", clientId }));
});

// Send QR code and other data for a specific client
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "qr") {
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      data.qr
    )}`;
    ws.send(JSON.stringify({ type: "qr", clientId, qr: qrCode }));
  }
};

server.listen(3000, () => {
  console.log("WebSocket server running on ws://167.172.148.248:3000");
});

async function init(ws, clientId) {
  try {
    // Disconnect the existing client if already initialized
    if (clients[clientId]) {
      console.log("Disconnecting existing client...");
      await clients[clientId].whatsappClient.destroy();
    }

    const whatsappClient = new Client({
      authStrategy: new LocalAuth({
        clientId: clientId, // Use unique client ID
      }),
      puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: "/snap/bin/chromium", // Replace with your Chromium path
      },
    });

    let lastQrTime = null;

    // Emit QR code via WebSocket
    whatsappClient.on("qr", (qr) => {
      const currentTime = Date.now();

      if (lastQrTime) {
        const timeDifference = (currentTime - lastQrTime) / 1000;
        console.log(`QR Code received again after ${timeDifference} seconds.`);
      } else {
        console.log("QR Code received for the first time.");
      }

      lastQrTime = currentTime;
      ws.send(JSON.stringify({ type: "qr", qr })); // Send QR code to the client
    });

    whatsappClient.on("ready", () => {
      console.log("Client is ready");
      clients[clientId].isClientReady = true;
      ws.send(JSON.stringify({ type: "status", ready: true })); // Notify client that WhatsApp is ready
    });

    whatsappClient.on("auth_failure", (message) => {
      console.log("Authentication failed:", message);
      ws.send(
        JSON.stringify({
          type: "error",
          message: `Authentication failed: ${message}`,
        })
      ); // Notify client about auth failure
    });

    whatsappClient.on("disconnected", (reason) => {
      console.log("Disconnected:", reason);
      clients[clientId].isClientReady = false;
      ws.send(
        JSON.stringify({
          type: "error",
          message: `Disconnected: ${reason}`,
        })
      ); // Notify client about disconnection
    });

    // Save client state
    clients[clientId] = { whatsappClient, isClientReady: false };

    // Initialize the client
    whatsappClient.initialize();
  } catch (error) {
    console.error("Error initializing client:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: `Initialization error: ${error.message}`,
      })
    );
  }
}

// Generate a unique client ID for each connection
function generateClientId() {
  return `client_${Math.random().toString(36).substr(2, 9)}`;
}

// API to send a message for a specific client
app.post("/api/send-message", async (req, res) => {
  const { clientId, phone, message } = req.body;

  if (!clients[clientId] || !clients[clientId].isClientReady) {
    return res
      .status(400)
      .json({ success: false, message: "WhatsApp client is not ready." });
  }

  try {
    const formattedPhone = `${phone}@c.us`; // Format phone number
    await clients[clientId].whatsappClient.sendMessage(formattedPhone, message);
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

// Serve client.html
app.get("/server", (req, res) => {
  res.sendFile(path.join(__dirname, "server.html"));
});

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server running at http://167.172.148.248:${port}`);
});

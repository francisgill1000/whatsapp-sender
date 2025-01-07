const express = require("express");
const cors = require("cors");
const fs = require("fs");
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

wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    const data = JSON.parse(message);
    if (data.type === "clientId") {
      const clientId = data.clientId;
      console.log(`Client connected with ID: ${clientId}`);

      // Store WebSocket connection and initialize WhatsApp client
      clients[clientId] = { ws, ...clients[clientId] };
      if (!clients[clientId].whatsappClient) {
        await init(ws, clientId);
      } else {
        console.log(`Client ${clientId} already initialized.`);
      }
    }
  });

  ws.on("close", () => {
    for (const clientId in clients) {
      if (clients[clientId].ws === ws) {
        console.log(`Client with ID ${clientId} disconnected.`);
        delete clients[clientId];
        break;
      }
    }
  });
});


server.listen(3000, () => {
  console.log("WebSocket server running on ws://localhost:3000");
});

async function init(ws, clientId) {
  try {
    // Check if a client already exists for the clientId
    if (clients[clientId] && clients[clientId].whatsappClient) {
      console.log(`Disconnecting existing client ${clientId}...`);
      try {
        await clients[clientId].whatsappClient.destroy();
      } catch (error) {
        console.error(
          `Error during client destruction for ${clientId}:`,
          error.message
        );
      }
    }

    // Remove any leftover locks or files for the session
    const sessionDir = path.join(".wwebjs_auth", `session-${clientId}`);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
      console.log(`Cleaned up session directory for client ${clientId}`);
    }

    const whatsappClient = new Client({
      authStrategy: new LocalAuth({ clientId }),
      puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: "/snap/bin/chromium", // Replace with your Chromium path
      },
    });

    // Add event listeners
    whatsappClient.on("qr", (qr) => {
      ws.send(JSON.stringify({ type: "qr", qr }));
    });

    whatsappClient.on("ready", () => {
      console.log(`Client ${clientId} is ready.`);
      clients[clientId].isClientReady = true;
      ws.send(JSON.stringify({ type: "status", ready: true }));
    });

    whatsappClient.on("auth_failure", (message) => {
      ws.send(
        JSON.stringify({
          type: "error",
          message: `Authentication failed: ${message}`,
        })
      );
    });

    whatsappClient.on("disconnected", (reason) => {
      console.log(`Client ${clientId} disconnected: ${reason}`);
      ws.send(
        JSON.stringify({ type: "error", message: `Disconnected: ${reason}` })
      );
      delete clients[clientId];
    });

    // Save the client
    clients[clientId] = { whatsappClient, ws, isClientReady: false };
    await whatsappClient.initialize();
  } catch (error) {
    console.error(`Error initializing client ${clientId}:`, error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: `Initialization error: ${error.message}`,
      })
    );
  }
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
  console.log(`Server running at http://localhost:${port}`);
});

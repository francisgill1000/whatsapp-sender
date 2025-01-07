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

      // Store WebSocket connection associated with the clientId
      clients[clientId] = { ws };

      // Initialize WhatsApp client for this clientId
      await init(ws, clientId);
    }
  });

  ws.on("close", async () => {
    for (let clientId in clients) {
      if (clients[clientId].ws === ws) {
        console.log(`Client with ID ${clientId} disconnected.`);
        // Clean up the client
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
    if (clients[clientId] && clients[clientId].whatsappClient) {
      try {
        await clients[clientId].whatsappClient.destroy();
      } catch (error) {
        console.error(
          `Error destroying existing client for ${clientId}:`,
          error.message
        );
      }
    }

    const whatsappClient = new Client({
      authStrategy: new LocalAuth({ clientId }),
      puppeteer: {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-extensions",
          "--remote-debugging-port=9222", // Optional for debugging
        ],
        executablePath: "/snap/bin/chromium", // Replace with your Chromium path
      },
    });

    // Add event listeners and initialization logic
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

      // Delete client from the active clients object

      // Notify WebSocket
      try {
        ws.send(
          JSON.stringify({ type: "error", message: `Disconnected: ${reason}` })
        );
      } catch (error) {
        console.warn(
          `Failed to send message to WebSocket for client ${clientId}: ${error.message}`
        );
      }

      // Schedule deletion of session directory after 10 seconds
      setTimeout(async () => {
        // delete clients[clientId];

        const sessionDir = path.join(".wwebjs_auth", `session-${clientId}`);
        if (fs.existsSync(sessionDir)) {
          fs.rm(sessionDir, { recursive: true, force: true }, (err) => {
            if (err) {
              console.error(
                `Failed to delete session directory ${sessionDir}: ${err.message}`
              );
            } else {
              console.log(
                `Session directory ${sessionDir} deleted successfully.`
              );
            }
          });
        }
      }, 10000); // 10 seconds
    });

    // Save client state
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

const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Works" });
});
const port = 3000; // Example port

let client;

app.get("/qr", (req, res) => {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      // args: ["--no-sandbox", "--disable-setuid-sandbox"], // Add this line to disable the sandbox
      executablePath: "/snap/bin/chromium", // Replace with the actual path
    },
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true }, (qrCode) => {
      if (qrCode) {
        qrBox.textContent = qrCode; // Set QR code inside pre tag

        res.send(qrBox);
      }
    });
  });

  client.on("ready", () => {
    console.log("Client is ready!");
    res.send("Client is ready!");
  });

  client.on("authenticated", () => {
    console.log("Authenticated successfully!");
    res.send("Authenticated successfully!");
  });

  client.on("auth_failure", (message) => {
    console.error(`Authentication failed: ${message}`);
    res.status(500).send(`Authentication failed: ${message}`);
  });
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
      res.status(500).json({
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

  client.on("disconnected", (reason) => {
    console.error(`Disconnected: ${reason}`);
    res.status(500).send(`Disconnected: ${reason}`);
  });

  client.initialize();

  res.send("done");
});

// Define the API endpoint
app.post("/send-message", async (req, res) => {
  const { phone, message } = req.body;

  // Validate the input
  if (!phone || !message) {
    res.send("Phone number and message are required.");

    return res
      .status(400)
      .json({ error: "Phone number and message are required." });
  }

  const formattedPhone = `${phone}@c.us`; // Format the phone number

  try {
    await client.sendMessage(formattedPhone, message);

    // const logEntry = `${new Date().toISOString()},${phone},${message},Success\n`;
    // fs.appendFile(csvFilePath, logEntry, (err) => {
    //   if (err) {
    //     console.error("Error logging to CSV file:", err);
    //   }
    // });

    res
      .status(200)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, error: "Failed to send message." });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});

#!/bin/bash

# Update system and install necessary dependencies
echo "Updating system and installing dependencies..."
sudo apt-get update
sudo apt-get install -y \
  wget \
  curl \
  unzip \
  fonts-liberation \
  libappindicator3-1 \
  libasound2t64 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Chromium browser via Snap
echo "Installing Chromium..."
sudo snap install chromium

# Clone the WhatsApp Sender repository
echo "Cloning the WhatsApp Sender repository..."
git clone https://github.com/francisgill1000/whatsapp-sender
cd whatsapp-sender

# Optional: Run any setup command for your repository (if needed)
# Example: npm install
# echo "Installing dependencies for the WhatsApp Sender project..."
# npm install

echo "Setup complete!"

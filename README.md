# Smart Parking and Management System

A comprehensive system for automating and managing parking facilities using RFID tags, IoT devices, and a modern web interface.

## System Overview

The Smart Parking Management System consists of four main components:

1. **Backend Server**: Node.js/Express with MongoDB database
2. **Client Web App**: React-based user interface for parking users
3. **Admin Panel**: React-based interface for parking facility administrators
4. **Arduino Firmware**: Arduino Uno R4 WiFi code for combined entry/exit points with RFID integration

## Features

### Client Features
- User registration and authentication
- Real-time parking slot availability view
- Parking slot reservation
- Digital wallet with multiple payment methods
- Transaction history
- Automated entry and exit using RFID tags
- Notification system

### Admin Features
- Real-time monitoring of parking slots
- Manual slot management
- User account management
- Transaction history and reports
- Dashboard with usage statistics
- System configuration

### Hardware Integration
- RFID-based user identification
- Automatic barrier control
- Visual feedback via OLED display
- Automatic payment calculation based on parking duration
- Single Arduino board for controlling both entry and exit points

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB, RESTful API
- **Frontend**: React, Redux, Material-UI
- **Hardware**: Arduino Uno R4 WiFi, MFRC522 RFID reader, Servo motors, OLED display
- **Authentication**: JWT-based auth system
- **Payment Processing**: Digital wallet with multiple payment methods

## Project Structure

```
/
├── backend/               # Node.js/Express backend server
│   ├── models/            # MongoDB data models
│   ├── routes/            # API routes
│   └── seed.js            # Database seed script
│
├── client/                # React client web application
│   ├── public/            # Static assets
│   └── src/               # React source files
│
├── admin/                 # React admin panel
│   ├── public/            # Static assets
│   └── src/               # React source files
│
└── esp32_firmware/        # Arduino firmware (folder kept for compatibility)
    ├── Arduino_Combined_System.ino    # Combined entry/exit firmware
    ├── ARDUINO_R4_WIFI_README.md      # Arduino Uno R4 WiFi setup instructions
    └── combined_system_wiring.txt     # Wiring diagram for combined system
```

## Installation and Setup

### Backend Setup

```bash
cd backend
npm install
node seed.js  # Seed the database with sample data
npm start
```

### Client App Setup

```bash
cd client
npm install
npm start
```

### Admin Panel Setup

```bash
cd admin
npm install
npm start
```

### Arduino Setup

See detailed instructions in the [Arduino Uno R4 WiFi README](./esp32_firmware/ARDUINO_R4_WIFI_README.md).

## System Requirements

- Node.js 14.x or higher
- MongoDB 4.x or higher
- Arduino IDE with Arduino Uno R4 WiFi board support
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Arduino Uno R4 WiFi, MFRC522 RFID readers, and other required hardware components

## Development

1. Fork the repository
2. Create a feature branch: `git checkout -b new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin new-feature`
5. Submit a pull request

## License

MIT License 
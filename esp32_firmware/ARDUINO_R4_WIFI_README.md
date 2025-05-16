# Arduino Uno R4 WiFi Smart Parking System

This document provides instructions for setting up the Arduino Uno R4 WiFi-based smart parking system using RFID tags for vehicle identification at both entry and exit points using a single board.

## Overview

This implementation uses a single Arduino Uno R4 WiFi board to control both entry and exit points, with:
- Two RFID readers (one for entry, one for exit)
- Two servo motors (entry and exit barriers)
- Two IR sensors (for vehicle detection)
- One OLED display (for user feedback)

## Hardware Requirements

### Components List

- 1x Arduino Uno R4 WiFi
- 2x MFRC522 RFID reader modules
- 2x Micro Servo Motors
- 2x IR Sensors
- 1x SSD1306 OLED Display (I2C, 128x64)
- RFID tags/cards (13.56MHz)
- Jumper wires
- Breadboard
- 5V power supply

## Wiring Instructions

### Arduino Uno R4 WiFi to RFID Readers

#### Entry RFID Reader (MFRC522):
```
Arduino Uno R4 WiFi  |   RFID-RC522 (Entry)
--------------------|------------------
3.3V                |   3.3V
GND                 |   GND
Pin 10              |   SDA (SS)
Pin 13              |   SCK
Pin 11              |   MOSI
Pin 12              |   MISO
Pin 9               |   RST
```

#### Exit RFID Reader (MFRC522):
```
Arduino Uno R4 WiFi  |   RFID-RC522 (Exit)
--------------------|------------------
3.3V                |   3.3V
GND                 |   GND
Pin 8               |   SDA (SS)
Pin 13              |   SCK
Pin 11              |   MOSI
Pin 12              |   MISO
Pin 7               |   RST
```

### Arduino Uno R4 WiFi to Servo Motors:
```
Arduino Uno R4 WiFi  |   Entry Servo      |   Exit Servo
--------------------|-------------------|------------------
5V                  |   VCC (Red)       |   VCC (Red)
GND                 |   GND (Brown)     |   GND (Brown)
Pin 3               |   Signal (Orange) |   -
Pin 5               |   -               |   Signal (Orange)
```

### Arduino Uno R4 WiFi to IR Sensors:
```
Arduino Uno R4 WiFi  |   Entry IR Sensor  |   Exit IR Sensor
--------------------|-------------------|------------------
5V                  |   VCC             |   VCC
GND                 |   GND             |   GND
Pin 4               |   OUT             |   -
Pin 6               |   -               |   OUT
```

### Arduino Uno R4 WiFi to OLED Display:
```
Arduino Uno R4 WiFi  |   SSD1306 OLED
--------------------|------------------
3.3V                |   VCC
GND                 |   GND
A4 (SDA)            |   SDA
A5 (SCL)            |   SCL
```

## Software Setup

### Required Libraries
- SPI.h (standard library)
- MFRC522.h
- Wire.h (standard library)
- Adafruit_GFX.h
- Adafruit_SSD1306.h
- Servo.h (standard library)
- WiFiS3.h (for Arduino Uno R4 WiFi)
- ArduinoHttpClient.h
- ArduinoJson.h

### Installation Steps

1. Install Arduino IDE (if not already installed)
2. Go to Tools > Board > Boards Manager
3. Search for and install "Arduino UNO R4 Boards" (or ensure it's already installed)
4. Select "Arduino UNO R4 WiFi" as your board
5. Go to Tools > Manage Libraries
6. Install all the required libraries mentioned above
7. Connect your Arduino Uno R4 WiFi to the computer
8. Open the sketch file: `Arduino_Combined_System.ino`
9. Modify the WiFi credentials and server details in the sketch
10. Upload the sketch to the Arduino

## Configuration Instructions

### WiFi & Server Configuration
In `Arduino_Combined_System.ino`, update the following variables:

```cpp
// WiFi credentials
const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";

// Backend server details
const char* serverHost = "your-backend-server.com";
const int serverPort = 5000;
const String serverPath = "/api/rfid";
```

### Pin Configuration
If needed, you can modify the pin assignments in the sketch:

```cpp
// RFID readers
#define ENTRY_RST_PIN     9
#define ENTRY_SS_PIN      10
#define EXIT_RST_PIN      7
#define EXIT_SS_PIN       8

// Servo motors
#define ENTRY_SERVO_PIN   3
#define EXIT_SERVO_PIN    5

// IR sensors
#define ENTRY_IR_PIN      4
#define EXIT_IR_PIN       6
```

## Usage Instructions

1. Power on the system
2. The OLED display will show the initialization process
3. Once connected to WiFi, the system is ready for operation
4. The system will monitor both entry and exit points simultaneously
5. When a vehicle is detected by either IR sensor:
   - The display will show which point (Entry/Exit) has a vehicle
   - The user presents their RFID card to the appropriate reader
   - The system communicates with the server to process the request
   - The corresponding barrier opens if authorized

## Troubleshooting

### Common Issues

1. **WiFi Connection Failure**
   - Check SSID and password
   - Ensure the Arduino Uno R4 WiFi board is functioning properly
   - Verify your WiFi network is operational

2. **RFID Reader Not Detecting Cards**
   - Check wiring connections (especially SS and RST pins)
   - Ensure cards are compatible with MFRC522
   - Verify SPI connections are correct
   - Make sure you're using the correct reader for entry/exit

3. **Servo Not Moving**
   - Check power supply (servos may need separate power for reliable operation)
   - Verify pin connections
   - Test servos with a simple test sketch

4. **Server Communication Issues**
   - Verify server URL and port are correct
   - Check that backend server is running
   - Ensure network allows required connections
   - Check Arduino's IP address is on the same network

5. **SPI Bus Conflicts**
   - Since you're using two RFID readers on the same SPI bus, ensure that SS pins are correctly managed
   - Only one device should be active on the SPI bus at a time

For additional help, check the serial monitor output at 115200 baud rate for detailed debugging information. 
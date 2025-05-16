# Arduino-based Smart Parking System with RFID

This document provides instructions for setting up the Arduino-based smart parking system using RFID tags for vehicle identification.

## Hardware Requirements

### Components List

For each entry/exit point:
- Arduino Uno
- ESP8266 WiFi module (ESP-01)
- MFRC522 RFID reader
- RFID tags/cards
- SSD1306 OLED Display (I2C, 128x64)
- Micro Servo Motor
- IR Sensor (for vehicle detection)
- Breadboard and jumper wires
- 5V power supply

## Wiring Instructions

### Arduino Uno to RFID-RC522 Connections:
```
Arduino Uno   |   RFID-RC522
----------------|---------------
3.3V           |   3.3V
GND            |   GND
Pin 10         |   SDA (SS)
Pin 13         |   SCK
Pin 11         |   MOSI
Pin 12         |   MISO
Pin 9          |   RST
```

### Arduino Uno to ESP8266 WiFi Module:
```
Arduino Uno   |   ESP8266
----------------|---------------
3.3V           |   VCC
GND            |   GND
RX (Pin 0)     |   TX
TX (Pin 1)     |   RX
```

### Arduino Uno to OLED Display:
```
Arduino Uno   |   SSD1306 OLED
----------------|---------------
5V             |   VCC
GND            |   GND
A4 (SDA)       |   SDA
A5 (SCL)       |   SCL
```

### Arduino Uno to Servo Motor:
```
Arduino Uno   |   Servo Motor
----------------|---------------
5V             |   VCC (Red)
GND            |   GND (Brown)
Pin 3          |   Signal (Orange)
```

### Arduino Uno to IR Sensor:
```
Arduino Uno   |   IR Sensor
----------------|---------------
5V             |   VCC
GND            |   GND
Pin 4          |   OUT
```

## Software Setup

### Required Libraries
- SPI.h
- MFRC522.h
- Wire.h
- Adafruit_GFX.h
- Adafruit_SSD1306.h
- Servo.h
- ESP8266WiFi.h
- ESP8266HTTPClient.h
- ArduinoJson.h

### Installation Steps

1. Install Arduino IDE (if not already installed)
2. Open Arduino IDE
3. Go to Tools > Manage Libraries
4. Search for and install all required libraries
5. Connect your Arduino to the computer
6. Open the appropriate sketch file:
   - `Arduino_Parking_Entry.ino` for entry points
   - `Arduino_Parking_Exit.ino` for exit points
7. Modify the WiFi credentials and server URL in the sketch
8. Select the correct board and port from Tools menu
9. Upload the sketch to the Arduino

## Configuration Instructions

### WiFi Configuration
In both `Arduino_Parking_Entry.ino` and `Arduino_Parking_Exit.ino`, update the following variables:

```cpp
const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";
const char* serverUrl = "http://your-backend-server.com/api";
```

### Pin Configuration
If needed, you can modify the pin assignments in the sketch:

```cpp
#define SS_PIN 10    // SDA pin for RFID-RC522
#define RST_PIN 9    // RST pin for RFID-RC522
#define SERVO_PIN 3  // Servo motor pin
#define TRIGGER_PIN 4  // IR sensor trigger pin
```

## Usage Instructions

1. Power on the system
2. The OLED display will show the initialization process
3. Once connected to WiFi, the system is ready for operation
4. When a vehicle is detected by the IR sensor:
   - The display will prompt to scan an RFID card
   - The user presents their RFID card to the reader
   - The system communicates with the server to process entry/exit
   - The barrier opens if authorized

## Troubleshooting

### Common Issues

1. **WiFi Connection Failure**
   - Check SSID and password
   - Ensure ESP8266 is properly connected
   - Verify power supply is adequate

2. **RFID Reader Not Detecting Cards**
   - Check wiring connections
   - Ensure card is compatible with MFRC522
   - Verify SPI connections are correct

3. **Servo Not Moving**
   - Check power supply (servos may need separate power)
   - Verify pin connection
   - Test servo with a simple sketch

4. **Server Communication Issues**
   - Verify server URL is correct
   - Check that backend server is running
   - Ensure network allows required connections

For additional help, check the serial monitor output at 115200 baud rate for detailed debugging information. 
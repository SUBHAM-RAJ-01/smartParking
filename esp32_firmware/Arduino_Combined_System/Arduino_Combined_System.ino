/*
 * Smart Parking System - Combined Entry/Exit Control
 * Arduino Uno R4 WiFi with RFID Integration (No Servo.h)
 */

#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFiS3.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "iPhone";  // Change to your WiFi name
const char* password = "qwertyuiop";  // Change to your WiFi password

// Backend server details
const char* serverHost = "192.168.21.1";  // Change to your computer's local IP
const int serverPort = 5000;
const String serverPath = "/api/rfid";

// Pin definitions
#define ENTRY_RST_PIN     9
#define ENTRY_SS_PIN      10
#define EXIT_RST_PIN      7
#define EXIT_SS_PIN       8
#define ENTRY_SERVO_PIN   3
#define EXIT_SERVO_PIN    5
#define SCREEN_WIDTH      128
#define SCREEN_HEIGHT     64
#define OLED_RESET        -1

// Initialize components
MFRC522 entryRfid(ENTRY_SS_PIN, ENTRY_RST_PIN);
MFRC522 exitRfid(EXIT_SS_PIN, EXIT_RST_PIN);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// State variables
boolean processingEntryVehicle = false;
boolean processingExitVehicle = false;
int wifiStatus = WL_IDLE_STATUS;
WiFiClient wifi;
HttpClient client = HttpClient(wifi, serverHost, serverPort);
boolean entryMode = true;

// Servo control functions (PWM-based)
void setServoAngle(int servoPin, int angle) {
  int pulse = map(angle, 0, 180, 500, 2500);
  digitalWrite(servoPin, HIGH);
  delayMicroseconds(pulse);
  digitalWrite(servoPin, LOW);
  delayMicroseconds(20000 - pulse);
}

// Hold servo at an angle for ms milliseconds
void holdServo(int servoPin, int angle, int ms) {
  unsigned long end = millis() + ms;
  while (millis() < end) {
    setServoAngle(servoPin, angle);
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("Smart Parking System - Combined Entry/Exit Control");

  // Servo pins setup
  pinMode(ENTRY_SERVO_PIN, OUTPUT);
  pinMode(EXIT_SERVO_PIN, OUTPUT);
  holdServo(ENTRY_SERVO_PIN, 0, 500);   // Barriers closed
  holdServo(EXIT_SERVO_PIN, 0, 500);

  // OLED display
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Initializing...");
  display.display();

  // SPI bus and RFID
  SPI.begin();
  entryRfid.PCD_Init();
  exitRfid.PCD_Init();

  // WiFi
  connectToWiFi();

  showReadyScreen("System Ready");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  // Toggle between entry and exit mode every 2 seconds
  static unsigned long lastToggleTime = 0;
  if (millis() - lastToggleTime > 2000) {
    lastToggleTime = millis();
    entryMode = !entryMode;
    if (entryMode) {
      showScanCardScreen("ENTRY");
    } else {
      showScanCardScreen("EXIT");
    }
  }

  // Entry check
  if (entryMode && !processingEntryVehicle && entryRfid.PICC_IsNewCardPresent() && entryRfid.PICC_ReadCardSerial()) {
    processEntryVehicle();
  }

  // Exit check
  if (!entryMode && !processingExitVehicle && exitRfid.PICC_IsNewCardPresent() && exitRfid.PICC_ReadCardSerial()) {
    processExitVehicle();
  }

  delay(100);
}

void connectToWiFi() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Connecting to WiFi");
  display.println(ssid);
  display.display();

  if (WiFi.status() == WL_NO_MODULE) {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("ERROR: WiFi module");
    display.println("not detected!");
    display.display();
    Serial.println("ERROR: WiFi module not detected!");
    while (true); // Don't continue
  }

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    wifiStatus = WiFi.begin(ssid, password);
    delay(1000);
    display.print(".");
    display.display();
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    display.println("\nWiFi connected!");
    IPAddress ip = WiFi.localIP();
    display.println(ip[0] + String(".") + ip[1] + String(".") + ip[2] + String(".") + ip[3]);
    display.display();
    delay(2000);
  } else {
    Serial.println("\nWiFi connection failed");
    display.println("\nWiFi failed!");
    display.println("Check credentials.");
    display.display();
    delay(2000);
  }
}

void showReadyScreen(String message) {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Smart Parking System");
  display.println("-----------------");
  display.println(message);
  display.display();
}

void showScanCardScreen(String point) {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Smart Parking System");
  display.println("-----------------");
  display.println(point + " Mode Active");
  display.println("Scan RFID card...");
  display.display();
}

String getRfidTag(MFRC522 &rfid) {
  String tag = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    tag += (rfid.uid.uidByte[i] < 0x10 ? "0" : "") + String(rfid.uid.uidByte[i], HEX);
  }
  tag.toUpperCase();
  return tag;
}

void processEntryVehicle() {
  if (processingEntryVehicle) return;
  processingEntryVehicle = true;

  String rfidTag = getRfidTag(entryRfid);

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Processing Entry...");
  display.println("RFID: " + rfidTag);
  display.display();

  if (WiFi.status() == WL_CONNECTED) {
    DynamicJsonDocument doc(1024);
    doc["rfid"] = rfidTag;
    String jsonPayload;
    serializeJson(doc, jsonPayload);

    client.beginRequest();
    client.post(serverPath + "/entry");
    client.sendHeader("Content-Type", "application/json");
    client.sendHeader("Content-Length", jsonPayload.length());
    client.beginBody();
    client.print(jsonPayload);
    client.endRequest();

    int statusCode = client.responseStatusCode();
    String response = client.responseBody();

    if (statusCode == 200) {
      DynamicJsonDocument respDoc(1024);
      DeserializationError error = deserializeJson(respDoc, response);

      if (!error) {
        bool success = respDoc["success"];
        if (success) {
          String userName = respDoc["userName"];
          int slotNumber = respDoc["slotNumber"];

          display.clearDisplay();
          display.setCursor(0, 0);
          display.println("Welcome " + userName + "!");
          display.println("Assigned slot: " + String(slotNumber));
          display.println("Opening barrier...");
          display.display();

          holdServo(ENTRY_SERVO_PIN, 90, 5000); // Open 5s
          holdServo(ENTRY_SERVO_PIN, 0, 500);   // Close
        } else {
          String errorMsg = respDoc["message"];
          display.clearDisplay();
          display.setCursor(0, 0);
          display.println("Error:");
          display.println(errorMsg);
          display.display();
          delay(3000);
        }
      } else {
        display.clearDisplay();
        display.setCursor(0, 0);
        display.println("JSON parsing error");
        display.display();
        delay(3000);
      }
    } else {
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Server Error:");
      display.println(statusCode);
      display.display();
      delay(3000);
    }
  } else {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("WiFi disconnected!");
    display.println("Reconnecting...");
    display.display();
    connectToWiFi();
  }

  entryRfid.PICC_HaltA();
  entryRfid.PCD_StopCrypto1();
  processingEntryVehicle = false;
  showReadyScreen("System Ready");
}

void processExitVehicle() {
  if (processingExitVehicle) return;
  processingExitVehicle = true;

  String rfidTag = getRfidTag(exitRfid);

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Processing Exit...");
  display.println("RFID: " + rfidTag);
  display.display();

  if (WiFi.status() == WL_CONNECTED) {
    DynamicJsonDocument doc(1024);
    doc["rfid"] = rfidTag;
    String jsonPayload;
    serializeJson(doc, jsonPayload);

    client.beginRequest();
    client.post(serverPath + "/exit");
    client.sendHeader("Content-Type", "application/json");
    client.sendHeader("Content-Length", jsonPayload.length());
    client.beginBody();
    client.print(jsonPayload);
    client.endRequest();

    int statusCode = client.responseStatusCode();
    String response = client.responseBody();

    if (statusCode == 200) {
      DynamicJsonDocument respDoc(1024);
      DeserializationError error = deserializeJson(respDoc, response);

      if (!error) {
        bool success = respDoc["success"];
        if (success) {
          String userName = respDoc["userName"];
          float parkingFee = respDoc["parkingFee"];
          String parkingDuration = respDoc["parkingDuration"];
          String paymentStatus = respDoc["paymentStatus"];
          float walletBalance = respDoc["walletBalance"];

          display.clearDisplay();
          display.setCursor(0, 0);
          display.println("User: " + userName);
          display.println("Duration: " + parkingDuration);
          display.println("Fee: $" + String(parkingFee, 2));

          if (paymentStatus == "PAID" || paymentStatus == "WALLET") {
            display.println("Payment: SUCCESSFUL");
            display.println("Wallet: $" + String(walletBalance, 2));
            display.println("Opening barrier...");
            display.display();

            holdServo(EXIT_SERVO_PIN, 90, 5000); // Open 5s
            holdServo(EXIT_SERVO_PIN, 0, 500);   // Close
          } else {
            display.println("Insufficient balance!");
            display.println("Please add funds");
            display.display();

            bool paymentConfirmed = false;
            int checkCount = 0;

            while (!paymentConfirmed && checkCount < 30) {
              delay(1000);
              checkCount++;
              client.beginRequest();
              client.get(serverPath + "/payment-status/" + rfidTag);
              client.endRequest();

              int paymentStatusCode = client.responseStatusCode();
              String paymentResponse = client.responseBody();

              if (paymentStatusCode == 200) {
                DynamicJsonDocument paymentDoc(256);
                deserializeJson(paymentDoc, paymentResponse);

                if (paymentDoc["paid"]) {
                  paymentConfirmed = true;

                  display.clearDisplay();
                  display.setCursor(0, 0);
                  display.println("Payment received!");
                  display.println("Thank you!");
                  display.println("Opening barrier...");
                  display.display();

                  holdServo(EXIT_SERVO_PIN, 90, 5000); // Open 5s
                  holdServo(EXIT_SERVO_PIN, 0, 500);   // Close
                }
              }
            }

            if (!paymentConfirmed) {
              display.clearDisplay();
              display.setCursor(0, 0);
              display.println("Payment timeout!");
              display.println("Please try again");
              display.display();
              delay(3000);
            }
          }
        } else {
          String errorMsg = respDoc["message"];
          display.clearDisplay();
          display.setCursor(0, 0);
          display.println("Error:");
          display.println(errorMsg);
          display.display();
          delay(3000);
        }
      } else {
        display.clearDisplay();
        display.setCursor(0, 0);
        display.println("JSON parsing error");
        display.display();
        delay(3000);
      }
    } else {
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Server Error:");
      display.println(statusCode);
      display.display();
      delay(3000);
    }
  } else {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("WiFi disconnected!");
    display.println("Reconnecting...");
    display.display();
    connectToWiFi();
  }

  exitRfid.PICC_HaltA();
  exitRfid.PCD_StopCrypto1();
  processingExitVehicle = false;
  showReadyScreen("System Ready");
}

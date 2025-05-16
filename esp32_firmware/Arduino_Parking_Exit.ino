/*
 * Smart Parking System - Exit Point
 * Arduino Uno with RFID Integration
 */

#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Servo.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";

// Backend server details
const char* serverUrl = "http://your-backend-server.com/api";

// Pin definitions
#define SS_PIN 10    // SDA pin for RFID-RC522
#define RST_PIN 9    // RST pin for RFID-RC522
#define SERVO_PIN 3  // Servo motor pin
#define TRIGGER_PIN 4  // IR sensor trigger pin
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// Initialize components
MFRC522 rfid(SS_PIN, RST_PIN);
Servo barrierServo;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
boolean vehicleDetected = false;
boolean processingVehicle = false;

void setup() {
  Serial.begin(115200);
  Serial.println("Smart Parking System - Exit Point");
  
  // Initialize servo
  barrierServo.attach(SERVO_PIN);
  barrierServo.write(0);  // Close barrier initially
  
  // Initialize OLED display
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("Initializing...");
  display.display();
  
  // Initialize RFID reader
  SPI.begin();
  rfid.PCD_Init();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Set up IR sensor pin
  pinMode(TRIGGER_PIN, INPUT);
  
  showReadyScreen();
}

void loop() {
  // Check if a vehicle is detected
  if (digitalRead(TRIGGER_PIN) == LOW && !vehicleDetected) {
    vehicleDetected = true;
    showScanCardScreen();
  } else if (digitalRead(TRIGGER_PIN) == HIGH && vehicleDetected) {
    vehicleDetected = false;
    showReadyScreen();
  }
  
  // Check if an RFID card is present
  if (vehicleDetected && !processingVehicle && rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    processVehicleExit();
  }
  
  delay(100);
}

void connectToWiFi() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Connecting to WiFi");
  display.display();
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    display.print(".");
    display.display();
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    display.println("\nWiFi connected!");
    display.println(WiFi.localIP().toString());
    display.display();
    delay(2000);
  } else {
    Serial.println("\nWiFi connection failed");
    display.println("\nWiFi failed!");
    display.display();
    delay(2000);
  }
}

void showReadyScreen() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Smart Parking System");
  display.println("Exit Point");
  display.println("-----------------");
  display.println("Ready for vehicles");
  display.display();
}

void showScanCardScreen() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Vehicle detected!");
  display.println("Please scan your");
  display.println("RFID card...");
  display.display();
}

String getRfidTag() {
  String tag = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    tag += (rfid.uid.uidByte[i] < 0x10 ? "0" : "") + String(rfid.uid.uidByte[i], HEX);
  }
  tag.toUpperCase();
  return tag;
}

void processVehicleExit() {
  if (processingVehicle) return;
  processingVehicle = true;
  
  // Get the RFID tag ID
  String rfidTag = getRfidTag();
  
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Processing...");
  display.println("RFID: " + rfidTag);
  display.display();
  
  // Send to server for payment processing
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverUrl) + "/rfid/exit");
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload with RFID data
    DynamicJsonDocument doc(1024);
    doc["rfid"] = rfidTag;
    String payload;
    serializeJson(doc, payload);
    
    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
      
      // Parse response
      DynamicJsonDocument respDoc(1024);
      deserializeJson(respDoc, response);
      
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
          
          // Open the barrier
          barrierServo.write(90);
          delay(5000);  // Keep open for 5 seconds
          barrierServo.write(0);  // Close the barrier
        } else {
          display.println("Insufficient balance!");
          display.println("Please add funds");
          display.println("to your wallet");
          display.display();
          
          // Wait for payment confirmation
          bool paymentConfirmed = false;
          int checkCount = 0;
          
          while (!paymentConfirmed && checkCount < 30) {  // Check for 30 seconds max
            delay(1000);
            checkCount++;
            
            // Check payment status
            HTTPClient paymentHttp;
            paymentHttp.begin(String(serverUrl) + "/rfid/payment-status/" + rfidTag);
            int paymentResponseCode = paymentHttp.GET();
            
            if (paymentResponseCode > 0) {
              String paymentResponse = paymentHttp.getString();
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
                
                // Open the barrier
                barrierServo.write(90);
                delay(5000);  // Keep open for 5 seconds
                barrierServo.write(0);  // Close the barrier
              }
            }
            
            paymentHttp.end();
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
      display.println("Server Error:");
      display.println(httpResponseCode);
      display.display();
      delay(3000);
    }
    
    http.end();
  } else {
    display.println("WiFi disconnected!");
    display.display();
    connectToWiFi();  // Try to reconnect
  }
  
  // Reset RFID subsystem
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  processingVehicle = false;
} 
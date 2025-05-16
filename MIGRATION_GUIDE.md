# Migration Guide: ANPR to RFID-based Parking System

This guide provides instructions for migrating from the previous ANPR-based parking system to the new RFID-based system.

## Overview of Changes

The new system replaces the camera-based ANPR (Automatic Number Plate Recognition) with RFID (Radio Frequency Identification) technology, bringing several benefits:

- More reliable vehicle identification
- Faster entry and exit processing
- Lower hardware costs
- Reduced computational requirements
- Better privacy protection
- Simplified system maintenance

## Hardware Migration

### Previous Hardware (ESP32-CAM):
- ESP32-CAM module
- OV2640 camera
- Servo motor
- IR sensor
- OLED display

### New Hardware (Arduino):
- Arduino Uno
- ESP8266 WiFi module
- MFRC522 RFID reader
- RFID tags/cards
- Servo motor (can be reused)
- IR sensor (can be reused)
- OLED display (can be reused)

## Software Migration Steps

### Backend Changes:

1. **Database Schema Update**:
   - Run the database migration script to add RFID fields:
   ```bash
   cd backend
   node seed.js
   ```

2. **API Endpoints**:
   - The `/api/anpr` endpoints have been replaced with `/api/rfid` endpoints
   - Update any client applications that directly communicate with these endpoints

3. **User Management**:
   - Existing users need to be issued RFID cards/tags
   - Associate each RFID tag with the user's account in the system
   - Update the user database to include RFID tag identifiers

### Frontend Changes:

1. **Admin Interface**:
   - Updated to support RFID tag management
   - New interface for associating RFID tags with user accounts
   - No visible changes to slot management or reporting features

2. **User Interface**:
   - Updated to display RFID tag information
   - Instructions for using RFID tags instead of license plate recognition
   - Core functionality remains the same

## Migration Procedure

1. **Backup Existing Data**:
   ```bash
   mongodump --db parking --out ./backup
   ```

2. **Update Backend Code**:
   - Replace old files with new ones or apply patches
   - Update dependencies:
   ```bash
   cd backend
   npm install
   ```

3. **Update Database**:
   - Add RFID field to user collection:
   ```bash
   cd backend
   node migrations/add_rfid_field.js
   ```

4. **Hardware Installation**:
   - Install the new Arduino-based hardware according to the wiring instructions
   - See [ARDUINO_RFID_README.md](./esp32_firmware/ARDUINO_RFID_README.md) for details

5. **Issue RFID Tags**:
   - Distribute RFID tags to all registered users
   - Use the admin interface to associate each tag with the appropriate user

6. **Testing**:
   - Test entry and exit with several users
   - Verify that the slot allocation, payment, and barrier control work correctly

7. **Parallel Operation (Optional)**:
   - Run both systems in parallel for a transition period
   - Gradually migrate users to the new system

## Troubleshooting

### Common Migration Issues:

1. **Database Connection Errors**:
   - Ensure MongoDB is running
   - Check connection strings in configuration files

2. **Missing RFID Data**:
   - Ensure each user has an associated RFID tag
   - Verify RFID tags are correctly registered in the system

3. **Hardware Communication Issues**:
   - Check WiFi connectivity
   - Verify Arduino wiring according to the documentation
   - Test RFID reader with a simple scanning sketch

4. **Compatibility Issues**:
   - Ensure all client applications are updated to use the new API endpoints
   - Check for hardcoded references to the old ANPR system

## Support

If you encounter issues during migration, please refer to:
- [Documentation](./README.md)
- [Hardware Setup Guide](./esp32_firmware/ARDUINO_RFID_README.md)
- [Architecture Overview](./ARCHITECTURE.md)

Or contact our support team at support@example.com for assistance. 
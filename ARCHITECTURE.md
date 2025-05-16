# Smart Parking System Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────┐           ┌─────────────────────────────────┐
│                                     │           │                                 │
│      Entry Point Arduino            │           │      Exit Point Arduino         │
│  ┌───────────────┐  ┌────────────┐  │           │  ┌───────────────┐ ┌─────────┐  │
│  │ RFID Reader   │  │ Servo Motor│  │           │  │ RFID Reader   │ │ Servo   │  │
│  └───────┬───────┘  └─────┬──────┘  │           │  └───────┬───────┘ └────┬────┘  │
│          │                │         │           │          │              │       │
│  ┌───────┴───────┐  ┌─────┴──────┐  │           │  ┌───────┴───────┐ ┌────┴────┐  │
│  │ IR Sensor     │  │ OLED Display│  │           │  │ IR Sensor     │ │ OLED    │  │
│  └───────────────┘  └────────────┘  │           │  └───────────────┘ └─────────┘  │
│                                     │           │                                 │
└─────────────────┬───────────────────┘           └─────────────────┬───────────────┘
                  │                                                 │
                  │                                                 │
                  │ HTTP API                                        │ HTTP API
                  │                                                 │
                  ▼                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│                                     Backend Server                                  │
│                                                                                     │
│  ┌─────────────────┐  ┌───────────────────┐  ┌──────────────────┐  ┌──────────────┐│
│  │ Authentication  │  │ RFID Processing   │  │ Parking Slot     │  │ Payment      ││
│  │ Service         │  │ Service           │  │ Management       │  │ Processing   ││
│  └────────┬────────┘  └─────────┬─────────┘  └────────┬─────────┘  └───────┬──────┘│
│           │                     │                      │                    │       │
│           │                     │                      │                    │       │
│  ┌────────┴─────────────────────┴──────────────────────┴────────────────────┴──────┐│
│  │                                                                                 ││
│  │                                  MongoDB Database                               ││
│  │                                                                                 ││
│  └─────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                     │
└───────────────────────────────────┬─────────────────────────────────────────────────┘
                                    │
                                    │ REST API
                                    │
                 ┌─────────────────────────────────────────┐
                 │                                         │
    ┌────────────┴────────────┐         ┌──────────────────┴───────────┐
    │                         │         │                              │
┌───┴───────────────────┐  ┌──┴────────────────────┐  ┌────────────────┴──────────┐
│                       │  │                       │  │                           │
│     Client Web App    │  │      Admin Panel      │  │     Mobile Application    │
│                       │  │                       │  │     (Future Extension)    │
│  ┌──────────────────┐ │  │ ┌──────────────────┐  │  │                           │
│  │ User Dashboard   │ │  │ │ Admin Dashboard  │  │  │                           │
│  └──────────────────┘ │  │ └──────────────────┘  │  │                           │
│  ┌──────────────────┐ │  │ ┌──────────────────┐  │  │                           │
│  │ Wallet & Payment │ │  │ │ User Management  │  │  │                           │
│  └──────────────────┘ │  │ └──────────────────┘  │  │                           │
│  ┌──────────────────┐ │  │ ┌──────────────────┐  │  │                           │
│  │ Slot Reservation │ │  │ │ Slot Management  │  │  │                           │
│  └──────────────────┘ │  │ └──────────────────┘  │  │                           │
│                       │  │                       │  │                           │
└───────────────────────┘  └───────────────────────┘  └───────────────────────────┘
```

## Component Details

### Hardware Components

1. **Entry Point Arduino**
   - Reads RFID tags for user identification
   - Communicates with the backend for user verification and slot allocation
   - Controls entry barrier (servo motor)
   - Provides user feedback via OLED display
   - Detects vehicles using IR sensor

2. **Exit Point Arduino**
   - Reads RFID tags for user identification
   - Communicates with backend for payment processing
   - Controls exit barrier (servo motor)
   - Displays payment information via OLED display
   - Detects vehicles using IR sensor

### Backend Services

1. **Authentication Service**
   - User registration and login
   - JWT token generation and validation
   - Role-based access control

2. **RFID Processing Service**
   - RFID tag validation and user identification
   - Entry and exit management
   - Session tracking

3. **Parking Slot Management**
   - Real-time slot availability tracking
   - Slot reservation and allocation
   - Duration tracking for parked vehicles

4. **Payment Processing**
   - Fee calculation based on parking duration
   - Multiple payment method handling
   - Wallet management and transactions
   - Payment status tracking

### Database

- **MongoDB Database**
  - User collection (credentials, profiles, wallet, RFID tags)
  - Parking records collection (entries, exits, duration)
  - Slot collection (status, reservation)
  - Transaction collection (payments, refunds)

### Client Applications

1. **Client Web App**
   - User-facing web application
   - Responsive design for mobile and desktop
   - Secure authentication
   - Real-time slot availability view
   - Wallet management and payment interface

2. **Admin Panel**
   - Administrator-facing web application
   - Dashboard with system statistics
   - User management interface
   - Slot monitoring and manual control
   - Transaction history and reporting

3. **Mobile Application** (Future Extension)
   - Native mobile app for iOS and Android
   - Push notifications
   - Location-based services
   - QR code integration

## Communication Flow

1. **Vehicle Entry Process**:
   - Vehicle approaches entry point → IR sensor detects vehicle
   - User scans RFID tag at the reader
   - RFID tag ID sent to backend for processing
   - Backend identifies user and assigns slot
   - Response sent to Arduino
   - Entry barrier opens if successful

2. **Vehicle Exit Process**:
   - Vehicle approaches exit point → IR sensor detects vehicle
   - User scans RFID tag at the reader
   - RFID tag ID sent to backend for processing
   - Backend calculates parking duration and fee
   - Payment processed (auto from wallet or manual)
   - Response sent to Arduino
   - Exit barrier opens if payment successful

3. **User Interaction Flow**:
   - User registers account → manages profile
   - User adds funds to wallet → views available slots
   - User reserves slot → receives confirmation
   - User views transaction history and receipts

4. **Admin Interaction Flow**:
   - Admin logs in → views dashboard
   - Admin monitors parking slots → manages users
   - Admin views transaction records → generates reports
   - Admin configures system settings 
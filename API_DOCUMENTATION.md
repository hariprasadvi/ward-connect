# Ward Connect - Complete API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
Most API endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📑 Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Bill Payment APIs](#bill-payment-apis)
4. [Civic Request APIs](#civic-request-apis)
5. [Vehicle Booking APIs](#vehicle-booking-apis)
6. [Shop/E-commerce APIs](#shope-commerce-apis)
7. [Job Portal APIs](#job-portal-apis)
8. [House Message APIs](#house-message-apis)
9. [Waste Management APIs](#waste-management-apis)
10. [Kudumbashree Module APIs](#kudumbashree-module-apis)

---

## Authentication APIs

**Base Path:** `/auth`

### 1. User Signup
- **Endpoint:** `POST /auth/signup`
- **Authentication:** Not required
- **Description:** Register a new user
- **Request Body:**
```json
{
  "full_name": "string",
  "mobile_number": "string",
  "ward_number": "string",
  "house_number": "string",
  "password": "string"
}
```
- **Response:**
```json
{
  "message": "User registered successfully",
  "user": { ... },
  "token": "jwt_token"
}
```

### 2. User Login
- **Endpoint:** `POST /auth/login`
- **Authentication:** Not required
- **Description:** Login with credentials
- **Request Body:**
```json
{
  "mobile_number": "string",
  "password": "string"
}
```
- **Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": { ... }
}
```

### 3. Send OTP
- **Endpoint:** `POST /auth/send-otp`
- **Authentication:** Not required
- **Description:** Send OTP for verification
- **Request Body:**
```json
{
  "mobile_number": "string"
}
```

### 4. Verify OTP
- **Endpoint:** `POST /auth/verify-otp`
- **Authentication:** Not required
- **Description:** Verify OTP code
- **Request Body:**
```json
{
  "mobile_number": "string",
  "otp": "string"
}
```

---

## User Management APIs

**Base Path:** `/api/users`

### 1. Get User Profile
- **Endpoint:** `GET /api/users/profile`
- **Authentication:** Required
- **Description:** Get current user's profile

### 2. Update User Profile
- **Endpoint:** `PUT /api/users/profile`
- **Authentication:** Required
- **Description:** Update user profile
- **Request Body:**
```json
{
  "full_name": "string",
  "ward_number": "string",
  "house_number": "string"
}
```

### 3. Get All House Numbers
- **Endpoint:** `GET /api/users/house-numbers`
- **Authentication:** Required
- **Description:** Get list of all house numbers in the ward

---

## Bill Payment APIs

**Base Path:** `/api/bills`

### 1. Get All Bills
- **Endpoint:** `GET /api/bills`
- **Authentication:** Required
- **Description:** Get all bills for the current user

### 2. Fetch Bill by Consumer Number
- **Endpoint:** `POST /api/bills/fetch`
- **Authentication:** Required
- **Description:** Fetch bill details using consumer number
- **Request Body:**
```json
{
  "billType": "electricity|water|gas",
  "consumerNumber": "string",
  "provider": "string"
}
```

### 3. Pay Bill
- **Endpoint:** `POST /api/bills/:id/pay`
- **Authentication:** Required
- **Description:** Initiate bill payment
- **URL Parameters:** `id` - Bill ID

### 4. Create Razorpay Order
- **Endpoint:** `POST /api/bills/create-order`
- **Authentication:** Required
- **Description:** Create Razorpay order for bill payment
- **Request Body:**
```json
{
  "amount": "number",
  "billId": "string",
  "billType": "string"
}
```

### 5. Verify Payment
- **Endpoint:** `POST /api/bills/verify-payment`
- **Authentication:** Required
- **Description:** Verify Razorpay payment
- **Request Body:**
```json
{
  "razorpay_order_id": "string",
  "razorpay_payment_id": "string",
  "razorpay_signature": "string",
  "billId": "string"
}
```

---

## Civic Request APIs

**Base Path:** `/api/civic-requests`

### 1. Create Civic Request
- **Endpoint:** `POST /api/civic-requests`
- **Authentication:** Required
- **Description:** Submit a new civic complaint/request
- **Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "location": "string",
  "mediaUrl": "string (optional)",
  "category": "string"
}
```

### 2. Get Civic Requests
- **Endpoint:** `GET /api/civic-requests`
- **Authentication:** Required
- **Description:** Get all civic requests submitted by the user

---

## Vehicle Booking APIs

**Base Path:** `/api/vehicle`

### Owner APIs

#### 1. Add Vehicle
- **Endpoint:** `POST /api/vehicle/add`
- **Authentication:** Required
- **Request Body:**
```json
{
  "ownerId": "number",
  "registrationNumber": "string",
  "type": "Auto|Taxi|Ambulance|Lorry",
  "driverName": "string",
  "contactNumber": "string",
  "latitude": "number",
  "longitude": "number"
}
```

#### 2. Get My Vehicles
- **Endpoint:** `GET /api/vehicle/my-vehicles/:ownerId`
- **Authentication:** Required
- **URL Parameters:** `ownerId` - Owner's user ID

#### 3. Get Booking Requests
- **Endpoint:** `GET /api/vehicle/requests/:ownerId`
- **Authentication:** Required
- **Description:** Get all pending/confirmed booking requests for owner's vehicles

#### 4. Respond to Booking
- **Endpoint:** `POST /api/vehicle/respond`
- **Authentication:** Required
- **Request Body:**
```json
{
  "bookingId": "number",
  "status": "Confirmed|Cancelled",
  "amount": "number (optional)"
}
```

#### 5. Update Vehicle Location
- **Endpoint:** `PUT /api/vehicle/update-location/:vehicleId`
- **Authentication:** Required
- **Request Body:**
```json
{
  "latitude": "number",
  "longitude": "number"
}
```

#### 6. Update Vehicle Availability
- **Endpoint:** `PUT /api/vehicle/:vehicleId/availability`
- **Authentication:** Required
- **Request Body:**
```json
{
  "isAvailable": "boolean"
}
```

#### 7. Delete Vehicle
- **Endpoint:** `DELETE /api/vehicle/delete/:vehicleId`
- **Authentication:** Required

#### 8. Get Owner History
- **Endpoint:** `GET /api/vehicle/history/owner/:ownerId`
- **Authentication:** Required

### User APIs

#### 1. Search Vehicles
- **Endpoint:** `GET /api/vehicle/search?type=Auto`
- **Authentication:** Required
- **Query Parameters:** `type` (optional) - Auto|Taxi|Ambulance|Lorry

#### 2. Book Vehicle
- **Endpoint:** `POST /api/vehicle/book`
- **Authentication:** Required
- **Request Body:**
```json
{
  "userId": "number",
  "vehicleId": "number",
  "source": "string",
  "destination": "string",
  "bookingType": "Regular|Emergency"
}
```

#### 3. Get Booking Status
- **Endpoint:** `GET /api/vehicle/booking/:id`
- **Authentication:** Required

#### 4. Emergency SOS
- **Endpoint:** `POST /api/vehicle/emergency`
- **Authentication:** Required
- **Request Body:**
```json
{
  "userId": "number",
  "latitude": "number",
  "longitude": "number"
}
```

#### 5. Rate Vehicle
- **Endpoint:** `POST /api/vehicle/rate`
- **Authentication:** Required
- **Request Body:**
```json
{
  "bookingId": "number",
  "rating": "number (1-5)"
}
```

#### 6. Get User History
- **Endpoint:** `GET /api/vehicle/history/user/:userId`
- **Authentication:** Required

---

## Shop/E-commerce APIs

**Base Path:** `/api/shop`

### Public APIs

#### 1. Get All Products
- **Endpoint:** `GET /api/shop/products`
- **Authentication:** Not required
- **Description:** Get all available products

### Cart APIs (Protected)

#### 1. Get Cart
- **Endpoint:** `GET /api/shop/cart`
- **Authentication:** Required

#### 2. Add to Cart
- **Endpoint:** `POST /api/shop/cart`
- **Authentication:** Required
- **Request Body:**
```json
{
  "productId": "number",
  "quantity": "number"
}
```

#### 3. Update Cart Quantity
- **Endpoint:** `PUT /api/shop/cart/:id`
- **Authentication:** Required
- **Request Body:**
```json
{
  "quantity": "number"
}
```

#### 4. Remove from Cart
- **Endpoint:** `DELETE /api/shop/cart/:id`
- **Authentication:** Required

#### 5. Checkout
- **Endpoint:** `POST /api/shop/checkout`
- **Authentication:** Required
- **Request Body:**
```json
{
  "deliveryAddress": "string",
  "paymentMethod": "string"
}
```

### Wishlist APIs (Protected)

#### 1. Get Wishlist
- **Endpoint:** `GET /api/shop/wishlist`
- **Authentication:** Required

#### 2. Add to Wishlist
- **Endpoint:** `POST /api/shop/wishlist`
- **Authentication:** Required
- **Request Body:**
```json
{
  "productId": "number"
}
```

#### 3. Remove from Wishlist
- **Endpoint:** `DELETE /api/shop/wishlist/:productId`
- **Authentication:** Required

### Seller Hub APIs (Protected)

#### 1. Create Product
- **Endpoint:** `POST /api/shop/products`
- **Authentication:** Required
- **Content-Type:** `multipart/form-data`
- **Request Body:**
```
name: string
description: string
price: number
stock: number
category: string
image: file
```

#### 2. Get Seller Products
- **Endpoint:** `GET /api/shop/seller/products`
- **Authentication:** Required

#### 3. Update Product
- **Endpoint:** `PUT /api/shop/products/:id`
- **Authentication:** Required
- **Content-Type:** `multipart/form-data`

#### 4. Delete Product
- **Endpoint:** `DELETE /api/shop/products/:id`
- **Authentication:** Required

#### 5. Get Seller Orders
- **Endpoint:** `GET /api/shop/seller/orders`
- **Authentication:** Required

#### 6. Update Order Status
- **Endpoint:** `PUT /api/shop/seller/orders/:id/status`
- **Authentication:** Required
- **Request Body:**
```json
{
  "status": "Processing|Shipped|Delivered|Cancelled"
}
```

---

## Job Portal APIs

**Base Path:** `/api/job`

### 1. AI Job Chat
- **Endpoint:** `POST /api/job/chat`
- **Authentication:** Required
- **Description:** Chat with AI for job recommendations
- **Request Body:**
```json
{
  "message": "string",
  "conversationHistory": []
}
```

### 2. Generate CV
- **Endpoint:** `POST /api/job/cv`
- **Authentication:** Required
- **Description:** Generate CV using AI
- **Request Body:**
```json
{
  "personalInfo": { ... },
  "education": [ ... ],
  "experience": [ ... ],
  "skills": [ ... ]
}
```

### 3. Get Job Alerts
- **Endpoint:** `GET /api/job/alerts`
- **Authentication:** Required
- **Description:** Get personalized job alerts

### 4. Apply for Job
- **Endpoint:** `POST /api/job/apply`
- **Authentication:** Required
- **Request Body:**
```json
{
  "jobId": "string",
  "coverLetter": "string",
  "resume": "string"
}
```

---

## House Message APIs

**Base Path:** `/api/house-messages`

### 1. Broadcast to House
- **Endpoint:** `POST /api/house-messages/broadcast`
- **Authentication:** Required
- **Description:** Send message to all members of a house
- **Request Body:**
```json
{
  "houseNumber": "string",
  "message": "string",
  "title": "string"
}
```

### 2. Get My Alerts
- **Endpoint:** `GET /api/house-messages/my-alerts`
- **Authentication:** Required
- **Description:** Get all messages for user's house

---

## Waste Management APIs

### Waste Pickup APIs

**Base Path:** `/api/waste/pickups`

#### 1. Create Pickup Request
- **Endpoint:** `POST /api/waste/pickups`
- **Authentication:** Required
- **Request Body:**
```json
{
  "wasteType": "Biodegradable|Non-Biodegradable|E-Waste|Hazardous",
  "quantity": "string",
  "preferredDate": "date",
  "address": "string"
}
```

#### 2. Get Pickups
- **Endpoint:** `GET /api/waste/pickups`
- **Authentication:** Required

#### 3. Get Notification Count
- **Endpoint:** `GET /api/waste/pickups/notifications`
- **Authentication:** Required

#### 4. Acknowledge Pickup
- **Endpoint:** `PUT /api/waste/pickups/:id/acknowledge`
- **Authentication:** Required

#### 5. Update Pickup Status (Admin)
- **Endpoint:** `PUT /api/waste/pickups/:id`
- **Authentication:** Required (Admin)
- **Request Body:**
```json
{
  "status": "Scheduled|In Progress|Completed|Cancelled"
}
```

#### 6. Schedule Admin Pickup
- **Endpoint:** `POST /api/waste/pickups/admin-schedule`
- **Authentication:** Required (Admin)

#### 7. Delete Pickup
- **Endpoint:** `DELETE /api/waste/pickups/:id`
- **Authentication:** Required (Admin)

### Waste Complaint APIs

**Base Path:** `/api/waste/complaints`

#### 1. Create Complaint
- **Endpoint:** `POST /api/waste/complaints`
- **Authentication:** Required
- **Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "location": "string",
  "imageUrl": "string (optional)"
}
```

#### 2. Get Complaints
- **Endpoint:** `GET /api/waste/complaints`
- **Authentication:** Required

#### 3. Update Complaint Status (Admin)
- **Endpoint:** `PUT /api/waste/complaints/:id/status`
- **Authentication:** Required (Admin)
- **Request Body:**
```json
{
  "status": "Pending|In Progress|Resolved|Rejected"
}
```

#### 4. Delete Complaint
- **Endpoint:** `DELETE /api/waste/complaints/:id`
- **Authentication:** Required (Admin)

### Waste AI APIs

**Base Path:** `/api/waste/ai`

#### 1. Classify Waste
- **Endpoint:** `POST /api/waste/ai/classify`
- **Authentication:** Required
- **Description:** Use AI to classify waste type from image
- **Request Body:**
```json
{
  "imageUrl": "string"
}
```

---

## Kudumbashree Module APIs

### Meeting APIs

**Base Path:** `/api/kudumbashree/meeting`

#### 1. Schedule Meeting
- **Endpoint:** `POST /api/kudumbashree/meeting/schedule`
- **Authentication:** Required
- **Request Body:**
```json
{
  "title": "string",
  "date": "date",
  "time": "string",
  "location": "string",
  "agenda": "string"
}
```

#### 2. Get Meetings
- **Endpoint:** `GET /api/kudumbashree/meeting`
- **Authentication:** Required

#### 3. Record Meeting Audio
- **Endpoint:** `POST /api/kudumbashree/meeting/record`
- **Authentication:** Required
- **Content-Type:** `multipart/form-data`
- **Request Body:**
```
meetingId: number
audio: file
```

#### 4. Get Meeting Transcript
- **Endpoint:** `GET /api/kudumbashree/meeting/:id/transcript`
- **Authentication:** Required

#### 5. Get Processing Status
- **Endpoint:** `GET /api/kudumbashree/meeting/:id/status`
- **Authentication:** Required

#### 6. Delete Meeting
- **Endpoint:** `DELETE /api/kudumbashree/meeting/:id`
- **Authentication:** Required

### Attendance APIs

**Base Path:** `/api/kudumbashree/attendance`

#### 1. Mark Attendance
- **Endpoint:** `POST /api/kudumbashree/attendance`
- **Authentication:** Required
- **Request Body:**
```json
{
  "meetingId": "number",
  "userId": "number"
}
```

#### 2. Mark Attendance with Payment
- **Endpoint:** `POST /api/kudumbashree/attendance/mark-with-payment`
- **Authentication:** Required
- **Request Body:**
```json
{
  "meetingId": "number",
  "userId": "number",
  "amount": "number"
}
```

#### 3. Get Attendance by Meeting
- **Endpoint:** `GET /api/kudumbashree/attendance/by-meeting/:meetingId`
- **Authentication:** Required

#### 4. Generate Payment QR
- **Endpoint:** `POST /api/kudumbashree/attendance/generate-payment-qr`
- **Authentication:** Required
- **Request Body:**
```json
{
  "meetingId": "number",
  "amount": "number"
}
```

#### 5. Get User Attendance History
- **Endpoint:** `GET /api/kudumbashree/attendance/user-history`
- **Authentication:** Required

### Loan APIs

**Base Path:** `/api/kudumbashree/loan`

#### 1. Apply for Loan
- **Endpoint:** `POST /api/kudumbashree/loan/apply`
- **Authentication:** Required
- **Request Body:**
```json
{
  "amount": "number",
  "purpose": "string",
  "duration": "number (months)",
  "guarantor": "string"
}
```

#### 2. Get Loans
- **Endpoint:** `GET /api/kudumbashree/loan`
- **Authentication:** Required

#### 3. Update Loan Status (Admin)
- **Endpoint:** `PUT /api/kudumbashree/loan/:id/status`
- **Authentication:** Required (Admin)
- **Request Body:**
```json
{
  "status": "Pending|Approved|Rejected|Disbursed|Closed"
}
```

#### 4. Repay Loan
- **Endpoint:** `POST /api/kudumbashree/loan/:id/repay`
- **Authentication:** Required
- **Request Body:**
```json
{
  "amount": "number",
  "paymentMethod": "string"
}
```

#### 5. Remind Loan Payment
- **Endpoint:** `POST /api/kudumbashree/loan/:id/remind-payment`
- **Authentication:** Required (Admin)

### Financial APIs

**Base Path:** `/api/kudumbashree/financial`

#### 1. Get Financial Report
- **Endpoint:** `POST /api/kudumbashree/financial/report`
- **Authentication:** Required
- **Request Body:**
```json
{
  "startDate": "date",
  "endDate": "date"
}
```

#### 2. Get Attendance Collections
- **Endpoint:** `GET /api/kudumbashree/financial/attendance-collections`
- **Authentication:** Required

#### 3. Record Payment
- **Endpoint:** `POST /api/kudumbashree/financial/record-payment`
- **Authentication:** Required
- **Request Body:**
```json
{
  "userId": "number",
  "amount": "number",
  "type": "string",
  "description": "string"
}
```

#### 4. Create Razorpay Order
- **Endpoint:** `POST /api/kudumbashree/financial/create-order`
- **Authentication:** Required
- **Request Body:**
```json
{
  "amount": "number",
  "purpose": "string"
}
```

#### 5. Verify Payment
- **Endpoint:** `POST /api/kudumbashree/financial/verify-payment`
- **Authentication:** Required
- **Request Body:**
```json
{
  "razorpay_order_id": "string",
  "razorpay_payment_id": "string",
  "razorpay_signature": "string"
}
```

#### 6. Get User Transactions
- **Endpoint:** `GET /api/kudumbashree/financial/user-transactions/:userId`
- **Authentication:** Required

### Member APIs

**Base Path:** `/api/kudumbashree/member`

#### 1. Get Profile
- **Endpoint:** `GET /api/kudumbashree/member/profile`
- **Authentication:** Required

#### 2. Get All Members
- **Endpoint:** `GET /api/kudumbashree/member/members`
- **Authentication:** Required

#### 3. Approve Member (Admin)
- **Endpoint:** `POST /api/kudumbashree/member/approve/:userId`
- **Authentication:** Required (Admin)

#### 4. Reject Member (Admin)
- **Endpoint:** `POST /api/kudumbashree/member/reject/:userId`
- **Authentication:** Required (Admin)

### Report APIs

**Base Path:** `/api/kudumbashree/report`

#### 1. Get Admin Dashboard
- **Endpoint:** `GET /api/kudumbashree/report/admin-dashboard`
- **Authentication:** Required (Admin)
- **Description:** Get comprehensive admin dashboard data

#### 2. Get Member Dashboard
- **Endpoint:** `GET /api/kudumbashree/report/member-dashboard`
- **Authentication:** Required
- **Description:** Get member-specific dashboard data

---

## Error Responses

All APIs follow a consistent error response format:

```json
{
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently, there are no rate limits implemented. Consider implementing rate limiting for production use.

---

## CORS Configuration

The backend accepts requests from all origins (`*`). For production, configure specific allowed origins.

---

## File Upload

File uploads are supported for:
- Product images (Shop module)
- Meeting audio recordings (Kudumbashree module)

Maximum file size: **50MB**

---

## Payment Integration

The application uses **Razorpay** for payment processing. Required environment variables:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

---

## External Services

### 1. Google Gemini AI
Used for:
- Job recommendations and CV generation
- Meeting transcription
- Waste classification

### 2. Razorpay
Used for:
- Bill payments
- Gas booking payments
- Kudumbashree financial transactions

---

## Database Models

The application uses **PostgreSQL** with **Sequelize ORM**. Key models include:
- User
- Vehicle
- Booking
- Product
- Order
- Bill
- Payment
- CivicRequest
- WastePickup
- WasteComplaint
- Meeting
- Attendance
- Loan
- FinancialTransaction

---

## Development Notes

1. **Database Sync**: The server uses `sequelize.sync({ alter: true })` to automatically update database schema
2. **Authentication Middleware**: Most routes are protected by the `authenticate` middleware
3. **File Storage**: Uploaded files are stored using disk storage middleware
4. **Associations**: Complex relationships exist between models (e.g., User-Booking-Vehicle)

---

## Testing the APIs

You can test the APIs using tools like:
- **Postman**
- **Thunder Client** (VS Code extension)
- **cURL**
- **Insomnia**

Example cURL request:
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobile_number":"1234567890","password":"password123"}'
```

---

## Future Enhancements

1. API versioning (e.g., `/api/v1/`)
2. GraphQL support
3. WebSocket support for real-time updates
4. API documentation with Swagger/OpenAPI
5. Rate limiting and throttling
6. Request validation middleware
7. API analytics and monitoring

---

**Last Updated:** February 2, 2026
**Version:** 1.0.0

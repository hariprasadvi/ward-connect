# Ward Connect - API Endpoints List

## Base URL: `http://localhost:5000`

---

## 🔐 Authentication APIs (`/auth`)
1. `POST /auth/signup` - User registration
2. `POST /auth/login` - User login
3. `POST /auth/send-otp` - Send OTP for verification
4. `POST /auth/verify-otp` - Verify OTP code

---

## 👤 User Management APIs (`/api/users`)
5. `GET /api/users/profile` - Get user profile
6. `PUT /api/users/profile` - Update user profile
7. `GET /api/users/house-numbers` - Get all house numbers

---

## 💰 Bill Payment APIs (`/api/bills`)
8. `GET /api/bills` - Get all bills
9. `POST /api/bills/fetch` - Fetch bill by consumer number
10. `POST /api/bills/:id/pay` - Pay bill
11. `POST /api/bills/create-order` - Create Razorpay order
12. `POST /api/bills/verify-payment` - Verify payment

---

## 📢 Civic Request APIs (`/api/civic-requests`)
13. `POST /api/civic-requests` - Create civic request
14. `GET /api/civic-requests` - Get civic requests

---

## 🚗 Vehicle Booking APIs (`/api/vehicle`)

### Owner APIs
15. `POST /api/vehicle/add` - Add vehicle
16. `GET /api/vehicle/my-vehicles/:ownerId` - Get my vehicles
17. `GET /api/vehicle/requests/:ownerId` - Get booking requests
18. `POST /api/vehicle/respond` - Respond to booking
19. `PUT /api/vehicle/update-location/:vehicleId` - Update vehicle location
20. `PUT /api/vehicle/:vehicleId/availability` - Update availability
21. `DELETE /api/vehicle/delete/:vehicleId` - Delete vehicle
22. `GET /api/vehicle/history/owner/:ownerId` - Get owner history

### User APIs
23. `GET /api/vehicle/search` - Search vehicles
24. `POST /api/vehicle/book` - Book vehicle
25. `GET /api/vehicle/booking/:id` - Get booking status
26. `POST /api/vehicle/emergency` - Emergency SOS
27. `POST /api/vehicle/rate` - Rate vehicle
28. `GET /api/vehicle/history/user/:userId` - Get user history

---

## 🛒 Shop/E-commerce APIs (`/api/shop`)

### Public
29. `GET /api/shop/products` - Get all products

### Cart
30. `GET /api/shop/cart` - Get cart
31. `POST /api/shop/cart` - Add to cart
32. `PUT /api/shop/cart/:id` - Update cart quantity
33. `DELETE /api/shop/cart/:id` - Remove from cart
34. `POST /api/shop/checkout` - Checkout

### Wishlist
35. `GET /api/shop/wishlist` - Get wishlist
36. `POST /api/shop/wishlist` - Add to wishlist
37. `DELETE /api/shop/wishlist/:productId` - Remove from wishlist

### Seller Hub
38. `POST /api/shop/products` - Create product
39. `GET /api/shop/seller/products` - Get seller products
40. `PUT /api/shop/products/:id` - Update product
41. `DELETE /api/shop/products/:id` - Delete product
42. `GET /api/shop/seller/orders` - Get seller orders
43. `PUT /api/shop/seller/orders/:id/status` - Update order status

---

## 💼 Job Portal APIs (`/api/job`)
44. `POST /api/job/chat` - AI job chat
45. `POST /api/job/cv` - Generate CV
46. `GET /api/job/alerts` - Get job alerts
47. `POST /api/job/apply` - Apply for job

---

## 🏠 House Message APIs (`/api/house-messages`)
48. `POST /api/house-messages/broadcast` - Broadcast to house
49. `GET /api/house-messages/my-alerts` - Get my alerts

---

## ♻️ Waste Management APIs

### Waste Pickup (`/api/waste/pickups`)
50. `POST /api/waste/pickups` - Create pickup request
51. `GET /api/waste/pickups` - Get pickups
52. `GET /api/waste/pickups/notifications` - Get notification count
53. `PUT /api/waste/pickups/:id/acknowledge` - Acknowledge pickup
54. `PUT /api/waste/pickups/:id` - Update pickup status (Admin)
55. `POST /api/waste/pickups/admin-schedule` - Schedule admin pickup
56. `DELETE /api/waste/pickups/:id` - Delete pickup

### Waste Complaint (`/api/waste/complaints`)
57. `POST /api/waste/complaints` - Create complaint
58. `GET /api/waste/complaints` - Get complaints
59. `PUT /api/waste/complaints/:id/status` - Update complaint status (Admin)
60. `DELETE /api/waste/complaints/:id` - Delete complaint

### Waste AI (`/api/waste/ai`)
61. `POST /api/waste/ai/classify` - Classify waste using AI

---

## 🌾 Kudumbashree Module APIs

### Meeting (`/api/kudumbashree/meeting`)
62. `POST /api/kudumbashree/meeting/schedule` - Schedule meeting
63. `GET /api/kudumbashree/meeting` - Get meetings
64. `POST /api/kudumbashree/meeting/record` - Record meeting audio
65. `GET /api/kudumbashree/meeting/:id/transcript` - Get meeting transcript
66. `GET /api/kudumbashree/meeting/:id/status` - Get processing status
67. `DELETE /api/kudumbashree/meeting/:id` - Delete meeting

### Attendance (`/api/kudumbashree/attendance`)
68. `POST /api/kudumbashree/attendance` - Mark attendance
69. `POST /api/kudumbashree/attendance/mark-with-payment` - Mark attendance with payment
70. `GET /api/kudumbashree/attendance/by-meeting/:meetingId` - Get attendance by meeting
71. `POST /api/kudumbashree/attendance/generate-payment-qr` - Generate payment QR
72. `GET /api/kudumbashree/attendance/user-history` - Get user attendance history

### Loan (`/api/kudumbashree/loan`)
73. `POST /api/kudumbashree/loan/apply` - Apply for loan
74. `GET /api/kudumbashree/loan` - Get loans
75. `PUT /api/kudumbashree/loan/:id/status` - Update loan status (Admin)
76. `POST /api/kudumbashree/loan/:id/repay` - Repay loan
77. `POST /api/kudumbashree/loan/:id/remind-payment` - Remind loan payment

### Financial (`/api/kudumbashree/financial`)
78. `POST /api/kudumbashree/financial/report` - Get financial report
79. `GET /api/kudumbashree/financial/attendance-collections` - Get attendance collections
80. `POST /api/kudumbashree/financial/record-payment` - Record payment
81. `POST /api/kudumbashree/financial/create-order` - Create Razorpay order
82. `POST /api/kudumbashree/financial/verify-payment` - Verify payment
83. `GET /api/kudumbashree/financial/user-transactions/:userId` - Get user transactions

### Member (`/api/kudumbashree/member`)
84. `GET /api/kudumbashree/member/profile` - Get profile
85. `GET /api/kudumbashree/member/members` - Get all members
86. `POST /api/kudumbashree/member/approve/:userId` - Approve member (Admin)
87. `POST /api/kudumbashree/member/reject/:userId` - Reject member (Admin)

### Report (`/api/kudumbashree/report`)
88. `GET /api/kudumbashree/report/admin-dashboard` - Get admin dashboard
89. `GET /api/kudumbashree/report/member-dashboard` - Get member dashboard

---

## 📊 Summary

**Total APIs: 89 endpoints**

- Authentication: 4 APIs
- User Management: 3 APIs
- Bill Payment: 5 APIs
- Civic Requests: 2 APIs
- Vehicle Booking: 14 APIs
- Shop/E-commerce: 15 APIs
- Job Portal: 4 APIs
- House Messages: 2 APIs
- Waste Management: 11 APIs
- Kudumbashree: 29 APIs

---

**Project:** Ward Connect  
**Backend Port:** 5000  
**Frontend Port:** 4200

# 🌸 Kudumbashree Module - Implementation Guide
## Project Presentation - Module Explanations

---

## 📌 **Module Overview**

**What is Kudumbashree?**
- Digital microfinance management system for women's self-help groups in Kerala
- Complete solution for meetings, loans, attendance, and financial tracking
- Built with Angular (Frontend) + Node.js (Backend) + PostgreSQL (Database)

**Key Features:**
- 🤖 AI-powered loan risk assessment
- 📍 GPS-based attendance verification
- 💳 Razorpay payment integration
- 🎤 AI meeting transcription
- 🌐 Multilingual (English + Malayalam)

---

## 🏗️ **1. AUTHENTICATION MODULE**

### Implementation:
```
Location: 
- Frontend: angular-frontend/src/app/pages/kudumbashree/services/auth.service.ts
- Backend: backend/src/controllers/authController.js
```

### How It Works:
1. **User Registration**
   - User fills registration form with role selection
   - Backend creates User record with `is_approved: false`
   - KudumbashreeProfile created with group assignment
   
2. **Login Flow**
   ```
   User enters credentials
   → Backend validates (bcrypt password check)
   → JWT token generated
   → Token stored in localStorage
   → User redirected based on role:
      - Kudumbashree Member → /member/dashboard
      - Kudumbashree Admin → /admin/dashboard
   ```

3. **Role-Based Access**
   - **AuthGuard**: Checks if user has valid JWT token
   - **RoleGuard**: Verifies user role matches route requirement
   - Routes protected with `canActivate: [AuthGuard, RoleGuard]`

### Key Code:
```typescript
// Auth Service syncs with main app
syncFromMainAuth(mainUser) {
  if (mainUser.role === 'Kudumbashree Member') {
    kudumbashreeRole = 'member';
  } else if (mainUser.role === 'Kudumbashree Admin') {
    kudumbashreeRole = 'admin';
  }
}
```

---

## 👥 **2. MEMBER MANAGEMENT MODULE**

### Implementation:
```
Location:
- Frontend: components/member-management/
- Backend: controllers/member.controller.js
- Model: models/KudumbashreeProfile.js
```

### Database Schema:
```javascript
KudumbashreeProfile {
  userId: FK → User
  groupId: FK → KudumbashreeGroup
  memberId: Unique string
  bank_account: String
  ifsc_code: String
  join_date: Date
}
```

### Features:
1. **Member Registration Approval**
   - Admin sees pending members (is_approved: false)
   - Reviews profile details
   - Approves → Sets `is_approved: true`
   - Rejects → Deletes user record

2. **Member Profile**
   - Displays user info + group info
   - Shows attendance rate, loan history
   - Editable bank details

### API Endpoints:
```
GET  /api/kudumbashree/member/profile
GET  /api/kudumbashree/member (all members)
PUT  /api/kudumbashree/member/:userId/approve
DELETE /api/kudumbashree/member/:userId/reject
```

---

## 📅 **3. MEETING MANAGEMENT MODULE**

### Implementation:
```
Location:
- Frontend: components/meeting-organizer/
- Backend: controllers/meeting.controller.js
- Model: models/Meeting.js
```

### Database Schema:
```javascript
Meeting {
  groupId: FK
  date, title, location
  latitude, longitude, radius  // Geo-fencing
  audioData: BLOB              // Meeting recording
  processingStatus: ENUM       // AI processing status
  transcript: TEXT             // AI-generated
  summary: TEXT                // AI-generated
  status: 'Scheduled'/'Completed'/'Cancelled'
}
```

### How It Works:

**1. Schedule Meeting (Admin)**
```
Admin fills form:
  - Date & Time
  - Location (with map picker)
  - Geo-fence radius (default 100m)
  
Backend:
  - Creates Meeting record
  - Status: 'Scheduled'
  - Sends notifications to members
```

**2. AI Meeting Transcription**
```
Flow:
1. Admin uploads audio file (MP3/WAV)
2. Multer stores as BLOB in database
3. Background job (Bull Queue) picks up task
4. Google Gemini API transcribes audio
5. AI generates summary
6. Updates Meeting record with transcript & summary
```

**Key Code:**
```javascript
// Upload audio
router.post('/record', uploadMemory.single('audio'), 
  meetingController.recordMeetingAudio);

// In controller
await Meeting.update({ 
  audioData: req.file.buffer,
  processingStatus: 'UPLOADING'
}, { where: { id: meetingId } });

// Add to queue
minutesQueue.add({ meetingId });
```

### API Endpoints:
```
POST /api/kudumbashree/meeting/schedule
POST /api/kudumbashree/meeting/record
GET  /api/kudumbashree/meeting/:id/transcript
GET  /api/kudumbashree/meeting?type=active
```

---

## ✅ **4. ATTENDANCE MODULE**

### Implementation:
```
Location:
- Frontend: components/attendance/
- Backend: controllers/attendance.controller.js
- Model: models/Attendance.js
```

### Database Schema:
```javascript
Attendance {
  meetingId: FK
  userId: FK
  status: 'Present'/'Absent'
  thrift_amount: Decimal
  payment_status: 'Pending'/'Paid'
  transaction_id: String
  latitude, longitude        // User's location
  face_verified: Boolean
}
```

### How It Works:

**1. GPS-Based Verification**
```javascript
// Haversine formula calculates distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Returns distance in meters
}

// Verification
userDistance = calculateDistance(
  meetingLat, meetingLon,
  userLat, userLon
);

if (userDistance <= meeting.radius) {
  // Allow attendance
} else {
  // Reject - too far from meeting location
}
```

**2. Attendance with Payment**
```
Member clicks "Mark Attendance"
  ↓
System checks GPS location
  ↓
If within radius:
  - Shows thrift payment form
  - Member enters amount (e.g., ₹100)
  - Razorpay checkout opens
  - Payment completed
  ↓
Backend:
  - Creates Attendance record
  - Creates FinancialTransaction
  - Updates group total_funds
```

### API Endpoints:
```
POST /api/kudumbashree/attendance
POST /api/kudumbashree/attendance/mark-with-payment
GET  /api/kudumbashree/attendance/user-history
```

---

## 💰 **5. LOAN MANAGEMENT MODULE**

### Implementation:
```
Location:
- Frontend: components/loan-management/
- Backend: controllers/loan.controller.js
- Model: models/Loan.js
- AI Service: services/ai.service.js
```

### Database Schema:
```javascript
Loan {
  userId, groupId: FK
  amount, purpose
  interest_rate: Default 12%
  tenure_months: Integer
  status: 'Pending'/'Approved'/'Rejected'/'Active'/'Closed'
  repaid_amount: Decimal
  overdue_amount: Decimal
  risk_score: Decimal        // AI-generated 0-100
  ai_analysis: TEXT          // AI recommendation
  repayment_schedule: JSON
}
```

### How It Works:

**1. Loan Application (Member)**
```
Member fills form:
  - Amount: ₹10,000
  - Purpose: Business
  - Tenure: 12 months
  
Backend receives request
  ↓
AI Risk Assessment triggered:
  - Analyzes member's attendance (from Attendance table)
  - Checks previous loan history
  - Compares amount vs group funds
  - Calculates risk score (0-100)
  
Loan created with:
  - status: 'Pending'
  - risk_score: 85
  - ai_analysis: "Low risk. Good attendance..."
```

**2. AI Risk Assessment Code:**
```javascript
// In loan.controller.js
const aiAnalysis = await aiService.assessLoanRisk({
  userId,
  loanAmount: amount,
  groupFunds: group.total_funds,
  memberHistory: /* attendance, previous loans */
});

await Loan.create({
  userId, groupId, amount, purpose,
  tenure_months,
  status: 'Pending',
  risk_score: aiAnalysis.score,
  ai_analysis: aiAnalysis.recommendation
});
```

**3. Admin Approval**
```
Admin dashboard shows pending loans
  ↓
Admin clicks to review
  - Sees AI risk score: 85/100
  - Reads AI analysis
  - Views member history
  ↓
Decision:
  - Approve → status: 'Active', deduct from group funds
  - Reject → status: 'Rejected'
```

**4. Loan Repayment**
```
Member dashboard shows active loans
  ↓
Click "Pay EMI"
  - Shows amount due
  - Razorpay checkout
  - Payment completed
  ↓
Backend:
  - Updates repaid_amount
  - Creates FinancialTransaction
  - Adds back to group funds
  - If fully paid → status: 'Closed'
```

**5. Overdue Tracking**
```javascript
// Auto-calculates penalty
checkAndApplyOverdue(loan) {
  const today = new Date();
  const lastCheck = loan.last_penalty_check_date;
  const daysSinceLastCheck = Math.floor(
    (today - lastCheck) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastCheck > 0) {
    const penaltyRate = 0.01; // 1% per day
    const maxPenalty = 0.10;  // Max 10%
    
    const penalty = Math.min(
      loan.amount * penaltyRate * daysSinceLastCheck,
      loan.amount * maxPenalty
    );
    
    loan.overdue_amount += penalty;
  }
}
```

### API Endpoints:
```
POST /api/kudumbashree/loan/apply
GET  /api/kudumbashree/loan
PUT  /api/kudumbashree/loan/:id/status
POST /api/kudumbashree/loan/:id/repay
```

---

## 💳 **6. PAYMENT INTEGRATION MODULE**

### Implementation:
```
Location:
- Frontend: services/payment.service.ts
- Backend: controllers/financial.controller.js
- Integration: Razorpay SDK
```

### How It Works:

**Complete Payment Flow:**
```
1. INITIATE PAYMENT (Frontend)
   Member clicks "Pay" button
   ↓
   
2. CREATE ORDER (Backend)
   POST /api/kudumbashree/financial/create-order
   {
     amount: 10000,  // in paise (₹100)
     currency: 'INR'
   }
   ↓
   Razorpay.orders.create() called
   ↓
   Returns: { id: 'order_xxx', amount: 10000 }
   
3. OPEN CHECKOUT (Frontend)
   const options = {
     key: RAZORPAY_KEY_ID,
     amount: order.amount,
     order_id: order.id,
     handler: function(response) {
       // Payment success
       verifyPayment(response);
     }
   };
   razorpay.open(options);
   
4. USER COMPLETES PAYMENT
   - UPI / Card / Net Banking
   - Razorpay processes
   
5. VERIFY PAYMENT (Backend)
   POST /api/kudumbashree/financial/verify-payment
   {
     razorpay_order_id,
     razorpay_payment_id,
     razorpay_signature
   }
   ↓
   Verify signature using crypto
   ↓
   If valid:
     - Create FinancialTransaction
     - Update group funds
     - Update attendance/loan status
     - Return success
```

**Key Code:**
```javascript
// Verify signature
const crypto = require('crypto');
const generated_signature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(order_id + '|' + payment_id)
  .digest('hex');

if (generated_signature === razorpay_signature) {
  // Payment verified
  await FinancialTransaction.create({
    userId, groupId,
    type: 'Thrift',
    amount: amount / 100,  // Convert paise to rupees
    transaction_id: payment_id,
    status: 'Success'
  });
}
```

### Payment Types:
1. **Thrift** - Regular savings during meetings
2. **Loan Repayment** - EMI payments
3. **Fine** - Penalties

---

## 📊 **7. FINANCIAL TRACKING MODULE**

### Implementation:
```
Location:
- Frontend: components/payment-history/
- Backend: controllers/financial.controller.js
- Model: models/FinancialTransaction.js
```

### Database Schema:
```javascript
FinancialTransaction {
  userId, groupId: FK
  type: 'Thrift'/'Loan Repayment'/'Fine'/'Other'
  amount: Decimal
  date: Date
  status: 'Success'/'Pending'/'Failed'
  transaction_id: Unique string
}
```

### Features:
1. **Transaction History** - All payments by member
2. **Group Fund Tracking** - Total available funds
3. **Reports** - Financial summaries by date range

---

## 📱 **8. DASHBOARD MODULE**

### Member Dashboard:
```
Statistics Cards:
  - Attendance Rate: 92%
  - Active Loans: ₹5,000
  - Total Payments: ₹12,000

Upcoming Meetings:
  - Next meeting details
  - Quick attendance button

Recent Activities:
  - Last 5 transactions
  - Loan updates

Quick Actions:
  - Mark Attendance
  - Apply for Loan
  - View Profile
```

### Admin Dashboard:
```
Group Overview:
  - Total Members: 45
  - Total Funds: ₹2,50,000
  - Active Loans: 12

Pending Approvals:
  - New Members: 3
  - Loan Applications: 5

Management:
  - Schedule Meeting
  - Generate Reports
  - View Analytics
```

---

## 🌐 **9. MULTILINGUAL MODULE**

### Implementation:
```
Location: services/translation.service.ts
```

### How It Works:
```typescript
translations = {
  'dashboard': { 'en': 'Dashboard', 'ml': 'ഡാഷ്‌ബോർഡ്' },
  'attendance': { 'en': 'Attendance', 'ml': 'ഹാജർ' },
  'loan': { 'en': 'Loan', 'ml': 'വായ്പ' }
};

translate(key: string): string {
  const lang = this.currentLanguage();
  return this.translations[key][lang];
}
```

---

## 🔧 **Technology Stack**

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 18 + TypeScript |
| Styling | Tailwind CSS + Angular Material |
| Backend | Node.js + Express.js |
| Database | PostgreSQL + Sequelize ORM |
| Auth | JWT (jsonwebtoken) |
| Payment | Razorpay SDK |
| AI | Google Gemini API |
| Queue | Bull (Redis-based) |

---

## 🚀 **Key Innovations**

1. **AI Risk Assessment** - First in microfinance sector
2. **GPS Attendance** - Prevents proxy attendance fraud
3. **Integrated Payments** - Cashless operations
4. **Auto Transcription** - AI-powered meeting minutes
5. **Multilingual** - Inclusive for Malayalam speakers

---

## 📋 **Demo Flow for Presentation**

**Scenario: Member applies for loan**

1. Login as Member → Dashboard
2. Click "Apply for Loan"
3. Fill form (₹10,000, Business, 12 months)
4. Submit → AI analyzes in background
5. Switch to Admin login
6. See pending loan with AI score (85/100)
7. Review AI analysis
8. Approve loan
9. Switch back to Member
10. See approved loan
11. Click "Pay EMI" → Razorpay demo
12. Payment success → Updated balance

---

## 🎯 **Presentation Tips**

1. **Start with problem** - Manual microfinance challenges
2. **Show architecture** - How modules connect
3. **Demo AI features** - Most impressive part
4. **Highlight security** - JWT, payment verification
5. **Show mobile responsive** - Resize browser
6. **End with impact** - Women empowerment, efficiency

---

## ✅ **Quick Reference**

**URLs:**
- Application: `http://localhost:4200/kudumbashree`
- Backend API: `http://localhost:5000/api/kudumbashree/*`

**Test Accounts:**
- Member: (Use registered member)
- Admin: (Use admin account)

**Key Files:**
- Routes: `kudumbashree.routes.ts`
- Models: `backend/src/models/`
- Controllers: `backend/src/controllers/`
- Components: `angular-frontend/src/app/pages/kudumbashree/components/`

---

**Good luck with your presentation! 🎉**

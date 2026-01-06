// using global fetch in Node 18+

// If standard fetch is available (Node 18+), use it. otherwise we might fail if node-fetch isn't installed.
// We'll try-catch around require to be safe or just use global fetch.
const request = async (url, method, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const options = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (e) {
        console.error(`Error requesting ${url}:`, e.message);
        return { error: e.message };
    }
};

const BASE_URL = 'http://localhost:5000';

const runTests = async () => {
    console.log('--- Starting Kudumbashree Backend Tests ---');

    // 1. Signup / Login
    const userPayload = {
        full_name: 'Test Kudumbashree Member',
        mobile_number: `999${Math.floor(Math.random() * 10000000)}`, // Random to avoid unique constraint
        password: 'password123',
        role: 'Kudumbashree Member'
    };
    
    console.log('\n1. Testing Signup...');
    const signupRes = await request(`${BASE_URL}/auth/signup`, 'POST', userPayload);
    console.log('Signup Status:', signupRes.status);
    if (signupRes.status !== 201) {
        console.log('Signup Error Details:', JSON.stringify(signupRes.data, null, 2));
        return; // Stop if signup fails
    }
    
    // Login
    console.log('\n2. Testing Login...');
    const loginRes = await request(`${BASE_URL}/auth/login`, 'POST', {
        mobile_number: userPayload.mobile_number,
        password: userPayload.password
    });
    console.log('Login Status:', loginRes.status);
    
    if (loginRes.status !== 200) {
        console.error('Login failed, stopping tests.');
        return;
    }
    
    const token = loginRes.data.token;
    console.log('Token received.');

    // 2. Use Case 5: Reports (Member Dashboard)
    // We check this EARLY to get the user's details including the auto-created Group ID from backend logic
    console.log('\n3. Fetching Member Dashboard to get Context...');
    const dashboardRes = await request(`${BASE_URL}/api/reports/member-dashboard`, 'GET', null, token);
    console.log('Dashboard Status:', dashboardRes.status);
    
    let groupId = null;
    let meetingId = null;

    if (dashboardRes.status === 200 && dashboardRes.data.user) {
         // Because we patched authController, checking if profile creation worked could be done via a profile endpoint, 
         // but dashboard returns user. We need to fetch the profile or group to schedule a meeting.
         // Actually, let's use the /kudumbashree/profile endpoint if it exists or guess.
         // BUT, we can just Schedule a meeting with a likely groupId if we know the auto-creation logic (ID 1).
         // Better: Fetch profile.
    }
    
    // Fetch Profile to get groupId
    const profileRes = await request(`${BASE_URL}/api/kudumbashree/profile`, 'GET', null, token);
    if (profileRes.status === 200) {
        groupId = profileRes.data.groupId;
        console.log(`User Linked to Group ID: ${groupId}`);
    } else {
        console.log('Could not fetch profile, assuming Group ID 1 for testing');
        groupId = 1; 
    }

    // 3. Use Case 4: Schedule Meeting (Need to be admin? No, let's try or assume logic allows member/admin)
    // Actually typically only admin schedules. The test user is a "Member".
    // If permission denies, we can't test Attendance fully dynamically without an Admin login.
    // However, let's try to schedule. If it fails (403), we skip attendance marking or try with hardcoded ID.
    console.log('\n4. Scheduling Meeting...');
    const meetingPayload = {
        groupId: groupId,
        date: new Date().toISOString(),
        title: 'Test Meeting ' + Date.now(),
        location: 'Community Hall',
        description: 'Automated Test Meeting'
    };
    const scheduleRes = await request(`${BASE_URL}/api/meetings/schedule`, 'POST', meetingPayload, token);
    console.log('Schedule Status:', scheduleRes.status);
    
    if (scheduleRes.status === 201) {
        meetingId = scheduleRes.data.meeting.id;
        console.log(`Meeting Scheduled with ID: ${meetingId}`);
    } else {
        console.log('Scheduling failed (likely permissions), skipping Attendance Mark test or using ID 1');
        meetingId = 1;
    }

    // 4. Use Case 2: Attendance
    console.log('\n5. Testing Mark Attendance...');
    const attendancePayload = {
        meetingId: meetingId, 
        userId: loginRes.data.user.id,
        status: 'Present',
        latitude: 10.00,
        longitude: 76.00,
        face_verified: true
    };

    const attendanceRes = await request(`${BASE_URL}/api/attendance`, 'POST', attendancePayload, token);
    console.log('Mark Attendance Status:', attendanceRes.status);
    console.log('Response:', attendanceRes.data);

    // 5. Final Report Check
    console.log('\n6. Final Report Check...');
    const finalReportRes = await request(`${BASE_URL}/api/reports/member-dashboard`, 'GET', null, token);
    console.log('Final Report Status:', finalReportRes.status);
    // console.log('Final Report Data:', finalReportRes.data); // optional verbose

    console.log('\n--- Tests Completed ---');
};

runTests();

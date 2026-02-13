// Mock Data Configuration
const USE_MOCK_DATA = true;
const MOCK_DELAY = 300; // Reduced delay for better UX

// Mock Database
const MOCK_DB = {
    users: [
        {
            email: 'student@test.com',
            password: 'password',
            role: 'student',
            name: 'Demo Student',
            access_token: 'mock-student-token-123',
            student_info: {
                id: 1,
                name: 'Demo Student',
                roll_number: 'CS2024001',
                course: 'B.Tech',
                branch: 'CSE',
                batch: '2024-2028'
            }
        },
        {
            email: 'teacher@test.com',
            password: 'password',
            role: 'teacher',
            name: 'Demo Teacher',
            access_token: 'mock-teacher-token-456',
            teacher_info: {
                id: 1,
                name: 'Demo Teacher'
            }
        }
    ],
    subjects: [
        { id: 1, name: 'Design Thinking', code: 'DT101', course: 'B.Tech', branch: 'CSE' },
        { id: 2, name: 'Data Structures & Algorithms', code: 'CS201', course: 'B.Tech', branch: 'CSE' },
        { id: 3, name: 'Optimization Techniques', code: 'OT301', course: 'B.Tech', branch: 'CSE' },
        { id: 4, name: 'BEEE', code: 'EE101', course: 'B.Tech', branch: 'CSE' },
        { id: 5, name: 'Mathematics', code: 'MA101', course: 'B.Tech', branch: 'CSE' }
    ],
    enrollments: [
        { student_id: 1, subject_id: 1 },
        { student_id: 1, subject_id: 2 }
    ],
    attendance: [
        {
            date: new Date().toISOString().split('T')[0],
            subject_name: 'Data Structures',
            is_present: true
        },
        {
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            subject_name: 'Algorithms',
            is_present: false
        }
    ],
    stats: [
        { subject_name: 'Data Structures', present_count: 8, total_classes: 10 },
        { subject_name: 'Algorithms', present_count: 5, total_classes: 10 }
    ],
    faceRegistered: true
};

// Mock Fetch Function
async function mockFetch(url, options = {}) {
    if (!USE_MOCK_DATA) return window.fetch(url, options);

    console.log(`[MOCK API] Request to: ${url}`, options);

    await new Promise(r => setTimeout(r, MOCK_DELAY));

    try {
        let path = url;
        if (url.includes('http://localhost:8000')) {
            path = url.replace('http://localhost:8000', '');
        }

        // Auth & Users
        if (path === '/auth/login' && options.method === 'POST') {
            const body = JSON.parse(options.body);
            const user = MOCK_DB.users.find(u => u.email === body.email && u.password === body.password);

            if (user) {
                return {
                    ok: true,
                    json: async () => ({ access_token: user.access_token, token_type: 'bearer' })
                };
            }
            return { ok: false, json: async () => ({ detail: 'Invalid credentials' }) };
        }

        if (path === '/auth/me') {
            let token = '';
            if (options.headers && options.headers['Authorization']) {
                token = options.headers['Authorization'].split(' ')[1];
            }

            // Allow any valid token from DB, or default to student for robustness in demo
            const user = MOCK_DB.users.find(u => u.access_token === token);

            if (user) {
                return { ok: true, json: async () => user };
            } else {
                return { ok: false, status: 401, json: async () => ({ detail: 'Unauthorized' }) };
            }
        }

        if (path === '/auth/subjects') {
            return { ok: true, json: async () => MOCK_DB.subjects };
        }

        if (path.startsWith('/auth/register')) {
            return { ok: true, json: async () => ({ message: 'Registration successful' }) };
        }

        // Student Endpoints
        if (path === '/students/my-subjects') {
            const enrolledSubjects = MOCK_DB.subjects.filter(s =>
                MOCK_DB.enrollments.some(e => e.subject_id === s.id)
            );
            return { ok: true, json: async () => enrolledSubjects };
        }

        if (path === '/students/enroll') {
            return { ok: true, json: async () => ({ message: 'Enrolled successfully' }) };
        }

        if (path === '/students/face-registered') {
            return {
                ok: true,
                json: async () => ({
                    is_registered: MOCK_DB.faceRegistered,
                    samples_count: 5
                })
            };
        }

        if (path === '/students/register-face') {
            MOCK_DB.faceRegistered = true;
            return { ok: true, json: async () => ({ message: 'Face registered successfully' }) };
        }

        if (path === '/students/my-stats') {
            return { ok: true, json: async () => MOCK_DB.stats };
        }

        if (path === '/students/my-attendance') {
            return { ok: true, json: async () => MOCK_DB.attendance };
        }

        // Teacher Endpoints
        if (path === '/teachers/subjects') {
            if (options.method === 'POST') {
                const body = JSON.parse(options.body);
                MOCK_DB.subjects.push({ id: MOCK_DB.subjects.length + 1, ...body });
                return { ok: true, json: async () => body };
            }
            return { ok: true, json: async () => MOCK_DB.subjects };
        }

        if (path.match(/\/teachers\/subjects\/\d+\/students/)) {
            return {
                ok: true,
                json: async () => [
                    { roll_number: 'CS2024001', name: 'Dewansh', branch: 'CSE' },
                    { roll_number: 'CS2024002', name: 'Rohit', branch: 'CSE' },
                    { roll_number: 'CS2024003', name: 'Roshan', branch: 'CSE' },
                    { roll_number: 'CS2024004', name: 'Sumit', branch: 'CSE' },
                    { roll_number: 'CS2024005', name: 'Rithvik', branch: 'CSE' }
                ]
            };
        }

        if (path === '/teachers/mark-attendance') {
            return {
                ok: true,
                json: async () => ({
                    present_students: [
                        { roll_number: 'CS2024001', name: 'Dewansh' },
                        { roll_number: 'CS2024003', name: 'Roshan' },
                        { roll_number: 'CS2024004', name: 'Sumit' }
                    ],
                    absent_students: [
                        { roll_number: 'CS2024002', name: 'Rohit' },
                        { roll_number: 'CS2024005', name: 'Rithvik' }
                    ],
                    detections: [
                        [
                            { student_name: 'Dewansh', roll_number: 'CS2024001' },
                            { student_name: 'Roshan', roll_number: 'CS2024003' },
                            { student_name: 'Sumit', roll_number: 'CS2024004' }
                        ]
                    ]
                })
            };
        }

        console.warn(`[MOCK API] Unhandled route: ${path}`);
        return { ok: false, status: 404, json: async () => ({ detail: 'Not Found' }) };

    } catch (e) {
        console.error("Mock Fetch Error:", e);
        return { ok: false, status: 500, json: async () => ({ detail: e.message }) };
    }
}


// API Base URL (Not used directly when mocking, but kept for structure)
const API_URL = 'http://localhost:8000';

// Global state
let currentUser = null;
let authToken = null;
let selectedRole = 'student';
let stream = null;
let capturedFrames = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setTodayDate();
    loadRegSubjects();  // Pre-populate registration subject dropdown
});

// Auth functions
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
}

function selectRole(role) {
    selectedRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (role === 'student') {
        document.getElementById('studentFields').style.display = 'block';
        document.getElementById('teacherFields').style.display = 'none';
        loadRegSubjects();  // Populate subject dropdown on student selection
    } else {
        document.getElementById('studentFields').style.display = 'none';
        document.getElementById('teacherFields').style.display = 'block';
    }
}

async function loadRegSubjects() {
    try {
        const response = await mockFetch(`${API_URL}/auth/subjects`);
        const subjects = await response.json();
        const select = document.getElementById('regSubjects');
        if (!select) return;
        select.innerHTML = '';
        subjects.forEach(s => {
            select.innerHTML += `<option value="${s.id}">${s.name} (${s.code})</option>`;
        });
    } catch (e) {
        console.error('Failed to load subjects for registration:', e);
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await mockFetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Login failed');
        }

        const data = await response.json();
        authToken = data.access_token;
        localStorage.setItem('authToken', authToken);

        await loadUserProfile();
        showNotification('Login successful!', 'success');
    } catch (error) {
        console.error("Login Error:", error);
        showNotification(error.message || 'Login failed. Please check your credentials.', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    let endpoint = '';
    let payload = { email, password };

    if (selectedRole === 'student') {
        endpoint = '/auth/register/student';
        payload = {
            ...payload,
            name: document.getElementById('studentName').value,
            roll_number: document.getElementById('rollNumber').value,
            course: document.getElementById('course').value,
            branch: document.getElementById('branch').value,
            batch: document.getElementById('batch').value,
            subject_ids: Array.from(document.getElementById('regSubjects').selectedOptions).map(o => parseInt(o.value))
        };
    } else {
        endpoint = '/auth/register/teacher';
        payload = {
            ...payload,
            name: document.getElementById('teacherName').value
        };
    }

    try {
        const response = await mockFetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
        }

        showNotification('Registration successful! Please login.', 'success');
        switchTab('login');
        document.getElementById('regForm').reset();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function loadUserProfile() {
    try {
        const response = await mockFetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to load profile');

        currentUser = await response.json();

        if (currentUser.role === 'student') {
            showStudentDashboard();
        } else {
            showTeacherDashboard();
        }
    } catch (error) {
        console.error("Load Profile Error:", error);
        logout();
    }
}

function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
        authToken = token;
        loadUserProfile();
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('authSection').classList.add('active');
}

// Student Dashboard
async function showStudentDashboard() {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('studentDashboard').classList.add('active');

    if (currentUser.student_info) {
        document.getElementById('studentNameDisplay').textContent = currentUser.student_info.name;
    }

    await checkFaceRegistration();
    await loadMySubjects();
    await loadAttendanceStats();
    await loadRecentAttendance();
}

async function loadMySubjects() {
    try {
        // Show enrolled subjects
        const response = await mockFetch(`${API_URL}/students/my-subjects`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const enrolled = await response.json();
        const div = document.getElementById('mySubjects');

        if (enrolled.length === 0) {
            div.innerHTML = '<p style="color: var(--text-secondary);">Not enrolled in any subjects yet.</p>';
        } else {
            let html = '<h4>Currently Enrolled:</h4><ul style="list-style: none; padding: 0;">';
            enrolled.forEach(s => {
                html += `<li style="padding: 4px 0;">📖 ${s.name} (${s.code})</li>`;
            });
            html += '</ul>';
            div.innerHTML = html;
        }

        // Populate available subjects dropdown (exclude already enrolled)
        const allRes = await mockFetch(`${API_URL}/auth/subjects`);
        const allSubjects = await allRes.json();
        const enrolledIds = new Set(enrolled.map(s => s.id));
        const select = document.getElementById('dashboardSubjects');
        select.innerHTML = '';
        allSubjects.filter(s => !enrolledIds.has(s.id)).forEach(s => {
            select.innerHTML += `<option value="${s.id}">${s.name} (${s.code})</option>`;
        });
    } catch (e) {
        console.error('Failed to load subjects:', e);
    }
}

async function enrollInSubjects() {
    const select = document.getElementById('dashboardSubjects');
    const subjectIds = Array.from(select.selectedOptions).map(o => parseInt(o.value));
    if (subjectIds.length === 0) {
        showNotification('Please select at least one subject', 'error');
        return;
    }
    try {
        const response = await mockFetch(`${API_URL}/students/enroll`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subject_ids: subjectIds })
        });
        if (!response.ok) throw new Error('Enrollment failed');
        const data = await response.json();
        showNotification(data.message, 'success');
        await loadMySubjects();  // Refresh the list
    } catch (e) {
        showNotification(e.message, 'error');
    }
}

async function checkFaceRegistration() {
    try {
        const response = await mockFetch(`${API_URL}/students/face-registered`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();
        const statusDiv = document.getElementById('faceStatus');

        if (data.is_registered) {
            statusDiv.innerHTML = `
                <div class="badge badge-success">✓ Face Registered (${data.samples_count} samples)</div>
                <p style="margin-top: 10px; color: var(--text-secondary);">You can re-register to update your face samples.</p>
            `;
        } else {
            statusDiv.innerHTML = `
                <div class="badge badge-danger">⚠ Face Not Registered</div>
                <p style="margin-top: 10px; color: var(--text-secondary);">Please register your face to mark attendance.</p>
            `;
        }
    } catch (error) {
        console.error('Failed to check face registration:', error);
    }
}

async function loadAttendanceStats() {
    try {
        const response = await mockFetch(`${API_URL}/students/my-stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const stats = await response.json();
        const statsDiv = document.getElementById('attendanceStats');

        if (stats.length === 0) {
            statsDiv.innerHTML = '<p style="color: var(--text-secondary);">No attendance records yet.</p>';
            return;
        }

        let html = '<div class="stats-grid">';
        stats.forEach(stat => {
            const percentage = ((stat.present_count / stat.total_classes) * 100).toFixed(1);
            html += `
                <div class="stat-card">
                    <h3>${stat.subject_name}</h3>
                    <div class="value">${percentage}%</div>
                    <div class="percentage">${stat.present_count}/${stat.total_classes} classes</div>
                </div>
            `;
        });
        html += '</div>';
        statsDiv.innerHTML = html;
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

async function loadRecentAttendance() {
    try {
        const response = await mockFetch(`${API_URL}/students/my-attendance`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const records = await response.json();
        const recordsDiv = document.getElementById('recentAttendance');

        if (records.length === 0) {
            recordsDiv.innerHTML = '<p style="color: var(--text-secondary);">No attendance records yet.</p>';
            return;
        }

        let html = '<table><thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead><tbody>';
        records.slice(0, 10).forEach(record => {
            const statusBadge = record.is_present
                ? '<span class="badge badge-success">Present</span>'
                : '<span class="badge badge-danger">Absent</span>';
            html += `
                <tr>
                    <td>${record.date}</td>
                    <td>${record.subject_name}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        });
        html += '</tbody></table>';
        recordsDiv.innerHTML = html;
    } catch (error) {
        console.error('Failed to load attendance:', error);
    }
}

// Teacher Dashboard
async function showTeacherDashboard() {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('teacherDashboard').classList.add('active');

    if (currentUser.teacher_info) {
        document.getElementById('teacherNameDisplay').textContent = currentUser.teacher_info.name;
    }

    await loadSubjects();
}

async function loadSubjects() {
    try {
        const response = await mockFetch(`${API_URL}/teachers/subjects`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const subjects = await response.json();
        const select = document.getElementById('subjectSelect');

        select.innerHTML = '<option value="">-- Select Subject --</option>';
        subjects.forEach(subject => {
            select.innerHTML += `<option value="${subject.id}">${subject.name} (${subject.code})</option>`;
        });
    } catch (error) {
        console.error('Failed to load subjects:', error);
    }
}

async function createSubject(event) {
    event.preventDefault();

    const payload = {
        name: document.getElementById('subjectName').value,
        code: document.getElementById('subjectCode').value,
        course: document.getElementById('subCourse').value,
        branch: document.getElementById('subBranch').value
    };

    try {
        const response = await mockFetch(`${API_URL}/teachers/subjects`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to create subject');

        showNotification('Subject created successfully!', 'success');
        event.target.reset();
        await loadSubjects();
    } catch (error) {
        showNotification('Failed to create subject', 'error');
    }
}

async function loadSubjectStudents() {
    const subjectId = document.getElementById('subjectSelect').value;

    if (!subjectId) {
        document.getElementById('markingSection').style.display = 'none';
        document.getElementById('enrolledStudents').innerHTML = '';
        return;
    }

    document.getElementById('markingSection').style.display = 'block';

    try {
        const response = await mockFetch(`${API_URL}/teachers/subjects/${subjectId}/students`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const students = await response.json();
        const studentsDiv = document.getElementById('enrolledStudents');

        if (students.length === 0) {
            studentsDiv.innerHTML = '<p style="color: var(--text-secondary); margin-top: 15px;">No students enrolled in this subject.</p>';
            return;
        }

        let html = `<h3 style="margin-top: 20px;">Enrolled Students (${students.length})</h3><table><thead><tr><th>Roll No</th><th>Name</th><th>Branch</th></tr></thead><tbody>`;
        students.forEach(student => {
            html += `<tr><td>${student.roll_number}</td><td>${student.name}</td><td>${student.branch}</td></tr>`;
        });
        html += '</tbody></table>';
        studentsDiv.innerHTML = html;
    } catch (error) {
        console.error('Failed to load students:', error);
    }
}

// Camera Functions
async function startCamera(type) {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        const video = document.getElementById(`${type}Video`);
        video.srcObject = stream;

        if (type === 'student') {
            document.getElementById('captureBtn').disabled = false;
        } else {
            document.getElementById('markAttendanceBtn').disabled = false;
        }

        showNotification('Camera started', 'success');
    } catch (error) {
        showNotification('Failed to access camera', 'error');
    }
}

function stopCamera(type) {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;

        const video = document.getElementById(`${type}Video`);
        video.srcObject = null;

        if (type === 'student') {
            document.getElementById('captureBtn').disabled = true;
        } else {
            document.getElementById('markAttendanceBtn').disabled = true;
        }
    }
}

async function captureFrames() {
    capturedFrames = [];
    const video = document.getElementById('studentVideo');
    const canvas = document.getElementById('studentCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const previewDiv = document.getElementById('capturePreview');
    previewDiv.innerHTML = '';

    // Capture 5 frames with delay
    for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));

        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        capturedFrames.push(base64);

        const img = document.createElement('img');
        img.src = base64;
        previewDiv.appendChild(img);
    }

    showNotification('Captured 5 frames. Uploading...', 'success');
    await registerFace();
}

async function registerFace() {
    try {
        const response = await mockFetch(`${API_URL}/students/register-face`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ frames: capturedFrames })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Face registration failed');
        }

        const data = await response.json();
        showNotification(data.message, 'success');
        await checkFaceRegistration();
        capturedFrames = [];
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleClassroomUpload(event) {
    const subjectId = document.getElementById('subjectSelect').value;
    const date = document.getElementById('attendanceDate').value;

    if (!subjectId || !date) {
        showNotification('Please select subject and date first', 'error');
        event.target.value = '';
        return;
    }

    const files = event.target.files;
    if (!files.length) return;

    const statusEl = document.getElementById('uploadStatus');
    statusEl.textContent = `Processing ${files.length} images...`;

    const images = [];
    for (let i = 0; i < files.length; i++) {
        try {
            const base64 = await readFileAsBase64(files[i]);
            images.push(base64);
        } catch (e) {
            console.error('File read error:', e);
        }
    }

    if (images.length === 0) {
        statusEl.textContent = 'No valid images to process.';
        return;
    }

    try {
        const response = await mockFetch(`${API_URL}/teachers/mark-attendance`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject_id: parseInt(subjectId),
                date: date,
                images: images
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Attendance marking failed');
        }

        const data = await response.json();
        displayAttendanceResult(data);
        showNotification(`Success! ${data.present_students.length} present`, 'success');
        statusEl.textContent = 'Upload complete.';
    } catch (error) {
        showNotification(error.message, 'error');
        statusEl.textContent = 'Upload failed.';
    }

    event.target.value = ''; // Reset input
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

async function captureForAttendance() {
    const subjectId = document.getElementById('subjectSelect').value;
    const date = document.getElementById('attendanceDate').value;

    if (!subjectId || !date) {
        showNotification('Please select subject and date', 'error');
        return;
    }

    const video = document.getElementById('teacherVideo');
    const canvas = document.getElementById('teacherCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Capture 3 images
    const images = [];
    for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        ctx.drawImage(video, 0, 0);
        images.push(canvas.toDataURL('image/jpeg', 0.8));
    }

    showNotification('Processing attendance...', 'success');

    try {
        const response = await mockFetch(`${API_URL}/teachers/mark-attendance`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject_id: parseInt(subjectId),
                date: date,
                images: images
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Attendance marking failed');
        }

        const data = await response.json();
        displayAttendanceResult(data);
        showNotification(`Attendance marked! ${data.present_students.length} present, ${data.absent_students.length} absent`, 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function displayAttendanceResult(data) {
    const resultDiv = document.getElementById('attendanceResult');

    let html = `
        <div style="margin-top: 20px;">
            <h3>Attendance Result</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Present</h3>
                    <div class="value" style="color: var(--success);">${data.present_students.length}</div>
                </div>
                <div class="stat-card">
                    <h3>Absent</h3>
                    <div class="value" style="color: var(--danger);">${data.absent_students.length}</div>
                </div>
            </div>
        </div>
    `;

    if (data.present_students.length > 0) {
        html += '<h4 style="margin-top: 20px;">Present Students:</h4><table><thead><tr><th>Roll No</th><th>Name</th></tr></thead><tbody>';
        data.present_students.forEach(student => {
            html += `<tr><td>${student.roll_number}</td><td>${student.name}</td></tr>`;
        });
        html += '</tbody></table>';
    }

    resultDiv.innerHTML = html;

    // Also update the detection overlay with more visual detail if available
    const overlayDiv = document.getElementById('detectionOverlay');
    if (!overlayDiv) return;

    overlayDiv.innerHTML = '';

    if (data.detections && data.detections.length > 0) {
        // Just show detections from the last image for immediate feedback
        const lastImageDetections = data.detections[data.detections.length - 1];
        lastImageDetections.forEach(det => {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.style.padding = '10px';
            card.style.borderLeft = '4px solid var(--success)';
            card.innerHTML = `
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Detected</div>
                <div style="font-size: 1rem; font-weight: bold;">${det.student_name}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${det.roll_number}</div>
            `;
            overlayDiv.appendChild(card);
        });
    }
}

// Utility
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
}

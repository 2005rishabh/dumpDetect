const API_URL = 'http://localhost:5000/api/reports';
const AUTH_URL = 'http://localhost:5000/api/auth';

// Auth State Management
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function updateNav() {
    const navUl = document.querySelector('nav ul');
    if (!navUl) return;

    // Remove existing auth links to prevent duplicates
    const authLinks = navUl.querySelectorAll('.auth-link');
    authLinks.forEach(link => link.remove());

    if (isAuthenticated()) {
        const user = JSON.parse(localStorage.getItem('user'));
        const li = document.createElement('li');
        li.className = 'auth-link';
        li.innerHTML = `<a href="#" onclick="logout()">Logout (${user.username})</a>`;
        navUl.appendChild(li);
    } else {
        const li = document.createElement('li');
        li.className = 'auth-link';
        li.innerHTML = `<a href="login.html">Login</a>`;
        navUl.appendChild(li);
    }
}

// Login Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerText;

        btn.innerText = 'Logging in...';
        btn.disabled = true;

        try {
            const res = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

// Signup Handler
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = signupForm.querySelector('button');
        const originalText = btn.innerText;

        btn.innerText = 'Signing up...';
        btn.disabled = true;

        try {
            const res = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Signup failed');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

// Leaderboard Data (Static for now)
const leaderboardData = [
    { username: "EcoWarrior99", points: 1250, avatar: "fas fa-user-astronaut" },
    { username: "GreenGuardian", points: 980, avatar: "fas fa-user-ninja" },
    { username: "RiverSaver", points: 850, avatar: "fas fa-user-secret" },
    { username: "CleanWaterAct", points: 720, avatar: "fas fa-user-tie" },
    { username: "NatureLover", points: 600, avatar: "fas fa-user-graduate" }
];

// Fetch and Render Reports
async function fetchReports() {
    const reportsList = document.getElementById('reports-list-container');
    if (!reportsList) return;

    try {
        const response = await fetch(API_URL);
        const reports = await response.json();

        if (reports.length === 0) {
            reportsList.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No reports yet. Be the first to submit one!</p>';
            return;
        }

        reportsList.innerHTML = reports.map(report => `
            <div class="card animate-fade-in">
                <img src="${report.imagePath || 'assets/images/pollution_1.png'}" alt="Pollution" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
                <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${report.location}</h3>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">${report.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; color: #888; font-size: 0.8rem;">
                    <span><i class="far fa-clock"></i> ${new Date(report.date).toLocaleDateString()}</span>
                    <span style="color: var(--primary-color); font-weight: 600;">${report.status}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching reports:', error);
        reportsList.innerHTML = '<p style="text-align: center; color: red; grid-column: 1/-1;">Failed to load reports. Is the server running?</p>';
    }
}

// Render Leaderboard
const leaderboardContainer = document.getElementById('leaderboard-list');
if (leaderboardContainer) {
    leaderboardContainer.innerHTML = leaderboardData.map((user, index) => `
        <div class="card animate-fade-in" style="display: flex; align-items: center; padding: 1rem; margin-bottom: 1rem; animation-delay: ${index * 0.1}s;">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color); width: 40px;">${index + 1}</div>
            <div style="background: #e3f2fd; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 1rem;">
                <i class="${user.avatar}" style="font-size: 1.5rem; color: var(--primary-color);"></i>
            </div>
            <div style="flex: 1;">
                <h3 style="margin-bottom: 0;">${user.username}</h3>
                <p style="color: #666; font-size: 0.9rem;">Level ${(user.points / 100).toFixed(0)} Contributor</p>
            </div>
            <div style="font-weight: 700; color: var(--accent-color); font-size: 1.2rem;">
                ${user.points} pts
            </div>
        </div>
    `).join('');
}

// Handle Report Submission
const reportForm = document.getElementById('report-form');
if (reportForm) {
    reportForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!isAuthenticated()) {
            alert('Please login to submit a report');
            window.location.href = 'login.html';
            return;
        }

        const btn = reportForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        btn.disabled = true;

        const formData = new FormData();
        const imageFile = document.getElementById('image-input').files[0];
        const location = document.getElementById('location-input').value;
        const description = document.getElementById('description-input').value;

        formData.append('location', location);
        formData.append('description', description);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                document.getElementById('form-container').style.display = 'none';
                const successMsg = document.getElementById('success-message');
                successMsg.style.display = 'block';
                successMsg.classList.add('animate-fade-in');
                fetchReports(); // Refresh reports after successful submission
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit report. Please try again.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// Mock Location Detection
function detectLocation() {
    const locInput = document.getElementById('location-input');
    locInput.value = "Detecting...";
    setTimeout(() => {
        locInput.value = "Lat: 28.6139, Long: 77.2090 (New Delhi)";
    }, 1000);
}

// Initialize
updateNav();
fetchReports();

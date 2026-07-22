// State variables
let failedAttempts = 1; // Default starting attempts as requested
const maxAttempts = 3;
let lockoutTime = 30; // 30 seconds cooldown
let cooldownTimer = null;
let isLocked = false;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');
const loginBtn = document.getElementById('loginBtn');
const protectionText = document.getElementById('protectionText');
const securityStatusContainer = document.querySelector('.security-status');

// Status Display Elements
const statusCard = document.getElementById('statusCard');
const statusUsername = document.getElementById('statusUsername');
const statusState = document.getElementById('statusState');
const statusFailed = document.getElementById('statusFailed');
const statusLockTimer = document.getElementById('statusLockTimer');

// Timeline and Controls
const timelineList = document.getElementById('timelineList');
const clearLogsBtn = document.getElementById('clearLogsBtn');
const toastContainer = document.getElementById('toastContainer');

// SVG Elements
const svgShackle = document.getElementById('svgShackle');
const svgBody = document.getElementById('svgBody');
const svgRing = document.getElementById('svgRing');
const svgKeyholeCircle = document.getElementById('svgKeyholeCircle');
const svgKeyholeBar = document.getElementById('svgKeyholeBar');
const lockGlow = document.getElementById('lockGlow');

// Correct Credentials
const CORRECT_USERNAME = 'admin';
const CORRECT_PASSWORD = 'password123';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateStatusDisplay();
    setupPasswordToggle();
    setupEventListeners();
    
    // Animate shackle to initial secure state (closed)
    setLockVisualState('secure');
});

// Toggle password visibility
function setupPasswordToggle() {
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        eyeIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
        lucide.createIcons();
    });
}

// Autofill demo credentials
function fillDemoCredentials() {
    if (isLocked) {
        showToast('System is currently locked. Please wait.', 'error');
        return;
    }
    usernameInput.value = CORRECT_USERNAME;
    passwordInput.value = CORRECT_PASSWORD;
    showToast('Demo credentials copied to input fields.', 'info');
}

// Event Listeners setup
function setupEventListeners() {
    // Form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (isLocked) {
            showToast('Access Blocked. Shield lock active.', 'error');
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Log the target username in status display
        statusUsername.textContent = username;

        if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
            handleSuccessfulLogin(username);
        } else {
            handleFailedLogin(username);
        }
    });

    // Clear logs button
    clearLogsBtn.addEventListener('click', () => {
        timelineList.innerHTML = '';
        showToast('Security event logs cleared.', 'info');
        
        // Add minimal start log
        addLogEntry('System Started', 'System Started', 'System event registry wiped. Monitor restarted.', 'info');
    });
}

// Update status panel details
function updateStatusDisplay() {
    statusFailed.textContent = `${failedAttempts}/${maxAttempts}`;
    
    if (failedAttempts === 0) {
        statusFailed.className = 'status-value font-mono';
    } else if (failedAttempts === 1) {
        statusFailed.className = 'status-value font-mono highlight-warning';
    } else {
        statusFailed.className = 'status-value font-mono highlight-danger';
    }
}

// Successful Login Logic
function handleSuccessfulLogin(username) {
    failedAttempts = 0;
    updateStatusDisplay();
    
    // Play Success Toast
    showToast(`Access Granted. Welcome back, ${username}!`, 'success');
    
    // Add success log entry
    addLogEntry('Login Successful', 'Login Successful', `Administrative session established for user '${username}'.`, 'success');
    
    // Unlock animation
    setLockVisualState('unlocked');
    
    // Clear inputs
    usernameInput.value = '';
    passwordInput.value = '';
    
    // After 4 seconds, revert lock to secure state
    setTimeout(() => {
        if (!isLocked) {
            setLockVisualState('secure');
        }
    }, 4000);
}

// Failed Login Logic
function handleFailedLogin(username) {
    failedAttempts++;
    updateStatusDisplay();

    // Trigger visual rejection shake
    statusCard.classList.add('shake-animation');
    document.querySelector('.auth-card').classList.add('shake-animation');
    
    setTimeout(() => {
        statusCard.classList.remove('shake-animation');
        document.querySelector('.auth-card').classList.remove('shake-animation');
    }, 5000);

    // Add failed attempt log entry
    addLogEntry('Failed Login Attempt', 'Failed Login Attempt', `Unauthorized access attempt. Invalid credentials for user '${username}'.`, 'warning');

    if (failedAttempts >= maxAttempts) {
        triggerLockout(username);
    } else {
        showToast(`Access Denied. Attempts: ${failedAttempts}/${maxAttempts}`, 'error');
    }
}

// Lockout Trigger Logic
function triggerLockout(username) {
    isLocked = true;
    failedAttempts = maxAttempts;
    updateStatusDisplay();
    
    // Form and button states
    usernameInput.disabled = true;
    passwordInput.disabled = true;
    loginBtn.disabled = true;

    // Protection status text update
    protectionText.textContent = "Lockout Mode Active - Threat Detected";
    securityStatusContainer.classList.add('locked');
    
    // Update status indicators
    statusState.className = 'status-value badge-status locked';
    statusState.querySelector('.status-text').textContent = 'Locked';
    
    // Set lock visual to locked state (red glow, closed shackle)
    setLockVisualState('locked');

    showToast('Security Alert: Maximum login attempts exceeded. Terminal locked.', 'error');
    addLogEntry('Security Lockout Triggered', 'System Locked', `Automated lock engaged due to brute-force risk on user '${username}'.`, 'danger');

    // Countdown Timer logic
    let remaining = lockoutTime;
    updateTimerString(remaining);

    // Ring dasharray setup for progress indicator
    const totalOffset = 283;
    svgRing.style.strokeDashoffset = 0;

    cooldownTimer = setInterval(() => {
        remaining--;
        updateTimerString(remaining);
        
        // Progress ring countdown representation
        const offset = totalOffset - (totalOffset * (remaining / lockoutTime));
        svgRing.style.strokeDashoffset = offset;

        if (remaining <= 0) {
            resolveLockout();
        }
    }, 1000);
}

// Format and display countdown
function updateTimerString(seconds) {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    statusLockTimer.textContent = `${min}:${sec}`;
}

// Lockout Release
function resolveLockout() {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
    isLocked = false;
    failedAttempts = 0;
    
    // Re-enable form fields
    usernameInput.disabled = false;
    passwordInput.disabled = false;
    loginBtn.disabled = false;

    // Revert text and status displays
    protectionText.textContent = "System Protection Active";
    securityStatusContainer.classList.remove('locked');
    
    statusState.className = 'status-value badge-status active';
    statusState.querySelector('.status-text').textContent = 'Active';
    statusLockTimer.textContent = '00:00';
    
    updateStatusDisplay();
    setLockVisualState('secure');

    // Reset ring progress
    svgRing.style.strokeDashoffset = 0;

    showToast('Terminal lockout resolved. Access restored.', 'success');
    addLogEntry('System Lock Released', 'Lock Lifted', 'Cooldown duration completed. Login form initialized.', 'info');
}

// UI Lock State Management (SVG manipulation)
function setLockVisualState(state) {
    // Colors
    const colorGreen = 'url(#lockGradGreen)';
    const colorRed = 'url(#lockGradRed)';
    const colorCyan = '#00f0ff';
    
    if (state === 'locked') {
        // Red closed lock state
        svgShackle.classList.remove('unlocked');
        lockGlow.className = 'lock-glow locked';
        lockGlow.style.background = 'radial-gradient(circle, rgba(255, 59, 48, 0.25) 0%, transparent 70%)';
        
        // Apply Red colors to SVG
        applySvgColor(colorRed);
    } 
    else if (state === 'unlocked') {
        // Cyan/green open lock state
        svgShackle.classList.add('unlocked');
        lockGlow.className = 'lock-glow';
        lockGlow.style.background = 'radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, transparent 70%)';
        
        // Apply Cyan/Green colors to SVG
        applySvgColor(colorCyan);
    } 
    else if (state === 'secure') {
        // Normal secure active state (Green, Closed)
        svgShackle.classList.remove('unlocked');
        lockGlow.className = 'lock-glow';
        lockGlow.style.background = 'radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, transparent 70%)';
        
        // Apply Green colors to SVG
        applySvgColor(colorGreen);
    }
}

// Utility to recolor SVG elements
function applySvgColor(color) {
    svgShackle.style.stroke = color;
    svgBody.style.stroke = color;
    svgRing.style.stroke = color;
    svgKeyholeCircle.style.stroke = color;
    svgKeyholeBar.style.stroke = color;
}

// Add logs dynamically to the timeline list (prepended)
function addLogEntry(eventType, title, details, statusType) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const li = document.createElement('li');
    li.className = `timeline-item ${statusType}`;

    // Select Lucide Icon name depending on statusType
    let iconName = 'info';
    if (statusType === 'success') iconName = 'check-circle-2';
    if (statusType === 'warning') iconName = 'alert-octagon';
    if (statusType === 'danger') iconName = 'shield-x';

    li.innerHTML = `
        <div class="timeline-marker">
            <i data-lucide="${iconName}" class="timeline-icon"></i>
        </div>
        <div class="timeline-content">
            <div class="timeline-header">
                <span class="timeline-event">${title}</span>
                <span class="timeline-time">${timeStr}</span>
            </div>
            <p class="timeline-details">${details}</p>
        </div>
    `;

    // Prepend to top of logs
    timelineList.insertBefore(li, timelineList.firstChild);
    
    // Re-trigger Lucide render for the new item
    lucide.createIcons();

    // Scroll timeline to top
    document.querySelector('.log-timeline-wrapper').scrollTop = 0;
}

// Toast notification trigger
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';

    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <div class="toast-message">${message}</div>
    `;

    toastContainer.appendChild(toast);
    lucide.createIcons();

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

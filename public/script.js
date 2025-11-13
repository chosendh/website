// Authentication functions
async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success) {
        localStorage.setItem('userId', result.userId);
        window.location.href = '/dashboard';
    } else {
        showMessage(result.message, 'error');
    }
}

async function register() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    showMessage(result.message, result.success ? 'success' : 'error');
}

function logout() {
    localStorage.removeItem('userId');
    window.location.href = '/';
}

// Script protection functions
async function protectScript() {
    const userId = localStorage.getItem('userId');
    const scriptName = document.getElementById('scriptName').value || 'Unnamed Script';
    const scriptCode = document.getElementById('scriptCode').value;

    if (!scriptCode.trim()) {
        alert('Please enter script code');
        return;
    }

    const response = await fetch('/api/protect-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, scriptName, scriptCode })
    });

    const result = await response.json();

    if (result.success) {
        alert('Script protected successfully! Your loadstring has been generated.');
        document.getElementById('scriptCode').value = '';
        document.getElementById('scriptName').value = '';
        loadUserScripts();
    } else {
        alert('Error: ' + result.message);
    }
}

// Load user's scripts
async function loadUserScripts() {
    const userId = localStorage.getItem('userId');
    const response = await fetch(`/api/user-scripts/${userId}`);
    const result = await response.json();

    const scriptsList = document.getElementById('scriptsList');

    if (result.success && result.scripts.length > 0) {
        scriptsList.innerHTML = result.scripts.map(script => `
            <div class="script-item">
                <div class="script-name">${script.name}</div>
                <div class="script-date">Created: ${new Date(script.created).toLocaleDateString()}</div>
                <div class="loadstring" onclick="copyToClipboard(this)">
                    ${script.loadstring}
                </div>
                <small>Click to copy loadstring</small>
            </div>
        `).join('');
    } else {
        scriptsList.innerHTML = '<p>No scripts yet. Protect your first script above!</p>';
    }
}

// Copy to clipboard function
function copyToClipboard(element) {
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = element.textContent;
        element.textContent = 'Copied!';
        element.style.background = '#d4edda';

        setTimeout(() => {
            element.textContent = originalText;
            element.style.background = '#e9ecef';
        }, 2000);
    });
}

// Utility functions
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Load scripts when dashboard loads
if (window.location.pathname === '/dashboard') {
    document.addEventListener('DOMContentLoaded', loadUserScripts);
}
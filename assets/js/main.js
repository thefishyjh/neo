document.addEventListener('DOMContentLoaded', () => {
    
    // --- Custom Cursor Setup ---
    const cursor = document.createElement('div');
    cursor.id = 'cursor';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let lastParticleX = 0, lastParticleY = 0; // Track last particle position
    const particleSpawnDistance = 15; // Distance before spawning a new particle

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';

        // Create trail particles if moved enough
        const distance = Math.sqrt(Math.pow(mouseX - lastParticleX, 2) + Math.pow(mouseY - lastParticleY, 2));
        if (distance > particleSpawnDistance) {
            createTrailParticle(mouseX, mouseY);
            lastParticleX = mouseX;
            lastParticleY = mouseY;
        }
    });

    document.addEventListener('mousedown', () => document.body.classList.add('clicking'));
    document.addEventListener('mouseup', () => document.body.classList.remove('clicking'));

    // Hover effects for links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .game-card, .target');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    // Function to create a single trail particle
    function createTrailParticle(x, y) {
        const trail = document.createElement('div');
        trail.classList.add('trail-particle');
        trail.style.left = x + 'px';
        trail.style.top = y + 'px';
        document.body.appendChild(trail);

        // Remove after animation
        trail.addEventListener('animationend', () => trail.remove());
    }


    // --- Typing Effect (Homepage Only) ---
    const textElement = document.getElementById('typing-text');
    if (textElement) {
        const textToType = "Welcome to the Arcade Verse.";
        let index = 0;

        function type() {
            if (index < textToType.length) {
                textElement.textContent += textToType.charAt(index);
                index++;
                setTimeout(type, 100);
            }
        }
        type();
    }

    // Console greeting
    console.log("%c SYSTEM READY ", "background: #000; color: #0aff00; font-size: 20px; padding: 10px; border: 2px solid #0aff00;");

    // Particle System
    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random Size (increased range)
        const size = Math.random() * 30 + 15; // 15-45px
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random Position
        particle.style.left = `${Math.random() * 100}vw`;
        
        // Random Duration (increased range and added delay)
        const duration = Math.random() * 8 + 7; // 7-15s
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${Math.random() * -duration}s`; // Start some particles mid-animation
        
        // Random Color Accent and more intense glow
        if (Math.random() > 0.4) { // Increased chance for accent color
            particle.classList.add('accent');
        }

        document.body.appendChild(particle);

        // Remove after animation
        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
    }

    // Spawn particles periodically
    setInterval(createParticle, 150);

    // --- Dynamic Content Loading ---
    loadLeaderboard();

    function loadLeaderboard() {
        const tbody = document.getElementById('leaderboard-body');
        if (!tbody) return;

        // Default CPU Data (Fallback)
        const defaultScores = [
            { pilot: 'GHOST_RIDER', game: 'Neon Snake', score: 99999, class: 'rank-1' },
            { pilot: 'NEO_ANDERSON', game: 'Cyber Breaker', score: 88420, class: 'rank-2' },
            { pilot: 'TRINITY_X', game: 'Reflex Core', score: 75000, class: 'rank-3' },
            { pilot: 'CYBER_PUNK', game: 'Neon Snake', score: 62100, class: '' },
            { pilot: 'GLITCH_USER', game: 'Cyber Breaker', score: 54300, class: '' }
        ];

        // Fetch user scores from LocalStorage
        let storedScores = JSON.parse(localStorage.getItem('neo_arcade_hall_of_fame') || '[]');
        
        // Merge with defaults if stored is empty, or just use stored + defaults and sort?
        // Let's mix them so the table isn't empty initially, but user scores can beat them.
        let allScores = [...defaultScores, ...storedScores];

        // Sort by Score (Descending)
        allScores.sort((a, b) => parseInt(b.score) - parseInt(a.score));

        // Take Top 10
        const topScores = allScores.slice(0, 10);
        
        tbody.innerHTML = topScores.map((row, index) => {
            let rankClass = '';
            if (index === 0) rankClass = 'rank-1';
            if (index === 1) rankClass = 'rank-2';
            if (index === 2) rankClass = 'rank-3';

            return `
            <tr>
                <td><span class="${rankClass}">${(index + 1).toString().padStart(2, '0')}</span></td>
                <td>${row.pilot}</td>
                <td>${row.game}</td>
                <td class="score">${parseInt(row.score).toLocaleString()}</td>
            </tr>
            `;
        }).join('');
    }
});

// --- Shared Cyberpunk Modal System ---
function showCyberPrompt(message, callback) {
    // 1. Check/Create Modal DOM
    let overlay = document.getElementById('cyber-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'cyber-modal-overlay';
        overlay.innerHTML = `
            <div class="cyber-modal">
                <h3 id="modal-msg"></h3>
                <input type="text" id="modal-input" class="cyber-input" placeholder="ENTER ID" autocomplete="off" maxlength="12">
                <button id="modal-btn" class="modal-btn">CONFIRM</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // 2. Setup Elements
    const msgEl = document.getElementById('modal-msg');
    const inputEl = document.getElementById('modal-input');
    const btnEl = document.getElementById('modal-btn');

    msgEl.textContent = message;
    inputEl.value = ''; // Clear previous
    overlay.style.display = 'flex';
    inputEl.focus();

    // 3. Handle Submission
    const submitHandler = () => {
        const value = inputEl.value.trim();
        if (value) {
            cleanup();
            callback(value);
        } else {
            inputEl.placeholder = "ID REQUIRED!";
            inputEl.style.borderColor = "#ff0000";
        }
    };

    const cleanup = () => {
        btnEl.removeEventListener('click', submitHandler);
        inputEl.removeEventListener('keypress', keyHandler);
        overlay.style.display = 'none';
        inputEl.style.borderColor = ""; // Reset style
    };

    const keyHandler = (e) => {
        if (e.key === 'Enter') submitHandler();
    };

    btnEl.addEventListener('click', submitHandler);
    inputEl.addEventListener('keypress', keyHandler);
}

const BACKEND_URL = "https://onrender.com"; 
let sessionToken = null;

document.addEventListener("DOMContentLoaded", () => {
    fetchCloudData();
});

async function fetchCloudData() {
    try {
        const res = await fetch(`${BACKEND_URL}/api/posts`);
        const posts = await res.json();
        
        const dailyVault = document.getElementById('daily-cards-vault');
        const learningVault = document.getElementById('learning-cards-vault');
        const strategyVault = document.getElementById('strategy-cards-vault');
        const reelsVault = document.getElementById('reels-cards-vault');

        dailyVault.innerHTML = ''; learningVault.innerHTML = '';
        strategyVault.innerHTML = ''; reelsVault.innerHTML = '';

        if(!posts || posts.length === 0) {
            const fallback = `<div class="display-card-v2"><h4>Workspace Active but Empty</h4><p>Log into Studio Desk to publish your charts.</p></div>`;
            dailyVault.innerHTML = fallback; learningVault.innerHTML = fallback;
            strategyVault.innerHTML = fallback; reelsVault.innerHTML = fallback;
            return;
        }

        posts.forEach(p => {
            let img = p.image_url ? `<div class="chart-frame-wrapper"><img src="${p.image_url}" class="chart-frame-img"></div>` : '';
            let dateStr = new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            
            let cardHtml = `
                <div class="display-card-v2">
                    <h3>${p.title}</h3>
                    <p style="font-size:0.8rem; color:#636d81; margin-bottom:10px;">Published on ${dateStr}</p>
                    ${img}
                    <p class="card-body-text">${p.body}</p>
                </div>
            `;

            if(p.category === 'daily') dailyVault.innerHTML += cardHtml;
            if(p.category === 'learning') learningVault.innerHTML += cardHtml;
            if(p.category === 'strategy') strategyVault.innerHTML += cardHtml;
            
            if(p.category === 'reel') {
                reelsVault.innerHTML += `
                    <article class="reel-card">
                        <div class="reel-video-simulation-box">
                            <img src="${p.image_url}" class="reel-media-placeholder">
                            <div style="position: absolute; font-size: 2rem; opacity: 0.85; cursor: pointer;">▶️</div>
                            <div class="reel-overlay-info">
                                <h4>${p.title}</h4>
                                <p>${p.body}</p>
                            </div>
                        </div>
                    </article>
                `;
            }
        });
    } catch (err) { console.error("Cloud syncing blocked", err); }
}

async function executeLogin() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    try {
        const res = await fetch(`${BACKEND_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if(res.ok) {
            sessionToken = data.token;
            document.getElementById('login-interface').classList.add('hidden');
            document.getElementById('editor-interface').classList.remove('hidden');
        } else { alert(data.error); }
    } catch(e) { alert("Server connectivity exception. Wake up backend."); }
}

async function submitPostToServer() {
    const title = document.getElementById('content-title').value;
    const category = document.getElementById('content-type').value;
    const image_url = document.getElementById('content-media').value;
    const body = document.getElementById('content-body').value;

    if(!title || !body) return alert("Title and descriptions are required.");

    const res = await fetch(`${BACKEND_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': sessionToken },
        body: JSON.stringify({ title, category, image_url, body })
    });
    if(res.ok) {
        alert("Published live to permanent Supabase database cloud!");
        document.getElementById('content-title').value = '';
        document.getElementById('content-media').value = '';
        document.getElementById('content-body').value = '';
        fetchCloudData();
    }
}

function calculateTradeMetrics() {
    const entry = parseFloat(document.getElementById('calc-entry').value);
    const target = parseFloat(document.getElementById('calc-target').value);
    const stop = parseFloat(document.getElementById('calc-stop').value);
    const outBox = document.getElementById('calc-output-metrics');
    if (!entry || !target || !stop) return;
    const reward = target - entry; const risk = entry - stop;
    if (risk <= 0 || reward <= 0) { outBox.innerHTML = "Invalid bounds."; return; }
    outBox.innerHTML = `Ratio: <b style="color:#2962ff;">${(reward / risk).toFixed(2)} : 1</b>`;
}

function navigateHub(targetTab, event) {
    document.querySelectorAll('.viewport-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(`${targetTab}-panel`).classList.add('active');
}

function togglePublishingDesk() { document.getElementById('studio-desk').classList.toggle('hidden'); }
function adjustFormFields() {}

// ✅ STEP 1: Update this string to your EXACT live Render Web Service address
const BACKEND_URL = "https://tradesahihai-backend.onrender.com"; 
let sessionToken = null;

document.addEventListener("DOMContentLoaded", () => {
    // Fire up both your standard historical records and your active daily flat-file layers
    fetchCloudData();
    fetchDailyFlatFiles();
});

/**
 * 📈 NEW FUNCTION: Fetches flat files directly out of your backend structure
 * Paths: data/2026/August/Aug15_pnb.txt, Aug15_learning.txt, etc.
 */
async function fetchDailyFlatFiles() {
    try {
        const year = "2026";
        const month = "August";
        const dateStr = "Aug15";

        const res = await fetch(`${BACKEND_URL}/api/analysis/${year}/${month}/${dateStr}`);
        if (!res.ok) {
            console.warn("Flat file logs matching today's parameters are empty or pending.");
            return;
        }

        const data = await res.json();
        injectFlatFilesIntoVaults(data);

    } catch (err) {
        console.error("Flat-file synchronizer pipeline blocked:", err);
    }
}

/**
 * 🎨 Renders and matches text variables and asset urls right inside your existing UI elements
 */
function injectFlatFilesIntoVaults(data) {
    const dailyVault = document.getElementById('daily-cards-vault');
    const learningVault = document.getElementById('learning-cards-vault');
    const strategyVault = document.getElementById('strategy-cards-vault');
    const reelsVault = document.getElementById('reels-cards-vault');

    // 1. Inferences & Chart Image Layer
    if (data.summary) {
        let imgHtml = data.imageUrl ? `<div class="chart-frame-wrapper"><img src="${data.imageUrl}" class="chart-frame-img"></div>` : '';
        dailyVault.innerHTML = `
            <div class="display-card-v2">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                    <h3 style="margin:0;">📈 Today's Analysis Summary</h3>
                    <div><span class="localization-tag" style="background:#2962ff;">📁 Live File Sync</span></div>
                </div>
                <p style="font-size:0.75rem; color:#636d81; margin-bottom:12px;">File loaded from database: ${data.date}</p>
                ${imgHtml}
                <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.6;">${data.summary}</p>
            </div>
        ` + dailyVault.innerHTML; // Keeps it pinned cleanly at the top of your history!
    }

    // 2. Learning Metrics Layer
    if (data.learning) {
        learningVault.innerHTML = `
            <div class="display-card-v2">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                    <h3 style="margin:0;">💡 Concept Learnings</h3>
                    <div><span class="localization-tag" style="background:#00e676; color:#000;">📁 Live File Sync</span></div>
                </div>
                <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.6; margin-top:12px;">${data.learning}</p>
            </div>
        ` + learningVault.innerHTML;
    }

    // 3. Conditional Strategy Layer (Prepends ONLY if data exists, otherwise leaves hidden)
    if (data.strategy) {
        strategyVault.innerHTML = `
            <div class="display-card-v2">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                    <h3 style="margin:0;">🎯 System Execution Rules</h3>
                    <div><span class="localization-tag" style="background:#ffea00; color:#000;">📁 Live File Sync</span></div>
                </div>
                <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.6; margin-top:12px;">${data.strategy}</p>
            </div>
        ` + strategyVault.innerHTML;
    }

    // 4. Conditional Video Reels Layer (Injects native video player frames instantly if file paths exist)
    if (data.videoUrl) {
        reelsVault.innerHTML = `
            <article class="reel-card" style="width: 100%; max-width: 360px; margin-bottom: 1.5rem;">
                <video src="${data.videoUrl}" controls class="chart-frame-img" style="border-radius: 8px; background: #000; width:100%;">
                    Your environment context cannot stream native mp4 objects.
                </video>
                <div style="padding: 10px 0;">
                    <h4 style="margin:0;">🎬 Live Reel Playback</h4>
                    <p style="font-size:0.75rem; color:#636d81;">Streaming via public storage bucket root</p>
                </div>
            </article>
        ` + reelsVault.innerHTML;
    }
}

// --- Your Existing Legacy Operations (Preserved) ---
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
            let dateStr = new Date(p.created_at || Date.now()).toLocaleDateString(undefined, { 
                year: 'numeric', month: 'short', day: 'numeric' 
            });
            
            let cardHtml = `
                <div class="display-card-v2">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                        <h3 style="margin:0;">${p.title}</h3>
                        <div><span class="localization-tag">🌐 Global Sync</span></div>
                    </div>
                    <p style="font-size:0.75rem; color:#636d81; margin-bottom:12px;">Logged securely on ${dateStr}</p>
                    ${img}
                    <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.6;">${p.body}</p>
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
                                <p style="font-size:0.75rem; opacity:0.9;">${p.body}</p>
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
        
        // Short-circuit execution safely if fields remain unpopulated
        if (!entry || !target || !stop || !outBox) return;
        
        const reward = target - entry; 
        const risk = entry - stop;
        
        // Strict baseline validation boundaries
        if (risk <= 0 || reward <= 0) { 
            outBox.innerHTML = "Invalid bounds."; 
            return; 
        }
        
        // Fixed: Enclosed dynamic template strings within valid backticks (`)
        outBox.innerHTML = `Ratio: <b style="color:#2962ff;">${(reward / risk).toFixed(2)} : 1</b>`;
    }

    /**
     * Handles structural tab panel views switches and synchronizes link classes.
     */
    function navigateHub(targetTab, event) {
        document.querySelectorAll('.viewport-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
        
        // Defensive check: Guard event context if triggered outside a click listener
        if (event && event.target) {
            event.target.classList.add('active');
        }
        
        // Fixed: Added backticks to correctly process the dynamic element identifier
        const targetPanel = document.getElementById(`${targetTab}-panel`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }

    /**
     * Sidebar Management drawer layout class modifier control toggle.
     */
    function togglePublishingDesk() { 
        const studioDesk = document.getElementById('studio-desk');
        if (studioDesk) {
            studioDesk.classList.toggle('hidden'); 
        }
    }

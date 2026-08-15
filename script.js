// Local Development Cache Memory Arrays with Fixed and Secured Image Paths
let mockTechnicalDatabase = [
    {
        id: 101,
        title: "NIFTY 50: Rebounding from 50-day EMA Anchor",
        date: "Aug 15, 2026",
        media: "https://unsplash.com",
        body: "The index completed a clean validation sequence at its descending support line confluence. Bullish candles formed on higher volume, verifying pattern integrity. \n\nTarget parameters set for continuation moves towards previous high pivots, with stops safely tracking under current swing points."
    }
];

let mockFundamentalDatabase = [
    {
        id: 201,
        title: "Reliance Industries: Margin Expansion Review",
        date: "Aug 12, 2026",
        media: "https://unsplash.com",
        body: "Detailed review of quarterly performance metrics reveals a 120bps margin expansion across core operating arrays. Cash conversion parameters remain highly positive, justifying historical valuation expansion runways."
    }
];

let mockReelsDatabase = [
    {
        id: 301,
        title: "How to Spot Fake Breakouts 💸",
        desc: "3 volume filters to avoid trap structures.",
        thumbnail: "https://unsplash.com"
    },
    {
        id: 302,
        title: "My Top 3 Candlestick Setups 🕯️",
        desc: "High probability reversals explained in 60s.",
        thumbnail: "https://unsplash.com"
    }
];

// Active State Initialization System
document.addEventListener("DOMContentLoaded", () => {
    renderAllContentStreams();
});

// Dynamic Tab View Controller System
function navigateHub(targetTab, evt) {
    document.querySelectorAll('.viewport-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`${targetTab}-panel`).classList.add('active');
    
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    }

    // Soft viewport scroll reset
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Layout Studio Expansion Mechanisms
function togglePublishingDesk() {
    const studio = document.getElementById('studio-desk');
    studio.classList.toggle('hidden');
}

// Adjust form layouts depending on active media target choice
function adjustFormFields() {
    const type = document.getElementById('content-type').value;
    const mediaGroup = document.getElementById('media-link-group');
    const bodyLabel = document.getElementById('body-label');

    if (type === 'reel') {
        mediaGroup.querySelector('label').innerText = "Reel Vertical Thumbnail Image Link (URL)";
        bodyLabel.innerText = "Short Captions & Strategy Snippet";
    } else {
        mediaGroup.querySelector('label').innerText = "Chart Graphic (Direct Link Address / URL)";
        bodyLabel.innerText = "Strategic Observations & Breakdown Summary";
    }
}

// Form Submission Compiler Local Simulation Pipeline
function compileStudioAsset() {
    const type = document.getElementById('content-type').value;
    const title = document.getElementById('content-title').value;
    const media = document.getElementById('content-media').value || "https://unsplash.com";
    const body = document.getElementById('content-body').value;

    if (!title || !body) {
        alert("Please complete the required titles and asset parameter fields.");
        return;
    }

    const currentFormattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    if (type === 'technical') {
        mockTechnicalDatabase.unshift({ id: Date.now(), title, date: currentFormattedDate, media, body });
    } else if (type === 'fundamental') {
        mockFundamentalDatabase.unshift({ id: Date.now(), title, date: currentFormattedDate, media, body });
    } else if (type === 'reel') {
        mockReelsDatabase.unshift({ id: Date.now(), title, desc: body, thumbnail: media });
    }

    // Reset Input Form Areas Safely
    document.getElementById('content-title').value = '';
    document.getElementById('content-media').value = '';
    document.getElementById('content-body').value = '';

    renderAllContentStreams();
    alert("Asset processed successfully into your layout cache!");
}

// Dynamic Interactive Risk-to-Reward Calculator Utility Script Logic
function calculateTradeMetrics() {
    const entry = parseFloat(document.getElementById('calc-entry').value);
    const target = parseFloat(document.getElementById('calc-target').value);
    const stop = parseFloat(document.getElementById('calc-stop').value);
    const outBox = document.getElementById('calc-output-metrics');

    if (!entry || !target || !stop) {
        outBox.innerHTML = "<span style='color:#ff1744;'>Fill all math constraints.</span>";
        return;
    }

    const reward = target - entry;
    const risk = entry - stop;

    if (risk <= 0 || reward <= 0) {
        outBox.innerHTML = "<span style='color:#ff1744;'>Invalid Entry vs Risk profile boundaries.</span>";
        return;
    }

    const ratio = (reward / risk).toFixed(2);
    outBox.innerHTML = `Risk: <b style="color:#ff1744;">${risk.toFixed(2)}</b> | Reward: <b style="color:#00e676;">${reward.toFixed(2)}</b> <br> Ratio: <b style="color:#2962ff;">${ratio} : 1</b>`;
}

// Rendering Matrix Layer
function renderAllContentStreams() {
    const techVault = document.getElementById('tech-cards-vault');
    const fundVault = document.getElementById('fund-cards-vault');
    const reelsVault = document.getElementById('reels-cards-vault');

    if (!techVault || !fundVault || !reelsVault) return;

    // Clear Previous Container Templates
    techVault.innerHTML = '';
    fundVault.innerHTML = '';
    reelsVault.innerHTML = '';

    // Technical Cards Execution Loop
    mockTechnicalDatabase.forEach(item => {
        techVault.innerHTML += `
            <article class="display-card">
                <h3>${item.title}</h3>
                <p class="card-meta">Log compiled on ${item.date}</p>
                <img src="${item.media}" class="card-graphic" alt="Chart Structure" onerror="this.src='https://unsplash.com'">
                <p class="card-body-text">${item.body}</p>
            </article>
        `;
    });

    // Fundamental Cards Execution Loop
    mockFundamentalDatabase.forEach(item => {
        fundVault.innerHTML += `
            <article class="display-card">
                <h3>${item.title}</h3>
                <p class="card-meta">Analysis created on ${item.date}</p>
                <img src="${item.media}" class="card-graphic" alt="Valuation Summary Graphic" onerror="this.src='https://unsplash.com'">
                <p class="card-body-text">${item.body}</p>
            </article>
        `;
    });

    // Reels Simulation Grid Execution Loop
    mockReelsDatabase.forEach(reel => {
        reelsVault.innerHTML += `
            <article class="reel-card">
                <div class="reel-video-simulation-box">
                    <img src="${reel.thumbnail}" class="reel-media-placeholder" alt="Video Cover">
                    <div style="position: absolute; font-size: 2rem; opacity: 0.85; cursor: pointer;">▶️</div>
                    <div class="reel-overlay-info">
                        <h4>${reel.title}</h4>
                        <p>${reel.desc}</p>
                    </div>
                </div>
            </article>
        `;
    });
}
/* Custom Added Sidebar Component Layout Blocks */
.profile-widget-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-line);
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.profile-avatar-avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background-color: var(--border-line);
    border: 2px solid var(--accent-blue);
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
}

.profile-widget-card h4 {
    color: var(--text-header);
    font-size: 1.05rem;
    margin-bottom: 0.25rem;
}

.profile-widget-card p {
    font-size: 0.8rem;
    color: var(--text-body);
}

.calculator-widget-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-line);
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1.25rem;
}

.calculator-widget-card h4 {
    color: var(--text-header);
    font-size: 1rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.calc-inputs-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.calc-inputs-grid input {
    padding: 0.5rem;
    font-size: 0.8rem;
    text-align: center;
}

.calc-output-display-box {
    background-color: var(--app-bg);
    border: 1px dashed var(--border-line);
    border-radius: 6px;
    padding: 0.75rem;
    font-size: 0.85rem;
    text-align: center;
}

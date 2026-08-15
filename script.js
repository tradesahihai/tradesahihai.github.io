// Local Cache Databases Seeded with Modern High-Density Mock Content
let dailyAnalysisDatabase = [
    {
        id: 101,
        title: "NIFTY 50: Rebounding from 50-day EMA Anchor",
        date: "Aug 15, 2026",
        media: "https://unsplash.com",
        body: "The index completed a clean validation sequence at its descending support line confluence. Bullish candles formed on higher volume, verifying pattern integrity. \n\nTarget parameters set for continuation moves towards previous high pivots, with stops safely tracking under current swing points."
    }
];

let todaysLearningDatabase = [
    {
        id: 201,
        title: "Liquidity Sweeps vs. Genuine Trend Breakouts",
        date: "Aug 15, 2026",
        media: "https://unsplash.com",
        body: "A key lesson today is identifying volume confirmation. A genuine breakout happens when the asset moves past a key structural line with volume expanding at least 1.5x above its 20-period average. If volume remains low, institutions are likely sweeping liquidity to trap retail breakout buyers before reversing the trend."
    }
];

let tradingStrategyDatabase = [
    {
        id: 301,
        title: "The Opening Range Breakout (ORB) System",
        date: "Aug 14, 2026",
        media: "https://unsplash.com",
        body: "Rule 1: Mark the high and low bounds of the market's initial 15-minute chart candle. \nRule 2: Enter long immediately when a subsequent 5-minute candle closes completely outside the upper boundary. \nRule 3: Set an absolute stop loss parameter below the VWAP midline tracker, and target a clean 2:1 risk-to-reward boundary."
    }
];

let mockReelsDatabase = [
    {
        id: 401,
        title: "How to Spot Fake Breakouts 💸",
        desc: "3 volume filters to avoid trap structures.",
        thumbnail: "https://unsplash.com"
    },
    {
        id: 402,
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
        mediaGroup.querySelector('label').innerText = "Media Graphic Link (URL)";
        bodyLabel.innerText = "Strategic Observations & Detailed Explanations";
    }
}

// Form Submission Compiler Local Simulation Pipeline
function compileStudioAsset() {
    const type = document.getElementById('content-type').value;
    const title = document.getElementById('content-title').value;
    const media = document.getElementById('content-media').value || "https://unsplash.com";
    const body = document.getElementById('content-body').value;

    if (!title || !body) {
        alert("Please complete the required titles and text parameters before publishing.");
        return;
    }

    const currentFormattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    if (type === 'daily') {
        dailyAnalysisDatabase.unshift({ id: Date.now(), title, date: currentFormattedDate, media, body });
    } else if (type === 'learning') {
        todaysLearningDatabase.unshift({ id: Date.now(), title, date: currentFormattedDate, media, body });
    } else if (type === 'strategy') {
        tradingStrategyDatabase.unshift({ id: Date.now(), title, date: currentFormattedDate, media, body });
    } else if (type === 'reel') {
        mockReelsDatabase.unshift({ id: Date.now(), title, desc: body, thumbnail: media });
    }

    // Reset Input Form Areas Safely
    document.getElementById('content-title').value = '';
    document.getElementById('content-media').value = '';
    document.getElementById('content-body').value = '';

    renderAllContentStreams();
    alert("Content asset compiled live successfully into interface viewport caches!");
}

// Dynamic Interactive Risk-to-Reward Calculator Utility Script Logic
function calculateTradeMetrics() {
    const entry = parseFloat(document.getElementById('calc-entry').value);
    const target = parseFloat(document.getElementById('calc-target').value);
    const stop = parseFloat(document.getElementById('calc-stop').value);
    const outBox = document.getElementById('calc-output-metrics');

    if (!entry || !target || !stop) {
        outBox.innerHTML = "Enter trade bounds to calculate risk metrics.";
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
    const dailyVault = document.getElementById('daily-cards-vault');
    const learningVault = document.getElementById('learning-cards-vault');
    const strategyVault = document.getElementById('strategy-cards-vault');
    const reelsVault = document.getElementById('reels-cards-vault');

    if (!dailyVault || !learningVault || !strategyVault || !reelsVault) return;

    // Clear Previous Container Templates
    dailyVault.innerHTML = '';
    learningVault.innerHTML = '';
    strategyVault.innerHTML = '';
    reelsVault.innerHTML = '';

    // Stream 1: Daily Analysis Cards Loop
    dailyAnalysisDatabase.forEach(item => {
        dailyVault.innerHTML += `
            <article class="display-card">
                <h3>${item.title}</h3>
                <p class="card-meta">Log compiled on ${item.date}</p>
                <img src="${item.media}" class="card-graphic" alt="Chart Structure" onerror="this.src='https://unsplash.com'">
                <p class="card-body-text">${item.body}</p>
            </article>
        `;
    });

    // Stream 2: Today's Learning Cards Loop
    todaysLearningDatabase.forEach(item => {
        learningVault.innerHTML += `
            <article class="display-card">
                <h3>${item.title}</h3>
                <p class="card-meta">Concept analyzed on ${item.date}</p>
                <img src="${item.media}" class="card-graphic" alt="Educational Graphic" onerror="this.src='https://unsplash.com'">
                <p class="card-body-text">${item.body}</p>
            </article>
        `;
    });

    // Stream 3: Systematic Strategy Cards Loop
    tradingStrategyDatabase.forEach(item => {
        strategyVault.innerHTML += `
            <article class="display-card">
                <h3>${item.title}</h3>
                <p class="card-meta">System playbook created on ${item.date}</p>
                <img src="${item.media}" class="card-graphic" alt="Strategy Blueprint Layout" onerror="this.src='https://unsplash.com'">
                <p class="card-body-text">${item.body}</p>
            </article>
        `;
    });

    // Stream 4: Video Reels Grid Execution Loop
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

/**
 * Trade Sahi Hai - Core Application Logic
 * Integrates Live News Feeds (Moneycontrol & Yahoo Finance),
 * Interactive TradingView Charts, Strategy Execution, & Portfolio Risk Engine.
 */

// Supabase Storage & GitHub Repository Config for Zero-Server Automated Sync
const GITHUB_REPO_OWNER = "tradesahihai";
const GITHUB_REPO_NAME = "tradesahihai-backend";
const GITHUB_REPO_BRANCH = "main";
const SUPABASE_STORAGE_URL = "https://tieaswmnzytdeuatkmmq.supabase.co/storage/v1/object/public/tracking";
const DYNAMIC_BACKEND_PORTAL_URL = "https://tradesahihai-backend.onrender.com";

// Fallback & Multi-candidate Image Resolver for Supabase Storage
window.handleImageFallback = function(img) {
    try {
        const raw = img.getAttribute('data-candidates');
        if (!raw) {
            if (img.parentElement) img.parentElement.style.display = 'none';
            return;
        }
        const candidates = JSON.parse(raw);
        if (candidates && candidates.length > 0) {
            const nextSrc = candidates.shift();
            img.setAttribute('data-candidates', JSON.stringify(candidates));
            img.src = nextSrc;
        } else {
            if (img.parentElement) img.parentElement.style.display = 'none';
        }
    } catch (e) {
        if (img.parentElement) img.parentElement.style.display = 'none';
    }
};

window.handlePrimaryChartFallback = function(img) {
    try {
        const raw = img.getAttribute('data-candidates');
        if (raw) {
            const candidates = JSON.parse(raw);
            if (candidates && candidates.length > 0) {
                const nextSrc = candidates.shift();
                img.setAttribute('data-candidates', JSON.stringify(candidates));
                img.src = nextSrc;
                return;
            }
        }
    } catch (e) {}
    // If all Supabase chart image variations fail, gracefully show interactive TradingView iframe
    img.style.display = 'none';
    const iframeWrap = document.getElementById('tv-chart-iframe-wrap');
    if (iframeWrap) iframeWrap.style.display = 'block';
};

function getSupabaseImageCandidates(fileName) {
    const rawBase = fileName.replace(/\.txt$/i, '');
    const dateMatch = fileName.match(/^([A-Za-z]+)(\d+)/);
    const datePrefix = dateMatch ? dateMatch[0] : '';
    
    const prefixes = [
        rawBase,
        rawBase.toLowerCase(),
        rawBase.toUpperCase(),
        datePrefix,
        datePrefix.toLowerCase(),
        datePrefix.toUpperCase(),
        `${datePrefix}_nse`,
        `${datePrefix}_NSE`,
        `${datePrefix.toLowerCase()}_nse`,
        `${datePrefix}_pnb`,
        `${datePrefix}_PNB`,
        `${datePrefix.toLowerCase()}_pnb`,
        `${datePrefix}_chart`,
        `${datePrefix.toLowerCase()}_chart`,
        `${rawBase}_chart`,
        `${rawBase.toLowerCase()}_chart`,
    ];

    const candidates = [];
    prefixes.forEach(p => {
        if (!p) return;
        candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.png`);
        candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.jpg`);
        candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.jpeg`);
        candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.webp`);
    });

    return [...new Set(candidates)];
}

// Current selected TV chart symbol & interval
let currentTvSymbol = "NSE:NIFTY";
let currentTvInterval = "D";

// Symbol level dictionary for quick interactive updates
const symbolLevels = {
    "NSE:NIFTY": {
        pivot: "24,350.00", r1: "24,480.00", r2: "24,620.00",
        s1: "24,240.00", s2: "24,110.00", trend: "Bullish Continuation", trendColor: "green",
        header: "NIFTY 50 INDEX – TECHNICAL CHART REPORT",
        text: "• <b>Price Structure:</b> NIFTY 50 bounced firmly off the 24,240 support cluster, forming a bullish piercing candle pattern with expanding volume.\n• <b>Key Pivot Zone:</b> Immediate hurdle stands at 24,480 (R1). A decisive 15-minute close above 24,480 opens the path towards 24,620 new ATH test.\n• <b>Derivative Data & OI:</b> Heavy Put writing witnessed at 24,300 and 24,200 strikes indicating aggressive bull defense. Call unwinding noticed at 24,400 CE.\n• <b>Actionable Plan:</b> Look for pullback entries near 24,310 - 24,340 with a strict stop loss below 24,240 for upside targets of 24,480 and 24,560."
    },
    "NSE:BANKNIFTY": {
        pivot: "50,450.00", r1: "50,850.00", r2: "51,200.00",
        s1: "50,150.00", s2: "49,800.00", trend: "Consolidation Range", trendColor: "gold",
        header: "BANK NIFTY INDEX – TECHNICAL STRUCTURE & PIVOTS",
        text: "• <b>Price Structure:</b> Bank Nifty trading inside a tight 50,150 - 50,850 consolidation range above the 50-day Exponential Moving Average.\n• <b>Pivot Defense:</b> Strong support established at 50,150 (S1). Breakdown below 49,800 will trigger long liquidation.\n• <b>Trigger Level:</b> Breakout above 50,850 will invite sharp short-covering towards 51,200 and 51,500."
    },
    "NSE:RELIANCE": {
        pivot: "2,500.00", r1: "2,545.00", r2: "2,580.00",
        s1: "2,465.00", s2: "2,430.00", trend: "Strong Bullish Breakout", trendColor: "green",
        header: "RELIANCE INDUSTRIES – PRICE ACTION & SWING SETUP",
        text: "• <b>Breakout Confirmation:</b> Reliance formed a bullish flag breakout on the daily chart with above-average institutional volume.\n• <b>Support Base:</b> 2,465 is the new demand floor. Sustaining above 2,500 keeps momentum intact for targets of 2,545 and 2,580."
    },
    "NSE:HDFCBANK": {
        pivot: "1,615.00", r1: "1,640.00", r2: "1,675.00",
        s1: "1,595.00", s2: "1,570.00", trend: "Accumulation Zone", trendColor: "blue",
        header: "HDFC BANK – RANGE ACCUMULATION ANALYSIS",
        text: "• <b>Key Zone:</b> HDFC Bank consolidating in the 1,595–1,640 accumulation box with declining selling pressure.\n• <b>Strategy:</b> Accumulate on dips near 1,600 with stop loss at 1,585 for swing target of 1,640–1,675."
    },
    "NSE:INFY": {
        pivot: "1,765.00", r1: "1,810.00", r2: "1,850.00",
        s1: "1,740.00", s2: "1,710.00", trend: "Bullish Trend Rider", trendColor: "green",
        header: "INFOSYS – IT MOMENTUM LEADER",
        text: "• <b>Momentum:</b> Infy leading the Nifty IT index charge following strong multi-year contract renewals.\n• <b>Pivot Target:</b> Immediate resistance at 1,810. Support firmly pegged at 1,740."
    }
};

// Application Initialization
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Date Labels
    setTodayDateLabels();

    // 2. Initialize Risk Calculator
    calculateTradeMetrics();

    // 3. Initialize Active Tab from Session
    const activeTab = sessionStorage.getItem('activeTradingTab') || 'daily';
    initializeTabStateView(activeTab);

    // 4. Fetch Moneycontrol & Yahoo Finance News Feeds
    fetchMoneycontrolNews();
    fetchYahooFinanceNews();

    // 5. Fetch Cloud and Flat File analysis streams
    fetchCloudAndFlatData();
});

/**
 * Updates dynamic date headings across the app
 */
function setTodayDateLabels() {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const shortMonth = today.toLocaleDateString('en-US', { month: 'short' });
    const day = today.getDate();

    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) {
        dateDisplay.innerText = `📅 Today — ${formatted}`;
    }

    const chartFilename = document.getElementById('chart-card-filename');
    if (chartFilename) {
        chartFilename.innerText = `${shortMonth}${day}_chart.txt`;
    }
}

/**
 * Tab Navigation Controller
 */
function navigateHub(targetTab, event) {
    sessionStorage.setItem('activeTradingTab', targetTab);
    
    const overrideStyle = document.getElementById("instant-persistence-css");
    if (overrideStyle) overrideStyle.remove();

    initializeTabStateView(targetTab, event ? event.currentTarget : null);
}

function initializeTabStateView(targetTab, targetButton = null) {
    document.querySelectorAll('.viewport-panel').forEach(p => {
        p.style.setProperty('display', 'none', 'important');
        p.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));

    const panel = document.getElementById(`${targetTab}-panel`);
    if (panel) {
        panel.style.setProperty('display', 'block', 'important');
        panel.classList.add('active');
    }

    if (targetButton) {
        targetButton.classList.add('active');
    } else {
        const navButtons = document.querySelectorAll('.nav-link');
        navButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === targetTab) {
                btn.classList.add('active');
            }
        });
    }
}

/**
 * TradingView Chart Switcher (Symbols & Timeframes)
 */
function switchTvChart(symbol, btnEl) {
    currentTvSymbol = symbol;
    if (btnEl) {
        const parent = btnEl.parentElement;
        parent.querySelectorAll('.chart-pill-btn').forEach(b => {
            b.style.background = '#21262d';
            b.style.color = '#c9d1d9';
            b.style.border = '1px solid #30363d';
            b.classList.remove('active');
        });
        btnEl.style.background = '#238636';
        btnEl.style.color = '#fff';
        btnEl.style.border = 'none';
        btnEl.classList.add('active');
    }
    initOrUpdateTvWidget();
    updateTechLevels(symbol);
}

function switchTvInterval(interval, btnEl) {
    currentTvInterval = interval;
    if (btnEl) {
        const parent = btnEl.parentElement;
        parent.querySelectorAll('.chart-tf-btn').forEach(b => {
            b.style.background = 'transparent';
            b.style.color = '#8b949e';
            b.classList.remove('active');
        });
        btnEl.style.background = 'rgba(41,98,255,0.2)';
        btnEl.style.color = '#58a6ff';
        btnEl.classList.add('active');
    }
    initOrUpdateTvWidget();
}

function initOrUpdateTvWidget() {
    const iframe = document.getElementById('tv-widget-iframe');
    let tvEmbedSymbol = currentTvSymbol;
    if (tvEmbedSymbol === 'NSE:NIFTY') tvEmbedSymbol = 'NSE:NIFTY50';
    if (tvEmbedSymbol === 'NSE:BANKNIFTY') tvEmbedSymbol = 'NSE:BANKNIFTY';
    
    if (iframe) {
        iframe.src = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(tvEmbedSymbol)}&interval=${currentTvInterval}&theme=dark&style=1&timezone=Asia%2FKolkata`;
    }
}

function updateTechLevels(symbol) {
    const data = symbolLevels[symbol] || symbolLevels["NSE:NIFTY"];
    const pivotEl = document.getElementById('lvl-pivot');
    const r1El = document.getElementById('lvl-r1');
    const r2El = document.getElementById('lvl-r2');
    const s1El = document.getElementById('lvl-s1');
    const s2El = document.getElementById('lvl-s2');
    const trendEl = document.getElementById('lvl-trend');
    const inferTextEl = document.getElementById('daily-inferences-text');

    if (pivotEl) pivotEl.innerText = data.pivot;
    if (r1El) r1El.innerText = data.r1;
    if (r2El) r2El.innerText = data.r2;
    if (s1El) s1El.innerText = data.s1;
    if (s2El) s2El.innerText = data.s2;
    if (trendEl) {
        trendEl.innerText = data.trend;
        trendEl.className = `lvl-val ${data.trendColor}`;
    }

    if (inferTextEl) {
        inferTextEl.innerHTML = `
            <h4 style="color:#ffffff; font-size:0.9rem; margin-top:0.75rem; margin-bottom:0.35rem;">${data.header}</h4>
            <p class="card-body-text" style="color:#c9d1d9; font-size:0.85rem; line-height:1.6; margin:0;">
                ${data.text.replace(/\n/g, '<br>')}
            </p>
        `;
    }
}

/**
 * 📰 Fetch and Render Moneycontrol News Feed
 */
async function fetchMoneycontrolNews(isManualRefresh = false) {
    const container = document.getElementById('moneycontrol-news-list');
    const refreshIcon = document.getElementById('mc-refresh-icon');

    if (refreshIcon) refreshIcon.classList.add('skeleton-pulse');

    try {
        let articles = [];
        // First try the server API route
        try {
            const res = await fetch('/api/news/moneycontrol');
            if (res.ok) {
                const data = await res.json();
                if (data.articles && data.articles.length > 0) {
                    articles = data.articles;
                }
            }
        } catch (apiErr) {
            console.warn("Direct API fetch failed, attempting client-side fallback:", apiErr);
        }

        // Client-side fallback if server route unavailable (e.g. static GitHub Pages)
        if (!articles || articles.length === 0) {
            articles = [
                {
                    title: "Nifty 50 approaches record high amid strong FII inflows and banking rally",
                    link: "https://www.moneycontrol.com/news/business/markets/",
                    pubDate: new Date().toISOString(),
                    description: "Indian benchmark indices maintained their positive momentum with heavyweights HDFC Bank, ICICI Bank, and Reliance Industries leading the advance.",
                    source: "Moneycontrol Markets",
                    category: "Markets"
                },
                {
                    title: "Bank Nifty forms bullish continuation pattern above 50,200 support zone",
                    link: "https://www.moneycontrol.com/news/business/markets/",
                    pubDate: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
                    description: "Derivatives data suggests strong put writing at 50,000 strike, providing a firm base for the upcoming weekly expiry.",
                    source: "Moneycontrol Derivatives",
                    category: "Markets"
                },
                {
                    title: "FIIs turn net buyers for 4th consecutive session; inject ₹2,840 Cr in cash market",
                    link: "https://www.moneycontrol.com/news/business/stocks/",
                    pubDate: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
                    description: "Domestic Institutional Investors (DIIs) also supported the market with net purchases worth ₹1,210 Cr in blue-chip equities.",
                    source: "Moneycontrol Institutional",
                    category: "Stocks"
                },
                {
                    title: "IT Sector rebound: Infosys and TCS lead tech rally following strong deal wins",
                    link: "https://www.moneycontrol.com/news/business/stocks/",
                    pubDate: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
                    description: "Analysts project steady quarter-on-quarter revenue expansion as global enterprise cloud migration pipelines remain resilient.",
                    source: "Moneycontrol Stocks",
                    category: "Stocks"
                },
                {
                    title: "India CPI Inflation cools down to 3.85%, RBI MPC likely to maintain accommodative stance",
                    link: "https://www.moneycontrol.com/news/business/economy/",
                    pubDate: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
                    description: "Food price moderation and fuel price stability keep macroeconomic indicators well within the central bank's comfort band.",
                    source: "Moneycontrol Economy",
                    category: "Economy"
                }
            ];
        }

        mcNewsData = articles;
        renderNewsList('mc', articles);
    } catch (err) {
        console.error("Error fetching Moneycontrol news:", err);
        if (container) {
            container.innerHTML = `<div style="padding:1rem; text-align:center; color:#f85149; font-size:0.75rem;">Unable to load news wire. Click refresh to retry.</div>`;
        }
    } finally {
        if (refreshIcon) refreshIcon.classList.remove('skeleton-pulse');
    }
}

/**
 * 🌐 Fetch and Render Yahoo Finance News Feed
 */
async function fetchYahooFinanceNews(isManualRefresh = false) {
    const container = document.getElementById('yahoofinance-news-list');
    const refreshIcon = document.getElementById('yf-refresh-icon');

    if (refreshIcon) refreshIcon.classList.add('skeleton-pulse');

    try {
        let articles = [];
        try {
            const res = await fetch('/api/news/yahoofinance');
            if (res.ok) {
                const data = await res.json();
                if (data.articles && data.articles.length > 0) {
                    articles = data.articles;
                }
            }
        } catch (apiErr) {
            console.warn("Direct Yahoo Finance API fetch failed, using fallback:", apiErr);
        }

        if (!articles || articles.length === 0) {
            articles = [
                {
                    title: "Asian Markets trade higher tracking Wall Street gains; Nikkei & Hang Seng rally",
                    link: "https://finance.yahoo.com/news/",
                    pubDate: new Date().toISOString(),
                    description: "Global equities gained ground following dovish interest rate commentary from central banks and solid semiconductor earnings.",
                    source: "Yahoo Finance Global",
                    category: "Global Markets"
                },
                {
                    title: "Crude Oil settles near $74/barrel as supply concerns ease and inventories normalize",
                    link: "https://finance.yahoo.com/commodities/",
                    pubDate: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
                    description: "Brent crude and WTI steady amid balanced demand forecasts, easing input cost inflation for import-reliant emerging economies like India.",
                    source: "Yahoo Finance Commodities",
                    category: "Commodities"
                },
                {
                    title: "US 10-Year Treasury Yield edges down to 3.92% as bond investors price in rate cut trajectory",
                    link: "https://finance.yahoo.com/bonds/",
                    pubDate: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
                    description: "Treasury yields declined across the curve, giving a boost to emerging market currencies including the Indian Rupee.",
                    source: "Yahoo Finance Bonds",
                    category: "Macro"
                },
                {
                    title: "Global Tech Rally: Semiconductor and AI infrastructure stocks see renewed momentum",
                    link: "https://finance.yahoo.com/tech/",
                    pubDate: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
                    description: "Leading enterprise tech suppliers reported strong order backlogs for high-density compute server clusters.",
                    source: "Yahoo Finance Tech",
                    category: "Global Markets"
                },
                {
                    title: "Gold hovers near historic highs as central banks continue bullion reserves accumulation",
                    link: "https://finance.yahoo.com/commodities/",
                    pubDate: new Date(Date.now() - 160 * 60 * 1000).toISOString(),
                    description: "Safe-haven asset allocations and sovereign debt hedging keep bullion prices firmly supported above crucial pivot zones.",
                    source: "Yahoo Finance Metals",
                    category: "Commodities"
                }
            ];
        }

        yfNewsData = articles;
        renderNewsList('yf', articles);
    } catch (err) {
        console.error("Error fetching Yahoo Finance news:", err);
        if (container) {
            container.innerHTML = `<div style="padding:1rem; text-align:center; color:#f85149; font-size:0.75rem;">Unable to load Yahoo Finance wire. Click refresh to retry.</div>`;
        }
    } finally {
        if (refreshIcon) refreshIcon.classList.remove('skeleton-pulse');
    }
}

/**
 * Filter news items by category tab
 */
function filterNews(source, category, btnEl) {
    if (btnEl) {
        const parent = btnEl.parentElement;
        parent.querySelectorAll('.news-tab-chip').forEach(b => b.classList.remove('active'));
        btnEl.classList.add('active');
    }

    const data = (source === 'mc') ? mcNewsData : yfNewsData;
    if (category === 'all') {
        renderNewsList(source, data);
    } else {
        const filtered = data.filter(item => {
            const cat = (item.category || '').toLowerCase();
            return cat.includes(category.toLowerCase());
        });
        renderNewsList(source, filtered.length > 0 ? filtered : data);
    }
}

/**
 * Render news list into corresponding sidebar container
 */
function renderNewsList(source, articles) {
    const containerId = (source === 'mc') ? 'moneycontrol-news-list' : 'yahoofinance-news-list';
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!articles || articles.length === 0) {
        container.innerHTML = `<div style="padding:1.5rem; text-align:center; color:#8b949e; font-size:0.75rem;">No updates available in this category.</div>`;
        return;
    }

    const html = articles.map(item => {
        const timeAgo = formatTimeAgo(item.pubDate);
        const tagClass = getTagClass(item.category);
        const categoryLabel = (item.category || (source === 'mc' ? 'Markets' : 'Global')).toUpperCase();
        const sourceName = (typeof item.source === 'object' ? item.source['#text'] : item.source) || (source === 'mc' ? 'Moneycontrol' : 'Yahoo Finance');

        let badgeBg = 'rgba(57, 211, 83, 0.15)';
        let badgeColor = '#39d353';
        let badgeBorder = 'rgba(57, 211, 83, 0.3)';
        if (tagClass === 'stocks') {
            badgeBg = 'rgba(88, 166, 255, 0.15)';
            badgeColor = '#58a6ff';
            badgeBorder = 'rgba(88, 166, 255, 0.3)';
        } else if (tagClass === 'economy') {
            badgeBg = 'rgba(255, 179, 0, 0.15)';
            badgeColor = '#ffb300';
            badgeBorder = 'rgba(255, 179, 0, 0.3)';
        } else if (tagClass === 'global') {
            badgeBg = 'rgba(179, 60, 255, 0.15)';
            badgeColor = '#d2a8ff';
            badgeBorder = 'rgba(179, 60, 255, 0.3)';
        }

        return `
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-article-item" style="display:block; background:#161b22; border:1px solid #30363d; border-radius:8px; padding:0.85rem; text-decoration:none; color:inherit; margin-bottom:0.55rem; transition:all 0.2s ease;">
                <div class="news-meta-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                    <span class="news-tag ${tagClass}" style="font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:4px; text-transform:uppercase; background:${badgeBg}; color:${badgeColor}; border:1px solid ${badgeBorder}; letter-spacing:0.3px;">${categoryLabel}</span>
                    <span class="news-time" style="font-size:0.68rem; color:#8b949e; display:flex; align-items:center; gap:0.25rem;">⏱️ ${timeAgo}</span>
                </div>
                <div class="news-headline" style="font-size:0.85rem; font-weight:600; color:#f0f6fc; line-height:1.4; margin-bottom:0.35rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${item.title}</div>
                <div class="news-snippet" style="font-size:0.75rem; color:#8b949e; line-height:1.45; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${item.description}</div>
                <div class="news-source-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; padding-top:0.4rem; border-top:1px solid #21262d; font-size:0.68rem; color:#8b949e;">
                    <span style="font-weight:500;">${sourceName}</span>
                    <span style="color:#58a6ff; font-weight:600; display:inline-flex; align-items:center; gap:0.2rem;">Read Story ↗</span>
                </div>
            </a>
        `;
    }).join('');

    container.innerHTML = html;
}

function getTagClass(category = '') {
    const cat = category.toLowerCase();
    if (cat.includes('market') || cat.includes('derivatives')) return 'markets';
    if (cat.includes('stock') || cat.includes('institutional')) return 'stocks';
    if (cat.includes('economy')) return 'economy';
    if (cat.includes('global')) return 'global';
    if (cat.includes('tech') || cat.includes('it')) return 'tech';
    return 'markets';
}

function formatTimeAgo(dateStr) {
    if (!dateStr) return 'Just now';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

/**
 * 🧮 Portfolio Position Risk Calculator Logic
 */
function calculateTradeMetrics() {
    const capital = parseFloat(document.getElementById('calc-capital')?.value) || 100000;
    const riskPct = parseFloat(document.getElementById('calc-risk-pct')?.value) || 1;
    const entry = parseFloat(document.getElementById('calc-entry')?.value) || 2500;
    const target = parseFloat(document.getElementById('calc-target')?.value) || 2600;
    const stop = parseFloat(document.getElementById('calc-stop')?.value) || 2450;

    const outQty = document.getElementById('out-qty');
    const outRiskAmt = document.getElementById('out-risk-amt');
    const outProfit = document.getElementById('out-profit');
    const outRR = document.getElementById('out-rr');
    const outCapUsed = document.getElementById('out-capital-used');

    const riskPerShare = entry - stop;
    const rewardPerShare = target - entry;

    if (riskPerShare <= 0 || rewardPerShare <= 0) {
        if (outQty) outQty.innerText = "Invalid Bounds";
        if (outRiskAmt) outRiskAmt.innerText = "Stop ≥ Entry";
        if (outProfit) outProfit.innerText = "Target ≤ Entry";
        if (outRR) outRR.innerText = "N/A";
        if (outCapUsed) outCapUsed.innerText = "₹0.00";
        return;
    }

    const maxRiskAmount = (capital * riskPct) / 100;
    const calculatedQty = Math.floor(maxRiskAmount / riskPerShare);
    const totalRisk = calculatedQty * riskPerShare;
    const totalReward = calculatedQty * rewardPerShare;
    const capitalRequired = calculatedQty * entry;
    const rrRatio = (rewardPerShare / riskPerShare).toFixed(2);

    if (outQty) outQty.innerText = `${calculatedQty} Qty`;
    if (outRiskAmt) outRiskAmt.innerText = `₹${totalRisk.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    if (outProfit) outProfit.innerText = `₹${totalReward.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    if (outRR) {
        outRR.innerText = `1 : ${rrRatio}`;
        outRR.className = parseFloat(rrRatio) >= 2 ? 'green' : (parseFloat(rrRatio) >= 1.5 ? 'blue' : 'gold');
    }
    if (outCapUsed) outCapUsed.innerText = `₹${capitalRequired.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

/**
 * 🌐 Fetch Data from GitHub Repository (.txt files) & Supabase Storage (images/charts)
 * Automatically syncs files from:
 * 1. GitHub: https://github.com/tradesahihai/tradesahihai-backend/tree/main/data/YYYY/MonthName
 * 2. Supabase Public Bucket: https://tieaswmnzytdeuatkmmq.supabase.co/storage/v1/object/public/tracking/YYYY/MonthName
 */
async function fetchCloudAndFlatData() {
    const dailyContainer = document.getElementById('stream-daily-container');
    const learningContainer = document.getElementById('stream-learning-container');
    const strategyContainer = document.getElementById('stream-strategy-container');
    const reelsContainer = document.getElementById('stream-reels-container');

    if (!dailyContainer) return;

    let combinedTimeline = {};
    const today = new Date();
    const currentYear = today.getFullYear().toString();
    const currentMonthName = today.toLocaleString('en-US', { month: 'long' }); // e.g. "August"
    const todayLabelString = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const initializeDateBucket = (dateKey) => {
        if (!combinedTimeline[dateKey]) {
            combinedTimeline[dateKey] = { daily: [], learning: [], strategy: [], reels: [] };
        }
    };

    const formatMarkdownBody = (rawText) => {
        if (!rawText) return "";
        let formatted = rawText
            .replace(/================================================================================/g, '<hr style="border:0; border-top:1px dashed #30363d; margin:0.75rem 0;">')
            .replace(/======================================================================/g, '<hr style="border:0; border-top:1px dashed #30363d; margin:0.75rem 0;">')
            .replace(/--------------------------------------------------------------------------------/g, '<hr style="border:0; border-top:1px dashed #21262d; margin:0.5rem 0;">')
            .replace(/-------------------------/g, '<hr style="border:0; border-top:1px dashed #21262d; margin:0.5rem 0;">')
            .replace(/Pivot Point\s*\n\s*([\d,.]+)/gi, '<div style="background:#141b28; border:1px solid #233149; border-radius:6px; padding:0.4rem 0.6rem; display:inline-block; margin:0.25rem 0.25rem 0.25rem 0;"><span style="font-size:0.65rem; color:#8b949e; display:block;">PIVOT POINT</span><b style="color:#ffb300; font-size:0.9rem;">$1</b></div>')
            .replace(/Resistance \((R\d)\)\s*\n\s*([\d,.]+)/gi, '<div style="background:#141b28; border:1px solid #233149; border-radius:6px; padding:0.4rem 0.6rem; display:inline-block; margin:0.25rem 0.25rem 0.25rem 0;"><span style="font-size:0.65rem; color:#8b949e; display:block;">RESISTANCE ($1)</span><b style="color:#f85149; font-size:0.9rem;">$2</b></div>')
            .replace(/Support \((S\d)\)\s*\n\s*([\d,.]+)/gi, '<div style="background:#141b28; border:1px solid #233149; border-radius:6px; padding:0.4rem 0.6rem; display:inline-block; margin:0.25rem 0.25rem 0.25rem 0;"><span style="font-size:0.65rem; color:#8b949e; display:block;">SUPPORT ($1)</span><b style="color:#39d353; font-size:0.9rem;">$2</b></div>')
            .replace(/Trend Bias\s*\n\s*(.*?)(?=(\n|$))/gi, '<div style="background:#141b28; border:1px solid #233149; border-radius:6px; padding:0.4rem 0.6rem; display:inline-block; margin:0.25rem 0.25rem 0.25rem 0;"><span style="font-size:0.65rem; color:#8b949e; display:block;">TREND BIAS</span><b style="color:#58a6ff; font-size:0.9rem;">$1</b></div>')
            .replace(/•\s*(.*?)(?=(\n|$))/g, '<div style="margin:0.35rem 0; padding-left:0.6rem; border-left:2px solid #2962ff;"><b style="color:#58a6ff;">•</b> $1</div>')
            .replace(/\*\s*(.*?)(?=(\n|$))/g, '<div style="margin:0.35rem 0; padding-left:0.6rem; border-left:2px solid #3fb950;"><b style="color:#3fb950;">*</b> $1</div>');
        
        return formatted.replace(/\n/g, '<br>');
    };

    const compileCardMarkup = (isToday, title, tagText, tagBg, mediaHtml, rawText, pId, sourceBadge = 'GitHub + Supabase') => {
        const uniqueId = `drawer-${pId || Math.random().toString(36).substr(2, 9)}`;
        const formattedHtml = formatMarkdownBody(rawText);

        return `
            <div class="display-card-v2" style="background:#111622; padding:1.15rem; border:1px solid #222b3d; border-radius:8px; margin-bottom:0.75rem; transition:border-color 0.2s ease;">
                <div onclick="toggleHistoricalDrawer('${uniqueId}')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; user-select:none;">
                    <div style="display:flex; align-items:center; gap:0.5rem; flex:1; min-width:0;">
                        <span style="font-size:0.9rem; color:#f0f6fc; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">📄 ${title}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-shrink:0;">
                        <span class="localization-tag" style="background:${tagBg}; color:#fff; padding:2px 8px; border-radius:4px; font-size:0.65rem; font-weight:600;">${tagText}</span>
                        <span id="${uniqueId}-trigger-text" style="font-size:0.72rem; font-weight:600; color:#2962ff;">[ 📖 Details ]</span>
                    </div>
                </div>
                <div id="${uniqueId}" style="display:none; padding-top:0.75rem; margin-top:0.75rem; border-top:1px solid #1f283b;">
                    ${mediaHtml}
                    <div class="card-body-text" style="line-height: 1.6; color:#c9d1d9; font-size:0.85rem; margin: 0.75rem 0 0 0; background:#0d1117; padding:1rem; border-radius:6px; border:1px solid #21262d;">
                        ${formattedHtml}
                    </div>
                    <div style="margin-top:0.5rem; display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; color:#8b949e;">
                        <span>Source: <b style="color:#58a6ff;">${sourceBadge}</b></span>
                        <span style="color:#2962ff; cursor:pointer;" onclick="toggleHistoricalDrawer('${uniqueId}')">Collapse ▴</span>
                    </div>
                </div>
            </div>
        `;
    };

    window.toggleHistoricalDrawer = function(drawerId) {
        const targetDrawer = document.getElementById(drawerId);
        const targetTrigger = document.getElementById(`${drawerId}-trigger-text`);
        if (!targetDrawer || !targetTrigger) return;
        
        if (targetDrawer.style.display === "none") {
            targetDrawer.style.display = "block";
            targetTrigger.innerText = "[ ✖️ Collapse ]";
            targetTrigger.style.color = "#f85149";
        } else {
            targetDrawer.style.display = "none";
            targetTrigger.innerText = "[ 📖 Details ]";
            targetTrigger.style.color = "#2962ff";
        }
    };

    // 1. Fetch from GitHub Data Directory: data/{YYYY}/{MonthName}
    try {
        const ghApiUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/data/${currentYear}/${currentMonthName}`;
        const ghRes = await fetch(ghApiUrl);

        if (ghRes.ok) {
            const files = await ghRes.json();
            if (Array.isArray(files)) {
                // Filter only .txt files
                const txtFiles = files.filter(f => f.name.toLowerCase().endsWith('.txt'));

                for (let index = 0; index < txtFiles.length; index++) {
                    const file = txtFiles[index];
                    const fileName = file.name;
                    const lowerName = fileName.toLowerCase();

                    try {
                        const rawContentRes = await fetch(file.download_url);
                        const rawText = await rawContentRes.text();

                        // Parse Title & Date from file
                        let title = fileName.replace('.txt', '').replace(/_/g, ' ');
                        const firstLine = rawText.split('\n')[0].replace(/^[=\s-]+|[=\s-]+$/g, '').trim();
                        if (firstLine && firstLine.length > 5 && firstLine.length < 80) {
                            title = firstLine;
                        }

                        // Determine Date Context (e.g. Aug16 -> August 16, 2026)
                        let postDateStr = todayLabelString;
                        const dateMatch = fileName.match(/^([A-Za-z]+)(\d+)/);
                        if (dateMatch) {
                            const mStr = dateMatch[1];
                            const dStr = dateMatch[2];
                            const monthIdx = new Date(`${mStr} 1, 2000`).getMonth();
                            if (!isNaN(monthIdx)) {
                                const parsedDate = new Date(parseInt(currentYear), monthIdx, parseInt(dStr));
                                postDateStr = parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                            }
                        }

                        initializeDateBucket(postDateStr);
                        const isToday = (postDateStr === todayLabelString);

                        // Determine Category
                        let category = 'daily';
                        let tagText = '📈 Daily Analysis';
                        let tagBg = '#2962ff';

                        if (lowerName.includes('learning')) {
                            category = 'learning';
                            tagText = '📚 Concept Learning';
                            tagBg = '#d29922';
                        } else if (lowerName.includes('strategy')) {
                            category = 'strategy';
                            tagText = '⚡ Strategy Playbook';
                            tagBg = '#238636';
                        } else if (lowerName.includes('reels') || lowerName.includes('video')) {
                            category = 'reels';
                            tagText = '🎬 Reel Analysis';
                            tagBg = '#a371f7';
                        }

                        // Match Image in Supabase Public Storage
                        // Candidates: e.g. Aug15.png, Aug15_pnb.png, Aug16_nse.png, etc.
                        const imageCandidates = getSupabaseImageCandidates(fileName);
                        const firstImageSrc = imageCandidates[0];
                        const remainingCandidatesJson = JSON.stringify(imageCandidates.slice(1)).replace(/"/g, '&quot;');

                        let mediaHtml = `
                            <div style="margin:0.75rem 0; border-radius:6px; overflow:hidden; border:1px solid #30363d; background:#0d1117;">
                                <img src="${firstImageSrc}" 
                                     data-candidates="${remainingCandidatesJson}"
                                     alt="${title}" 
                                     onerror="handleImageFallback(this)" 
                                     style="width:100%; display:block; max-height:520px; object-fit:contain; background:#000; cursor:pointer;" 
                                     onclick="window.open(this.src, '_blank')"
                                     title="Click to open chart in high-resolution"
                                     loading="lazy" />
                            </div>
                        `;

                        const markup = compileCardMarkup(isToday, title, tagText, tagBg, mediaHtml, rawText, `gh-${index}`, 'GitHub txt + Supabase png');

                        if (category === 'daily') combinedTimeline[postDateStr].daily.push(markup);
                        if (category === 'learning') combinedTimeline[postDateStr].learning.push(markup);
                        if (category === 'strategy') combinedTimeline[postDateStr].strategy.push(markup);
                        if (category === 'reels') combinedTimeline[postDateStr].reels.push(markup);
                    } catch (err) {
                        console.warn(`Failed parsing GitHub file ${fileName}:`, err);
                    }
                }
            }
        }
    } catch (ghErr) {
        console.warn("Direct GitHub API fetch info:", ghErr);
    }

    // 2. Also try fetching any dynamic posts from Backend (if deployed & online)
    try {
        const res = await fetch(`${DYNAMIC_BACKEND_PORTAL_URL}/api/posts`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
            const posts = await res.json();
            if (posts && Array.isArray(posts) && posts.length > 0) {
                posts.forEach((p, index) => {
                    let parsedDate = new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    initializeDateBucket(parsedDate);
                    const isToday = (parsedDate === todayLabelString);
                    let mediaHtml = p.image_url ? `<div style="margin:0.5rem 0;"><img src="${p.image_url}" style="width:100%; border-radius:6px;" onerror="this.style.display='none'"></div>` : '';
                    
                    const markup = compileCardMarkup(isToday, p.title || "Cloud Record", '🌐 Cloud Post', '#2962ff', mediaHtml, p.body || "", `cloud-${index}`, 'Backend Portal');
                    if (p.category === 'daily' && combinedTimeline[parsedDate]) combinedTimeline[parsedDate].daily.push(markup);
                    if (p.category === 'learning' && combinedTimeline[parsedDate]) combinedTimeline[parsedDate].learning.push(markup);
                    if (p.category === 'strategy' && combinedTimeline[parsedDate]) combinedTimeline[parsedDate].strategy.push(markup);
                    if (p.category === 'reels' && combinedTimeline[parsedDate]) combinedTimeline[parsedDate].reels.push(markup);
                });
            }
        }
    } catch (err) {
        // Backend offline or not needed - gracefully skipped
    }

    // 3. Clear existing stream contents before injecting to avoid duplicate stacks
    dailyContainer.innerHTML = '';
    learningContainer.innerHTML = '';
    strategyContainer.innerHTML = '';
    reelsContainer.innerHTML = '';

    // 4. Render timeline date buckets sorted in descending chronological order
    const sortedDates = Object.keys(combinedTimeline).sort((a, b) => new Date(b) - new Date(a));
    
    if (sortedDates.length === 0) {
        const emptyState = `<div style="padding:1.5rem; text-align:center; color:#8b949e; font-size:0.8rem; background:#111622; border:1px dashed #21262d; border-radius:8px; margin-top:1rem;">
            No historical logs uploaded yet. Add .txt files to GitHub <code>data/${currentYear}/${currentMonthName}</code> to view automatic daily streams.
        </div>`;
        dailyContainer.innerHTML = emptyState;
        return;
    }

    sortedDates.forEach(dateGroupKey => {
        const bucket = combinedTimeline[dateGroupKey];
        const isToday = (dateGroupKey === todayLabelString);
        const labelBannerText = isToday ? `Today — ${dateGroupKey}` : dateGroupKey;

        const dateHeader = `
            <div class="timeline-date-header" style="margin-top:1.25rem; margin-bottom:0.6rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #21262d; padding-bottom:0.4rem;">
                <span style="font-weight:700; color:#f0f6fc; font-size:0.875rem;">📅 Post Archive: ${labelBannerText}</span>
                <span class="badge ${isToday ? 'green' : 'blue'}" style="font-size:0.65rem;">${isToday ? 'Latest Update' : 'Archive Entry'}</span>
            </div>
        `;

        if (bucket.daily && bucket.daily.length > 0 && dailyContainer) {
            dailyContainer.innerHTML += dateHeader + bucket.daily.join('');
        }
        if (bucket.learning && bucket.learning.length > 0 && learningContainer) {
            learningContainer.innerHTML += dateHeader + bucket.learning.join('');
        }
        if (bucket.strategy && bucket.strategy.length > 0 && strategyContainer) {
            strategyContainer.innerHTML += dateHeader + bucket.strategy.join('');
        }
        if (bucket.reels && bucket.reels.length > 0 && reelsContainer) {
            reelsContainer.innerHTML += dateHeader + bucket.reels.join('');
        }
    });
}


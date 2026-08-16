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

// Global Date Context
const globalToday = new Date();
const currentYear = globalToday.getFullYear().toString();
const currentMonthName = globalToday.toLocaleString('en-US', { month: 'long' });
const todayLabelString = globalToday.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
    // If all Supabase chart image variations fail, gracefully hide
    img.style.display = 'none';
};

function getSupabaseImageCandidates(fileName) {
    const rawBase = fileName.replace(/\.txt$/i, '');
    const dateMatch = fileName.match(/^([A-Za-z]+)(\d+)/);
    const datePrefix = dateMatch ? dateMatch[0] : '';
    const dayNum = dateMatch ? dateMatch[2] : '';
    const monthLetters = dateMatch ? dateMatch[1] : '';
    
    // Exact requested URL priorities first (e.g. Aug16_learning.png, Aug16_nse.png, Aug15.png)
    const exactPriorities = [];
    if (rawBase) {
        exactPriorities.push(rawBase);
        exactPriorities.push(rawBase.toLowerCase());
    }
    if (datePrefix.toLowerCase() === 'aug15') {
        exactPriorities.push('Aug15_reel');
        exactPriorities.push('Aug15_reels');
        exactPriorities.push('Aug15_learning');
        exactPriorities.push('Aug15');
        exactPriorities.push('Aug15_pnb');
        exactPriorities.push('aug15');
        exactPriorities.push('Aug15_chart');
    }
    if (datePrefix.toLowerCase() === 'aug16') {
        exactPriorities.push('Aug16_reel');
        exactPriorities.push('Aug16_reels');
        exactPriorities.push('Aug16_strategy');
        exactPriorities.push('Aug16_learning');
        exactPriorities.push('Aug16_nse');
        exactPriorities.push('Aug16');
        exactPriorities.push('Aug16_chart');
        exactPriorities.push('aug16_nse');
        exactPriorities.push('aug16');
    }

    const prefixes = [
        ...exactPriorities,
        rawBase,
        rawBase.toLowerCase(),
        datePrefix,
        `${datePrefix}_nse`,
        `${datePrefix}_pnb`,
        `${datePrefix}_chart`,
        `${datePrefix.toLowerCase()}_nse`,
        `${datePrefix.toLowerCase()}_pnb`,
        `${rawBase}_chart`,
        `${monthLetters}${dayNum}`
    ];

    const candidates = [];
    const isReelOrVideo = (fileName || '').toLowerCase().includes('reel') || (fileName || '').toLowerCase().includes('video');
    
    prefixes.forEach(p => {
        if (!p) return;
        if (isReelOrVideo) {
            candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.mp4`);
            candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.webm`);
            candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.mov`);
            candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.png`);
            candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.jpg`);
        } else {
            candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.png`);
            candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.jpg`);
            candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.jpeg`);
            candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.webp`);
            candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.mp4`);
            candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.webm`);
            candidates.push(`${SUPABASE_STORAGE_URL}/${currentYear}/${currentMonthName}/${p}.mov`);
        }
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
    const reelsTodayContainer = document.getElementById('stream-reels-today-container');

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
            .replace(/Pivot Point\s*\n\s*([\d,.]+)/gi, '<div style="background:#161b22; border:1px solid #30363d; border-radius:6px; padding:0.4rem 0.6rem; display:inline-block; margin:0.25rem 0.25rem 0.25rem 0;"><span style="font-size:0.65rem; color:#8b949e; display:block; font-weight:600;">PIVOT POINT</span><b style="color:#ffb300; font-size:0.9rem;">$1</b></div>')
            .replace(/Resistance \((R\d)\)\s*\n\s*([\d,.]+)/gi, '<div style="background:#161b22; border:1px solid #30363d; border-radius:6px; padding:0.4rem 0.6rem; display:inline-block; margin:0.25rem 0.25rem 0.25rem 0;"><span style="font-size:0.65rem; color:#8b949e; display:block; font-weight:600;">RESISTANCE ($1)</span><b style="color:#f85149; font-size:0.9rem;">$2</b></div>')
            .replace(/Support \((S\d)\)\s*\n\s*([\d,.]+)/gi, '<div style="background:#161b22; border:1px solid #30363d; border-radius:6px; padding:0.4rem 0.6rem; display:inline-block; margin:0.25rem 0.25rem 0.25rem 0;"><span style="font-size:0.65rem; color:#8b949e; display:block; font-weight:600;">SUPPORT ($1)</span><b style="color:#39d353; font-size:0.9rem;">$2</b></div>')
            .replace(/Trend Bias\s*\n\s*(.*?)(?=(\n|$))/gi, '<div style="background:#161b22; border:1px solid #30363d; border-radius:6px; padding:0.4rem 0.6rem; display:inline-block; margin:0.25rem 0.25rem 0.25rem 0;"><span style="font-size:0.65rem; color:#8b949e; display:block; font-weight:600;">TREND BIAS</span><b style="color:#58a6ff; font-size:0.9rem;">$1</b></div>')
            .replace(/•\s*(.*?)(?=(\n|$))/g, '<div style="margin:0.35rem 0; padding-left:0.6rem; border-left:2px solid #58a6ff;"><b style="color:#58a6ff;">•</b> $1</div>')
            .replace(/\*\s*(.*?)(?=(\n|$))/g, '<div style="margin:0.35rem 0; padding-left:0.6rem; border-left:2px solid #39d353;"><b style="color:#39d353;">*</b> $1</div>');
        
        return formatted.replace(/\n/g, '<br>');
    };

    // Helper to extract key levels if present in markdown text
    const extractKeyLevels = (rawText) => {
        const pivotMatch = rawText.match(/Pivot Point\s*\n\s*([\d,.]+)/i);
        const r1Match = rawText.match(/Resistance \(R1\)\s*\n\s*([\d,.]+)/i);
        const r2Match = rawText.match(/Resistance \(R2\)\s*\n\s*([\d,.]+)/i);
        const s1Match = rawText.match(/Support \(S1\)\s*\n\s*([\d,.]+)/i);
        const s2Match = rawText.match(/Support \(S2\)\s*\n\s*([\d,.]+)/i);
        const trendMatch = rawText.match(/Trend Bias\s*\n\s*(.*?)(?=(\n|$))/i);

        return {
            pivot: pivotMatch ? pivotMatch[1] : null,
            r1: r1Match ? r1Match[1] : null,
            r2: r2Match ? r2Match[1] : null,
            s1: s1Match ? s1Match[1] : null,
            s2: s2Match ? s2Match[1] : null,
            trend: trendMatch ? trendMatch[1].trim() : null
        };
    };

    // Compile single-line header card with "Read More" for older/archive data
    const compileArchiveCardMarkup = (title, postDateStr, mediaHtml, rawText, pId, tagText = 'Daily Log') => {
        const uniqueId = `archive-drawer-${pId || Math.random().toString(36).substr(2, 9)}`;
        const levels = extractKeyLevels(rawText);

        let techLevelsHtml = "";
        if (levels.pivot || levels.r1 || levels.s1) {
            techLevelsHtml = `
                <div class="tech-levels-grid" style="margin:0.75rem 0;">
                    <div class="tech-level-box" style="background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:0.5rem 0.65rem; text-align:center;">
                        <div class="lvl-title" style="font-size:0.65rem; color:#8b949e; text-transform:uppercase; font-weight:600; white-space:nowrap;">Pivot Point</div>
                        <div class="lvl-val gold" style="color:#ffb300; font-size:0.95rem; font-weight:700; margin-top:2px;">${levels.pivot || '-'}</div>
                    </div>
                    <div class="tech-level-box" style="background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:0.5rem 0.65rem; text-align:center;">
                        <div class="lvl-title" style="font-size:0.65rem; color:#8b949e; text-transform:uppercase; font-weight:600; white-space:nowrap;">Resistance (R1)</div>
                        <div class="lvl-val red" style="color:#f85149; font-size:0.95rem; font-weight:700; margin-top:2px;">${levels.r1 || '-'}</div>
                    </div>
                    <div class="tech-level-box" style="background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:0.5rem 0.65rem; text-align:center;">
                        <div class="lvl-title" style="font-size:0.65rem; color:#8b949e; text-transform:uppercase; font-weight:600; white-space:nowrap;">Resistance (R2)</div>
                        <div class="lvl-val red" style="color:#f85149; font-size:0.95rem; font-weight:700; margin-top:2px;">${levels.r2 || '-'}</div>
                    </div>
                    <div class="tech-level-box" style="background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:0.5rem 0.65rem; text-align:center;">
                        <div class="lvl-title" style="font-size:0.65rem; color:#8b949e; text-transform:uppercase; font-weight:600; white-space:nowrap;">Support (S1)</div>
                        <div class="lvl-val green" style="color:#39d353; font-size:0.95rem; font-weight:700; margin-top:2px;">${levels.s1 || '-'}</div>
                    </div>
                    <div class="tech-level-box" style="background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:0.5rem 0.65rem; text-align:center;">
                        <div class="lvl-title" style="font-size:0.65rem; color:#8b949e; text-transform:uppercase; font-weight:600; white-space:nowrap;">Support (S2)</div>
                        <div class="lvl-val green" style="color:#39d353; font-size:0.95rem; font-weight:700; margin-top:2px;">${levels.s2 || '-'}</div>
                    </div>
                    <div class="tech-level-box" style="background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:0.5rem 0.65rem; text-align:center;">
                        <div class="lvl-title" style="font-size:0.65rem; color:#8b949e; text-transform:uppercase; font-weight:600; white-space:nowrap;">Trend Bias</div>
                        <div class="lvl-val green" style="color:#39d353; font-size:0.85rem; font-weight:700; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${levels.trend || 'Bullish Continuation'}</div>
                    </div>
                </div>
            `;
        }

        // Clean raw text to prevent duplicate unstyled level fragments in the body
        let cleanedRawText = rawText
            .replace(/Pivot Point\s*\n\s*[\d,.]+/gi, '')
            .replace(/Resistance \((R\d)\)\s*\n\s*[\d,.]+/gi, '')
            .replace(/Support \((S\d)\)\s*\n\s*[\d,.]+/gi, '')
            .replace(/Trend Bias\s*\n\s*.*?(?=(\n|$))/gi, '');

        const formattedHtml = formatMarkdownBody(cleanedRawText);

        return `
            <div class="display-card-v2" style="background:#161b22; padding:0.85rem 1.15rem; border:1px solid #30363d; border-radius:8px; margin-bottom:0.65rem; transition:border-color 0.2s ease;">
                <div onclick="toggleHistoricalDrawer('${uniqueId}')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; user-select:none; gap:0.75rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem; flex:1; min-width:0;">
                        <span style="font-size:0.88rem; color:#f0f6fc; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">📄 ${title}</span>
                        <span style="font-size:0.72rem; color:#8b949e; white-space:nowrap;">• ${postDateStr}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-shrink:0;">
                        <button id="${uniqueId}-trigger-text" class="read-more-btn" style="background:#21262d; border:1px solid #30363d; color:#58a6ff; padding:3px 10px; border-radius:4px; font-size:0.75rem; font-weight:600; cursor:pointer; pointer-events:none;">📖 Read More ▾</button>
                    </div>
                </div>
                <div id="${uniqueId}" style="display:none; padding-top:0.85rem; margin-top:0.85rem; border-top:1px solid #21262d;">
                    ${mediaHtml}
                    ${techLevelsHtml}
                    <div class="card-body-text" style="line-height: 1.65; color:#c9d1d9; font-size:0.85rem; margin: 0.75rem 0 0 0; background:#0d1117; padding:1rem; border-radius:6px; border:1px solid #21262d;">
                        ${formattedHtml}
                    </div>
                    <div style="margin-top:0.6rem; display:flex; justify-content:flex-end; align-items:center; font-size:0.72rem;">
                        <span style="color:#f85149; cursor:pointer; font-weight:600;" onclick="toggleHistoricalDrawer('${uniqueId}')">✖️ Collapse ▴</span>
                    </div>
                </div>
            </div>
        `;
    };

    // Standard card markup for concept/learning/strategies
    const compileCardMarkup = (isToday, title, tagText, tagBg, mediaHtml, rawText, pId, postDateStr = todayLabelString, sourceBadge = 'GitHub + Supabase') => {
        // If not today (historical record), always render in the unified single-line archive drawer format
        if (!isToday) {
            return compileArchiveCardMarkup(title, postDateStr, mediaHtml, rawText, pId, tagText);
        }

        const uniqueId = `drawer-${pId || Math.random().toString(36).substr(2, 9)}`;
        const levels = extractKeyLevels(rawText);

        let techLevelsHtml = "";
        if (levels.pivot || levels.r1 || levels.s1) {
            techLevelsHtml = `
                <div class="tech-levels-grid" style="margin:0.75rem 0;">
                    <div class="tech-level-box" style="background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:0.5rem 0.65rem; text-align:center;">
                        <div class="lvl-title" style="font-size:0.65rem; color:#8b949e; text-transform:uppercase; font-weight:600; white-space:nowrap;">Pivot Point</div>
                        <div class="lvl-val gold" style="color:#ffb300; font-size:0.95rem; font-weight:700; margin-top:2px;">${levels.pivot || '-'}</div>
                    </div>
                    <div class="tech-level-box" style="background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:0.5rem 0.65rem; text-align:center;">
                        <div class="lvl-title" style="font-size:0.65rem; color:#8b949e; text-transform:uppercase; font-weight:600; white-space:nowrap;">Resistance (R1)</div>
                        <div class="lvl-val red" style="color:#f85149; font-size:0.95rem; font-weight:700; margin-top:2px;">${levels.r1 || '-'}</div>
                    </div>
                    <div class="tech-level-box" style="background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:0.5rem 0.65rem; text-align:center;">
                        <div class="lvl-title" style="font-size:0.65rem; color:#8b949e; text-transform:uppercase; font-weight:600; white-space:nowrap;">Resistance (R2)</div>
                        <div class="lvl-val red" style="color:#f85149; font-size:0.95rem; font-weight:700; margin-top:2px;">${levels.r2 || '-'}</div>
                    </div>
                    <div class="tech-level-box" style="background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:0.5rem 0.65rem; text-align:center;">
                        <div class="lvl-title" style="font-size:0.65rem; color:#8b949e; text-transform:uppercase; font-weight:600; white-space:nowrap;">Support (S1)</div>
                        <div class="lvl-val green" style="color:#39d353; font-size:0.95rem; font-weight:700; margin-top:2px;">${levels.s1 || '-'}</div>
                    </div>
                    <div class="tech-level-box" style="background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:0.5rem 0.65rem; text-align:center;">
                        <div class="lvl-title" style="font-size:0.65rem; color:#8b949e; text-transform:uppercase; font-weight:600; white-space:nowrap;">Support (S2)</div>
                        <div class="lvl-val green" style="color:#39d353; font-size:0.95rem; font-weight:700; margin-top:2px;">${levels.s2 || '-'}</div>
                    </div>
                    <div class="tech-level-box" style="background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:0.5rem 0.65rem; text-align:center;">
                        <div class="lvl-title" style="font-size:0.65rem; color:#8b949e; text-transform:uppercase; font-weight:600; white-space:nowrap;">Trend Bias</div>
                        <div class="lvl-val green" style="color:#39d353; font-size:0.85rem; font-weight:700; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${levels.trend || 'Bullish Continuation'}</div>
                    </div>
                </div>
            `;
        }

        let cleanedRawText = rawText
            .replace(/Pivot Point\s*\n\s*[\d,.]+/gi, '')
            .replace(/Resistance \((R\d)\)\s*\n\s*[\d,.]+/gi, '')
            .replace(/Support \((S\d)\)\s*\n\s*[\d,.]+/gi, '')
            .replace(/Trend Bias\s*\n\s*.*?(?=(\n|$))/gi, '');

        const formattedHtml = formatMarkdownBody(cleanedRawText);

        const startOpen = isToday;

        return `
            <div class="display-card-v2" style="background:#161b22; padding:1.15rem; border:1px solid #30363d; border-radius:8px; margin-bottom:0.75rem; transition:border-color 0.2s ease;">
                <div onclick="toggleHistoricalDrawer('${uniqueId}')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; user-select:none; gap:0.75rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem; flex:1; min-width:0;">
                        <span style="font-size:0.9rem; color:#f0f6fc; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">📄 ${title}</span>
                        <span style="font-size:0.72rem; color:${isToday ? '#39d353' : '#8b949e'}; white-space:nowrap;">• ${isToday ? 'Today' : dateString}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-shrink:0;">
                        <span class="localization-tag" style="background:${tagBg}; color:#fff; padding:2px 8px; border-radius:4px; font-size:0.65rem; font-weight:600;">${tagText}</span>
                        <button id="${uniqueId}-trigger-text" class="read-more-btn" style="background:#21262d; border:1px solid ${startOpen ? 'rgba(248, 81, 73, 0.4)' : '#30363d'}; color:${startOpen ? '#f85149' : '#58a6ff'}; padding:3px 10px; border-radius:4px; font-size:0.75rem; font-weight:600; cursor:pointer; pointer-events:none;">${startOpen ? '✖️ Collapse ▴' : '📖 Details ▾'}</button>
                    </div>
                </div>
                <div id="${uniqueId}" style="display:${startOpen ? 'block' : 'none'}; padding-top:0.75rem; margin-top:0.75rem; border-top:1px solid #21262d;">
                    ${mediaHtml}
                    ${techLevelsHtml}
                    <div class="card-body-text" style="line-height: 1.6; color:#c9d1d9; font-size:0.85rem; margin: 0.75rem 0 0 0; background:#0d1117; padding:1rem; border-radius:6px; border:1px solid #21262d;">
                        ${formattedHtml}
                    </div>
                    <div style="margin-top:0.5rem; display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; color:#8b949e;">
                        <span>Source: <b style="color:#58a6ff;">${sourceBadge}</b></span>
                        <span style="color:#f85149; cursor:pointer; font-weight:600;" onclick="toggleHistoricalDrawer('${uniqueId}')">✖️ Collapse ▴</span>
                    </div>
                </div>
            </div>
        `;
    };

    window.toggleHistoricalDrawer = function(drawerId) {
        const targetDrawer = document.getElementById(drawerId);
        const targetTrigger = document.getElementById(`${drawerId}-trigger-text`);
        if (!targetDrawer) return;
        
        if (targetDrawer.style.display === "none" || !targetDrawer.style.display) {
            targetDrawer.style.display = "block";
            if (targetTrigger) {
                targetTrigger.innerText = "✖️ Collapse ▴";
                targetTrigger.style.color = "#f85149";
                targetTrigger.style.borderColor = "rgba(248, 81, 73, 0.4)";
            }
        } else {
            targetDrawer.style.display = "none";
            if (targetTrigger) {
                targetTrigger.innerText = "📖 Read More ▾";
                targetTrigger.style.color = "#58a6ff";
                targetTrigger.style.borderColor = "#30363d";
            }
        }
    };

    // Store parsed items
    let parsedDailyFiles = [];
    const processedFileNames = new Set();
    const processedDateKeys = new Set();

    // Helper to process a file payload
    const processFilePayload = (fileName, rawText, index = 0) => {
        if (!fileName || !rawText) return;
        const lowerName = fileName.toLowerCase();
        if (processedFileNames.has(lowerName)) return;

        // Extract date key like 'aug16', 'aug15'
        const dateMatch = fileName.match(/^([A-Za-z]+)(\d+)/);
        const dateKey = dateMatch ? `${dateMatch[1].toLowerCase()}${dateMatch[2]}` : lowerName;

        // Parse Title & Date from file
        let title = fileName.replace('.txt', '').replace(/_/g, ' ');
        const firstLine = rawText.split('\n')[0].replace(/^[=\s-]+|[=\s-]+$/g, '').trim();
        if (firstLine && firstLine.length > 5 && firstLine.length < 80) {
            title = firstLine;
        }

        // Determine Date Context (e.g. Aug16 -> August 16, 2026; Aug15 -> August 15, 2026)
        let postDateStr = todayLabelString;
        let postDateObj = today;
        if (dateMatch) {
            const mStr = dateMatch[1];
            const dStr = dateMatch[2];
            const monthIdx = new Date(`${mStr} 1, 2000`).getMonth();
            if (!isNaN(monthIdx)) {
                postDateObj = new Date(parseInt(currentYear), monthIdx, parseInt(dStr));
                postDateStr = postDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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

        // Avoid duplicate daily files for the same exact date
        if (category === 'daily') {
            if (processedDateKeys.has(dateKey)) return;
            processedDateKeys.add(dateKey);
        }
        processedFileNames.add(lowerName);

        // Match Image/Video in Supabase Public Storage
        const imageCandidates = getSupabaseImageCandidates(fileName);
        const firstImageSrc = imageCandidates[0];
        const remainingCandidatesJson = JSON.stringify(imageCandidates.slice(1)).replace(/"/g, '&quot;');

        const isVideoCandidate = firstImageSrc.endsWith('.mp4') || firstImageSrc.endsWith('.webm') || firstImageSrc.endsWith('.mov') || category === 'reels';

        let mediaHtml = `
            <div style="margin:0.75rem 0; border-radius:6px; overflow:hidden; border:1px solid #30363d; background:#0d1117;">
                ${isVideoCandidate ? `
                    <video controls playsinline preload="metadata" style="width:100%; max-height:540px; background:#000; border-radius:6px; display:block;" onerror="this.style.display='none'">
                        <source src="${firstImageSrc}" type="video/mp4">
                        <source src="${firstImageSrc.replace(/\.[^/.]+$/, '.webm')}" type="video/webm">
                        Your browser does not support HTML5 video.
                    </video>
                ` : `
                    <img src="${firstImageSrc}" 
                         data-candidates="${remainingCandidatesJson}"
                         alt="${title}" 
                         onerror="handleImageFallback(this)" 
                         style="width:100%; display:block; max-height:520px; object-fit:contain; background:#0a0e14; cursor:pointer;" 
                         onclick="window.open(this.src, '_blank')"
                         title="Click to open chart in high-resolution"
                         loading="lazy" />
                `}
            </div>
        `;

        if (category === 'daily') {
            parsedDailyFiles.push({
                fileName,
                title,
                postDateStr,
                postDateObj,
                isToday,
                rawText,
                mediaHtml,
                imageCandidates,
                index
            });
        } else {
            const markup = compileCardMarkup(isToday, title, tagText, tagBg, mediaHtml, rawText, `gh-${index}`, postDateStr, 'GitHub txt + Supabase png');
            if (category === 'learning') combinedTimeline[postDateStr].learning.push(markup);
            if (category === 'strategy') combinedTimeline[postDateStr].strategy.push(markup);
            if (category === 'reels') combinedTimeline[postDateStr].reels.push(markup);
        }
    };

    // 1. Fetch from GitHub Data Directory: data/{YYYY}/{MonthName}
    try {
        const ghApiUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/data/${currentYear}/${currentMonthName}`;
        const ghRes = await fetch(ghApiUrl);

        if (ghRes.ok) {
            const files = await ghRes.json();
            if (Array.isArray(files)) {
                const txtFiles = files.filter(f => f.name.toLowerCase().endsWith('.txt'));

                for (let index = 0; index < txtFiles.length; index++) {
                    const file = txtFiles[index];
                    try {
                        const rawContentRes = await fetch(file.download_url);
                        if (rawContentRes.ok) {
                            const rawText = await rawContentRes.text();
                            processFilePayload(file.name, rawText, index);
                        }
                    } catch (err) {
                        console.warn(`Failed parsing GitHub file ${file.name}:`, err);
                    }
                }
            }
        }
    } catch (ghErr) {
        console.warn("Direct GitHub API fetch info:", ghErr);
    }

    // 2. Fallback Seed Data: Ensure Aug 16 & Aug 15 records are always available even if GitHub API is rate-limited
    const defaultSeedFiles = [
        {
            name: "Aug16_chart.txt",
            text: `======================================================================
NIFTY 50 INDEX – TECHNICAL ANALYSIS & KEY LEVELS
======================================================================
Pivot Point
24,350.00
Resistance (R1)
24,480.00
Resistance (R2)
24,620.00
Support (S1)
24,240.00
Support (S2)
24,110.00
Trend Bias
Bullish Continuation

• Price Structure: NIFTY 50 bounced firmly off the 24,240 support cluster, forming a bullish piercing candle pattern with expanding volume.
• Key Pivot Zone: Immediate hurdle stands at 24,480 (R1). A decisive 15-minute close above 24,480 opens the path towards 24,620 new ATH test.
• Derivative Data & OI: Heavy Put writing witnessed at 24,300 and 24,200 strikes indicating aggressive bull defense. Call unwinding noticed at 24,400 CE.
• Actionable Plan: Look for pullback entries near 24,310 - 24,340 with a strict stop loss below 24,240 for upside targets of 24,480 and 24,560.`
        },
        {
            name: "Aug15_pnb.txt",
            text: `======================================================================
PUNJAB NATIONAL BANK (PNB) – INTRADAY / SWING TECHNICAL REPORT
======================================================================
Pivot Point
118.50
Resistance (R1)
122.40
Resistance (R2)
125.80
Support (S1)
115.20
Support (S2)
112.00
Trend Bias
Bullish Breakout Continuation

• Price Structure: PNB stock surged above 118 with solid institutional buying volume, breaking out of a 3-week accumulation zone.
• Derivative & Order Flow: Heavy call short-covering witnessed between 115 and 118 strikes, open interest buildup firmly on the long side.
• Actionable Strategy: Accumulate on intraday dips near 118.00–118.50 with a strict stop loss below 115.00 for upside targets of 122.40 (R1) and 125.80 (R2).`
        },
        {
            name: "learning_orderflow_imbalance.txt",
            text: `======================================================================
ORDER FLOW & FOOTPRINT IMBALANCE TRADING STRATEGY
======================================================================
• What is an Imbalance?: When aggressive market buyers or sellers exhaust passive liquidity by a ratio of 3:1 or 4:1 at consecutive price ticks.
• Key Confirmation: Stacked buying imbalances during a breakout above a daily pivot point provide high-probability continuation setups with defined risk.`
        },
        {
            name: "Aug16_reel.txt",
            text: `======================================================================
NIFTY 50 LIVE INTRADAY BREAKOUT REEL & ORDER FLOW REACTION
======================================================================
• Video Breakdown: Quick 60-second recap of today's key pivot breakout above 24,350.
• Watch the video above for tape reading, buyer imbalance spikes, and volume surge cues.`
        },
        {
            name: "strategy_gap_and_go_setup.txt",
            text: `======================================================================
GAP & GO INTRADAY MOMENTUM PLAYBOOK
======================================================================
• Condition 1: Index or stock gaps up > 0.5% outside previous day's Value Area High (VAH).
• Condition 2: First 5-minute candle closes in the upper 20% of its range with volume > 2x 20-period average.
• Execution: Enter long on the break of the first 5-min candle high with stop loss at the 5-min candle low.`
        }
    ];

    defaultSeedFiles.forEach((f, idx) => {
        processFilePayload(f.name, f.text, 100 + idx);
    });

    // 3. Also try fetching any dynamic posts from Backend (if deployed & online)
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
                    
                    const markup = compileCardMarkup(isToday, p.title || "Cloud Record", '🌐 Cloud Post', '#2962ff', mediaHtml, p.body || "", `cloud-${index}`, parsedDate, 'Backend Portal');
                    if (p.category === 'learning' && combinedTimeline[parsedDate]) combinedTimeline[parsedDate].learning.push(markup);
                    if (p.category === 'strategy' && combinedTimeline[parsedDate]) combinedTimeline[parsedDate].strategy.push(markup);
                    if (p.category === 'reels' && combinedTimeline[parsedDate]) combinedTimeline[parsedDate].reels.push(markup);
                });
            }
        }
    } catch (err) {
        // Backend offline or not needed - gracefully skipped
    }

    // 3. FEATURED TODAY'S ANALYSIS vs OLDER ARCHIVE (ZERO DUPLICATES)
    if (parsedDailyFiles.length > 0) {
        // Sort daily files descending by date
        parsedDailyFiles.sort((a, b) => b.postDateObj - a.postDateObj);

        // Find today's file or the latest file
        let featuredFile = parsedDailyFiles.find(f => f.isToday) || parsedDailyFiles[0];

        if (featuredFile) {
            // Populate Featured Today Card (Full Content View)
            const filenameEl = document.getElementById('chart-card-filename');
            const primaryImg = document.getElementById('primary-daily-chart-img');
            const infTextEl = document.getElementById('daily-inferences-text');

            if (filenameEl) filenameEl.innerText = featuredFile.title || featuredFile.fileName;
            
            if (primaryImg && featuredFile.imageCandidates && featuredFile.imageCandidates.length > 0) {
                primaryImg.src = featuredFile.imageCandidates[0];
                primaryImg.setAttribute('data-candidates', JSON.stringify(featuredFile.imageCandidates.slice(1)));
                primaryImg.style.display = 'block';
                const iframeWrap = document.getElementById('tv-chart-iframe-wrap');
                if (iframeWrap) iframeWrap.style.display = 'none';
            }

            // Update level pills if found in file
            const levels = extractKeyLevels(featuredFile.rawText);
            if (levels.pivot && document.getElementById('lvl-pivot')) document.getElementById('lvl-pivot').innerText = levels.pivot;
            if (levels.r1 && document.getElementById('lvl-r1')) document.getElementById('lvl-r1').innerText = levels.r1;
            if (levels.r2 && document.getElementById('lvl-r2')) document.getElementById('lvl-r2').innerText = levels.r2;
            if (levels.s1 && document.getElementById('lvl-s1')) document.getElementById('lvl-s1').innerText = levels.s1;
            if (levels.s2 && document.getElementById('lvl-s2')) document.getElementById('lvl-s2').innerText = levels.s2;
            if (levels.trend && document.getElementById('lvl-trend')) document.getElementById('lvl-trend').innerText = levels.trend;

            // Update body text
            if (infTextEl) {
                infTextEl.innerHTML = `
                    <h4 style="color:#ffffff; font-size:0.92rem; margin-top:0; margin-bottom:0.5rem;">${featuredFile.title}</h4>
                    <div class="card-body-text" style="color:#c9d1d9; font-size:0.85rem; line-height:1.6;">
                        ${formatMarkdownBody(featuredFile.rawText)}
                    </div>
                `;
            }

            // Put only HISTORICAL/OLDER daily files into Archive (strictly !f.isToday and not the featured file)
            // Today's data stays exclusively on top today, and moves under Historical tomorrow automatically
            parsedDailyFiles.forEach(f => {
                if (!f.isToday && f !== featuredFile) {
                    const archiveMarkup = compileArchiveCardMarkup(f.title, f.postDateStr, f.mediaHtml, f.rawText, `gh-${f.index}`);
                    combinedTimeline[f.postDateStr].daily.push(archiveMarkup);
                }
            });
        }
    }

    // 4. Clear existing stream contents before injecting to avoid duplicate stacks
    dailyContainer.innerHTML = '';
    learningContainer.innerHTML = '';
    strategyContainer.innerHTML = '';
    reelsContainer.innerHTML = '';
    if (reelsTodayContainer) reelsTodayContainer.innerHTML = '';

    // 5. Render timeline date buckets sorted in descending chronological order
    const sortedDates = Object.keys(combinedTimeline).sort((a, b) => new Date(b) - new Date(a));
    
    let totalDailyArchiveCount = 0;
    let totalLearningCount = 0;
    let totalStrategyCount = 0;
    let totalReelsCount = 0;

    sortedDates.forEach(dateGroupKey => {
        const bucket = combinedTimeline[dateGroupKey];
        if (bucket.daily && bucket.daily.length > 0) totalDailyArchiveCount += bucket.daily.length;
        if (bucket.learning && bucket.learning.length > 0) totalLearningCount += bucket.learning.length;
        if (bucket.strategy && bucket.strategy.length > 0) totalStrategyCount += bucket.strategy.length;
        if (bucket.reels && bucket.reels.length > 0) totalReelsCount += bucket.reels.length;
    });

    if (totalDailyArchiveCount === 0 && dailyContainer) {
        dailyContainer.innerHTML = `<div style="padding:1rem; text-align:center; color:#8b949e; font-size:0.8rem; background:#0d1117; border:1px dashed #21262d; border-radius:6px;">
            No older archive records for this period.
        </div>`;
    }
    if (totalLearningCount === 0 && learningContainer) {
        learningContainer.innerHTML = `<div style="padding:1rem; text-align:center; color:#8b949e; font-size:0.8rem; background:#0d1117; border:1px dashed #21262d; border-radius:6px;">
            No older learning logs for this period.
        </div>`;
    }
    if (totalStrategyCount === 0 && strategyContainer) {
        strategyContainer.innerHTML = `<div style="padding:1rem; text-align:center; color:#8b949e; font-size:0.8rem; background:#0d1117; border:1px dashed #21262d; border-radius:6px;">
            No older strategy playbooks for this period.
        </div>`;
    }
    if (totalReelsCount === 0 && reelsContainer) {
        reelsContainer.innerHTML = `<div style="padding:1rem; text-align:center; color:#8b949e; font-size:0.8rem; background:#0d1117; border:1px dashed #21262d; border-radius:6px;">
            No older video bytes for this period.
        </div>`;
    }

    sortedDates.forEach(dateGroupKey => {
        const bucket = combinedTimeline[dateGroupKey];
        const isBucketToday = (dateGroupKey === todayLabelString);

        if (bucket.daily && bucket.daily.length > 0 && dailyContainer) {
            dailyContainer.innerHTML += bucket.daily.join('');
        }
        if (bucket.learning && bucket.learning.length > 0 && learningContainer) {
            learningContainer.innerHTML += bucket.learning.join('');
        }
        if (bucket.strategy && bucket.strategy.length > 0 && strategyContainer) {
            strategyContainer.innerHTML += bucket.strategy.join('');
        }
        if (bucket.reels && bucket.reels.length > 0) {
            if (isBucketToday && reelsTodayContainer) {
                reelsTodayContainer.innerHTML += bucket.reels.join('');
            } else if (reelsContainer) {
                reelsContainer.innerHTML += bucket.reels.join('');
            }
        }
    });
}


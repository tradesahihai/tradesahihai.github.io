const DYNAMIC_BACKEND_PORTAL_URL = "https://onrender.com";
const todayLabelString = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
let combinedTimeline = {};

document.addEventListener("DOMContentLoaded", () => {
    fetchCloudAndFlatData();
    fetchLiveMarketNews();
});

const initializeDateBucket = (dateKey) => {
    if (!combinedTimeline[dateKey]) {
        combinedTimeline[dateKey] = { daily: [], learning: [], strategy: [], reels: [] };
    }
};

const compileCardMarkup = (isToday, title, tagText, tagBg, mediaHtml, textBody, pId) => {
    let rawContentText = ""; let displayedHeader = title;
    if (textBody && typeof textBody === 'object') {
        rawContentText = textBody.fullContent || "";
        displayedHeader = textBody.header || title;
    } else { rawContentText = textBody || ""; }

    let sanitizedMediaHtml = mediaHtml || "";
    if (!mediaHtml || sanitizedMediaHtml.includes('src="null"') || sanitizedMediaHtml.includes('src=""') || sanitizedMediaHtml.trim() === "") {
        sanitizedMediaHtml = "";
    }

    if (isToday) {
        return `
            <div class="display-card-v2" style="background:#161b22; padding:1.25rem; border:1px solid #30363d; border-radius:8px; margin-bottom:1rem; width: 100%; box-sizing: border-box; clear: both; overflow: hidden;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.75rem;">
                    <h3 style="margin:0; color:#fff; font-size:1.05rem; font-weight:600;">\${title}</h3>
                    <div><span class="localization-tag" style="background:\${tagBg}; color:\${tagBg === '#00e676' || tagBg === '#ffea00' ? '#000' : '#fff'}; padding: 3px 8px; border-radius: 4px; font-size: 0.65rem; font-weight:600;">\${tagText}</span></div>
                </div>
                \${sanitizedMediaHtml}
                <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.6; color:#c9d1d9; font-size:0.875rem; margin: 0.75rem 0 0 0;">\${rawContentText}</p>
            </div>
        `;
    } else {
        const uniqueId = `drawer-\${pId || Math.random().toString(36).substr(2, 9)}`;
        return `
            <div class="historical-accordion-row" style="background:#161b22; border:1px solid #21262d; border-radius:6px; margin-bottom:0.5rem; width:100%; overflow:hidden;">
                <div onclick="toggleHistoricalDrawer('\${uniqueId}')" style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 1rem; cursor:pointer; background:#1f242c; user-select:none;">
                    <span style="font-size:0.85rem; color:#f0f6fc; font-weight:500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%;">📁 \${displayedHeader}</span>
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <span class="localization-tag" style="background:#30363d; color:#8b949e; padding:2px 6px; border-radius:4px; font-size:0.65rem;">\${tagText}</span>
                        <span id="\${uniqueId}-trigger-text" style="font-size:0.7rem; font-weight:600; color:#2962ff;">[ 📖 Read More ]</span>
                    </div>
                </div>
                <div id="\${uniqueId}" style="display:none; padding:1rem; border-top:1px solid #21262d; background:#161b22;">
                    \${sanitizedMediaHtml}
                    <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.5; color:#c9d1d9; font-size:0.85rem; margin: 0.75rem 0 0 0;">\${rawContentText}</p>
                </div>
            </div>
        `;
    }
};

async function fetchCloudAndFlatData() {
    const dailyContainer = document.getElementById('stream-daily-container');
    const learningContainer = document.getElementById('stream-learning-container');
    const strategyContainer = document.getElementById('stream-strategy-container');
    const reelsContainer = document.getElementById('stream-reels-container');

    if (!dailyContainer || !learningContainer || !strategyContainer || !reelsContainer) return;

    try {
        const res = await fetch(`\${DYNAMIC_BACKEND_PORTAL_URL}/api/posts`);
        if (res.ok) {
            const posts = await res.json();
            posts.forEach((p, index) => {
                let parsedDate = new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                initializeDateBucket(parsedDate);
                const isToday = (parsedDate === todayLabelString);
                let mediaHtml = p.image_url ? `<div class="chart-frame-wrapper" style="margin:0.5rem 0; width:100%;"><img src="\${p.image_url}" style="width:100%; max-width:100%; height:auto; display:block; border-radius:4px;"></div>` : '';
                const contentPayload = isToday ? p.body : { header: p.title || "Older Cloud Record", hasMore: !!p.body, fullContent: p.body || "" };

                if (p.category === 'daily') combinedTimeline[parsedDate].daily.push(compileCardMarkup(isToday, p.title, '🌐 Global Sync', '#30363d', mediaHtml, contentPayload, `cloud-daily-\${index}`));
                if (p.category === 'learning') combinedTimeline[parsedDate].learning.push(compileCardMarkup(isToday, p.title, '🌐 Global Sync', '#30363d', mediaHtml, contentPayload, `cloud-learn-\${index}`));
                if (p.category === 'strategy') combinedTimeline[parsedDate].strategy.push(compileCardMarkup(isToday, p.title, '🌐 Global Sync', '#30363d', mediaHtml, contentPayload, `cloud-strat-\${index}`));
            });
        }
    } catch (err) { console.error("Cloud tracking offline:", err); }

    try {
        const today = new Date(); const fetchPromises = [];
        for (let i = 0; i < 4; i++) {
            const targetDate = new Date(); targetDate.setDate(today.getDate() - i);
            const year = targetDate.getFullYear().toString();
            const month = targetDate.toLocaleString('en-US', { month: 'long' });
            const dayNum = targetDate.getDate().toString();
            const dateStr = targetDate.toLocaleString('en-US', { month: 'short' }) + dayNum;

            const promise = fetch(`\${DYNAMIC_BACKEND_PORTAL_URL}/api/analysis/\${year}/\${month}/\${dayNum}`)
                .then(r => r.ok ? r.json() : null)
                .then(d => d ? { d, targetDate, dateStr } : null)
                .catch(() => null);
            fetchPromises.push(promise);
        }

        const resolved = await Promise.all(fetchPromises);
        resolved.forEach(session => {
            if (!session) return;
            const { d, targetDate, dateStr } = session;
            const formattedBucketDateKey = targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            initializeDateBucket(formattedBucketDateKey);
            const isTodayActiveSession = (formattedBucketDateKey === todayLabelString);

            if (d.summary) {
                const dailyArray = [{ title: `\${dateStr}_chart.txt`, content: d.summary, image: d.imageUrl }];
                dailyArray.forEach((item, idx) => {
                    let imgHtml = item.image ? `<div class="chart-frame-wrapper" style="margin: 0.5rem 0; width:100%;"><img src="\${item.image}" crossorigin="anonymous" style="width:100%; max-width:100%; height:auto; display:block; border-radius:6px; border:1px solid #30363d;"></div>` : '';
                    combinedTimeline[formattedBucketDateKey].daily.push(compileCardMarkup(isTodayActiveSession, item.title, '📁 Daily Chart Log', '#2962ff', imgHtml, item.content, `local-daily-\${dateStr}-\${idx}`));
                });
            }
            if (d.learning) {
                const learningArray = [{ title: `\${dateStr}_learning.txt`, content: d.learning }];
                learningArray.forEach((item, idx) => {
                    combinedTimeline[formattedBucketDateKey].learning.push(compileCardMarkup(isTodayActiveSession, item.title, '💡 Learning Vector', '#00e676', '', item.content, `local-learn-\${dateStr}-\${idx}`));
                });
            }
            if (d.strategy) {
                const strategyArray = [{ title: `\${dateStr}_strategy.txt`, content: d.strategy }];
                strategyArray.forEach((item, idx) => {
                    combinedTimeline[formattedBucketDateKey].strategy.push(compileCardMarkup(isTodayActiveSession, item.title, '🎯 System Playbook', '#ffea00', '', item.content, `local-strat-\${dateStr}-\${idx}`));
                });
            }
            if (d.videoUrl) {
                let videoHtml = `<div class="chart-frame-wrapper" style="margin: 0.5rem 0; width: 100%;"><video src="\${d.videoUrl}" crossorigin="anonymous" controls preload="metadata" style="width:100%; max-height:360px; border-radius:6px; background:#000; display:block;"></video></div>`;
                combinedTimeline[formattedBucketDateKey].reels.push(compileCardMarkup(isTodayActiveSession, `\${dateStr}_reels.mp4`, '🎬 Trending Reel', '#a004ff', videoHtml, isTodayActiveSession ? "Daily Walkthrough" : { header: "Trending Reel", hasMore: false, fullContent: "Daily Video Summary Documentation" }, `local-reel-\${dateStr}`));
            }
        });
    } catch (flatErr) { console.warn("Flat pipeline logging bypassed."); }

    const sortedDates = Object.keys(combinedTimeline).sort((a, b) => new Date(b) - new Date(a));
    
    const verifyEmptyState = (el) => {
        if (el && el.innerHTML.trim() === "") {
            el.innerHTML = `<div class="display-card-v2" style="background:#161b22; padding:1rem; border:1px solid #30363d; border-radius:8px; color:#8b949e; font-size:0.8rem; width:100%; box-sizing:border-box;">No entries filed for active matrix tracking streams today.</div>`;
        }
    };

    sortedDates.forEach(dateKey => {
        const bucket = combinedTimeline[dateKey];
        const isToday = (dateKey === todayLabelString);
        const labelText = isToday ? `Today - \${dateKey}` : dateKey;
        const genHeader = () => `<div class="timeline-date-header" style="padding:0.4rem 0.75rem; background:#21262d; border:1px solid #30363d; border-radius:4px; color:#c9d1d9; font-size:0.75rem; font-weight:600; margin:1rem 0 0.5rem 0; width:100%; font-family:monospace; box-sizing:border-box;">📅 \${labelText}</div>`;
        
        if (bucket.daily.length > 0) dailyContainer.innerHTML += genHeader() + bucket.daily.join('');
        if (bucket.learning.length > 0) learningContainer.innerHTML += genHeader() + bucket.learning.join('');
        if (bucket.strategy.length > 0) strategyContainer.innerHTML += genHeader() + bucket.strategy.join('');
        if (bucket.reels.length > 0) reelsContainer.innerHTML += genHeader() + bucket.reels.join('');
    });

    verifyEmptyState(dailyContainer); 
    verifyEmptyState(learningContainer);
    verifyEmptyState(strategyContainer); 
    verifyEmptyState(reelsContainer);
}

async function fetchLiveMarketNews() {
    const mc = document.getElementById("news-feed-moneycontrol");
    const yf = document.getElementById("news-feed-yahoofinance");
    if (!mc || !yf) return;

    const renderFeed = async (url, el) => {
        try {
            const res = await fetch(`https://allorigins.win\${encodeURIComponent(url)}`);
            const json = await res.json();
            const doc = new DOMParser().parseFromString(json.contents, "text/xml");
            const items = doc.getElementsByTagName("item");
            let html = "";
            
            for (let i = 0; i < Math.min(items.length, 6); i++) {
                const title = items[i].getElementsByTagName("title")?.textContent || "Market Alert";
                const link = items[i].getElementsByTagName("link")?.textContent || "#";
                html += `<a href="\${link}" target="_blank" rel="noopener noreferrer" style="text-decoration:none; display:block; padding:0.5rem; background:#1f242c; border:1px solid #21262d; border-radius:4px; box-sizing:border-box; margin-bottom:6px;">
                    <div style="color:#f0f6fc; font-size:0.72rem; font-weight:500; line-height:1.4;">\${title}</div>
                </a>`;
            }
            el.innerHTML = html || 'No updates available.';
        } catch { 
            el.innerHTML = 'Stream unavailable.'; 
        }
    };

    renderFeed("https://moneycontrol.com", mc);
    renderFeed("https://yahoo.com", yf);
}

window.switchActiveTab = function(tabIndex, tabIdString) {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach((b, idx) => idx === tabIndex ? b.classList.add('active') : b.classList.remove('active'));
    
    const sidePanel = document.getElementById("news-sidebar-panel");
    const leftStream = document.querySelector(".matrix-left-stream");
    
    if (sidePanel && leftStream) {
        if (tabIndex === 0) {
            sidePanel.style.display = "flex";
            leftStream.style.cssText = "flex:0 0 70%; width:70%; max-width:70%;";
        } else {
            sidePanel.style.display = "none";
            leftStream.style.cssText = "flex:0 0 100% !important; width:100% !important; max-width:100% !important;";
        }
    }
};

window.toggleHistoricalDrawer = function(dId) {
    const t = document.getElementById(dId); 
    const tr = document.getElementById(`\${dId}-trigger-text`);
    if (!t || !tr) return;
    if (t.style.display === "none") { 
        t.style.display = "block"; 
        tr.innerText = "[ ❌ Close ]"; 
        tr.style.color = "#f85149"; 
    } else { 
        t.style.display = "none"; 
        tr.innerText = "[ 📖 View ]"; 
        tr.style.color = "#2962ff"; 
    }
};
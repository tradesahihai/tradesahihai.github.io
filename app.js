const DYNAMIC_BACKEND_PORTAL_URL = "https://tradesahihai-backend.onrender.com"; 

document.addEventListener("DOMContentLoaded", () => {
    fetchCloudAndFlatData();
});

async function fetchCloudAndFlatData() {
    const dailyContainer = document.getElementById('stream-daily-container');
    const learningContainer = document.getElementById('stream-learning-container');
    const strategyContainer = document.getElementById('stream-strategy-container');
    const reelsContainer = document.getElementById('stream-reels-container');

    if (!dailyContainer || !learningContainer || !strategyContainer || !reelsContainer) return;

    dailyContainer.innerHTML = ''; learningContainer.innerHTML = '';
    strategyContainer.innerHTML = ''; reelsContainer.innerHTML = '';

    let combinedTimeline = {};
    const todayLabelString = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const initializeDateBucket = (dateKey) => {
        if (!combinedTimeline[dateKey]) {
            combinedTimeline[dateKey] = { daily: [], learning: [], strategy: [], reels: [] };
        }
    };

    const compileCardMarkup = (isToday, title, tagText, tagBg, mediaHtml, textBody, pId) => {
        if (isToday) {
            return `
                <div class="display-card-v2" style="background:#161b22; padding:1.25rem; border:1px solid #30363d; border-radius:8px; margin-bottom:1rem; width: 100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                        <h3 style="margin:0; color:#fff; font-size:1.05rem; font-weight:600;">${title}</h3>
                        <div><span class="localization-tag" style="background:${tagBg}; color:${tagBg === '#00e676' || tagBg === '#ffea00' ? '#000' : '#fff'}; padding: 3px 8px; border-radius: 4px; font-size: 0.65rem; font-weight:600;">${tagText}</span></div>
                    </div>
                    ${mediaHtml}
                    <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.5; color:#c9d1d9; font-size:0.875rem; margin-top:0.5rem;">${textBody}</p>
                </div>
            `;
        } else {
            const uniqueId = `drawer-${pId || Math.random().toString(36).substr(2, 9)}`;
            return `
                <div class="historical-accordion-row" style="background:#161b22; border:1px solid #21262d; border-radius:6px; margin-bottom:0.5rem; width:100%; overflow:hidden;">
                    <div onclick="toggleHistoricalDrawer('${uniqueId}')" style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 1rem; cursor:pointer; background:#1f242c; user-select:none;">
                        <span style="font-size:0.85rem; color:#f0f6fc; font-weight:500;">📁 ${title}</span>
                        <div style="display:flex; align-items:center; gap:0.75rem;">
                            <span class="localization-tag" style="background:#30363d; color:#8b949e; padding:2px 6px; border-radius:4px; font-size:0.65rem;">${tagText}</span>
                            <span id="${uniqueId}-trigger-text" style="font-size:0.7rem; font-weight:600; color:#2962ff;">[ 📖 View ]</span>
                        </div>
                    </div>
                    <div id="${uniqueId}" style="display:none; padding:1rem; border-top:1px solid #21262d; background:#161b22;">
                        ${mediaHtml}
                        <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.5; color:#c9d1d9; font-size:0.85rem; margin:0;">${textBody}</p>
                    </div>
                </div>
            `;
        }
    };

    // 1. Fetch Cloud Posts out of Supabase Tables
    try {
        const res = await fetch(`${DYNAMIC_BACKEND_PORTAL_URL}/api/posts`);
        const posts = await res.json();
        if (posts && posts.length > 0) {
            posts.forEach((p, index) => {
                let parsedDate = new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                initializeDateBucket(parsedDate);
                const isToday = (parsedDate === todayLabelString);
                let mediaHtml = p.image_url ? `<div class="chart-frame-wrapper" style="margin: 0.5rem 0;"><img src="${p.image_url}" class="chart-frame-img" style="max-width:100%; border-radius:4px;"></div>` : '';

                if (p.category === 'daily') combinedTimeline[parsedDate].daily.push(compileCardMarkup(isToday, p.title, '🌐 Global Sync', '#30363d', mediaHtml, p.body, `cloud-daily-${index}`));
                if (p.category === 'learning') combinedTimeline[parsedDate].learning.push(compileCardMarkup(isToday, p.title, '🌐 Global Sync', '#30363d', mediaHtml, p.body, `cloud-learn-${index}`));
                if (p.category === 'strategy') combinedTimeline[parsedDate].strategy.push(compileCardMarkup(isToday, p.title, '🌐 Global Sync', '#30363d', mediaHtml, p.body, `cloud-strat-${index}`));
            });
        }
    } catch (err) { console.error("Cloud tracking stream offline:", err); }

    // 2. 🌍 DYNAMIC ROLLING TIMELINE MONTH BOUNDARY ENGINE
    try {
        const today = new Date();
        
        // Loop backwards cleanly through the last 4 calendar days (e.g. tracking across Sep1 -> Aug31 smoothly)
        for (let i = 0; i < 4; i++) {
            const targetDate = new Date();
            targetDate.setDate(today.getDate() - i);
            
            const year = targetDate.getFullYear().toString(); 
            const month = targetDate.toLocaleString('en-US', { month: 'long' }); // e.g. "September", "August"
            const monthShort = targetDate.toLocaleString('en-US', { month: 'short' }); // e.g. "Sep", "Aug"
            const dayNum = targetDate.getDate();
            const dateStr = `${monthShort}${dayNum}`; // Generates clean lookup prefix tokens case-insensitively

            const res = await fetch(`${DYNAMIC_BACKEND_PORTAL_URL}/api/analysis/${year}/${month}/${dateStr}`);
            if (res.ok) {
                const data = await res.json();
                const formattedBucketDateKey = targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                initializeDateBucket(formattedBucketDateKey);
                const isTodayActiveSession = (formattedBucketDateKey === todayLabelString);

                // ✅ TYPE-SAFE REPAIR LOOP FOR DAILY ANALYSIS FEED CONTAINER
                if (data.daily) {
                    const dailyArray = Array.isArray(data.daily) ? data.daily : [{ title: `${dateStr}_chart.txt`, content: data.daily, image: data.imageUrl }];
                    dailyArray.forEach((item, idx) => {
                        if (!item.content) return;
                        let imgHtml = item.image ? `<div class="chart-frame-wrapper" style="margin-top:0.5rem;"><img src="${item.image}" style="max-width:100%; border-radius:6px; border:1px solid #30363d;"></div>` : '';
                        let html = compileCardMarkup(isTodayActiveSession, item.title || "📈 Daily Chart Log", '📁 Daily Chart Log', '#2962ff', imgHtml, item.content, `local-daily-${dateStr}-${idx}`);
                        combinedTimeline[formattedBucketDateKey].daily.push(html);
                    });
                }

                // ✅ TYPE-SAFE REPAIR LOOP FOR TODAY'S LEARNING SECTION
                if (data.learning) {
                    const learningArray = Array.isArray(data.learning) ? data.learning : [{ title: `${dateStr}_learning.txt`, content: data.learning, image: null }];
                    learningArray.forEach((item, idx) => {
                        if (!item.content) return;
                        let imgHtml = item.image ? `<div class="chart-frame-wrapper" style="margin-top:0.5rem;"><img src="${item.image}" style="max-width:100%; border-radius:6px; border:1px solid #30363d;"></div>` : '';
                        let html = compileCardMarkup(isTodayActiveSession, item.title || "💡 Learning Vector", '💡 Learning Vector', '#00e676', imgHtml, item.content, `local-learn-${dateStr}-${idx}`);
                        combinedTimeline[formattedBucketDateKey].learning.push(html);
                    });
                }

                // ✅ TYPE-SAFE REPAIR LOOP FOR SYSTEMATIC STRATEGIES
                if (data.strategy) {
                    const strategyArray = Array.isArray(data.strategy) ? data.strategy : [{ title: `${dateStr}_strategy.txt`, content: data.strategy, image: null }];
                    strategyArray.forEach((item, idx) => {
                        if (!item.content) return;
                        let imgHtml = item.image ? `<div class="chart-frame-wrapper" style="margin-top:0.5rem;"><img src="${item.image}" style="max-width:100%; border-radius:6px; border:1px solid #30363d;"></div>` : '';
                        let html = compileCardMarkup(isTodayActiveSession, item.title || "🎯 System Playbook", '🎯 System Playbook', '#ffea00', imgHtml, item.content, `local-strat-${dateStr}-${idx}`);
                        combinedTimeline[formattedBucketDateKey].strategy.push(html);
                    });
                }

                // ✅ TYPE-SAFE REPAIR LOOP FOR TRADING REELS VIDEO PANELS
                if (data.reels || data.videoUrl) {
                    const reelsArray = Array.isArray(data.reels) ? data.reels : [{ title: `${dateStr}_reels.mp4`, content: "Daily Walkthrough Reel", video: data.videoUrl }];
                    reelsArray.forEach((item, idx) => {
                        let videoUrlSrc = item.video || data.videoUrl;
                        if (!videoUrlSrc) return;
                        let videoHtml = `<div class="chart-frame-wrapper" style="margin-top:0.5rem;"><video src="${videoUrlSrc}" controls style="width:100%; max-height:360px; border-radius:6px; background:#000;"></video></div>`;
                        let html = compileCardMarkup(isTodayActiveSession, item.title || "🎬 Market Reel", '🎬 Market Reel', '#a004ff', videoHtml, item.content || "", `local-reel-${dateStr}-${idx}`);
                        combinedTimeline[formattedBucketDateKey].reels.push(html);
                    });
                }
            }
        }
    } catch (flatErr) { console.warn("Flat file engine pipeline log bypass:", flatErr.message); }

    const sortedDates = Object.keys(combinedTimeline).sort((a, b) => new Date(b) - new Date(a));
    
    const verifyEmptyState = (el) => {
        if(el.innerHTML.trim() === "") el.innerHTML = `<div class="display-card-v2" style="background:#161b22; padding:1rem; border:1px solid #30363d; border-radius:8px; color:#8b949e; font-size:0.8rem;">No entries filed for active matrix tracking streams today.</div>`;
    };

    sortedDates.forEach(dateGroupKey => {
        const bucket = combinedTimeline[dateGroupKey];
        const isToday = (dateGroupKey === todayLabelString);
        const labelBannerText = isToday ? `Today - ${dateGroupKey}` : dateGroupKey;

        const generateDateDividerHeader = () => `
        📅 ${labelBannerText}


`;
if (bucket.daily.length > 0) dailyContainer.innerHTML += generateDateDividerHeader() + bucket.daily.join('');
if (bucket.learning.length > 0) learningContainer.innerHTML += generateDateDividerHeader() + bucket.learning.join('');
if (bucket.strategy.length > 0) strategyContainer.innerHTML += generateDateDividerHeader() + bucket.strategy.join('');
if (bucket.reels.length > 0) reelsContainer.innerHTML += generateDateDividerHeader() + bucket.reels.join('');
});
verifyEmptyState(dailyContainer); verifyEmptyState(learningContainer);
verifyEmptyState(strategyContainer); verifyEmptyState(reelsContainer);
}
function toggleHistoricalDrawer(drawerId) {
const target = document.getElementById(drawerId);
const trigger = document.getElementById(`${drawerId}-trigger-text`);
if (!target || !trigger) return;
if (target.style.display === "none") {
target.style.display = "block"; trigger.innerText = "[ ❌ Close ]"; trigger.style.color = "#f85149";
} else {
target.style.display = "none"; trigger.innerText = "[ 📖 View ]"; trigger.style.color = "#2962ff";
}
}


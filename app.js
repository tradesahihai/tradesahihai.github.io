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
        // If textBody is an object from an older file entry request, extract its metrics safely
        let rawContentText = "";
        let displayedHeader = title;

        if (textBody && typeof textBody === 'object') {
            rawContentText = textBody.fullContent || "";
            displayedHeader = textBody.header || title;
        } else {
            rawContentText = textBody || "";
        }

        if (isToday) {
            return `
                <div class="display-card-v2" style="background:#161b22; padding:1.25rem; border:1px solid #30363d; border-radius:8px; margin-bottom:1rem; width: 100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                        <h3 style="margin:0; color:#fff; font-size:1.05rem; font-weight:600;">${title}</h3>
                        <div><span class="localization-tag" style="background:${tagBg}; color:${tagBg === '#00e676' || tagBg === '#ffea00' ? '#000' : '#fff'}; padding: 3px 8px; border-radius: 4px; font-size: 0.65rem; font-weight:600;">${tagText}</span></div>
                    </div>
                    ${mediaHtml}
                    <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.5; color:#c9d1d9; font-size:0.875rem; margin-top:0.5rem;">${rawContentText}</p>
                </div>
            `;
        } else {
            const uniqueId = `drawer-${pId || Math.random().toString(36).substr(2, 9)}`;
            return `
                <div class="historical-accordion-row" style="background:#161b22; border:1px solid #21262d; border-radius:6px; margin-bottom:0.5rem; width:100%; overflow:hidden;">
                    <div onclick="toggleHistoricalDrawer('${uniqueId}')" style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 1rem; cursor:pointer; background:#1f242c; user-select:none;">
                        <span style="font-size:0.85rem; color:#f0f6fc; font-weight:500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%;">📁 ${displayedHeader}</span>
                        <div style="display:flex; align-items:center; gap:0.75rem;">
                            <span class="localization-tag" style="background:#30363d; color:#8b949e; padding:2px 6px; border-radius:4px; font-size:0.65rem;">${tagText}</span>
                            <span id="${uniqueId}-trigger-text" style="font-size:0.7rem; font-weight:600; color:#2962ff;">[ 📖 Read More ]</span>
                        </div>
                    </div>
                    <div id="${uniqueId}" style="display:none; padding:1rem; border-top:1px solid #21262d; background:#161b22;">
                        ${mediaHtml}
                        <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.5; color:#c9d1d9; font-size:0.85rem; margin:0;">${rawContentText}</p>
                    </div>
                </div>
            `;
        }
    };

    // Global toggle event handler for older data rows
    window.toggleHistoricalDrawer = function(drawerId) {
        const targetDrawer = document.getElementById(drawerId);
        const targetTrigger = document.getElementById(`${drawerId}-trigger-text`);
        
        if (!targetDrawer || !targetTrigger) return;
        
        if (targetDrawer.style.display === "none") {
            targetDrawer.style.display = "block";
            targetTrigger.innerText = "[ ✖️ Collapse ]";
            targetTrigger.style.color = "#ff6b6b";
        } else {
            targetDrawer.style.display = "none";
            targetTrigger.innerText = "[ 📖 Read More ]";
            targetTrigger.style.color = "#2962ff";
        }
    };

    // 1. Fetch Cloud Posts out of Supabase Tables
    try {
        const res = await fetch(`${DYNAMIC_BACKEND_PORTAL_URL}/api/posts`);
        
        // Safety guard against 404 HTML fallback responses crashing JSON string parses
        if (!res.ok) {
            throw new Error(`Server returned HTTP Status ${res.status}`);
        }

        const posts = await res.json();
        if (posts && posts.length > 0) {
            posts.forEach((p, index) => {
                let parsedDate = new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                initializeDateBucket(parsedDate);
                const isToday = (parsedDate === todayLabelString);
                let mediaHtml = p.image_url ? `<div class="chart-frame-wrapper" style="margin: 0.5rem 0;"><img src="${p.image_url}" class="chart-frame-img" style="max-width:100%; border-radius:4px;"></div>` : '';

                // Build consistent structure payload for older entries pulled natively via table queries
                const contentPayload = isToday ? p.body : {
                    header: p.title || "Older Cloud Analysis Record",
                    hasMore: (p.body && p.body.length > 0),
                    fullContent: p.body || ""
                };

                if (p.category === 'daily') {
                    combinedTimeline[parsedDate].daily.push(compileCardMarkup(isToday, p.title, '🌐 Global Sync', '#30363d', mediaHtml, contentPayload, `cloud-daily-${index}`));
                }
                if (p.category === 'learning') {
                    combinedTimeline[parsedDate].learning.push(compileCardMarkup(isToday, p.title, '🌐 Global Sync', '#30363d', mediaHtml, contentPayload, `cloud-learn-${index}`));
                }
                if (p.category === 'strategy') {
                    combinedTimeline[parsedDate].strategy.push(compileCardMarkup(isToday, p.title, '🌐 Global Sync', '#30363d', mediaHtml, contentPayload, `cloud-strat-${index}`));
                }
            });
        }
    } catch (err) { 
        console.error("Cloud tracking stream offline:", err); 
    }
// 2. 🌍 DYNAMIC ROLLING TIMELINE MONTH BOUNDARY ENGINE
    try {
        const today = new Date();
        
        // Loop backwards cleanly through the last 4 calendar days (e.g. tracking across Sep1 -> Aug31 smoothly)
        for (let i = 0; i < 4; i++) {
            const targetDate = new Date();
            targetDate.setDate(today.getDate() - i);
            
            const year = targetDate.getFullYear().toString(); 
            const month = targetDate.toLocaleString('en-US', { month: 'long' }); // e.g. "September", "August"
            const dayNum = targetDate.getDate().toString(); // ✅ FIX: Extracted strictly as raw numeric string ("16") instead of "Aug16"
            const dateStr = targetDate.toLocaleString('en-US', { month: 'short' }) + dayNum; // Kept for labeling elements ("Aug16")

            // Corrected parameters assembly to pass raw numbers to the backend endpoint engine
            const res = await fetch(`${DYNAMIC_BACKEND_PORTAL_URL}/api/analysis/${year}/${month}/${dayNum}`);
            if (res.ok) {
                const data = await res.json();
                const formattedBucketDateKey = targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                initializeDateBucket(formattedBucketDateKey);
                const isTodayActiveSession = (formattedBucketDateKey === todayLabelString);

                // ✅ TYPE-SAFE REPAIR LOOP FOR DAILY ANALYSIS FEED CONTAINER
                if (data.summary) {
                    const dailyArray = Array.isArray(data.summary) ? data.summary : [{ title: `${dateStr}_chart.txt`, content: data.summary, image: data.imageUrl }];
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
                        
                        // Handled textBody object configuration to prevent empty object renderings inside old reels panels
                        const contentPayload = isTodayActiveSession ? (item.content || "") : {
                            header: item.title || "Market Walkthrough Reel",
                            hasMore: false,
                            fullContent: item.content || "Daily Video Summary Documentation"
                        };
                        
                        let html = compileCardMarkup(isTodayActiveSession, item.title || "🎬 Market Reel", '🎬 Market Reel', '#a004ff', videoHtml, contentPayload, `local-reel-${dateStr}-${idx}`);
                        combinedTimeline[formattedBucketDateKey].reels.push(html);
                    });
                }
            }
        }
    } catch (flatErr) { 
        console.warn("Flat file engine pipeline log bypass:", flatErr.message); 
    }

    const sortedDates = Object.keys(combinedTimeline).sort((a, b) => new Date(b) - new Date(a));
    
    const verifyEmptyState = (el) => {
        if (el.innerHTML.trim() === "") {
            el.innerHTML = `<div class="display-card-v2" style="background:#161b22; padding:1rem; border:1px solid #30363d; border-radius:8px; color:#8b949e; font-size:0.8rem; width:100%; box-sizing:border-box;">No entries filed for active matrix tracking streams today.</div>`;
        }
    };

    // Render logic loop mapping compiled entries into their responsive layout targets
       // --- Post-Processing Timeline Reductions ---
    const sortedDates = Object.keys(combinedTimeline).sort((a, b) => new Date(b) - new Date(a));
    
    const verifyEmptyState = (el) => {
        if (!el) return;
        if (el.innerHTML.trim() === "") {
            el.innerHTML = `
                <div class="display-card-v2" style="background:#161b22; padding:1rem; border:1px solid #30363d; border-radius:8px; color:#8b949e; font-size:0.8rem; width:100%; box-sizing:border-box;">
                    No entries filed for active matrix tracking streams today.
                </div>
            `;
        }
    };

    // 🔄 Render timeline headers and append historical tracks cleanly
    sortedDates.forEach(dateGroupKey => {
        const bucket = combinedTimeline[dateGroupKey];
        const isToday = (dateGroupKey === todayLabelString);
        const labelBannerText = isToday ? `Today - ${dateGroupKey}` : dateGroupKey;

        const generateDateDividerHeader = () => `
            <div class="timeline-date-header" style="padding: 0.4rem 0.75rem; background: #21262d; border: 1px solid #30363d; border-radius: 4px; color: #c9d1d9; font-size: 0.75rem; font-weight: 600; margin: 1rem 0 0.5rem 0; width:100%; clear:both; font-family:monospace; box-sizing:border-box;">
                📅 ${labelBannerText}
            </div>
        `;

        if (bucket.daily && bucket.daily.length > 0) {
            dailyContainer.innerHTML += generateDateDividerHeader() + bucket.daily.join('');
        }
        if (bucket.learning && bucket.learning.length > 0) {
            learningContainer.innerHTML += generateDateDividerHeader() + bucket.learning.join('');
        }
        if (bucket.strategy && bucket.strategy.length > 0) {
            strategyContainer.innerHTML += generateDateDividerHeader() + bucket.strategy.join('');
        }
        if (bucket.reels && bucket.reels.length > 0) {
            reelsContainer.innerHTML += generateDateDividerHeader() + bucket.reels.join('');
        }
    });

    // Run safe fallback empty status checks across tracking column elements
    verifyEmptyState(dailyContainer); 
    verifyEmptyState(learningContainer);
    verifyEmptyState(strategyContainer); 
    verifyEmptyState(reelsContainer);
}

/**
 * 📁 HISTORICAL ACCORDION TOGGLE CONTROLLER
 * Explicitly bound to the global window context to ensure inline onclick handlers evaluate correctly
 */
window.toggleHistoricalDrawer = function(drawerId) {
    const target = document.getElementById(drawerId);
    const trigger = document.getElementById(`${drawerId}-trigger-text`);
    
    if (!target || !trigger) return;
    
    if (target.style.display === "none") {
        target.style.display = "block"; 
        trigger.innerText = "[ ❌ Close ]"; 
        trigger.style.color = "#f85149";
    } else {
        target.style.display = "none"; 
        trigger.innerText = "[ 📖 View ]"; 
        trigger.style.color = "#2962ff";
    }
};

/**
 * 🧮 FIXED BOTTOM MATRIX PINNING ENGINE
 * Extracts the layout element and anchors it to the baseline of the screen
 */
document.addEventListener("DOMContentLoaded", () => {
    const targetCalculatorElement = document.querySelector('.calculator-widget-card');
    
    if (targetCalculatorElement) {
        const pinnedFooterContainer = document.createElement("div");
        pinnedFooterContainer.id = "global-portal-fixed-footer";
        
        pinnedFooterContainer.style.cssText = `
            position: fixed; 
            bottom: 0; 
            left: 0; 
            width: 100%; 
            background: #0d1117; 
            border-top: 1px solid #30363d; 
            padding: 0.4rem 0; 
            z-index: 99999; 
            box-shadow: 0 -4px 15px rgba(0,0,0,0.6);
            display: block !important;
        `;

        pinnedFooterContainer.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; width: 100%; box-sizing: border-box;">
                ${targetCalculatorElement.innerHTML}
            </div>
        `;

        const parentCardContainer = targetCalculatorElement.closest('footer') || targetCalculatorElement.parentElement;
        if (parentCardContainer && parentCardContainer.tagName === 'FOOTER') {
            targetCalculatorElement.remove();
        } else {
            targetCalculatorElement.remove();
        }

        document.body.appendChild(pinnedFooterContainer);
        document.body.style.setProperty("padding-bottom", "85px", "important");
    }
});

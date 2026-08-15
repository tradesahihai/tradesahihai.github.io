const DYNAMIC_BACKEND_PORTAL_URL = "https://onrender.com"; 

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

    // Get today's clean localized date string layout to evaluate older metrics (e.g., "August 16, 2026")
    const todayLabelString = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });

    const initializeDateBucket = (dateKey) => {
        if (!combinedTimeline[dateKey]) {
            combinedTimeline[dateKey] = { daily: [], learning: [], strategy: [], reels: [] };
        }
    };

    /**
     * 🎨 ACCORDION DRAWER GENERATOR: Wraps older content records cleanly into single-line expandable rows
     */
    const compileCardMarkup = (isToday, title, tagText, tagBg, dateLabel, mediaHtml, textBody, pId) => {
        if (isToday) {
            // Full expanded layout variant for today's live analysis entries
            return `
                <div class="display-card-v2" style="background:#161b22; padding:1.5rem; border:1px solid #30363d; border-radius:8px; margin-bottom:1rem; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                        <h3 style="margin:0; color:#fff; font-size:1.15rem; font-weight:600;">${title}</h3>
                        <div><span class="localization-tag" style="background:${tagBg}; color:${tagBg === '#00e676' || tagBg === '#ffea00' ? '#000' : '#fff'}; padding: 4px 10px; border-radius: 4px; font-size: 0.7rem; font-weight:600;">${tagText}</span></div>
                    </div>
                    <p style="font-size:0.75rem; color:#8b949e; margin: 0 0 12px 0;">Logged on active session workspace timeline</p>
                    ${mediaHtml}
                    <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.6; color:#c9d1d9; font-size:0.925rem; margin-top:0.75rem;">${textBody}</p>
                </div>
            `;
        } else {
            // Streamlined high-density accordion layout row with visibility controllers for legacy logs
            const uniqueId = `drawer-${pId || Math.random().toString(36).substr(2, 9)}`;
            return `
                <div class="historical-accordion-row" style="background:#161b22; border:1px solid #21262d; border-radius:6px; margin-bottom:0.5rem; width:100%; overflow:hidden;">
                    <!-- Headline Layer Header Bar -->
                    <div onclick="toggleHistoricalDrawer('${uniqueId}')" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1.25rem; cursor:pointer; background:#1f242c; user-select:none; transition: background 0.2s;">
                        <div style="display:flex; align-items:center; gap:0.75rem;">
                            <span style="font-size:0.9rem; color:#f0f6fc; font-weight:500;">📁 ${title}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <span class="localization-tag" style="background:#30363d; color:#8b949e; padding:2px 6px; border-radius:4px; font-size:0.65rem;">${tagText}</span>
                            <span id="${uniqueId}-trigger-text" style="font-size:0.75rem; font-weight:600; color:#2962ff; letter-spacing:0.5px;">[ 📖 Read Analysis ]</span>
                        </div>
                    </div>
                    <!-- Hidden Expandable Content Area Drop Drawer -->
                    <div id="${uniqueId}" style="display:none; padding:1.25rem; border-top:1px solid #21262d; background:#161b22;">
                        ${mediaHtml}
                        <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.6; color:#c9d1d9; font-size:0.9rem; margin:0;">${textBody}</p>
                    </div>
                </div>
            `;
        }
    };

    // 1. Fetch Legacy Table Data rows out of Supabase Cloud Tables
    try {
        const res = await fetch(`${DYNAMIC_BACKEND_PORTAL_URL}/api/posts`);
        const posts = await res.json();
        if (posts && posts.length > 0) {
            posts.forEach((p, index) => {
                let parsedDate = new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                });
                initializeDateBucket(parsedDate);
                
                const isToday = (parsedDate === todayLabelString);
                let mediaHtml = p.image_url ? `<div class="chart-frame-wrapper" style="margin: 0.5rem 0;"><img src="${p.image_url}" class="chart-frame-img" style="max-width:100%; border-radius:4px;"></div>` : '';

                if (p.category === 'daily') {
                    combinedTimeline[parsedDate].daily.push(compileCardMarkup(isToday, p.title, '🌐 Global Sync', '#30363d', parsedDate, mediaHtml, p.body, `cloud-daily-${index}`));
                }
                if (p.category === 'learning') {
                    combinedTimeline[parsedDate].learning.push(compileCardMarkup(isToday, p.title, '🌐 Global Sync', '#30363d', parsedDate, mediaHtml, p.body, `cloud-learn-${index}`));
                }
                if (p.category === 'strategy') {
                    combinedTimeline[parsedDate].strategy.push(compileCardMarkup(isToday, p.title, '🌐 Global Sync', '#30363d', parsedDate, mediaHtml, p.body, `cloud-strat-${index}`));
                }
                if (p.category === 'reel') {
                    let reelHtml = `
                        <article class="reel-card" style="width:100%; max-width:360px; background:#161b22; border:1px solid #30363d; border-radius:8px; padding:1rem; margin-bottom:1rem;">
                            <div class="reel-video-simulation-box" style="position:relative; display:flex; justify-content:center; align-items:center; background:#000; border-radius:6px; height:200px; overflow:hidden;">
                                <img src="${p.image_url}" style="width:100%; opacity:0.6;">
                                <div style="position: absolute; font-size: 2rem; opacity: 0.85; cursor: pointer;">▶️</div>
                                <div style="position:absolute; bottom:0; left:0; right:0; padding:10px; background:linear-gradient(transparent, rgba(0,0,0,0.8)); color:#fff;">
                                    <h4 style="margin:0;">${p.title}</h4>
                                    <p style="font-size:0.75rem; opacity:0.9; margin:4px 0 0 0;">${p.body}</p>
                                </div>
                            </div>
                        </article>
                    `;
                    combinedTimeline[parsedDate].reels.push(reelHtml);
                }
            });
        }
    } catch (err) { console.error("Cloud data stream offline:", err); }

    // 2. Fetch Flat Workspace files out of your native server folder data arrays
    try {
        const today = new Date();
        const year = today.getFullYear().toString(); 
        const month = today.toLocaleString('en-US', { month: 'long' }); 
        
        const monthShort = today.toLocaleString('en-US', { month: 'short' });
        const dayNum = today.getDate();
        const dateStr = `${monthShort}${dayNum}`; // Generates prefix format (e.g., "Aug16")
        
        const res = await fetch(`${DYNAMIC_BACKEND_PORTAL_URL}/api/analysis/${year}/${month}/${dateStr}`);
        if (res.ok) {
            const data = await res.json();
            initializeDateBucket(todayLabelString);
            
            let imgHtml = data.imageUrl ? `<div class="chart-frame-wrapper"><img src="${data.imageUrl}" class="chart-frame-img" style="max-width:100%; border-radius:8px; margin: 0.5rem 0;"></div>` : '';

            if (data.summary) {
                let html = compileCardMarkup(true, '📈 Performance Log Analysis Summary', '📁 Local File', '#2962ff', todayLabelString, imgHtml, data.summary, 'local-daily');
                combinedTimeline[todayLabelString].daily.unshift(html);
            }
            if (data.learning) {
                let html = compileCardMarkup(true, '💡 Market Core Concept Learnings', '📁 Local File', '#00e676', todayLabelString, '', data.learning, 'local-learn');
                combinedTimeline[todayLabelString].learning.unshift(html);
            }
            if (data.strategy) {
                let html = compileCardMarkup(true, '🎯 Playbook Strategic Actions', '📁 Local File', '#ffea00', todayLabelString, '', data.strategy, 'local-strat');
                combinedTimeline[todayLabelString].strategy.unshift(html);
            }
            if (data.videoUrl) {
                let html = `
                    <article class="reel-card" style="width: 100%; max-width: 360px; background:#161b22; padding:1rem; border:1px solid #30363d; border-radius:8px; margin-bottom: 1.5rem;">
                        <video src="${data.videoUrl}" controls style="border-radius: 6px; background: #000; width:100%; max-height:450px;">
                            Your browser environment context cannot stream native video frames.
                        </video>
                        <div style="padding: 10px 0 0 0;">
                                🎬 Daily Review Reel WalkthroughStreaming via public storage bucket root
    `;
    combinedTimeline[todayLabelString].reels.unshift(html);
}
}
} catch (flatErr) { 
    console.warn("Flat file metrics pending for active clock tracking layer:", flatErr); 
}

// 3. Render Sorted Chronological timelines grouped cleanly inside divided Date blocks
const sortedDates = Object.keys(combinedTimeline).sort((a, b) => new Date(b) - new Date(a));

if (sortedDates.length === 0) {
    // Fixed: Wrapped raw HTML content inside proper backticks
    const emptyFallback = `
        <div class="display-card-v2" style="background:#161b22; padding:1.5rem; border:1px solid #30363d; border-radius:8px; color:#8b949e;">
            <h4>Feed Repository Active</h4>
            <p>Commit flat text files to your data/ workspace directory to publish trading logs.</p>
        </div>
    `;
    
    dailyContainer.innerHTML = emptyFallback; 
    learningContainer.innerHTML = emptyFallback;
    strategyContainer.innerHTML = emptyFallback; 
    reelsContainer.innerHTML = emptyFallback;
    return;
}
    sortedDates.forEach(dateGroupKey => {
    const bucket = combinedTimeline[dateGroupKey];
    const isToday = (dateGroupKey === todayLabelString);
    
    // Dynamic banner wrapper changes title automatically if the timeline row matches today's diary
    // Fixed: Added template backticks to correctly handle string evaluation
    const labelBannerText = isToday ? `Today - ${dateGroupKey}` : dateGroupKey;
    
    // Fixed: Wrapped the raw HTML layout element inside missing backticks
    const generateDateDividerHeader = (title) => `
        <div class="timeline-date-divider" style="display: flex; align-items: center; margin: 2rem 0 1rem 0; width: 100%;"> 
            <span style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: ${isToday ? '#58a6ff' : '#8b949e'}; background: ${isToday ? 'rgba(56,139,253,0.15)' : '#21262d'}; padding: 4px 14px; border-radius: 20px; border: 1px solid ${isToday ? '#388bfd' : '#30363d'}; shadow: 0 2px 5px rgba(0,0,0,0.2);">📅 ${title}</span> 
            <div style="flex-grow: 1; height: 1px; background: ${isToday ? '#388bfd' : '#30363d'}; margin-left: 1rem; opacity: ${isToday ? '0.7' : '0.4'};"></div> 
        </div>
    `;
        if (bucket.daily.length > 0) dailyContainer.innerHTML += generateDateDividerHeader(labelBannerText) + bucket.daily.join('');
if (bucket.learning.length > 0) learningContainer.innerHTML += generateDateDividerHeader(labelBannerText) + bucket.learning.join('');
if (bucket.strategy.length > 0) strategyContainer.innerHTML += generateDateDividerHeader(labelBannerText) + bucket.strategy.join('');
if (bucket.reels.length > 0) {
    reelsContainer.innerHTML += generateDateDividerHeader(labelBannerText) + <div style="display:flex; flex-direction:column; gap:1rem;">${bucket.reels.join('')}</div>;
}});
}/**
🎛️ ACCORDION RUNTIME CONTROLLER: Slides open text descriptions seamlessly on user interactions*/
function toggleHistoricalDrawer(drawerId) {
    const targetDrawerElement = document.getElementById(drawerId);
    const triggerTextElement = document.getElementById(${drawerId}-trigger-text);
    if (!targetDrawerElement || !triggerTextElement) return;

    if (targetDrawerElement.style.display === "none") {
        targetDrawerElement.style.display = "block";
        triggerTextElement.innerText = "[ ❌ Close Analysis ]";
        triggerTextElement.style.color = "#f85149"; // Transitions text color alert to clear red alert metrics
    } else {
        targetDrawerElement.style.display = "none";
        triggerTextElement.innerText = "[ 📖 Read Analysis ]";
        triggerTextElement.style.color = "#2962ff"; // Reset state blue highlight
    }
}



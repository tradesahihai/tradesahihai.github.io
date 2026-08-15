const DYNAMIC_BACKEND_PORTAL_URL = "https://onrender.com"; 

document.addEventListener("DOMContentLoaded", () => {
    fetchCloudAndFlatData();
});

async function fetchCloudAndFlatData() {
    // Target containers
    const dailyContainer = document.getElementById('stream-daily-container');
    const learningContainer = document.getElementById('stream-learning-container');
    const strategyContainer = document.getElementById('stream-strategy-container');
    const reelsContainer = document.getElementById('stream-reels-container');

    if (!dailyContainer || !learningContainer || !strategyContainer || !reelsContainer) return;

    dailyContainer.innerHTML = ''; learningContainer.innerHTML = '';
    strategyContainer.innerHTML = ''; reelsContainer.innerHTML = '';

    let combinedTimeline = {};

    // Helper setup to initialize date entries inside the data object tree map
    const initializeDateBucket = (dateKey) => {
        if (!combinedTimeline[dateKey]) {
            combinedTimeline[dateKey] = { daily: [], learning: [], strategy: [], reels: [] };
        }
    };

    // 1. Fetch Legacy Table Data rows out of Supabase
    try {
        const res = await fetch(`${DYNAMIC_BACKEND_PORTAL_URL}/api/posts`);
        const posts = await res.json();
        if (posts && posts.length > 0) {
            posts.forEach(p => {
                let parsedDate = new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                });
                initializeDateBucket(parsedDate);
                
                let mediaHtml = p.image_url ? `<div class="chart-frame-wrapper"><img src="${p.image_url}" class="chart-frame-img" style="max-width:100%; border-radius:4px; margin-top:0.5rem;"></div>` : '';
                let cardHtml = `
                    <div class="display-card-v2" style="background:#161b22; padding:1.25rem; border:1px solid #30363d; border-radius:8px; margin-bottom:1rem; width:100%;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                            <h3 style="margin:0; color:#fff; font-size:1.1rem;">${p.title}</h3>
                            <div><span class="localization-tag" style="background:#30363d; color:#8b949e; padding:2px 8px; border-radius:4px; font-size:0.7rem;">🌐 Global Sync</span></div>
                        </div>
                        ${mediaHtml}
                        <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.6; color:#c9d1d9; margin-top:0.5rem; font-size:0.9rem;">${p.body}</p>
                    </div>
                `;

                if (p.category === 'daily') combinedTimeline[parsedDate].daily.push(cardHtml);
                if (p.category === 'learning') combinedTimeline[parsedDate].learning.push(cardHtml);
                if (p.category === 'strategy') combinedTimeline[parsedDate].strategy.push(cardHtml);
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

    // 2. Fetch Flat Files out of today's directory variables
    try {
        const year = "2026";
        const month = "August";
        const dateStr = "Aug15"; // Target log entry file identifier
        
        const res = await fetch(`${DYNAMIC_BACKEND_PORTAL_URL}/api/analysis/${year}/${month}/${dateStr}`);
        if (res.ok) {
            const data = await res.json();
            let parsedDate = "August 15, 2026"; // Synchronized date header line format
            initializeDateBucket(parsedDate);

            if (data.summary) {
                let imgHtml = data.imageUrl ? `<div class="chart-frame-wrapper"><img src="${data.imageUrl}" class="chart-frame-img" style="max-width:100%; border-radius:8px; margin: 1rem 0;"></div>` : '';
                let html = `
                    <div class="display-card-v2" style="background:#161b22; padding:1.5rem; border:1px solid #30363d; border-radius:8px; margin-bottom:1rem; width: 100%;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                            <h3 style="margin:0; color:#fff; font-size:1.1rem;">📈 Performance Log Analysis Summary</h3>
                            <div><span class="localization-tag" style="background:#2962ff; color:#fff; padding: 4px 10px; border-radius: 4px; font-size: 0.7rem; font-weight:600;">📁 Local File</span></div>
                        </div>
                        ${imgHtml}
                        <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.6; color:#c9d1d9; font-size:0.9rem;">${data.summary}</p>
                    </div>
                `;
                combinedTimeline[parsedDate].daily.unshift(html);
            }

            if (data.learning) {
                let html = `
                    <div class="display-card-v2" style="background:#161b22; padding:1.5rem; border:1px solid #30363d; border-radius:8px; margin-bottom:1rem; width: 100%;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                            <h3 style="margin:0; color:#fff; font-size:1.1rem;">💡 Market Core Concept Learnings</h3>
                            <div><span class="localization-tag" style="background:#00e676; color:#000; padding: 4px 10px; border-radius: 4px; font-size: 0.7rem; font-weight:600;">📁 Local File</span></div>
                        </div>
                        <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.6; margin-top:12px; color:#c9d1d9; font-size:0.9rem;">${data.learning}</p>
                    </div>
                `;
                combinedTimeline[parsedDate].learning.unshift(html);
            }

            if (data.strategy) {
                let html = `
                    <div class="display-card-v2" style="background:#161b22; padding:1.5rem; border:1px solid #30363d; border-radius:8px; margin-bottom:1rem; width: 100%;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                            <h3 style="margin:0; color:#fff; font-size:1.1rem;">🎯 Playbook Strategic Actions</h3>
                            <div><span class="localization-tag" style="background:#ffea00; color:#000; padding: 4px 10px; border-radius: 4px; font-size: 0.7rem; font-weight:600;">📁 Local File</span></div>
                        </div>
                        <p class="card-body-text" style="white-space: pre-wrap; line-height: 1.6; margin-top:12px; color:#c9d1d9; font-size:0.9rem;">${data.strategy}</p>
                    </div>
                `;
                combinedTimeline[parsedDate].strategy.unshift(html);
            }

            if (data.videoUrl) {
                let html = `
                    <article class="reel-card" style="width: 100%; max-width: 360px; background:#161b22; padding:1rem; border:1px solid #30363d; border-radius:8px; margin-bottom: 1.5rem;">
                        <video src="${data.videoUrl}" controls style="border-radius: 6px; background: #000; width:100%; max-height:450px;">
                            Your environment context cannot stream native mp4 video frames.
                        </video>
                        <div style="padding: 10px 0 0 0;">
                            <h4 style="margin:0; color:#fff;">🎬 Daily Review Reel Walkthrough</h4>
                            <p style="font-size:0.75rem; color:#8b949e; margin:4px 0 0 0;">Streaming via public storage bucket root</p>
                        </div>
                    </article>
                `;
                combinedTimeline[parsedDate].reels.unshift(html);
            }
        }
    } catch (flatErr) { console.warn("Flat file logs pending entry map details:", flatErr); }

    // 3. Render Chronological Timelines Separated and Divided by Specific Date Buckets
    // Sorts the timeline structure keys down sequentially from newest entries to oldest history
    const sortedDates = Object.keys(combinedTimeline).sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length === 0) {
        const emptyFallback = `<div class="display-card-v2" style="background:#161b22; padding:1.5rem; border:1px solid #30363d; border-radius:8px; color:#8b949e;"><h4>Feed Repository Active</h4><p>Commit flat text files to your data/ workspace directory to publish trading logs.</p></div>`;
        dailyContainer.innerHTML = emptyFallback; learningContainer.innerHTML = emptyFallback;
            strategyContainer.innerHTML = emptyFallback; 
    reelsContainer.innerHTML = emptyFallback;
    return;
}

sortedDates.forEach(dateGroupKey => {
    const bucket = combinedTimeline[dateGroupKey];
    
    // Fixed: Added backticks around the HTML string template literal
    const generateDateDividerHeader = (title) => `
        <div class="timeline-date-divider" style="display: flex; align-items: center; margin: 2rem 0 1rem 0; width: 100%;"> 
            <span style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #8b949e; background: #21262d; padding: 4px 12px; border-radius: 20px; border: 1px solid #30363d;">📅 ${title}</span> 
            <div style="flex-grow: 1; height: 1px; background: #30363d; margin-left: 1rem;"></div> 
        </div>
    `;
    
    if (bucket.daily.length > 0) {
        dailyContainer.innerHTML += generateDateDividerHeader(dateGroupKey) + bucket.daily.join('');
    }
    if (bucket.learning.length > 0) {
        learningContainer.innerHTML += generateDateDividerHeader(dateGroupKey) + bucket.learning.join('');
    }
    if (bucket.strategy.length > 0) {
        strategyContainer.innerHTML += generateDateDividerHeader(dateGroupKey) + bucket.strategy.join('');
    }
    if (bucket.reels.length > 0) {
        // Fixed: Added backticks around the wrapping HTML string literal
        reelsContainer.innerHTML += generateDateDividerHeader(dateGroupKey) + `
            <div style="display:flex; flex-direction:column; gap:1rem;">${bucket.reels.join('')}</div>
        `;
    }
});
}


// Initialization Configuration - Injected via Vercel Runtime Env
const SUPABASE_URL = window.env?.SUPABASE_URL || "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = window.env?.SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
    fetchCloudPosts();
    checkActiveSession();
});

// Fetch permanent data for all global visitors
async function fetchCloudPosts() {
    const techContainer = document.getElementById('technical-posts-container');
    const fundContainer = document.getElementById('fundamental-posts-container');

    let { data: posts, error } = await supabase
        .from('analysis_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Database error:", error);
        return;
    }

    techContainer.innerHTML = '';
    fundContainer.innerHTML = '';

    if (!posts || posts.length === 0) {
        const fallback = `<article class="post-card"><h2>No Entries Yet</h2><p>Admin hasn't published analyses yet.</p></article>`;
        techContainer.innerHTML = fallback;
        fundContainer.innerHTML = fallback;
        return;
    }

    posts.forEach(post => {
        let imgTag = post.image_url ? `<img src="${post.image_url}" class="post-chart" alt="Analysis Graphic">` : '';
        let dateStr = new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        let postHTML = `
            <article class="post-card">
                <h2>${post.title}</h2>
                <p class="meta-info">Published on ${dateStr}</p>
                ${imgTag}
                <p style="white-space: pre-line;">${post.body}</p>
            </article>
        `;

        if (post.category === 'technical') techContainer.innerHTML += postHTML;
        if (post.category === 'fundamental') fundContainer.innerHTML += postHTML;
    });
}

// Secure Login Logic Engine
async function loginAdmin() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-pass').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Authentication failed: " + error.message);
    } else {
        showEditorSuite();
    }
}

async function checkActiveSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) showEditorSuite();
}

function showEditorSuite() {
    document.getElementById('auth-box').classList.add('hidden');
    document.getElementById('editor-controls').classList.remove('hidden');
}

async function logoutAdmin() {
    await supabase.auth.signOut();
    window.location.reload();
}

// Global Cloud Write Publication
async function publishToCloud() {
    const category = document.getElementById('post-category').value;
    const title = document.getElementById('post-title').value;
    const image_url = document.getElementById('post-image').value;
    const body = document.getElementById('post-body').value;

    if (!title || !body) {
        alert("Title and content are required fields!");
        return;
    }

    const { data, error } = await supabase
        .from('analysis_posts')
        .insert([{ title, category, image_url, body }]);

    if (error) {
        alert("Publishing error: " + error.message);
    } else {
        alert("Published Live Globally!");
        document.getElementById('post-title').value = '';
        document.getElementById('post-image').value = '';
        document.getElementById('post-body').value = '';
        fetchCloudPosts();
    }
}

// Tab Switches Navigation Controls
function switchTab(targetTabId) {
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${targetTabId}-tab`).classList.add('active');
    event.currentTarget.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleAdminPanel() {
    document.getElementById('admin-panel').classList.toggle('hidden');
}

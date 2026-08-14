// Configuration Settings
const MASTER_PASSWORD = "TradeSahiHai2026"; // 🔑 CHANGE THIS TO YOUR DESIRED ADMIN PASSWORD
let postDatabase = JSON.parse(localStorage.getItem('trade_posts')) || [];

// Boot Checklist Setup
document.addEventListener("DOMContentLoaded", () => {
    renderAllPosts();
});

// Smooth Responsive Tab Inverted Switch System
function switchTab(targetTabId) {
    // Structural Node Selection
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    // Trigger Dynamic Activation Elements
    document.getElementById(`${targetTabId}-tab`).classList.add('active');
    event.currentTarget.classList.add('active');

    // Trigger Mobile Device Centering Scroll Functionality
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Admin Panel Toggle Mechanics
function toggleAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    adminPanel.classList.toggle('hidden');
}

// Authentication Engine Interface
function authenticateAdmin() {
    const enteredPass = document.getElementById('admin-pass').value;
    if (enteredPass === MASTER_PASSWORD) {
        document.getElementById('auth-box').classList.add('hidden');
        document.getElementById('editor-controls').classList.remove('hidden');
    } else {
        alert("Incorrect Admin Credentials. Access Denied.");
    }
}

// Dynamic Post Generation Execution
function publishPost() {
    const category = document.getElementById('post-category').value;
    const title = document.getElementById('post-title').value;
    const image = document.getElementById('post-image').value;
    const body = document.getElementById('post-body').value;

    if (!title || !body) {
        alert("Please complete the title and analysis content fields before publishing.");
        return;
    }

    const newPost = {
        id: Date.now(),
        category: category,
        title: title,
        image: image,
        body: body,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    postDatabase.unshift(newPost);
    localStorage.setItem('trade_posts', JSON.stringify(postDatabase));
    
    // Clear Workspace Input Fields
    document.getElementById('post-title').value = '';
    document.getElementById('post-image').value = '';
    document.getElementById('post-body').value = '';

    renderAllPosts();
    alert("Post published successfully locally!");
}

// Content Rendering Engine Matrix
function renderAllPosts() {
    const techContainer = document.getElementById('technical-posts-container');
    const fundContainer = document.getElementById('fundamental-posts-container');

    // Clear Previous Interface Nodes
    techContainer.innerHTML = '';
    fundContainer.innerHTML = '';

    if (postDatabase.length === 0) {
        const structuralTemplate = `<article class="post-card"><h2>No Entries Recorded</h2><p>Database workspace is currently empty.</p></article>`;
        techContainer.innerHTML = structuralTemplate;
        fundContainer.innerHTML = structuralTemplate;
        return;
    }

    postDatabase.forEach(post => {
        let imageElement = post.image ? `<img src="${post.image}" class="post-chart" alt="Chart Analysis Graphic">` : '';
        let postHTML = `
            <article class="post-card" id="post-${post.id}">
                <h2>${post.title}</h2>
                <p class="meta-info">Published on ${post.date}</p>
                ${imageElement}
                <p style="white-space: pre-line;">${post.body}</p>
            </article>
        `;

        if (post.category === 'technical') {
            techContainer.innerHTML += postHTML;
        } else if (post.category === 'fundamental') {
            fundContainer.innerHTML += postHTML;
        }
    });
}

// Database Clearing Protocol
function clearSavedData() {
    if (confirm("Are you sure you want to delete your custom posts library?")) {
        localStorage.removeItem('trade_posts');
        postDatabase = [];
        renderAllPosts();
    }
}

/**
 * MROSHELEVATE Feed Application Controller (Backend Connected)
 * Seamlessly interfaces with Supabase Service Layer (mroshBackend)
 */

(function () {
  // Elements
  const feedStreamContainer = document.getElementById("creatorFeedStream");
  const composerTextarea = document.getElementById("composerInput");
  const composerSubmitBtn = document.getElementById("publishPostBtn");
  const suggestedConnectionsContainer = document.getElementById("suggestedConnectionsList");
  const upcomingEventsContainer = document.getElementById("upcomingEventsList");
  const sidebarCreatorsContainer = document.getElementById("sidebarCreatorsList");

  let localPostsCache = [];

  // 1. Render Feed Stream
  async function renderFeed() {
    if (!feedStreamContainer) return;

    // Show subtle loading pulse if empty
    if (localPostsCache.length === 0) {
      feedStreamContainer.innerHTML = `
        <div style="text-align: center; padding: 32px; color: var(--text-muted); font-size: 0.9rem;">
          Loading creator community feed...
        </div>
      `;
    }

    const { data: posts, isLive } = await mroshBackend.getPosts();
    localPostsCache = posts || [];

    if (localPostsCache.length === 0) {
      feedStreamContainer.innerHTML = `
        <div style="text-align: center; padding: 48px 24px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <p style="color: var(--text-secondary); margin-bottom: 12px;">No posts in the universe yet.</p>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Be the first creator to share an update!</p>
        </div>
      `;
      return;
    }

    feedStreamContainer.innerHTML = localPostsCache.map(post => {
      const mediaHtml = post.media ? `
        <div class="post-media-container">
          <img src="${post.media.url}" alt="Post media" class="post-media-img" loading="lazy" />
        </div>
      ` : "";

      const commentsHtml = (post.comments || []).map(comment => `
        <div class="comment-row">
          <img src="${comment.avatar}" alt="${comment.author}" class="comment-avatar" />
          <div class="comment-bubble">
            <div class="comment-author">${comment.author} <span style="font-weight: 400; color: var(--text-muted); font-size: 0.75rem;">• ${comment.time}</span></div>
            <div class="comment-text">${comment.text}</div>
          </div>
        </div>
      `).join("");

      return `
        <article class="creator-post-card card-interactive" id="postCard-${post.id}" data-id="${post.id}">
          <!-- Post Header -->
          <div class="post-header">
            <div class="post-author-cluster" data-author="${post.author.name}">
              <img src="${post.author.avatar}" alt="${post.author.name}" class="post-author-avatar" />
              <div>
                <div class="post-author-name">
                  ${post.author.name}
                </div>
                <div class="post-timestamp-role">${post.author.role} • ${post.timeAgo}</div>
              </div>
            </div>
            <button class="post-more-btn" aria-label="More options" data-id="${post.id}">•••</button>
          </div>

          <!-- Post Content -->
          <div class="post-content-text">${post.content}</div>

          <!-- Media Attachment -->
          ${mediaHtml}

          <!-- Post Actions Bar -->
          <div class="post-actions-bar">
            <div class="engagement-actions-left">
              <!-- Like Button -->
              <button class="action-trigger-btn like-btn ${post.isLiked ? 'liked' : ''}" data-id="${post.id}" title="Like">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="${post.isLiked ? '#FF5A79' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span class="like-counter">${post.likes}</span>
              </button>

              <!-- Comment Button -->
              <button class="action-trigger-btn comment-btn" data-id="${post.id}" title="Comment">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span class="comment-counter">${(post.comments || []).length}</span>
              </button>

              <!-- Share Button -->
              <button class="action-trigger-btn share-btn" data-id="${post.id}" title="Share">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                <span class="share-counter">${post.shares}</span>
              </button>
            </div>

            <!-- Bookmark / Save Button -->
            <button class="save-trigger-btn ${post.isSaved ? 'saved' : ''}" data-id="${post.id}" title="Bookmark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${post.isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>

          <!-- Expandable Comments Drawer -->
          <div class="comments-drawer" id="commentsDrawer-${post.id}">
            <div class="comments-list-box" id="commentsList-${post.id}">
              ${commentsHtml}
            </div>
            
            <div class="comment-input-row">
              <input type="text" class="comment-input-field" id="inputComment-${post.id}" placeholder="Write a comment..." />
              <button class="btn btn-primary btn-sm submit-comment-btn" data-id="${post.id}">Post</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    attachFeedEventListeners();
  }

  // 2. Attach Event Handlers
  function attachFeedEventListeners() {
    // Likes
    document.querySelectorAll(".like-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const postId = btn.dataset.id;
        const post = localPostsCache.find(p => p.id === postId);
        if (!post) return;

        const isCurrentlyLiked = post.isLiked;
        post.isLiked = !isCurrentlyLiked;
        post.likes += post.isLiked ? 1 : -1;

        btn.classList.toggle("liked", post.isLiked);
        const svg = btn.querySelector("svg");
        if (svg) svg.setAttribute("fill", post.isLiked ? "#FF5A79" : "none");
        const counter = btn.querySelector(".like-counter");
        if (counter) counter.textContent = post.likes;

        btn.style.transform = "scale(1.2)";
        setTimeout(() => btn.style.transform = "scale(1)", 150);

        // Async persistence to Supabase
        await mroshBackend.toggleLike(postId, isCurrentlyLiked);
      });
    });

    // Comment Drawer Toggle
    document.querySelectorAll(".comment-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const postId = btn.dataset.id;
        const drawer = document.getElementById(`commentsDrawer-${postId}`);
        if (drawer) {
          const isOpen = drawer.classList.contains("open");
          drawer.classList.toggle("open", !isOpen);
          if (!isOpen) {
            const input = document.getElementById(`inputComment-${postId}`);
            if (input) input.focus();
          }
        }
      });
    });

    // Submit Comment
    document.querySelectorAll(".submit-comment-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        submitComment(btn.dataset.id);
      });
    });

    document.querySelectorAll(".comment-input-field").forEach(input => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const postId = input.id.replace("inputComment-", "");
          submitComment(postId);
        }
      });
    });

    async function submitComment(postId) {
      const input = document.getElementById(`inputComment-${postId}`);
      if (!input || !input.value.trim()) return;

      const commentText = input.value.trim();
      input.value = "";

      // Post comment to backend
      const { data: newComment } = await mroshBackend.addComment(postId, commentText);

      if (newComment) {
        const commentsListBox = document.getElementById(`commentsList-${postId}`);
        if (commentsListBox) {
          const commentRow = document.createElement("div");
          commentRow.className = "comment-row";
          commentRow.innerHTML = `
            <img src="${newComment.avatar}" alt="${newComment.author}" class="comment-avatar" />
            <div class="comment-bubble">
              <div class="comment-author">${newComment.author} <span style="font-weight: 400; color: var(--text-muted); font-size: 0.75rem;">• ${newComment.time}</span></div>
              <div class="comment-text">${newComment.text}</div>
            </div>
          `;
          commentsListBox.appendChild(commentRow);
        }

        const post = localPostsCache.find(p => p.id === postId);
        const postCard = document.getElementById(`postCard-${postId}`);
        if (postCard && post) {
          const counter = postCard.querySelector(".comment-counter");
          if (counter) counter.textContent = (post.comments || []).length;
        }
      }
    }

    // Shares
    document.querySelectorAll(".share-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const postId = btn.dataset.id;
        const post = localPostsCache.find(p => p.id === postId);
        if (!post) return;

        post.shares += 1;
        const counter = btn.querySelector(".share-counter");
        if (counter) counter.textContent = post.shares;

        if (window.showToast) {
          window.showToast("Post link copied to clipboard & shared to your network!");
        }
      });
    });

    // Saves / Bookmarks
    document.querySelectorAll(".save-trigger-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const postId = btn.dataset.id;
        const post = localPostsCache.find(p => p.id === postId);
        if (!post) return;

        const isCurrentlySaved = post.isSaved;
        post.isSaved = !isCurrentlySaved;

        btn.classList.toggle("saved", post.isSaved);
        const svg = btn.querySelector("svg");
        if (svg) svg.setAttribute("fill", post.isSaved ? "currentColor" : "none");

        if (window.showToast) {
          window.showToast(post.isSaved ? "Post saved to your bookmarks." : "Post removed from bookmarks.");
        }

        await mroshBackend.toggleSave(postId, isCurrentlySaved);
      });
    });

    // Author Click -> Profile Modal
    document.querySelectorAll(".post-author-cluster").forEach(cluster => {
      cluster.addEventListener("click", () => {
        const authorName = cluster.dataset.author;
        const matchedCreator = MROSH_DATA.creators.find(c => c.name.toLowerCase().includes(authorName.toLowerCase().split(" ")[0]));
        if (matchedCreator && window.openProfileModal) {
          window.openProfileModal(matchedCreator.id);
        }
      });
    });
  }

  // 3. Post Composer (Publish New Post)
  if (composerSubmitBtn && composerTextarea) {
    composerSubmitBtn.addEventListener("click", () => {
      publishNewPost();
    });

    composerTextarea.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        publishNewPost();
      }
    });
  }

  async function publishNewPost() {
    if (!composerTextarea) return;
    const text = composerTextarea.value.trim();
    if (!text) {
      composerTextarea.focus();
      return;
    }

    composerSubmitBtn.disabled = true;
    composerSubmitBtn.textContent = "Publishing...";

    const { data: newPost, error } = await mroshBackend.createPost({ content: text });

    composerSubmitBtn.disabled = false;
    composerSubmitBtn.textContent = "Publish Post";

    if (!error && newPost) {
      composerTextarea.value = "";
      renderFeed();

      if (window.showToast) {
        window.showToast("Your post is live in the creator feed!");
      }
    }
  }

  // 4. Render Suggested Connections
  async function renderSuggestedConnections() {
    if (!suggestedConnectionsContainer) return;

    const { data: connections } = await mroshBackend.getSuggestedConnections();

    suggestedConnectionsContainer.innerHTML = (connections || []).map(conn => `
      <div class="suggestion-item">
        <div class="suggestion-info">
          <img src="${conn.avatar}" alt="${conn.name}" class="suggestion-avatar" />
          <div>
            <div class="suggestion-name">${conn.name}</div>
            <div class="suggestion-role">${conn.role}</div>
          </div>
        </div>
        <button class="btn-connect ${conn.connected ? 'connected' : ''}" data-id="${conn.id}">
          ${conn.connected ? 'Connected' : 'Connect'}
        </button>
      </div>
    `).join("");

    suggestedConnectionsContainer.querySelectorAll(".btn-connect").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const conn = connections.find(c => c.id === id);
        if (!conn) return;

        const isConnected = conn.connected;
        conn.connected = !isConnected;
        btn.textContent = conn.connected ? "Connected" : "Connect";
        btn.classList.toggle("connected", conn.connected);

        if (window.showToast) {
          window.showToast(conn.connected ? `Connection request sent to ${conn.name}` : `Disconnected from ${conn.name}`);
        }

        await mroshBackend.toggleConnection(id, isConnected);
      });
    });
  }

  // 5. Render Upcoming Events
  async function renderUpcomingEvents() {
    if (!upcomingEventsContainer) return;

    const { data: events } = await mroshBackend.getEvents();

    upcomingEventsContainer.innerHTML = (events || []).map(ev => `
      <div class="event-item">
        <div class="event-date-box">
          <span class="event-day">${ev.day}</span>
          <span class="event-month">${ev.month}</span>
        </div>
        <div class="event-details">
          <div class="event-title">${ev.title}</div>
          <div class="event-meta">${ev.meta}</div>
        </div>
      </div>
    `).join("");
  }

  // 6. Render Sidebar Featured Creators
  function renderSidebarCreators() {
    if (!sidebarCreatorsContainer) return;

    const miniList = [
      { id: "cr-sarah", name: "Sarah Chen", role: "Film Director", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" },
      { id: "cr-marcus", name: "Marcus Rodriguez", role: "Music Producer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" },
      { id: "cr-emma", name: "Emma Thompson", role: "Digital Artist", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80" },
      { id: "cr-david", name: "David Park", role: "Game Designer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80" },
      { id: "cr-01", name: "Kavya Murthy", role: "UI/UX & 3D Artist", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" },
      { id: "shg-01", name: "Channapatna Collective", role: "Artisan SHG", avatar: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=80&auto=format&fit=crop&q=80" }
    ];

    sidebarCreatorsContainer.innerHTML = miniList.map(item => `
      <div class="creator-mini-item" data-id="${item.id}" title="View ${item.name}">
        <img src="${item.avatar}" alt="${item.name}" class="creator-mini-avatar" />
        <div class="creator-mini-info">
          <div class="creator-mini-name">${item.name}</div>
          <div class="creator-mini-role">${item.role}</div>
        </div>
      </div>
    `).join("");

    sidebarCreatorsContainer.querySelectorAll(".creator-mini-item").forEach(item => {
      item.addEventListener("click", () => {
        const id = item.dataset.id;
        const matched = MROSH_DATA.creators.find(c => c.id === id || c.name.toLowerCase().includes(item.querySelector(".creator-mini-name").textContent.toLowerCase().split(" ")[0]));
        if (matched && window.openProfileModal) {
          window.openProfileModal(matched.id);
        }
      });
    });
  }

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", () => {
    renderFeed();
    renderSuggestedConnections();
    renderUpcomingEvents();
    renderSidebarCreators();
  });
})();

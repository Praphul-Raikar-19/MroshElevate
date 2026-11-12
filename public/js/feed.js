/**
 * MROSHELEVATE Feed Application Controller
 * Handles Creator Post Creation, Likes, Comments, Shares, Saves, and Connections
 */

(function () {
  // Elements
  const feedStreamContainer = document.getElementById("creatorFeedStream");
  const composerForm = document.getElementById("postComposerForm");
  const composerTextarea = document.getElementById("composerInput");
  const composerSubmitBtn = document.getElementById("publishPostBtn");
  const suggestedConnectionsContainer = document.getElementById("suggestedConnectionsList");
  const upcomingEventsContainer = document.getElementById("upcomingEventsList");
  const sidebarCreatorsContainer = document.getElementById("sidebarCreatorsList");

  // 1. Render Feed Stream
  function renderFeed() {
    if (!feedStreamContainer) return;

    feedStreamContainer.innerHTML = FEED_DATA.posts.map(post => {
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
              <input type="text" class="comment-input-field" id="inputComment-${post.id}" placeholder="Write a comment as ${FEED_DATA.currentUser.name}..." />
              <button class="btn btn-primary btn-sm submit-comment-btn" data-id="${post.id}">Post</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    attachFeedEventListeners();
  }

  // 2. Attach Event Handlers for Likes, Comments, Shares, Saves
  function attachFeedEventListeners() {
    // Likes
    document.querySelectorAll(".like-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const postId = btn.dataset.id;
        const post = FEED_DATA.posts.find(p => p.id === postId);
        if (!post) return;

        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;

        btn.classList.toggle("liked", post.isLiked);
        const svg = btn.querySelector("svg");
        if (svg) svg.setAttribute("fill", post.isLiked ? "#FF5A79" : "none");
        const counter = btn.querySelector(".like-counter");
        if (counter) counter.textContent = post.likes;

        // Visual bounce animation
        btn.style.transform = "scale(1.2)";
        setTimeout(() => btn.style.transform = "scale(1)", 150);
      });
    });

    // Comment drawer toggle
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

    // Submit comment
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

    function submitComment(postId) {
      const input = document.getElementById(`inputComment-${postId}`);
      if (!input || !input.value.trim()) return;

      const post = FEED_DATA.posts.find(p => p.id === postId);
      if (!post) return;

      const newComment = {
        id: `c-${Date.now()}`,
        author: FEED_DATA.currentUser.name,
        avatar: FEED_DATA.currentUser.avatar,
        text: input.value.trim(),
        time: "Just now"
      };

      if (!post.comments) post.comments = [];
      post.comments.push(newComment);

      input.value = "";

      // Re-render comments container
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

      // Update counter
      const postCard = document.getElementById(`postCard-${postId}`);
      if (postCard) {
        const counter = postCard.querySelector(".comment-counter");
        if (counter) counter.textContent = post.comments.length;
      }
    }

    // Shares
    document.querySelectorAll(".share-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const postId = btn.dataset.id;
        const post = FEED_DATA.posts.find(p => p.id === postId);
        if (!post) return;

        post.shares += 1;
        const counter = btn.querySelector(".share-counter");
        if (counter) counter.textContent = post.shares;

        if (window.showToast) {
          window.showToast("Post link copied to clipboard & shared to your network!");
        } else {
          alert("Post shared successfully!");
        }
      });
    });

    // Saves / Bookmarks
    document.querySelectorAll(".save-trigger-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const postId = btn.dataset.id;
        const post = FEED_DATA.posts.find(p => p.id === postId);
        if (!post) return;

        post.isSaved = !post.isSaved;
        btn.classList.toggle("saved", post.isSaved);
        const svg = btn.querySelector("svg");
        if (svg) svg.setAttribute("fill", post.isSaved ? "currentColor" : "none");

        if (window.showToast) {
          window.showToast(post.isSaved ? "Post saved to your bookmarks." : "Post removed from bookmarks.");
        }
      });
    });

    // More options menu trigger
    document.querySelectorAll(".post-more-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (window.showToast) {
          window.showToast("Post options: Share, Report, Copy Link");
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

  function publishNewPost() {
    if (!composerTextarea) return;
    const text = composerTextarea.value.trim();
    if (!text) {
      composerTextarea.focus();
      return;
    }

    const newPost = {
      id: `post-${Date.now()}`,
      author: {
        id: "cr-self",
        name: FEED_DATA.currentUser.name,
        role: FEED_DATA.currentUser.role,
        avatar: FEED_DATA.currentUser.avatar
      },
      timeAgo: "Just now",
      content: text,
      media: null,
      likes: 0,
      isLiked: false,
      shares: 0,
      isSaved: false,
      comments: []
    };

    FEED_DATA.posts.unshift(newPost);
    composerTextarea.value = "";
    renderFeed();

    if (window.showToast) {
      window.showToast("Your post is live in the creator feed!");
    }
  }

  // 4. Render Suggested Connections (Right Sidebar)
  function renderSuggestedConnections() {
    if (!suggestedConnectionsContainer) return;

    suggestedConnectionsContainer.innerHTML = FEED_DATA.suggestedConnections.map(conn => `
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
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const conn = FEED_DATA.suggestedConnections.find(c => c.id === id);
        if (!conn) return;

        conn.connected = !conn.connected;
        btn.textContent = conn.connected ? "Connected" : "Connect";
        btn.classList.toggle("connected", conn.connected);

        if (window.showToast) {
          window.showToast(conn.connected ? `Connection request sent to ${conn.name}` : `Disconnected from ${conn.name}`);
        }
      });
    });
  }

  // 5. Render Upcoming Events (Right Sidebar)
  function renderUpcomingEvents() {
    if (!upcomingEventsContainer) return;

    upcomingEventsContainer.innerHTML = FEED_DATA.upcomingEvents.map(ev => `
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

  // 6. Render Sidebar Featured Creators (Left Sidebar)
  function renderSidebarCreators() {
    if (!sidebarCreatorsContainer) return;

    const miniList = [
      { name: "Sarah Chen", role: "Film Director", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" },
      { name: "Marcus Rodriguez", role: "Music Producer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" },
      { name: "Emma Thompson", role: "Digital Artist", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80" },
      { name: "David Park", role: "Game Designer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80" },
      { name: "Kavya Murthy", role: "UI/UX & 3D Artist", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" },
      { name: "Channapatna Collective", role: "Artisan SHG", avatar: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=80&auto=format&fit=crop&q=80" }
    ];

    sidebarCreatorsContainer.innerHTML = miniList.map(item => `
      <div class="creator-mini-item" title="View ${item.name}">
        <img src="${item.avatar}" alt="${item.name}" class="creator-mini-avatar" />
        <div class="creator-mini-info">
          <div class="creator-mini-name">${item.name}</div>
          <div class="creator-mini-role">${item.role}</div>
        </div>
      </div>
    `).join("");
  }

  // Initialize Feed Components
  document.addEventListener("DOMContentLoaded", () => {
    renderFeed();
    renderSuggestedConnections();
    renderUpcomingEvents();
    renderSidebarCreators();
  });
})();


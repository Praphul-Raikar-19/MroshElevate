/**
 * MROSHELEVATE Supabase Data & Service Layer
 * Provides unified, async interface for Auth, Posts, Interactions, Connections, and Storage.
 * Features automatic dual-mode: Real Supabase API when configured, seamless seed fallback when offline.
 */

const mroshBackend = (function () {
  let currentUser = null;

  // Initialize auth listener if Supabase client exists
  function initAuth() {
    const supabase = MROSH_SUPABASE.getClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          syncUserProfile(session.user);
        }
      });

      supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          syncUserProfile(session.user);
        } else {
          currentUser = null;
          updateUIAfterAuthChange();
        }
      });
    } else {
      // Default offline persona from FEED_DATA
      currentUser = {
        id: "offline-user-01",
        email: "alex.rivera@mroshelevate.io",
        full_name: FEED_DATA.currentUser.name,
        role: "creator",
        avatar_url: FEED_DATA.currentUser.avatar,
        district: "Bangalore Urban"
      };
    }
  }

  async function syncUserProfile(authUser) {
    const supabase = MROSH_SUPABASE.getClient();
    if (!supabase) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profile) {
        currentUser = profile;
      } else {
        currentUser = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email.split("@")[0],
          role: authUser.user_metadata?.role || "creator",
          avatar_url: authUser.user_metadata?.avatar_url || FEED_DATA.currentUser.avatar,
          district: authUser.user_metadata?.district || "Bangalore Urban"
        };
      }
      updateUIAfterAuthChange();
    } catch (err) {
      console.warn("Could not sync profile from table, using auth metadata:", err);
      currentUser = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email.split("@")[0],
        role: authUser.user_metadata?.role || "creator",
        avatar_url: authUser.user_metadata?.avatar_url || FEED_DATA.currentUser.avatar,
        district: authUser.user_metadata?.district || "Bangalore Urban"
      };
      updateUIAfterAuthChange();
    }
  }

  function updateUIAfterAuthChange() {
    const userAvatarEls = document.querySelectorAll("#currentUserProfileTrigger img, .composer-avatar");
    userAvatarEls.forEach(img => {
      if (img && currentUser) {
        img.src = currentUser.avatar_url;
      }
    });

    const composerTextarea = document.getElementById("composerInput");
    if (composerTextarea && currentUser) {
      composerTextarea.placeholder = `What are you creating today, ${currentUser.full_name}? Share a project or collaboration call...`;
    }
  }

  // =========================================================================
  // 1. AUTHENTICATION SERVICES
  // =========================================================================

  async function signUp({ email, password, fullName, role, district }) {
    const supabase = MROSH_SUPABASE.getClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role || "creator",
            district: district || "Bangalore Urban",
            avatar_url: FEED_DATA.currentUser.avatar
          }
        }
      });
      return { data, error, isLive: true };
    }

    // Offline Mock Sign Up
    currentUser = {
      id: `user-${Date.now()}`,
      email,
      full_name: fullName,
      role: role || "creator",
      district: district || "Bangalore Urban",
      avatar_url: FEED_DATA.currentUser.avatar
    };
    updateUIAfterAuthChange();
    return { data: { user: currentUser }, error: null, isLive: false };
  }

  async function signIn({ email, password }) {
    const supabase = MROSH_SUPABASE.getClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error, isLive: true };
    }

    // Offline Mock Sign In
    currentUser = {
      id: `user-${Date.now()}`,
      email,
      full_name: email.split("@")[0],
      role: "creator",
      district: "Bangalore Urban",
      avatar_url: FEED_DATA.currentUser.avatar
    };
    updateUIAfterAuthChange();
    return { data: { user: currentUser }, error: null, isLive: false };
  }

  async function signOut() {
    const supabase = MROSH_SUPABASE.getClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    currentUser = null;
    updateUIAfterAuthChange();
    return { success: true };
  }

  function getCurrentUser() {
    return currentUser;
  }

  // =========================================================================
  // 2. CREATOR FEED SERVICES
  // =========================================================================

  async function getPosts() {
    const supabase = MROSH_SUPABASE.getClient();
    if (supabase) {
      try {
        const { data: dbPosts, error } = await supabase
          .from("posts")
          .select(`
            *,
            author:author_id (
              id,
              full_name,
              role,
              avatar_url,
              district
            ),
            post_comments (
              id,
              text,
              created_at,
              author:author_id (
                full_name,
                avatar_url
              )
            )
          `)
          .order("created_at", { ascending: false });

        if (!error && dbPosts && dbPosts.length > 0) {
          // Normalize to UI feed format
          const formatted = dbPosts.map(p => ({
            id: p.id,
            author: {
              id: p.author?.id || p.author_id,
              name: p.author?.full_name || "Creator",
              role: p.author?.role || "Artist",
              avatar: p.author?.avatar_url || FEED_DATA.currentUser.avatar
            },
            timeAgo: formatTimeAgo(p.created_at),
            content: p.content,
            media: p.media_url ? { type: p.media_type || "image", url: p.media_url } : null,
            likes: p.likes_count || 0,
            isLiked: false,
            shares: p.shares_count || 0,
            isSaved: false,
            comments: (p.post_comments || []).map(c => ({
              id: c.id,
              author: c.author?.full_name || "Creator",
              avatar: c.author?.avatar_url || FEED_DATA.currentUser.avatar,
              text: c.text,
              time: formatTimeAgo(c.created_at)
            }))
          }));
          return { data: formatted, error: null, isLive: true };
        }
      } catch (err) {
        console.warn("Error fetching Supabase posts, using fallback:", err);
      }
    }

    // Fallback: return in-memory feed
    return { data: FEED_DATA.posts, error: null, isLive: false };
  }

  async function createPost({ content, mediaUrl, mediaType, tags }) {
    const supabase = MROSH_SUPABASE.getClient();
    const user = getCurrentUser();

    if (supabase && user && user.id && !user.id.startsWith("offline-")) {
      try {
        const { data, error } = await supabase
          .from("posts")
          .insert({
            author_id: user.id,
            content,
            media_url: mediaUrl || null,
            media_type: mediaType || (mediaUrl ? "image" : null),
            tags: tags || []
          })
          .select()
          .single();

        if (!error && data) {
          const formatted = {
            id: data.id,
            author: {
              id: user.id,
              name: user.full_name,
              role: user.role,
              avatar: user.avatar_url
            },
            timeAgo: "Just now",
            content: data.content,
            media: data.media_url ? { type: data.media_type, url: data.media_url } : null,
            likes: 0,
            isLiked: false,
            shares: 0,
            isSaved: false,
            comments: []
          };
          FEED_DATA.posts.unshift(formatted);
          return { data: formatted, error: null, isLive: true };
        }
      } catch (err) {
        console.warn("Supabase createPost error, using fallback:", err);
      }
    }

    // Fallback
    const fallbackPost = {
      id: `post-${Date.now()}`,
      author: {
        id: user ? user.id : "offline-user",
        name: user ? user.full_name : FEED_DATA.currentUser.name,
        role: user ? user.role : FEED_DATA.currentUser.role,
        avatar: user ? user.avatar_url : FEED_DATA.currentUser.avatar
      },
      timeAgo: "Just now",
      content,
      media: mediaUrl ? { type: mediaType || "image", url: mediaUrl } : null,
      likes: 0,
      isLiked: false,
      shares: 0,
      isSaved: false,
      comments: []
    };
    FEED_DATA.posts.unshift(fallbackPost);
    return { data: fallbackPost, error: null, isLive: false };
  }

  async function toggleLike(postId, isCurrentlyLiked) {
    const supabase = MROSH_SUPABASE.getClient();
    const user = getCurrentUser();

    if (supabase && user && user.id && !user.id.startsWith("offline-")) {
      try {
        if (isCurrentlyLiked) {
          await supabase
            .from("post_likes")
            .delete()
            .match({ post_id: postId, user_id: user.id });
        } else {
          await supabase
            .from("post_likes")
            .insert({ post_id: postId, user_id: user.id });
        }
        return { isLiked: !isCurrentlyLiked, isLive: true };
      } catch (err) {
        console.warn("Supabase toggleLike error:", err);
      }
    }

    // Fallback
    const post = FEED_DATA.posts.find(p => p.id === postId);
    if (post) {
      post.isLiked = !isCurrentlyLiked;
      post.likes += post.isLiked ? 1 : -1;
    }
    return { isLiked: !isCurrentlyLiked, isLive: false };
  }

  async function addComment(postId, text) {
    const supabase = MROSH_SUPABASE.getClient();
    const user = getCurrentUser();

    if (supabase && user && user.id && !user.id.startsWith("offline-")) {
      try {
        const { data, error } = await supabase
          .from("post_comments")
          .insert({
            post_id: postId,
            author_id: user.id,
            text
          })
          .select()
          .single();

        if (!error && data) {
          const newComment = {
            id: data.id,
            author: user.full_name,
            avatar: user.avatar_url,
            text: data.text,
            time: "Just now"
          };
          return { data: newComment, error: null, isLive: true };
        }
      } catch (err) {
        console.warn("Supabase addComment error:", err);
      }
    }

    // Fallback
    const newComment = {
      id: `c-${Date.now()}`,
      author: user ? user.full_name : FEED_DATA.currentUser.name,
      avatar: user ? user.avatar_url : FEED_DATA.currentUser.avatar,
      text,
      time: "Just now"
    };
    const post = FEED_DATA.posts.find(p => p.id === postId);
    if (post) {
      if (!post.comments) post.comments = [];
      post.comments.push(newComment);
    }
    return { data: newComment, error: null, isLive: false };
  }

  async function toggleSave(postId, isCurrentlySaved) {
    const supabase = MROSH_SUPABASE.getClient();
    const user = getCurrentUser();

    if (supabase && user && user.id && !user.id.startsWith("offline-")) {
      try {
        if (isCurrentlySaved) {
          await supabase
            .from("saved_posts")
            .delete()
            .match({ post_id: postId, user_id: user.id });
        } else {
          await supabase
            .from("saved_posts")
            .insert({ post_id: postId, user_id: user.id });
        }
        return { isSaved: !isCurrentlySaved, isLive: true };
      } catch (err) {
        console.warn("Supabase toggleSave error:", err);
      }
    }

    const post = FEED_DATA.posts.find(p => p.id === postId);
    if (post) post.isSaved = !isCurrentlySaved;
    return { isSaved: !isCurrentlySaved, isLive: false };
  }

  // =========================================================================
  // 3. CONNECTIONS & EVENTS
  // =========================================================================

  async function getSuggestedConnections() {
    const supabase = MROSH_SUPABASE.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, role, avatar_url")
          .limit(5);

        if (!error && data && data.length > 0) {
          const formatted = data.map(u => ({
            id: u.id,
            name: u.full_name,
            role: u.role,
            avatar: u.avatar_url,
            connected: false
          }));
          return { data: formatted, isLive: true };
        }
      } catch (err) {
        console.warn("Supabase getSuggestedConnections error:", err);
      }
    }
    return { data: FEED_DATA.suggestedConnections, isLive: false };
  }

  async function toggleConnection(targetUserId, isCurrentlyConnected) {
    const supabase = MROSH_SUPABASE.getClient();
    const user = getCurrentUser();

    if (supabase && user && user.id && !user.id.startsWith("offline-")) {
      try {
        if (isCurrentlyConnected) {
          await supabase
            .from("connections")
            .delete()
            .match({ sender_id: user.id, receiver_id: targetUserId });
        } else {
          await supabase
            .from("connections")
            .insert({ sender_id: user.id, receiver_id: targetUserId, status: "accepted" });
        }
        return { connected: !isCurrentlyConnected, isLive: true };
      } catch (err) {
        console.warn("Supabase toggleConnection error:", err);
      }
    }

    const conn = FEED_DATA.suggestedConnections.find(c => c.id === targetUserId);
    if (conn) conn.connected = !isCurrentlyConnected;
    return { connected: !isCurrentlyConnected, isLive: false };
  }

  async function getEvents() {
    const supabase = MROSH_SUPABASE.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("events").select("*");
        if (!error && data && data.length > 0) {
          return { data, isLive: true };
        }
      } catch (err) {
        console.warn("Supabase getEvents error:", err);
      }
    }
    return { data: FEED_DATA.upcomingEvents, isLive: false };
  }

  // =========================================================================
  // 4. TALENT DIRECTORY & OPPORTUNITIES
  // =========================================================================

  async function getCreators(category = "all", searchQuery = "") {
    const supabase = MROSH_SUPABASE.getClient();
    if (supabase) {
      try {
        let query = supabase.from("profiles").select("*");
        if (category && category !== "all") {
          query = query.eq("role", category);
        }
        if (searchQuery) {
          query = query.ilike("full_name", `%${searchQuery}%`);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return { data, isLive: true };
        }
      } catch (err) {
        console.warn("Supabase getCreators error:", err);
      }
    }
    // Fallback filter
    return { data: MROSH_DATA.creators, isLive: false };
  }

  async function applyToOpportunity({ opportunityId, pitchText, proposedRate, deliveryTime }) {
    const supabase = MROSH_SUPABASE.getClient();
    const user = getCurrentUser();

    if (supabase && user && user.id && !user.id.startsWith("offline-")) {
      try {
        const { data, error } = await supabase
          .from("applications")
          .insert({
            opportunity_id: opportunityId,
            applicant_id: user.id,
            pitch_text: pitchText,
            proposed_rate: proposedRate,
            estimated_delivery: deliveryTime,
            status: "pending"
          })
          .select()
          .single();
        return { data, error, isLive: true };
      } catch (err) {
        console.warn("Supabase applyToOpportunity error:", err);
      }
    }
    return { data: { success: true }, error: null, isLive: false };
  }

  // =========================================================================
  // 5. STORAGE UPLOADS
  // =========================================================================

  async function uploadPostMedia(file) {
    const supabase = MROSH_SUPABASE.getClient();
    const user = getCurrentUser();

    if (supabase && user && user.id && !user.id.startsWith("offline-")) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data, error } = await supabase.storage
          .from("post-media")
          .upload(filePath, file);

        if (!error) {
          const { data: publicUrlData } = supabase.storage
            .from("post-media")
            .getPublicUrl(filePath);
          return { url: publicUrlData.publicUrl, error: null };
        }
      } catch (err) {
        console.warn("Supabase uploadPostMedia error:", err);
      }
    }
    return { url: null, error: "Supabase storage not connected" };
  }

  // Utility: Time-ago formatting
  function formatTimeAgo(isoString) {
    if (!isoString) return "Recently";
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  // Self-init on load
  initAuth();

  return {
    initAuth,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getPosts,
    createPost,
    toggleLike,
    addComment,
    toggleSave,
    getSuggestedConnections,
    toggleConnection,
    getEvents,
    getCreators,
    applyToOpportunity,
    uploadPostMedia
  };
})();

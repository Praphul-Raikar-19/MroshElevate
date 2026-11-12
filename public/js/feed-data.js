/**
 * MROSHELEVATE Creator Feed Data & State
 * Matching the exact blueprint in the reference screenshot
 */

const FEED_DATA = {
  currentUser: {
    name: "Alex Rivera",
    role: "Visual Designer & Creator",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
  },

  posts: [
    {
      id: "post-01",
      author: {
        id: "cr-sarah",
        name: "Sarah Chen",
        role: "Film Director",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
      },
      timeAgo: "3 hours ago",
      content: "Golden hour camera test for the upcoming coastal documentary film. Found this timeless classic while scouting locations along the coastal highway.",
      media: {
        type: "image",
        url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=900&auto=format&fit=crop&q=80" // Orange vintage Beetle car
      },
      likes: 247,
      isLiked: false,
      shares: 18,
      isSaved: false,
      comments: [
        {
          id: "c-01",
          author: "Marcus Rodriguez",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
          text: "The grade on this is stunning Sarah! Can't wait to compose the score for this scene.",
          time: "2h ago"
        },
        {
          id: "c-02",
          author: "Emma Thompson",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80",
          text: "Incredible cinematic warm tones!",
          time: "1h ago"
        }
      ]
    },
    {
      id: "post-02",
      author: {
        id: "cr-marcus",
        name: "Marcus Rodriguez",
        role: "Music Producer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
      },
      timeAgo: "5 hours ago",
      content: "Exciting news! Just signed with an amazing new artist for our upcoming album. The sound is fresh, innovative, and exactly what the industry needs right now. Looking forward to collaborating with some of the best musicians in the business.",
      media: null,
      likes: 189,
      isLiked: false,
      shares: 12,
      isSaved: false,
      comments: [
        {
          id: "c-03",
          author: "David Park",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80",
          text: "Huge congrats Marcus! Let's get them in the studio for game soundtrack syncs.",
          time: "3h ago"
        }
      ]
    },
    {
      id: "post-03",
      author: {
        id: "shg-channapatna",
        name: "Channapatna Lacquer Collective",
        role: "Artisan SHG • Ramanagara",
        avatar: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&auto=format&fit=crop&q=80"
      },
      timeAgo: "1 day ago",
      content: "Batch 1 of the vegetable-dyed wooden lids for the heritage coffee export packaging is officially complete! 24 women artisans collaborated directly with Bangalore packaging designers through MROSHELEVATE. Zero middlemen, fair price.",
      media: {
        type: "image",
        url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&auto=format&fit=crop&q=80"
      },
      likes: 312,
      isLiked: true,
      shares: 29,
      isSaved: true,
      comments: [
        {
          id: "c-04",
          author: "Kavya Murthy",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
          text: "The finish on the natural turmeric and indigo dye turned out phenomenal!",
          time: "18h ago"
        }
      ]
    }
  ],

  suggestedConnections: [
    {
      id: "conn-01",
      name: "Emma Thompson",
      role: "UX Designer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
      connected: false
    },
    {
      id: "conn-02",
      name: "David Park",
      role: "Game Developer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      connected: false
    },
    {
      id: "conn-03",
      name: "Deepak Gowda",
      role: "Folk-Fusion Producer",
      avatar: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=100&auto=format&fit=crop&q=80",
      connected: false
    }
  ],

  upcomingEvents: [
    {
      id: "ev-01",
      day: "25",
      month: "AUG",
      title: "Creative Mixer",
      meta: "7:00 PM • Virtual Community Room"
    },
    {
      id: "ev-02",
      day: "02",
      month: "SEP",
      title: "Film Workshop",
      meta: "2:00 PM • Studio B, Acoustic Bay"
    },
    {
      id: "ev-03",
      day: "15",
      month: "SEP",
      title: "Channapatna Craft & UI",
      meta: "10:00 AM • Bangalore Design Hub"
    }
  ]
};

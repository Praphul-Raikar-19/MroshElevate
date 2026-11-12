/**
 * MROSHELEVATE Mock Ecosystem Seed Data
 * Tailored for the Karnataka Pilot: 100 Creators, 50 SHGs, 10 Studios
 */

const MROSH_DATA = {
  creators: [
    {
      id: "cr-01",
      name: "Kavya Murthy",
      role: "Lead UI/UX & 3D Artist",
      category: "digital",
      district: "Bangalore Urban",
      state: "Karnataka",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: 4.95,
      reviewsCount: 38,
      hourlyRate: "₹2,200/hr",
      availability: "available",
      badge: "verified_creator",
      pastClients: ["CRED", "Swiggy", "Ather"],
      bio: "Product designer specializing in dark-mode UI systems, micro-interactions, and 3D spatial models. Passionate about empowering regional digital art.",
      skills: ["Design Systems", "Figma", "Blender 3D", "React UI", "Interactive Prototyping"],
      stats: { followers: "24.5K", views: "1.2M", projects: 42 },
      portfolio: [
        { title: "Neo-Fintech Dashboard", type: "image", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80" },
        { title: "Spatial 3D Asset Pack", type: "image", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80" }
      ]
    },
    {
      id: "shg-01",
      name: "Channapatna Lacquer Collective",
      role: "Artisan Self-Help Group (24 Makers)",
      category: "shg",
      district: "Ramanagara / Channapatna",
      state: "Karnataka",
      avatar: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80",
      rating: 4.98,
      reviewsCount: 64,
      hourlyRate: "₹35,000 / Batch",
      availability: "open_to_offers",
      badge: "verified_shg",
      pastClients: ["FabIndia", "Bengaluru Design Week", "Karnataka Tourism"],
      bio: "Heritage woodcraft cooperative producing non-toxic vegetable-dyed lacquerware, contemporary minimalist toys, and luxury home decor accessories.",
      skills: ["Ivory Wood Turning", "Natural Lac Dyeing", "Eco Packaging", "Product Batching"],
      stats: { artisans: "24 Women Makers", heritageYears: "200+", exports: 18 },
      portfolio: [
        { title: "Geometric Wooden Desk Accessories", type: "image", url: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800&auto=format&fit=crop&q=80" },
        { title: "Heritage Modern Lacquerware Set", type: "image", url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80" }
      ]
    },
    {
      id: "cr-02",
      name: "Rohan D'Souza",
      role: "Cinematographer & Colorist",
      category: "cinema",
      district: "Mangalore / Dakshina Kannada",
      state: "Karnataka",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 4.92,
      reviewsCount: 29,
      hourlyRate: "₹18,000/day",
      availability: "available",
      badge: "verified_creator",
      pastClients: ["Netflix India Indie", "MTV Beats", "WildKarnataka Film"],
      bio: "Coastal storyteller capturing coastal folklore, high-contrast anamorphic cinema, and commercial brand narratives with RED & Arri color pipelines.",
      skills: ["DaVinci Resolve", "Anamorphic Cinematography", "Underwater Filming", "Gimbal Operation"],
      stats: { films: 16, awards: 4, views: "850K" },
      portfolio: [
        { title: "Kambala: The Mud & Thunder", type: "image", url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80" }
      ]
    },
    {
      id: "shg-02",
      name: "Ilkal Heritage Weavers Guild",
      role: "Handloom Weaving SHG (38 Weavers)",
      category: "shg",
      district: "Bagalkot / Ilkal",
      state: "Karnataka",
      avatar: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=80",
      rating: 5.0,
      reviewsCount: 52,
      hourlyRate: "₹45,000 / Collection",
      availability: "available",
      badge: "verified_shg",
      pastClients: ["Nicobar", "Raw Mango Studio", "National Handloom Board"],
      bio: "Master weavers specialized in the legendary 'Tope Teni' silk pallu technique. Collaborating directly with fashion labels and conscious apparel brands.",
      skills: ["Patteda Anchu Weave", "Pure Silk & Cotton", "Natural Indigo Vats", "Custom Yardage"],
      stats: { artisans: "38 Master Weavers", loomCount: 28, awards: 6 },
      portfolio: [
        { title: "Contemporary Silk Weaves for Fashion Runway", type: "image", url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80" }
      ]
    },
    {
      id: "st-01",
      name: "Acoustic Bay Studios",
      role: "Audio Engineering & Dolby Atmos Suite",
      category: "studio",
      district: "Indiranagar, Bangalore",
      state: "Karnataka",
      avatar: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=150&auto=format&fit=crop&q=80",
      rating: 4.88,
      reviewsCount: 44,
      hourlyRate: "₹3,500/hr",
      availability: "available",
      badge: "verified_studio",
      pastClients: ["Spotify India", "Kannada Indie Wave", "Sony Music"],
      bio: "State-of-the-art 7.1.4 Dolby Atmos mixing stage, live tracking live room, and dedicated Foley sound booth. Subsidized rates for verified MROSHELEVATE creators.",
      skills: ["Dolby Atmos 7.1.4", "Foley Recording", "Vocal Mastering", "Live Ensemble Tracking"],
      stats: { tracksMixed: "450+", albums: 34, platinumRecords: 3 },
      portfolio: [
        { title: "Atmos Studio Suite Tour", type: "image", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80" }
      ]
    },
    {
      id: "cr-03",
      name: "Deepak Gowda & Folk Ensemble",
      role: "Music Producer & Folk-Fusion Composer",
      category: "music",
      district: "Mysore",
      state: "Karnataka",
      avatar: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&auto=format&fit=crop&q=80",
      rating: 4.91,
      reviewsCount: 21,
      hourlyRate: "₹1,800/hr",
      availability: "available",
      badge: "verified_creator",
      pastClients: ["Karnataka Janapada Academy", "Indie Roots Tour"],
      bio: "Blending traditional folk instruments (Dollu, Goravara Vadya) with modern ambient synths and cinematic orchestral arrangements.",
      skills: ["Folk Arrangement", "Ableton Live", "Percussion Production", "Film Scoring"],
      stats: { streams: "3.4M", tracks: 28, concerts: 45 },
      portfolio: [
        { title: "Janapada Electro Symphony", type: "image", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80" }
      ]
    }
  ],

  opportunities: [
    {
      id: "opp-01",
      title: "Sustainable Packaging Design for Heritage Filter Coffee",
      brand: "Malnad Reserve Coffee Co.",
      category: "Design & Packaging",
      budget: "₹85,000",
      location: "Mysore / Remote",
      deadline: "10 Days Left",
      type: "Brand Deal",
      skillsNeeded: ["Packaging Design", "Channapatna Wood Accent", "Eco Print"],
      description: "Looking for an artisan-designer collaboration to develop a premium wooden tin lid and sustainable paper packaging for our single-estate Arabica export line."
    },
    {
      id: "opp-02",
      title: "3D Character Rigging & Stylized Environments for Indie Game",
      brand: "PixelCrafters Interactive",
      category: "Gaming & 3D",
      budget: "₹1,40,000",
      location: "Bangalore / Remote",
      deadline: "14 Days Left",
      type: "Contract",
      skillsNeeded: ["Blender 3D", "Rigging", "Unreal Engine 5", "Stylized Textures"],
      description: "Seeking a 3D artist to create 4 hero character rigs and mythological temple environment props for an upcoming PC adventure game based on Western Ghats legends."
    },
    {
      id: "opp-03",
      title: "Vernacular Web-Series Foley & Audio Post-Production",
      brand: "Kaveri Motion Pictures",
      category: "Sound & Cinema",
      budget: "₹65,000",
      location: "Bangalore Studios",
      deadline: "5 Days Left",
      type: "Studio Gig",
      skillsNeeded: ["Foley", "Dolby 5.1", "Sound Design", "Audio Restoration"],
      description: "Audio engineer or studio partnership needed to deliver dialogue cleanup, Foley sound effects, and final stereo/surround mix for a 6-episode coastal thriller."
    }
  ],

  milestonesTracker: [
    {
      project: "Channapatna Modern Deskware Series",
      lead: "Channapatna SHG x Studio Minimal",
      budget: "₹1,20,000",
      progress: 75,
      currentMilestone: "Batch Prototype Verification",
      status: "On Track",
      risk: "Low Risk"
    },
    {
      project: "Janapada Electronic Folk Album",
      lead: "Deepak Gowda x Acoustic Bay Studios",
      budget: "₹80,000",
      progress: 90,
      currentMilestone: "Dolby Atmos Final Master Sign-off",
      status: "Review Pending",
      risk: "Low Risk"
    },
    {
      project: "Malnad Organic Dye Apparel Capsule",
      lead: "Ilkal Guild x Namma Brand Lab",
      budget: "₹2,50,000",
      progress: 40,
      currentMilestone: "Sample Yardage Dye Testing",
      status: "In Progress",
      risk: "Low Risk"
    }
  ]
};


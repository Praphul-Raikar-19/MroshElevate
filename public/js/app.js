/**
 * MROSHELEVATE Interactive Client Application Engine
 * Handles State, Real-time Filters, Modals, Onboarding Wizard, and Role Switcher
 */

document.addEventListener("DOMContentLoaded", () => {
  // Global State
  const state = {
    selectedCategory: "all",
    searchQuery: "",
    currentPersona: "creator", // 'creator', 'brand', 'studio', 'shg', 'investor'
    onboardingStep: 1,
    selectedRoleForSignup: "creator"
  };

  // DOM Elements
  const creatorsContainer = document.getElementById("creatorsGrid");
  const filterPills = document.querySelectorAll(".filter-pill");
  const searchInput = document.getElementById("talentSearchInput");
  const opportunitiesContainer = document.getElementById("opportunitiesGrid");
  const milestonesContainer = document.getElementById("milestonesGrid");
  const personaSelector = document.getElementById("personaSelect");

  // Modals
  const profileModal = document.getElementById("profileModal");
  const opportunityModal = document.getElementById("opportunityModal");
  const onboardingModal = document.getElementById("onboardingModal");
  const closeModalBtns = document.querySelectorAll(".modal-close-trigger");

  // 1. Render Creators Grid
  function renderCreators() {
    if (!creatorsContainer) return;

    const filtered = MROSH_DATA.creators.filter(item => {
      const matchesCategory = state.selectedCategory === "all" || item.category === state.selectedCategory;
      const q = state.searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.skills.some(s => s.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      creatorsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <p style="color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 12px;">No creators or collectives matched "${state.searchQuery}".</p>
          <button class="btn btn-secondary btn-sm" id="resetFilterBtn">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById("resetFilterBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          state.selectedCategory = "all";
          state.searchQuery = "";
          if (searchInput) searchInput.value = "";
          filterPills.forEach(p => p.classList.toggle("active", p.dataset.category === "all"));
          renderCreators();
        });
      }
      return;
    }

    creatorsContainer.innerHTML = filtered.map(creator => {
      let badgeHtml = "";
      if (creator.badge === "verified_shg") {
        badgeHtml = `<span class="badge badge-shg">SHG Collective</span>`;
      } else if (creator.badge === "verified_studio") {
        badgeHtml = `<span class="badge badge-studio">Verified Studio</span>`;
      } else {
        badgeHtml = `<span class="badge badge-verified">Verified Creator</span>`;
      }

      const skillsHtml = creator.skills.slice(0, 3).map(skill => 
        `<span class="skill-tag">${skill}</span>`
      ).join("");

      return `
        <div class="creator-card card-glass card-interactive" data-id="${creator.id}">
          <div class="creator-top-row">
            <img src="${creator.avatar}" alt="${creator.name}" class="creator-avatar" loading="lazy" />
            <div class="creator-meta">
              <div class="creator-name">
                ${creator.name}
              </div>
              <div class="creator-role">${creator.role}</div>
              <div class="creator-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${creator.district}
              </div>
            </div>
            ${badgeHtml}
          </div>

          <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${creator.bio}
          </p>

          <div class="creator-metrics-row">
            <div class="creator-rate">${creator.hourlyRate}</div>
            <div class="creator-rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              ${creator.rating} <span style="color: var(--text-muted); font-size: 0.78rem;">(${creator.reviewsCount})</span>
            </div>
          </div>

          <div class="creator-skills-row">
            ${skillsHtml}
          </div>

          <div class="creator-actions">
            <button class="btn btn-secondary btn-sm view-profile-btn" data-id="${creator.id}">View Profile</button>
            <button class="btn btn-primary btn-sm collaborate-btn" data-id="${creator.id}">Collaborate</button>
          </div>
        </div>
      `;
    }).join("");

    // Attach click triggers to buttons
    document.querySelectorAll(".view-profile-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openProfileModal(btn.dataset.id);
      });
    });

    document.querySelectorAll(".collaborate-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openCollaborateFlow(btn.dataset.id);
      });
    });
  }

  // 2. Render Opportunities Grid
  function renderOpportunities() {
    if (!opportunitiesContainer) return;

    opportunitiesContainer.innerHTML = MROSH_DATA.opportunities.map(opp => {
      const skillsHtml = opp.skillsNeeded.map(s => `<span class="skill-tag">${s}</span>`).join("");
      return `
        <div class="opp-card card-glass card-interactive">
          <div>
            <div class="opp-badge-row">
              <span class="badge badge-pilot">${opp.type}</span>
              <span style="font-size: 0.78rem; color: var(--accent-secondary); font-family: var(--font-mono); font-weight: 600;">
                ${opp.deadline}
              </span>
            </div>

            <div class="opp-brand" style="margin-bottom: 8px;">
              <div class="opp-brand-icon">${opp.brand.charAt(0)}</div>
              <span>${opp.brand}</span>
            </div>

            <h3 class="opp-title">${opp.title}</h3>
            <p class="opp-desc">${opp.description}</p>
          </div>

          <div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
              ${skillsHtml}
            </div>

            <div class="opp-footer">
              <div>
                <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; display: block;">Budget Range</span>
                <span class="opp-budget">${opp.budget}</span>
              </div>
              <button class="btn btn-primary btn-sm apply-opp-btn" data-id="${opp.id}">Quick Apply</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    document.querySelectorAll(".apply-opp-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        openOpportunityModal(btn.dataset.id);
      });
    });
  }

  // 3. Render Milestones Progress (SafeGuard Inspiration)
  function renderMilestones() {
    if (!milestonesContainer) return;

    milestonesContainer.innerHTML = MROSH_DATA.milestonesTracker.map(item => `
      <div class="milestone-item">
        <div class="milestone-info-row">
          <span style="font-weight: 600; color: var(--text-primary);">${item.project}</span>
          <span style="font-family: var(--font-mono); color: var(--accent-primary); font-weight: 600;">${item.budget}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 6px;">
          <span>${item.currentMilestone}</span>
          <span style="color: var(--accent-secondary); font-weight: 600;">${item.progress}% Complete</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${item.progress}%;"></div>
        </div>
      </div>
    `).join("");
  }

  // 4. Filter Event Listeners
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.selectedCategory = pill.dataset.category;
      renderCreators();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      renderCreators();
    });
  }

  // 5. Modal Operations
  function openModal(modalEl) {
    if (modalEl) {
      modalEl.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  }

  function closeModal(modalEl) {
    if (modalEl) {
      modalEl.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  closeModalBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal-overlay");
      closeModal(modal);
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      closeModal(e.target);
    }
  });

  // Open Creator Profile Modal
  function openProfileModal(creatorId) {
    const creator = MROSH_DATA.creators.find(c => c.id === creatorId);
    if (!creator) return;

    const modalBody = document.getElementById("profileModalBody");
    const modalTitle = document.getElementById("profileModalTitle");

    if (modalTitle) modalTitle.textContent = creator.name;

    const portfolioHtml = (creator.portfolio || []).map(p => `
      <div style="border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border-subtle); position: relative;">
        <img src="${p.url}" alt="${p.title}" style="width: 100%; height: 180px; object-fit: cover;" />
        <div style="padding: 8px 12px; background: var(--bg-card); font-size: 0.85rem; font-weight: 600;">${p.title}</div>
      </div>
    `).join("");

    const clientsHtml = (creator.pastClients || []).map(client => `
      <span class="district-pill" style="font-size: 0.78rem;">${client}</span>
    `).join("");

    if (modalBody) {
      modalBody.innerHTML = `
        <div style="display: flex; gap: var(--space-lg); align-items: flex-start; margin-bottom: var(--space-lg);">
          <img src="${creator.avatar}" alt="${creator.name}" style="width: 80px; height: 80px; border-radius: var(--radius-md); object-fit: cover; border: 2px solid var(--accent-primary);" />
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <h3 style="font-size: 1.4rem;">${creator.name}</h3>
              <span class="creator-rate" style="font-size: 1.2rem;">${creator.hourlyRate}</span>
            </div>
            <p style="color: var(--accent-secondary); font-weight: 500; font-size: 0.95rem;">${creator.role} • ${creator.district}</p>
            <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 0.88rem; color: var(--text-secondary);">
              <span>⭐ ${creator.rating} Rating (${creator.reviewsCount} reviews)</span>
              <span>• Status: <strong style="color: var(--accent-primary); text-transform: capitalize;">${creator.availability.replace('_', ' ')}</strong></span>
            </div>
          </div>
        </div>

        <div style="margin-bottom: var(--space-lg);">
          <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px;">About the Creator</h4>
          <p style="color: var(--text-secondary); line-height: 1.6;">${creator.bio}</p>
        </div>

        <div style="margin-bottom: var(--space-lg);">
          <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px;">Key Skills & Tools</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${creator.skills.map(s => `<span class="skill-tag" style="padding: 4px 12px; font-size: 0.82rem;">${s}</span>`).join("")}
          </div>
        </div>

        ${clientsHtml ? `
          <div style="margin-bottom: var(--space-lg);">
            <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px;">Past Clients & Brand Work</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">${clientsHtml}</div>
          </div>
        ` : ""}

        <div style="margin-bottom: var(--space-lg);">
          <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px;">Portfolio Showcase</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
            ${portfolioHtml}
          </div>
        </div>
      `;
    }

    const modalFooter = profileModal.querySelector(".modal-footer");
    if (modalFooter) {
      modalFooter.innerHTML = `
        <button class="btn btn-secondary modal-close-trigger">Close</button>
        <button class="btn btn-primary" id="hireNowBtn" data-id="${creator.id}">
          Send Collaboration Brief
        </button>
      `;
      const hireBtn = document.getElementById("hireNowBtn");
      if (hireBtn) {
        hireBtn.addEventListener("click", () => {
          closeModal(profileModal);
          openCollaborateFlow(creator.id);
        });
      }
      profileModal.querySelector(".modal-close-trigger").addEventListener("click", () => closeModal(profileModal));
    }

    openModal(profileModal);
  }

  // Open Opportunity Application Modal
  function openOpportunityModal(oppId) {
    const opp = MROSH_DATA.opportunities.find(o => o.id === oppId);
    if (!opp) return;

    const modalBody = document.getElementById("opportunityModalBody");
    const modalTitle = document.getElementById("opportunityModalTitle");

    if (modalTitle) modalTitle.textContent = `Apply: ${opp.title}`;

    if (modalBody) {
      modalBody.innerHTML = `
        <div style="margin-bottom: var(--space-lg); padding: var(--space-md); background: var(--bg-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 700; color: var(--text-primary);">${opp.brand}</span>
            <span style="color: var(--accent-primary); font-family: var(--font-mono); font-weight: 700;">${opp.budget}</span>
          </div>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">${opp.description}</p>
        </div>

        <form id="pitchForm">
          <div style="margin-bottom: var(--space-md);">
            <label style="display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">Your Pitch & Approach</label>
            <textarea required rows="4" style="width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 12px; color: var(--text-primary); font-family: var(--font-main); outline: none;" placeholder="Explain why you or your collective are the ideal choice for this brief..."></textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-md);">
            <div>
              <label style="display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">Your Proposed Quote</label>
              <input type="text" value="${opp.budget}" style="width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-primary); font-family: var(--font-main); outline: none;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">Estimated Delivery Time</label>
              <input type="text" placeholder="e.g. 14 Days" style="width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-primary); font-family: var(--font-main); outline: none;" />
            </div>
          </div>

          <div style="margin-bottom: var(--space-lg);">
            <label style="display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">Portfolio References (URLs or uploaded samples)</label>
            <input type="text" placeholder="https://mroshelevate.io/portfolio/..." style="width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-primary); font-family: var(--font-main); outline: none;" />
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;">Submit Proposal</button>
        </form>
      `;

      const form = document.getElementById("pitchForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          showToast(`Application successfully sent to ${opp.brand}! Milestone proposal created.`);
          closeModal(opportunityModal);
        });
      }
    }

    openModal(opportunityModal);
  }

  // Collaborate Flow
  function openCollaborateFlow(creatorId) {
    const creator = MROSH_DATA.creators.find(c => c.id === creatorId);
    if (!creator) return;

    const modalBody = document.getElementById("opportunityModalBody");
    const modalTitle = document.getElementById("opportunityModalTitle");

    if (modalTitle) modalTitle.textContent = `Collaborate with ${creator.name}`;

    if (modalBody) {
      modalBody.innerHTML = `
        <div style="margin-bottom: var(--space-md); padding: var(--space-md); background: var(--bg-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 12px;">
          <img src="${creator.avatar}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" />
          <div>
            <div style="font-weight: 700;">${creator.name}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">${creator.role} • ${creator.hourlyRate}</div>
          </div>
        </div>

        <form id="collabBriefForm">
          <div style="margin-bottom: var(--space-md);">
            <label style="display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">Project Title</label>
            <input required type="text" placeholder="e.g. Karnataka Heritage Campaign 3D Asset Pack" style="width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-primary); font-family: var(--font-main); outline: none;" />
          </div>

          <div style="margin-bottom: var(--space-md);">
            <label style="display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">Collaboration Scope & Milestones</label>
            <textarea required rows="3" style="width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 12px; color: var(--text-primary); font-family: var(--font-main); outline: none;" placeholder="Outline deliverables, milestone 1 concept, milestone 2 delivery..."></textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-lg);">
            <div>
              <label style="display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">Estimated Budget</label>
              <input type="text" placeholder="₹45,000" style="width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-primary); font-family: var(--font-main); outline: none;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">Target Completion</label>
              <input type="date" style="width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-primary); font-family: var(--font-main); outline: none;" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;">Dispatch Collaboration Request</button>
        </form>
      `;

      const form = document.getElementById("collabBriefForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          showToast(`Collaboration invitation sent to ${creator.name}! A new project room has been drafted.`);
          closeModal(opportunityModal);
        });
      }
    }

    openModal(opportunityModal);
  }

  // 6. Onboarding Wizard
  const joinBtns = document.querySelectorAll(".join-ecosystem-trigger");
  joinBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      state.onboardingStep = 1;
      renderOnboardingStep();
      openModal(onboardingModal);
    });
  });

  function renderOnboardingStep() {
    const modalBody = document.getElementById("onboardingModalBody");
    const modalTitle = document.getElementById("onboardingModalTitle");

    if (state.onboardingStep === 1) {
      if (modalTitle) modalTitle.textContent = "Step 1: Choose Your Role in the Universe";
      modalBody.innerHTML = `
        <p style="color: var(--text-secondary); margin-bottom: var(--space-lg);">Select your primary participation mode for the Karnataka Pilot ecosystem:</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-xl);">
          <div class="card-glass role-option-card ${state.selectedRoleForSignup === 'creator' ? 'active-role' : ''}" data-role="creator" style="padding: 16px; cursor: pointer; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">🎨</div>
            <div style="font-weight: 700; margin-bottom: 4px;">Independent Creator</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">Designer, Filmmaker, 3D Artist, Musician</div>
          </div>

          <div class="card-glass role-option-card ${state.selectedRoleForSignup === 'shg' ? 'active-role' : ''}" data-role="shg" style="padding: 16px; cursor: pointer; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">🧵</div>
            <div style="font-weight: 700; margin-bottom: 4px;">Artisan SHG / Collective</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">Self-help group, craft guild, grassroots makers</div>
          </div>

          <div class="card-glass role-option-card ${state.selectedRoleForSignup === 'brand' ? 'active-role' : ''}" data-role="brand" style="padding: 16px; cursor: pointer; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">💼</div>
            <div style="font-weight: 700; margin-bottom: 4px;">Brand / Business</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">Hire talent, launch campaigns, commission craft</div>
          </div>

          <div class="card-glass role-option-card ${state.selectedRoleForSignup === 'studio' ? 'active-role' : ''}" data-role="studio" style="padding: 16px; cursor: pointer; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">🎙️</div>
            <div style="font-weight: 700; margin-bottom: 4px;">Production Studio</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">Audio/Video suites, book equipment, assemble crews</div>
          </div>
        </div>

        <button class="btn btn-primary" id="onboardingNextBtn" style="width: 100%;">Continue to Profile Setup →</button>
      `;

      document.querySelectorAll(".role-option-card").forEach(c => {
        c.addEventListener("click", () => {
          document.querySelectorAll(".role-option-card").forEach(x => x.style.borderColor = "var(--border-subtle)");
          c.style.borderColor = "var(--accent-primary)";
          state.selectedRoleForSignup = c.dataset.role;
        });
      });

      document.getElementById("onboardingNextBtn").addEventListener("click", () => {
        state.onboardingStep = 2;
        renderOnboardingStep();
      });
    } else if (state.onboardingStep === 2) {
      if (modalTitle) modalTitle.textContent = "Step 2: Profile & Regional District";
      modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-lg);">
          <div>
            <label style="display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">Full Name / Collective Title</label>
            <input id="obName" type="text" placeholder="e.g. Ramesh Hegde or Malnad Silk Guild" style="width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-primary); font-family: var(--font-main); outline: none;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">Email Address</label>
            <input id="obEmail" type="email" placeholder="name@domain.com" style="width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-primary); font-family: var(--font-main); outline: none;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">Karnataka Pilot District / Region</label>
            <select id="obDistrict" style="width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-primary); font-family: var(--font-main); outline: none;">
              <option value="Bangalore Urban">Bangalore Urban</option>
              <option value="Mysore">Mysore</option>
              <option value="Ramanagara">Ramanagara (Channapatna Craft Cluster)</option>
              <option value="Bagalkot">Bagalkot (Ilkal Weavers Cluster)</option>
              <option value="Bidar">Bidar (Bidriware Heritage)</option>
              <option value="Dharwad">Dharwad / Hubli Creative Center</option>
              <option value="Dakshina Kannada">Dakshina Kannada / Mangalore</option>
            </select>
          </div>
        </div>

        <div style="display: flex; gap: var(--space-sm);">
          <button class="btn btn-secondary" id="obBackBtn" style="flex: 1;">← Back</button>
          <button class="btn btn-primary" id="obFinalizeBtn" style="flex: 2;">Complete Registration & Launch</button>
        </div>
      `;

      document.getElementById("obBackBtn").addEventListener("click", () => {
        state.onboardingStep = 1;
        renderOnboardingStep();
      });

      document.getElementById("obFinalizeBtn").addEventListener("click", async () => {
        const nameVal = document.getElementById("obName")?.value || "Pilot Participant";
        const emailVal = document.getElementById("obEmail")?.value || `user-${Date.now()}@mroshelevate.io`;
        const districtVal = document.getElementById("obDistrict")?.value || "Bangalore Urban";

        const btn = document.getElementById("obFinalizeBtn");
        btn.disabled = true;
        btn.textContent = "Setting up account...";

        const { data, isLive, error } = await mroshBackend.signUp({
          fullName: nameVal,
          email: emailVal,
          password: "PilotPassword2026!",
          role: state.selectedRoleForSignup,
          district: districtVal
        });

        btn.disabled = false;
        btn.textContent = "Complete Registration & Launch";

        if (!error) {
          showToast(`Welcome to MROSHELEVATE, ${nameVal}! Account active (${isLive ? 'Supabase Live' : 'Local Mode'}).`);
          closeModal(onboardingModal);
        } else {
          showToast(`Notice: ${error.message || 'Continuing in local mode'}`);
          closeModal(onboardingModal);
        }
      });
    }
  }

  // 7. Interactive Journey Tab Switcher
  const journeyTabs = document.querySelectorAll(".tab-btn");
  const tabContent = document.getElementById("journeyTabContent");

  const journeyData = {
    creator: {
      title: "For Independent Creators & Artists",
      subtitle: "Break free from algorithmic suppression and build sustainable IP.",
      steps: [
        "Build a verified portfolio with zero compression and custom rate cards.",
        "Get direct briefs from premium brands with transparent milestone escrows.",
        "Team up with fellow cinematographers, audio engineers, and 3D artists in one workspace."
      ],
      previewBadge: "Creator Growth Hub",
      previewHighlight: "Direct Brand Deals • Milestone Grants • Studio Perks"
    },
    brand: {
      title: "For Brands & Visionary Businesses",
      subtitle: "Source hyper-authentic regional craft and world-class digital creators without agency markups.",
      steps: [
        "Post creative briefs and set transparent milestone budgets with zero hidden platform cuts.",
        "Directly commission authentic Channapatna woodcraft, Ilkal weaves, and modern UI/UX design.",
        "Review work submissions and release funds upon milestone sign-off."
      ],
      previewBadge: "Enterprise Talent Suite",
      previewHighlight: "Verified Grassroots SHGs • Zero Intermediary Fees • Direct IP Licensing"
    },
    studio: {
      title: "For Production Studios & Creative Houses",
      subtitle: "Maximize suite utilization, discover specialized crew, and co-produce major works.",
      steps: [
        "List idle studio hours for Dolby Atmos stages, Foley booths, and color grading suites.",
        "Assemble crew on demand for multi-city commercial shoots and vernacular cinema.",
        "Collaborate with vetted creators to deliver full-scale production packages."
      ],
      previewBadge: "Studio Collab Engine",
      previewHighlight: "Equipment Utilization • Crew Shortlisting • Subsidized Pilot Rates"
    },
    investor: {
      title: "For Creative Backers & Grant Programs",
      subtitle: "Fund the next generation of creative intellectual property with milestone accountability.",
      steps: [
        "Discover vetted creative proposals across digital animation, regional cinema, and craft preservation.",
        "Track progress via transparent SafeGuard-style deliverable rails.",
        "Support high-growth creators with micro-grants and structured milestone funding."
      ],
      previewBadge: "Transparent Grant Tracker",
      previewHighlight: "SafeGuard Verification • Zero-Waste Capital • Grassroots Economic Lift"
    },
    shg: {
      title: "For Self-Help Groups & Artisan Collectives",
      subtitle: "Bridge 200-year heritage crafts directly to modern commercial packaging and design markets.",
      steps: [
        "Create a verified collective digital presence with member artisan roster.",
        "Receive direct bulk purchase and design commission inquiries from international labels.",
        "Collaborate with modern digital designers to create fusion contemporary products."
      ],
      previewBadge: "Grassroots Craft Engine",
      previewHighlight: "Collective Bank Integration • Fair Trade Verification • Cluster Exports"
    }
  };

  journeyTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      journeyTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const role = tab.dataset.role;
      updateJourneyContent(role);
    });
  });

  function updateJourneyContent(role) {
    const data = journeyData[role] || journeyData.creator;
    if (!tabContent) return;

    tabContent.innerHTML = `
      <div>
        <span class="badge badge-pilot" style="margin-bottom: 12px;">${data.previewBadge}</span>
        <h3 style="font-size: 2rem; margin-bottom: 12px;">${data.title}</h3>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">${data.subtitle}</p>

        <div class="tab-steps-list">
          ${data.steps.map((step, idx) => `
            <div class="step-row">
              <div class="step-num">${idx + 1}</div>
              <p style="font-size: 0.95rem; color: var(--text-primary); margin: 0;">${step}</p>
            </div>
          `).join("")}
        </div>

        <div style="margin-top: 32px;">
          <button class="btn btn-primary join-ecosystem-trigger">Join as ${data.previewBadge.split(" ")[0]} →</button>
        </div>
      </div>

      <div class="card-glass" style="padding: 32px; border-radius: var(--radius-lg); border: 1px solid var(--border-active); background: var(--bg-card);">
        <div style="font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px;">Key Pilot Advantage</div>
        <h4 style="font-size: 1.3rem; margin-bottom: 12px; color: var(--accent-primary);">${data.previewHighlight}</h4>
        <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
          Designed natively to support the Karnataka Pilot targets: 100 verified creators, 50 rural & peri-urban SHGs, and 10 state-of-the-art creative production studios.
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span class="district-pill">Zero Middlemen</span>
          <span class="district-pill">Milestone Escrows</span>
          <span class="district-pill">Equitable Attribution</span>
        </div>
      </div>
    `;

    // Reattach trigger to newly rendered button
    tabContent.querySelectorAll(".join-ecosystem-trigger").forEach(b => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        state.onboardingStep = 1;
        state.selectedRoleForSignup = role;
        renderOnboardingStep();
        openModal(onboardingModal);
      });
    });
  }

  // 8. Persona Switcher (Allows testing different viewpoints)
  if (personaSelector) {
    personaSelector.addEventListener("change", (e) => {
      const selected = e.target.value;
      state.currentPersona = selected;
      showToast(`Switched perspective to: ${selected.toUpperCase()}`);
    });
  }

  // 9. Toast Notification Utility
  function showToast(message) {
    let toast = document.getElementById("mroshToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "mroshToast";
      toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: var(--bg-card);
        color: var(--text-primary);
        border: 1px solid var(--accent-primary);
        box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 20px var(--accent-primary-glow);
        padding: 12px 24px;
        border-radius: var(--radius-full);
        font-size: 0.92rem;
        font-weight: 600;
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(20px)";
    }, 3500);
  }

  // 10. Supabase Configuration Modal & Status Pill Manager
  const sbStatusPill = document.getElementById("supabaseStatusPill");
  const sbConfigModal = document.getElementById("supabaseConfigModal");
  const sbConfigForm = document.getElementById("supabaseConfigForm");
  const sbUrlInput = document.getElementById("sbProjectUrlInput");
  const sbAnonInput = document.getElementById("sbAnonKeyInput");
  const clearSbBtn = document.getElementById("clearSbConfigBtn");
  const sbStatusText = document.getElementById("supabaseStatusText");

  function updateSupabaseStatusUI() {
    const isLive = MROSH_SUPABASE.isConfigured();
    if (sbStatusPill && sbStatusText) {
      if (isLive) {
        sbStatusPill.classList.add("connected");
        sbStatusText.textContent = "Supabase: Live";
      } else {
        sbStatusPill.classList.remove("connected");
        sbStatusText.textContent = "Supabase: Setup";
      }
    }
  }

  if (sbStatusPill && sbConfigModal) {
    sbStatusPill.addEventListener("click", () => {
      const cfg = MROSH_SUPABASE.getConfig();
      if (sbUrlInput) sbUrlInput.value = cfg.url;
      if (sbAnonInput) sbAnonInput.value = cfg.anonKey;
      openModal(sbConfigModal);
    });
  }

  if (sbConfigForm) {
    sbConfigForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const url = sbUrlInput?.value;
      const key = sbAnonInput?.value;
      const success = MROSH_SUPABASE.saveConfig(url, key);
      if (success) {
        updateSupabaseStatusUI();
        showToast("Supabase configuration saved! Reloading live feed...");
        closeModal(sbConfigModal);
        setTimeout(() => window.location.reload(), 1000);
      }
    });
  }

  if (clearSbBtn) {
    clearSbBtn.addEventListener("click", () => {
      MROSH_SUPABASE.clearConfig();
      updateSupabaseStatusUI();
      showToast("Supabase reset to offline seed mode.");
      closeModal(sbConfigModal);
      setTimeout(() => window.location.reload(), 800);
    });
  }

  // Expose globally
  window.openProfileModal = openProfileModal;
  window.showToast = showToast;

  // Initial Runs
  updateSupabaseStatusUI();
  renderCreators();
  renderOpportunities();
  renderMilestones();
  updateJourneyContent("creator");
});


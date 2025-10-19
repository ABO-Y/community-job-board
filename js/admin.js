// admin.js - Improved admin dashboard logic

// --------- Configuration & helpers ---------
const STORAGE_KEY = "jobs";

function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Simple in-app notification (non-blocking)
function notify(message) {
  let nl = document.getElementById("admin-notify");
  if (!nl) {
    nl = document.createElement("div");
    nl.id = "admin-notify";
    nl.style.position = "fixed";
    nl.style.bottom = "12px";
    nl.style.right = "12px";
    nl.style.padding = "10px 14px";
    nl.style.background = "rgba(0,0,0,0.85)";
    nl.style.color = "#fff";
    nl.style.borderRadius = "6px";
    nl.style.fontFamily = "system-ui, -apple-system, Arial";
    nl.style.fontSize = "14px";
    nl.style.zIndex = "1000";
    document.body.appendChild(nl);
  }
  nl.textContent = message;
  nl.style.display = "block";
  clearTimeout(nl._t);
  nl._t = setTimeout(() => (nl.style.display = "none"), 1800);
}

// --------- Data layer: load/save with normalization ---------
function loadJobs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // Normalize: ensure every job has a status
    return parsed.map(j => ({
      ...j,
      status: j.status || "pending",
    }));
  } catch (e) {
    console.error("Failed to load jobs from storage:", e);
    return [];
  }
}

function saveJobs(jobs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.error("Failed to save jobs to storage:", e);
  }
}

// --------- Rendering ---------
function renderJobCard(job, index) {
  // Card container
  const card = document.createElement("div");
  card.className = "job-card";

  card.innerHTML = `
    <h3 class="job-title">${escapeHTML(job.title)}</h3>
    <p class="job-meta">${escapeHTML(job.category)} | ${escapeHTML(job.location)}</p>
    <p class="job-desc">${escapeHTML(job.description)}</p>
    <p class="job-status">Status: <strong>${escapeHTML(job.status)}</strong></p>
  `;

  // Actions container
  const actions = document.createElement("div");
  actions.className = "job-actions";

  const addButton = (text, onClick) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.onclick = onClick;
    btn.setAttribute("aria-label", `${text} ${job.title}`);
    btn.className = "action-btn";
    return btn;
  };

  // Depending on status, show appropriate actions
  if (job.status === "pending") {
    const approveBtn = addButton("Approve", () => approveJob(index));
    const deleteBtn = addButton("Delete", () => deleteJob(index));
    approveBtn.style.marginRight = "8px";
    actions.appendChild(approveBtn);
    actions.appendChild(deleteBtn);
  } else {
    const deleteBtn = addButton("Delete", () => deleteJob(index));
    actions.appendChild(deleteBtn);
  }

  card.appendChild(actions);
  return card;
}

function loadAdminJobs() {
  const pendingContainer = document.getElementById("pending-jobs");
  const approvedContainer = document.getElementById("approved-jobs");

  // Clear existing content
  pendingContainer.innerHTML = "";
  approvedContainer.innerHTML = "";

  // Use fragments to minimize reflows
  const fragPending = document.createDocumentFragment();
  const fragApproved = document.createDocumentFragment();

  jobs.forEach((job, idx) => {
    const card = renderJobCard(job, idx);
    if (job.status === "pending") fragPending.appendChild(card);
    else fragApproved.appendChild(card);
  });

  pendingContainer.appendChild(fragPending);
  approvedContainer.appendChild(fragApproved);

  // Optional empty state messages
  if (!jobs.length) {
    pendingContainer.innerHTML = "<p class='empty'>No jobs found.</p>";
    approvedContainer.innerHTML = "<p class='empty'>No jobs found.</p>";
  }
}

// --------- Actions ---------
function approveJob(index) {
  if (!jobs[index]) return;
  jobs[index].status = "approved";
  saveJobs(jobs);
  loadAdminJobs();
  mockEmailAlert(jobs[index]);
  notify(`"${jobs[index].title}" has been approved!`);
  // Return focus to the first item in the pending list for accessibility
  setTimeout(() => {
    const firstPending = document.querySelector("#pending-jobs .job-card");
    if (firstPending) firstPending.querySelector("button").focus();
  }, 0);
}

function deleteJob(index) {
  const toDelete = jobs[index];
  if (!toDelete) return;
  if (confirm("Are you sure you want to delete this job?")) {
    const [removed] = jobs.splice(index, 1);
    saveJobs(jobs);
    loadAdminJobs();
    notify(`"${removed.title}" was deleted.`);
  }
}

// Mock email alert (keeps existing behavior for now)
function mockEmailAlert(job) {
  console.log(`
  📨 Mock Email Sent
  -------------------------
  To: employer@example.com
  Subject: Job "${job.title}" Approved!
  Message: Congratulations! Your job post has been approved and is now live.
  `);
}

// --------- Init ---------
let jobs = loadJobs();
saveJobs(jobs); // ensure storage exists/normalized
document.addEventListener("DOMContentLoaded", () => {
  // Optional: wire up logout button (demo)
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Simple client-side mock: redirect or clear session
      notify("Logged out (demo).");
      // In real app: window.location.href = '/login';
    });
  }

  loadAdminJobs();
});
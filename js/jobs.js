// js/jobs.js
import { db } from "./firebase-init.js";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const elements = {
  jobsContainer: document.getElementById("jobs-container"),
  searchBtn: document.getElementById("search-btn"),
  keywordInput: document.getElementById("keyword"),
  categorySelect: document.getElementById("category"),
  loadingMsg: document.querySelector(".loading"),
  emptyMsg: document.querySelector(".empty")
};

function setLoading(isLoading) {
  if (elements.loadingMsg) {
    elements.loadingMsg.hidden = !isLoading;
  }
  if (elements.searchBtn) {
    elements.searchBtn.disabled = isLoading;
    elements.searchBtn.textContent = isLoading ? "Searching..." : "Search";
  }
}

function showError(message) {
  elements.jobsContainer.innerHTML = `
    <div class="error-message" role="alert">
      ${escapeHtml(message)}
    </div>
  `;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return '';
  const date = timestamp.toDate();
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    .format(Math.ceil((date - new Date()) / 86400000), 'day');
}

async function loadJobs(keyword = "", category = "") {
  setLoading(true);
  elements.jobsContainer.innerHTML = "";

  try {
    // Build query
    let jobsQuery = query(
      collection(db, "jobs"),
      where("status", "==", "approved"),
      orderBy("postedAt", "desc"),
      limit(50)
    );

    if (category) {
      jobsQuery = query(jobsQuery, where("category", "==", category));
    }

    const snapshot = await getDocs(jobsQuery);
    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Client-side keyword filtering
    let filteredJobs = jobs;
    if (keyword) {
      const searchTerm = keyword.toLowerCase();
      filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (filteredJobs.length === 0) {
      elements.jobsContainer.innerHTML = `
        <p class="no-results" role="status">
          No jobs found matching your criteria.
        </p>
      `;
      return;
    }

    const jobsHTML = filteredJobs.map(job => `
      <article class="job-card">
        <h3>
          <a href="job-details.html?id=${job.id}">
            ${escapeHtml(job.title)}
          </a>
        </h3>
        ${job.company ? `<p class="company">${escapeHtml(job.company)}</p>` : ''}
        <div class="job-meta">
          <span class="category">${escapeHtml(job.category)}</span>
          ${job.location ? `<span class="location">${escapeHtml(job.location)}</span>` : ''}
          <span class="posted">Posted ${formatDate(job.postedAt)}</span>
        </div>
        ${job.description ? `
          <p class="description">${escapeHtml(job.description.substring(0, 150))}...</p>
        ` : ''}
        <div class="actions">
          <a href="job-details.html?id=${job.id}" class="btn">
            View Details
          </a>
        </div>
      </article>
    `).join('');

    elements.jobsContainer.innerHTML = jobsHTML;

  } catch (error) {
    console.error("Error loading jobs:", error);
    showError("Failed to load jobs. Please try again later.");
  } finally {
    setLoading(false);
  }
}

// Event Listeners
elements.searchBtn?.addEventListener("click", () => {
  const keyword = elements.keywordInput?.value.trim() || "";
  const category = elements.categorySelect?.value || "";
  loadJobs(keyword, category);
});

elements.keywordInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    elements.searchBtn?.click();
  }
});

// Load all jobs initially
loadJobs();

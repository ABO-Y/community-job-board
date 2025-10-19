import { auth, db } from "./firebase-init.js";
import { collection, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// State management
const state = {
  loading: false,
  jobs: [],
  filters: {
    category: '',
    location: '',
    keyword: ''
  }
};

// DOM Elements
const elements = {
  jobList: document.getElementById("job-list"),
  loadingSpinner: document.getElementById("loading-spinner"),
  filterForm: document.getElementById("filter-form"),
  errorContainer: document.getElementById("error-container")
};

// Loading state management
function setLoading(isLoading) {
  state.loading = isLoading;
  if (elements.loadingSpinner) {
    elements.loadingSpinner.hidden = !isLoading;
  }
  if (elements.jobList) {
    elements.jobList.setAttribute('aria-busy', isLoading.toString());
  }
}

// Error handling
function showError(message, level = 'error') {
  if (!elements.errorContainer) return;
  
  elements.errorContainer.innerHTML = `
    <div class="alert alert-${level}" role="alert">
      ${message}
      <button type="button" class="close-alert" aria-label="Close alert">×</button>
    </div>
  `;
  elements.errorContainer.hidden = false;
}

// Job fetching with filters
async function fetchJobs(filters = {}) {
  setLoading(true);
  
  try {
    let jobsQuery = query(
      collection(db, "jobs"),
      where("status", "==", "approved"),
      orderBy("postedAt", "desc"),
      limit(50)
    );

    // Apply filters if present
    if (filters.category) {
      jobsQuery = query(jobsQuery, where("category", "==", filters.category));
    }
    
    const snapshot = await getDocs(jobsQuery);
    const jobs = [];

    snapshot.forEach(doc => {
      jobs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Client-side keyword filtering
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      return jobs.filter(job => 
        job.title.toLowerCase().includes(keyword) ||
        job.description.toLowerCase().includes(keyword)
      );
    }

    return jobs;

  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Failed to load jobs. Please try again later.");
  } finally {
    setLoading(false);
  }
}

// Render jobs with proper date formatting and sanitization
function renderJobs(jobs) {
  if (!elements.jobList) return;

  if (!jobs.length) {
    elements.jobList.innerHTML = `
      <div class="no-jobs" role="status">
        No jobs found matching your criteria.
      </div>
    `;
    return;
  }

  elements.jobList.innerHTML = jobs.map(job => `
    <article class="job-card">
      <h3>
        <a href="job-details.html?id=${job.id}">${escapeHtml(job.title)}</a>
      </h3>
      <div class="job-meta">
        <span>${escapeHtml(job.category)}</span>
        ${job.location ? `<span>${escapeHtml(job.location)}</span>` : ''}
        <span>Posted ${formatDate(job.postedAt)}</span>
      </div>
      <p>${truncateText(escapeHtml(job.description), 150)}</p>
      <div class="job-actions">
        <a href="job-details.html?id=${job.id}" class="btn btn-primary">
          View Details
        </a>
      </div>
    </article>
  `).join("");
}

// Utility functions
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    .format(Math.ceil((date - new Date()) / 86400000), 'day');
}

function truncateText(text, length) {
  return text.length > length ? 
    text.substring(0, length) + '...' : 
    text;
}

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const jobs = await fetchJobs();
    renderJobs(jobs);
  } catch (error) {
    showError(error.message);
  }

  // Set up filter form listeners
  elements.filterForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    state.filters = {
      category: formData.get("category"),
      keyword: formData.get("keyword"),
      location: formData.get("location")
    };

    try {
      const filteredJobs = await fetchJobs(state.filters);
      renderJobs(filteredJobs);
    } catch (error) {
      showError(error.message);
    }
  });

  // Error container close button
  elements.errorContainer?.addEventListener("click", (e) => {
    if (e.target.matches(".close-alert")) {
      elements.errorContainer.hidden = true;
    }
  });
});

// Export for potential reuse
export { fetchJobs, renderJobs };

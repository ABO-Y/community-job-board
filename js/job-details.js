// js/job-details.js
import { db, auth } from "./firebase-init.js";
import { 
  doc, 
  getDoc, 
  addDoc, 
  collection, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const elements = {
  form: document.getElementById("application-form"),
  status: document.getElementById("application-status"),
  content: document.getElementById("job-details-content"),
  loadingSpinner: document.getElementById("loading-spinner"),
  submitBtn: document.querySelector("#application-form button[type='submit']")
};

function setLoading(isLoading) {
  if (elements.loadingSpinner) {
    elements.loadingSpinner.hidden = !isLoading;
  }
  if (elements.submitBtn) {
    elements.submitBtn.disabled = isLoading;
    elements.submitBtn.textContent = isLoading ? "Submitting..." : "Submit Application";
  }
}

function showStatus(message, type = 'info') {
  if (!elements.status) return;
  elements.status.textContent = message;
  elements.status.className = `alert alert-${type}`;
  elements.status.hidden = false;
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
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(timestamp.toDate());
}

async function loadJob() {
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("id");
  
  if (!jobId) {
    showStatus("Invalid job ID", "error");
    return;
  }

  setLoading(true);

  try {
    const jobDoc = await getDoc(doc(db, "jobs", jobId));
    
    if (!jobDoc.exists()) {
      elements.content.innerHTML = `
        <div class="alert alert-error" role="alert">
          Job listing not found or has been removed.
        </div>
      `;
      return;
    }

    const job = jobDoc.data();

    // Validate job status
    if (job.status !== 'approved') {
      elements.content.innerHTML = `
        <div class="alert alert-warning" role="alert">
          This job listing is no longer active.
        </div>
      `;
      return;
    }

    elements.content.innerHTML = `
      <article class="job-details">
        <h2>${escapeHtml(job.title)}</h2>
        
        <div class="job-meta">
          ${job.company ? `<p class="company">${escapeHtml(job.company)}</p>` : ''}
          <p class="category">Category: ${escapeHtml(job.category)}</p>
          ${job.location ? `<p class="location">Location: ${escapeHtml(job.location)}</p>` : ''}
          ${job.salary ? `<p class="salary">Salary: ${escapeHtml(job.salary)}</p>` : ''}
          <p class="posted-date">Posted: ${formatDate(job.postedAt)}</p>
        </div>

        <div class="job-description">
          ${job.description.split('\n').map(para => 
            `<p>${escapeHtml(para)}</p>`
          ).join('')}
        </div>

        <hr>
        
        <div class="apply-section">
          <h3>Apply for this position</h3>
          ${elements.form.outerHTML}
        </div>
      </article>
    `;

    // Re-attach form after innerHTML replacement
    elements.form = document.getElementById("application-form");
    setupFormListener();

  } catch (error) {
    console.error("Error loading job:", error);
    showStatus("Failed to load job details. Please try again later.", "error");
  } finally {
    setLoading(false);
  }
}

function setupFormListener() {
  elements.form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("id");

    const formData = new FormData(e.target);
    const name = formData.get("name")?.trim();
    const email = formData.get("email")?.trim();
    const message = formData.get("message")?.trim();

    // Validation
    if (!name || !email || !message) {
      showStatus("Please fill in all fields", "error");
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      showStatus("Please enter a valid email address", "error");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "applications"), {
        jobId,
        jobTitle: document.querySelector(".job-details h2").textContent,
        name,
        email,
        message,
        appliedAt: serverTimestamp(),
        status: 'pending'
      });

      showStatus("Application submitted successfully!", "success");
      elements.form.reset();
    } catch (err) {
      console.error("Error submitting application:", err);
      showStatus("Failed to submit application. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  });
}

// Initialize
window.addEventListener("DOMContentLoaded", loadJob);

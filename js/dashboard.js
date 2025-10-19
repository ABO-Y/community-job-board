// js/dashboard.js
import { auth, db } from "./firebase-init.js";
import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy,
  updateDoc,
  doc 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const elements = {
  pendingJobs: document.getElementById("pending-jobs"),
  approvedJobs: document.getElementById("approved-jobs"),
  logoutBtn: document.getElementById("logout"),
  loadingSpinner: document.getElementById("loading-spinner"),
  errorAlert: document.getElementById("error-alert")
};

function setLoading(isLoading) {
  if (elements.loadingSpinner) {
    elements.loadingSpinner.hidden = !isLoading;
  }
}

function showError(message) {
  if (elements.errorAlert) {
    elements.errorAlert.textContent = message;
    elements.errorAlert.hidden = false;
  }
}

function createJobCard(job, docId) {
  const card = document.createElement("article");
  card.classList.add("job-card");
  card.innerHTML = `
    <h3>${escapeHtml(job.title)}</h3>
    <div class="job-meta">
      ${job.company ? `<p class="company">${escapeHtml(job.company)}</p>` : ''}
      <p class="category">${escapeHtml(job.category)}</p>
      <p class="posted">Posted: ${formatDate(job.postedAt)}</p>
    </div>
    <p class="description">${escapeHtml(job.description.substring(0, 150))}...</p>
    <div class="actions">
      <a href="job-details.html?id=${docId}" class="btn btn-secondary">View Details</a>
      ${job.status === 'pending' ? `
        <button class="btn btn-primary approve-btn" data-job-id="${docId}">
          Approve
        </button>
        <button class="btn btn-danger reject-btn" data-job-id="${docId}">
          Reject
        </button>
      ` : ''}
    </div>
  `;
  return card;
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

async function loadJobs() {
  setLoading(true);

  try {
    // Get user's jobs
    const user = auth.currentUser;
    const jobsQuery = query(
      collection(db, "jobs"),
      where("postedBy", "==", user.uid),
      orderBy("postedAt", "desc")
    );

    const snapshot = await getDocs(jobsQuery);
    
    elements.pendingJobs.innerHTML = "";
    elements.approvedJobs.innerHTML = "";

    let pendingCount = 0;
    let approvedCount = 0;

    snapshot.forEach((doc) => {
      const job = doc.data();
      const card = createJobCard(job, doc.id);

      if (job.status === "pending") {
        elements.pendingJobs.appendChild(card);
        pendingCount++;
      } else if (job.status === "approved") {
        elements.approvedJobs.appendChild(card);
        approvedCount++;
      }
    });

    if (pendingCount === 0) {
      elements.pendingJobs.innerHTML = `
        <p class="no-jobs" role="status">No pending jobs.</p>
      `;
    }
    if (approvedCount === 0) {
      elements.approvedJobs.innerHTML = `
        <p class="no-jobs" role="status">No approved jobs.</p>
      `;
    }

  } catch (err) {
    console.error("Error loading jobs:", err);
    showError("Failed to load jobs. Please try again later.");
  } finally {
    setLoading(false);
  }
}

async function handleJobAction(jobId, action) {
  try {
    await updateDoc(doc(db, "jobs", jobId), {
      status: action,
      updatedAt: new Date()
    });
    
    // Reload jobs to reflect changes
    await loadJobs();
  } catch (err) {
    console.error(`Error ${action} job:`, err);
    showError(`Failed to ${action} job. Please try again.`);
  }
}

// Event Listeners
document.addEventListener("click", async (e) => {
  if (e.target.matches(".approve-btn")) {
    const jobId = e.target.dataset.jobId;
    await handleJobAction(jobId, "approved");
  } else if (e.target.matches(".reject-btn")) {
    const jobId = e.target.dataset.jobId;
    await handleJobAction(jobId, "rejected");
  }
});

elements.logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error("Error signing out:", err);
    showError("Failed to sign out. Please try again.");
  }
});

// Auth state observer
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  await loadJobs();
});

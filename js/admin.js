// js/admin.js
import { auth, db } from "./firebase-init.js";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc,
  orderBy,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const elements = {
  pendingJobs: document.getElementById("pending-jobs"),
  approvedJobs: document.getElementById("approved-jobs"),
  loadingSpinner: document.getElementById("loading-spinner"),
  errorAlert: document.getElementById("error-alert")
};

function setLoading(isLoading) {
  if (elements.loadingSpinner) {
    elements.loadingSpinner.hidden = !isLoading;
  }
  elements.pendingJobs?.setAttribute('aria-busy', isLoading.toString());
  elements.approvedJobs?.setAttribute('aria-busy', isLoading.toString());
}

function showError(message) {
  if (elements.errorAlert) {
    elements.errorAlert.textContent = message;
    elements.errorAlert.hidden = false;
    elements.errorAlert.setAttribute('role', 'alert');
  }
}

function createJobCard(job) {
  const card = document.createElement("article");
  card.classList.add("job-card");
  card.innerHTML = `
    <h3>${escapeHtml(job.title)}</h3>
    <div class="job-meta">
      ${job.company ? `<p class="company">${escapeHtml(job.company)}</p>` : ''}
      <p class="category">${escapeHtml(job.category)}</p>
      <p class="posted">Posted: ${formatDate(job.postedAt)}</p>
      <p class="poster">By: ${escapeHtml(job.postedByEmail)}</p>
    </div>
    <div class="job-description">
      ${escapeHtml(job.description)}
    </div>
    <div class="actions">
      ${job.status === 'pending' ? `
        <button class="btn approve-btn" data-id="${job.id}">
          Approve
        </button>
        <button class="btn reject-btn" data-id="${job.id}">
          Reject
        </button>
      ` : ''}
      <button class="btn delete-btn" data-id="${job.id}">
        Delete
      </button>
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
    // Check if user is admin
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || userDoc.data().role !== "admin") {
      throw new Error("Unauthorized access");
    }

    // Load pending jobs
    const pendingQuery = query(
      collection(db, "jobs"),
      where("status", "==", "pending"),
      orderBy("postedAt", "desc")
    );
    const pendingSnapshot = await getDocs(pendingQuery);
    
    elements.pendingJobs.innerHTML = "<h2>Pending Jobs</h2>";
    if (pendingSnapshot.empty) {
      elements.pendingJobs.innerHTML += `
        <p class="no-jobs" role="status">No pending jobs to review.</p>
      `;
    } else {
      pendingSnapshot.forEach(doc => {
        const job = { id: doc.id, ...doc.data() };
        elements.pendingJobs.appendChild(createJobCard(job));
      });
    }

    // Load approved jobs
    const approvedQuery = query(
      collection(db, "jobs"),
      where("status", "==", "approved"),
      orderBy("postedAt", "desc")
    );
    const approvedSnapshot = await getDocs(approvedQuery);
    
    elements.approvedJobs.innerHTML = "<h2>Approved Jobs</h2>";
    if (approvedSnapshot.empty) {
      elements.approvedJobs.innerHTML += `
        <p class="no-jobs" role="status">No approved jobs.</p>
      `;
    } else {
      approvedSnapshot.forEach(doc => {
        const job = { id: doc.id, ...doc.data() };
        elements.approvedJobs.appendChild(createJobCard(job));
      });
    }

  } catch (error) {
    console.error("Error loading jobs:", error);
    showError(error.message);
  } finally {
    setLoading(false);
  }
}

async function handleJobAction(jobId, action) {
  try {
    await updateDoc(doc(db, "jobs", jobId), {
      status: action,
      reviewedAt: serverTimestamp(),
      reviewedBy: auth.currentUser.uid
    });
    
    // Reload to show changes
    await loadJobs();
  } catch (error) {
    console.error(`Error ${action} job:`, error);
    showError(`Failed to ${action} job. Please try again.`);
  }
}

// Event delegation for job actions
document.addEventListener("click", async (e) => {
  const button = e.target;
  if (!button.matches(".approve-btn, .reject-btn, .delete-btn")) return;

  const jobId = button.dataset.id;
  if (!jobId) return;

  if (button.matches(".approve-btn")) {
    await handleJobAction(jobId, "approved");
  } else if (button.matches(".reject-btn")) {
    await handleJobAction(jobId, "rejected");
  } else if (button.matches(".delete-btn")) {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteDoc(doc(db, "jobs", jobId));
        await loadJobs();
      } catch (error) {
        console.error("Error deleting job:", error);
        showError("Failed to delete job. Please try again.");
      }
    }
  }
});

// Check admin status and load jobs
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  await loadJobs();
});

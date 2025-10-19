// js/applications.js
import { auth, db } from "./firebase-init.js";
import { 
  collection, 
  getDocs,
  query,
  where,
  orderBy 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const elements = {
  applicationsList: document.getElementById("applications-list"),
  searchInput: document.getElementById("searchInput"),
  jobFilter: document.getElementById("jobFilter"),
  loadingSpinner: document.getElementById("loading-spinner"),
  noResults: document.getElementById("no-results")
};

function setLoading(isLoading) {
  if (elements.loadingSpinner) {
    elements.loadingSpinner.hidden = !isLoading;
  }
  if (elements.applicationsList) {
    elements.applicationsList.setAttribute('aria-busy', isLoading.toString());
  }
}

function showNoResults(message = "No applications found") {
  if (elements.noResults) {
    elements.noResults.textContent = message;
    elements.noResults.hidden = false;
  }
}

function hideNoResults() {
  if (elements.noResults) {
    elements.noResults.hidden = true;
  }
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return '';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(timestamp.toDate());
}

// Ensure user is logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    loadApplications(user.uid);
  }
});

async function loadApplications(userId) {
  setLoading(true);
  elements.applicationsList.innerHTML = "";

  try {
    // Query applications for jobs posted by this user
    const jobsQuery = query(
      collection(db, "jobs"),
      where("postedBy", "==", userId)
    );
    const jobsSnapshot = await getDocs(jobsQuery);
    const jobIds = jobsSnapshot.docs.map(doc => doc.id);

    if (jobIds.length === 0) {
      showNoResults("You haven't posted any jobs yet.");
      return;
    }

    const appsQuery = query(
      collection(db, "applications"),
      where("jobId", "in", jobIds),
      orderBy("appliedAt", "desc")
    );
    
    const appsSnapshot = await getDocs(appsQuery);
    const apps = appsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate()
    }));

    if (apps.length === 0) {
      showNoResults("No applications received yet.");
      return;
    }

    // Store applications in memory for filtering
    window.applicationData = apps;

    displayApplications(apps);
    setupFilters(apps);

  } catch (err) {
    console.error("Error loading applications:", err);
    elements.applicationsList.innerHTML = `
      <div class="error-message" role="alert">
        Failed to load applications. Please try again later.
      </div>
    `;
  } finally {
    setLoading(false);
  }
}

function displayApplications(apps) {
  hideNoResults();
  
  if (apps.length === 0) {
    showNoResults("No applications match your search.");
    return;
  }

  elements.applicationsList.innerHTML = apps.map(app => `
    <article class="application-card" data-id="${app.id}">
      <div class="app-header">
        <h3>${app.jobTitle}</h3>
        <span class="app-date">Applied: ${formatDate(app.appliedAt)}</span>
      </div>
      
      <div class="applicant-info">
        <p><strong>Name:</strong> ${app.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${app.email}">${app.email}</a></p>
      </div>
      
      <div class="message">
        <p><strong>Message:</strong></p>
        <p>${app.message}</p>
      </div>
      
      <div class="status ${app.status}">
        Status: ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}
      </div>
      
      <div class="actions">
        <button class="btn accept-btn" data-id="${app.id}"
          ${app.status !== 'pending' ? 'disabled' : ''}>
          Accept
        </button>
        <button class="btn reject-btn" data-id="${app.id}"
          ${app.status !== 'pending' ? 'disabled' : ''}>
          Reject
        </button>
      </div>
    </article>
  `).join('');
}

function setupFilters(apps) {
  // Populate job filter dropdown
  const jobs = [...new Set(apps.map(a => a.jobTitle))];
  elements.jobFilter.innerHTML = `
    <option value="">All Jobs</option>
    ${jobs.map(job => `<option value="${job}">${job}</option>`).join('')}
  `;

  // Set up filter event listeners
  elements.searchInput?.addEventListener("input", debounce(() => {
    filterApplications();
  }, 300));

  elements.jobFilter?.addEventListener("change", () => {
    filterApplications();
  });
}

function filterApplications() {
  const apps = window.applicationData || [];
  const keyword = elements.searchInput?.value.toLowerCase() || '';
  const selectedJob = elements.jobFilter?.value || '';

  const filtered = apps.filter(app => {
    const matchesKeyword = !keyword || 
      app.name.toLowerCase().includes(keyword) ||
      app.email.toLowerCase().includes(keyword) ||
      app.message.toLowerCase().includes(keyword);
      
    const matchesJob = !selectedJob || app.jobTitle === selectedJob;
    
    return matchesKeyword && matchesJob;
  });

  displayApplications(filtered);
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Event delegation for accept/reject buttons
document.addEventListener('click', async (e) => {
  if (!e.target.matches('.accept-btn, .reject-btn')) return;
  
  const button = e.target;
  const applicationId = button.dataset.id;
  const action = button.classList.contains('accept-btn') ? 'accepted' : 'rejected';

  try {
    await updateApplicationStatus(applicationId, action);
    filterApplications(); // Refresh the display
  } catch (err) {
    console.error(`Error ${action} application:`, err);
    alert(`Failed to ${action} application. Please try again.`);
  }
});

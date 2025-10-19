import { db } from './firebase-init.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const applicationsList = document.getElementById('applications-list');
const searchInput = document.getElementById('searchInput');
const jobFilter = document.getElementById('jobFilter');

// Store jobs in memory to avoid multiple calls
const jobsMap = new Map();

// Load all jobs to populate filter dropdown and map
async function loadJobsForFilter() {
  const jobsSnapshot = await getDocs(collection(db, 'jobs'));
  jobsSnapshot.forEach(docSnap => {
    const jobData = docSnap.data();
    jobsMap.set(docSnap.id, jobData.title);

    const option = document.createElement('option');
    option.value = docSnap.id;
    option.textContent = jobData.title;
    jobFilter.appendChild(option);
  });
}

// Load all applications
async function loadApplications(filterJobId = '', searchKeyword = '') {
  applicationsList.innerHTML = `<p class="loading">Loading applications...</p>`;

  const appsSnapshot = await getDocs(collection(db, 'applications'));
  const applications = [];

  appsSnapshot.forEach(docSnap => {
    const app = { id: docSnap.id, ...docSnap.data() };
    if (
      (!filterJobId || app.jobId === filterJobId) &&
      (!searchKeyword ||
        app.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        app.email.toLowerCase().includes(searchKeyword.toLowerCase()))
    ) {
      applications.push(app);
    }
  });

  renderApplications(applications);
}

// Render applications
function renderApplications(applications) {
  if (applications.length === 0) {
    applicationsList.innerHTML = `<p class="empty">No applications found.</p>`;
    return;
  }

  applicationsList.innerHTML = '';
  applications.forEach(app => {
    const jobTitle = jobsMap.get(app.jobId) || "Unknown Job";

    const appEl = document.createElement('div');
    appEl.classList.add('application-card');
    appEl.innerHTML = `
      <h3>${app.name}</h3>
      <p>Email: ${app.email}</p>
      <p>Message: ${app.message}</p>
      <p>Job: ${jobTitle}</p>
    `;
    applicationsList.appendChild(appEl);
  });
}

// Filter and search events
searchInput.addEventListener('input', () => {
  loadApplications(jobFilter.value, searchInput.value);
});

jobFilter.addEventListener('change', () => {
  loadApplications(jobFilter.value, searchInput.value);
});

// Initialize
loadJobsForFilter().then(() => loadApplications());

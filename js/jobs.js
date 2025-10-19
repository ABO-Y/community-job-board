import { db } from './firebase-init.js';
import { collection, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const jobsContainer = document.getElementById('jobs-container');
const keywordInput = document.getElementById('keyword');
const categorySelect = document.getElementById('category');
const searchBtn = document.getElementById('search-btn');

async function loadJobs(filterKeyword = '', filterCategory = '') {
  jobsContainer.innerHTML = `<p class="loading">Loading jobs...</p>`;

  let q = collection(db, 'jobs');

  if (filterCategory) {
    q = query(q, where('category', '==', filterCategory));
  }

  const querySnapshot = await getDocs(q);

  const jobs = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (!filterKeyword || data.title.toLowerCase().includes(filterKeyword.toLowerCase())) {
      jobs.push({ id: doc.id, ...data });
    }
  });

  renderJobs(jobs);
}

function renderJobs(jobs) {
  if (jobs.length === 0) {
    jobsContainer.innerHTML = `<p class="empty">No jobs found.</p>`;
    return;
  }

  jobsContainer.innerHTML = '';
  jobs.forEach(job => {
    const jobEl = document.createElement('div');
    jobEl.classList.add('job-card');
    jobEl.innerHTML = `
      <h3>${job.title}</h3>
      <p>Category: ${job.category}</p>
      <p>${job.description.substring(0, 100)}...</p>
      <a href="job-details.html?id=${job.id}" class="btn">View Details</a>
    `;
    jobsContainer.appendChild(jobEl);
  });
}

// Event listeners
searchBtn.addEventListener('click', () => {
  const keyword = keywordInput.value.trim();
  const category = categorySelect.value;
  loadJobs(keyword, category);
});

// Load all jobs initially
loadJobs();

// admin.js
import { db } from './firebase-init.js';
import { collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const pendingJobsContainer = document.getElementById('pending-jobs');
const approvedJobsContainer = document.getElementById('approved-jobs');

async function loadJobs() {
  pendingJobsContainer.innerHTML = '<p class="loading">Loading pending jobs...</p>';
  approvedJobsContainer.innerHTML = '<p class="loading">Loading approved jobs...</p>';

  const snapshot = await getDocs(collection(db, 'jobs'));

  pendingJobsContainer.innerHTML = '';
  approvedJobsContainer.innerHTML = '';

  snapshot.forEach(docSnap => {
    const job = docSnap.data();
    const jobId = docSnap.id;

    const jobCard = document.createElement('div');
    jobCard.classList.add('job-card');
    jobCard.innerHTML = `
      <h3>${job.title}</h3>
      <p>${job.description.substring(0, 100)}...</p>
      <p><strong>Category:</strong> ${job.category}</p>
    `;

    if (job.approved) {
      approvedJobsContainer.appendChild(jobCard);
    } else {
      const approveBtn = document.createElement('button');
      approveBtn.textContent = 'Approve';
      approveBtn.classList.add('btn');
      approveBtn.addEventListener('click', () => approveJob(jobId));

      const rejectBtn = document.createElement('button');
      rejectBtn.textContent = 'Reject';
      rejectBtn.classList.add('btn', 'btn-reject');
      rejectBtn.addEventListener('click', () => rejectJob(jobId));

      jobCard.appendChild(approveBtn);
      jobCard.appendChild(rejectBtn);
      pendingJobsContainer.appendChild(jobCard);
    }
  });
}

// Approve a job
async function approveJob(jobId) {
  await updateDoc(doc(db, 'jobs', jobId), { approved: true });
  loadJobs(); // Refresh lists
}

// Reject a job (delete)
async function rejectJob(jobId) {
  await updateDoc(doc(db, 'jobs', jobId), { approved: false, rejected: true });
  loadJobs();
}

window.addEventListener('DOMContentLoaded', loadJobs);

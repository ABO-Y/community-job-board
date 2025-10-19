import { db, auth } from './firebase-init.js';
import { doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Get job ID from URL
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('id');

const jobContent = document.getElementById('job-details-content');
const applicationForm = document.getElementById('application-form');
const applicationStatus = document.getElementById('application-status');

// Load job details
async function loadJob() {
  if (!jobId) {
    jobContent.innerHTML = `<p class="empty">Job not found.</p>`;
    return;
  }

  const docRef = doc(db, 'jobs', jobId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const job = docSnap.data();
    jobContent.innerHTML = `
      <h3>${job.title}</h3>
      <p>Category: ${job.category}</p>
      <p>${job.description}</p>
    `;
  } else {
    jobContent.innerHTML = `<p class="empty">Job not found.</p>`;
  }
}

// Handle application form submission
applicationForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = applicationForm['name'].value.trim();
  const email = applicationForm['email'].value.trim();
  const message = applicationForm['message'].value.trim();

  if (!name || !email || !message) {
    applicationStatus.textContent = 'All fields are required.';
    applicationStatus.hidden = false;
    return;
  }

  try {
    await addDoc(collection(db, 'applications'), {
      jobId,
      name,
      email,
      message,
      appliedAt: serverTimestamp()
    });

    applicationStatus.textContent = 'Application submitted successfully!';
    applicationStatus.hidden = false;
    applicationForm.reset();
  } catch (error) {
    console.error(error);
    applicationStatus.textContent = 'Failed to submit application. Try again.';
    applicationStatus.hidden = false;
  }
});

loadJob();

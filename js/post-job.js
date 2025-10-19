import { auth, db } from './firebase-init.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const form = document.getElementById('post-job-form');
const status = document.getElementById('status');
const logoutBtn = document.getElementById('logout');

// Ensure only logged-in users can post jobs
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
});

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = form['title'].value.trim();
  const description = form['description'].value.trim();
  const category = form['category'].value;

  if (!title || !description || !category) {
    status.textContent = 'All fields are required.';
    status.hidden = false;
    return;
  }

  try {
    await addDoc(collection(db, 'jobs'), {
      title,
      description,
      category,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });

    status.textContent = 'Job posted successfully!';
    status.hidden = false;

    // Reset the form
    form.reset();
  } catch (error) {
    console.error('Error posting job:', error);
    status.textContent = 'Failed to post job. Please try again.';
    status.hidden = false;
  }
});

// Logout
logoutBtn.addEventListener('click', () => auth.signOut().then(() => window.location.href = 'login.html'));

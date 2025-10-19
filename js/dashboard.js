import { auth, db } from './firebase-init.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const jobsContainer = document.getElementById('jobs-container');
const logoutBtn = document.getElementById('logout');

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Fetch jobs posted by this user
  const q = query(collection(db, 'jobs'), where('userId', '==', user.uid));
  const snapshot = await getDocs(q);

  jobsContainer.innerHTML = '';
  if (snapshot.empty) {
    document.querySelector('.empty').hidden = false;
    return;
  }

  snapshot.forEach(doc => {
    const job = doc.data();
    const div = document.createElement('div');
    div.className = 'job-item';
    div.innerHTML = `
      <h3>${job.title}</h3>
      <p>${job.description}</p>
      <a href="applications.html?jobId=${doc.id}">View Applications</a>
    `;
    jobsContainer.appendChild(div);
  });
});

logoutBtn.addEventListener('click', () => auth.signOut().then(() => window.location.href = 'login.html'));

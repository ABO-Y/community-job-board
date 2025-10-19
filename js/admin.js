// js/admin.js
import { db } from "./firebase-init.js";
import { collection, getDocs, query, where, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const pendingJobsContainer = document.getElementById("pending-jobs");
const approvedJobsContainer = document.getElementById("approved-jobs");

async function loadJobs() {
  // Load pending jobs
  const pendingQ = query(collection(db, "jobs"), where("approved", "==", false));
  const pendingSnapshot = await getDocs(pendingQ);
  pendingJobsContainer.innerHTML = "";
  pendingSnapshot.forEach(docSnap => {
    const job = { id: docSnap.id, ...docSnap.data() };
    const card = document.createElement("div");
    card.classList.add("job-card");
    card.innerHTML = `
      <h3>${job.title}</h3>
      <p>${job.description}</p>
      <button class="approve-btn" data-id="${job.id}">Approve</button>
    `;
    pendingJobsContainer.appendChild(card);
  });

  // Load approved jobs
  const approvedQ = query(collection(db, "jobs"), where("approved", "==", true));
  const approvedSnapshot = await getDocs(approvedQ);
  approvedJobsContainer.innerHTML = "";
  approvedSnapshot.forEach(docSnap => {
    const job = { id: docSnap.id, ...docSnap.data() };
    const card = document.createElement("div");
    card.classList.add("job-card");
    card.innerHTML = `<h3>${job.title}</h3><p>${job.description}</p>`;
    approvedJobsContainer.appendChild(card);
  });

  // Approve buttons
  document.querySelectorAll(".approve-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const jobId = btn.dataset.id;
      await updateDoc(doc(db, "jobs", jobId), { approved: true });
      loadJobs();
    });
  });
}

window.addEventListener("DOMContentLoaded", loadJobs);

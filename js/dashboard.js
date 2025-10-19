// js/dashboard.js
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const pendingJobsContainer = document.getElementById("pending-jobs");
const approvedJobsContainer = document.getElementById("approved-jobs");
const logoutBtn = document.getElementById("logout");

// Check if user is logged in
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Load jobs
  await loadJobs();
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

async function loadJobs() {
  pendingJobsContainer.innerHTML = "<p>Loading...</p>";
  approvedJobsContainer.innerHTML = "<p>Loading...</p>";

  try {
    const jobsSnapshot = await getDocs(collection(db, "jobs"));
    pendingJobsContainer.innerHTML = "";
    approvedJobsContainer.innerHTML = "";

    jobsSnapshot.forEach((doc) => {
      const job = doc.data();
      const div = document.createElement("div");
      div.classList.add("job-card");
      div.innerHTML = `<h3>${job.title}</h3><p>${job.description}</p>`;

      if (job.status === "pending") {
        pendingJobsContainer.appendChild(div);
      } else if (job.status === "approved") {
        approvedJobsContainer.appendChild(div);
      }
    });

    if (!pendingJobsContainer.hasChildNodes()) pendingJobsContainer.innerHTML = "<p>No pending jobs.</p>";
    if (!approvedJobsContainer.hasChildNodes()) approvedJobsContainer.innerHTML = "<p>No approved jobs.</p>";

  } catch (err) {
    console.error(err);
    pendingJobsContainer.innerHTML = "<p>Error loading jobs.</p>";
    approvedJobsContainer.innerHTML = "<p>Error loading jobs.</p>";
  }
}

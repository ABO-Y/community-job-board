// js/jobs.js
import { db } from "./firebase-init.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const jobsContainer = document.getElementById("jobs-container");
const searchBtn = document.getElementById("search-btn");
const keywordInput = document.getElementById("keyword");
const categorySelect = document.getElementById("category");

async function loadJobs(keyword = "", category = "") {
  jobsContainer.innerHTML = "";
  const jobsCol = collection(db, "jobs");

  let q;
  if (category) {
    q = query(jobsCol, where("category", "==", category));
  } else {
    q = jobsCol;
  }

  const snapshot = await getDocs(q);
  const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  let filteredJobs = jobs;
  if (keyword) {
    filteredJobs = jobs.filter(job =>
      job.title.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  if (filteredJobs.length === 0) {
    jobsContainer.innerHTML = "<p>No jobs found.</p>";
    return;
  }

  filteredJobs.forEach(job => {
    const jobEl = document.createElement("div");
    jobEl.className = "job-card";
    jobEl.innerHTML = `
      <h3>${job.title}</h3>
      <p>${job.company || ""}</p>
      <a href="job-details.html?id=${job.id}" class="btn">View Details</a>
    `;
    jobsContainer.appendChild(jobEl);
  });
}

searchBtn.addEventListener("click", () => {
  const keyword = keywordInput.value.trim();
  const category = categorySelect.value;
  loadJobs(keyword, category);
});

// Load all jobs initially
loadJobs();

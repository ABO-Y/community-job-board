// js/applications.js
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const applicationsList = document.getElementById("applications-list");
const searchInput = document.getElementById("searchInput");
const jobFilter = document.getElementById("jobFilter");

// Ensure user is logged in
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
  else loadApplications();
});

async function loadApplications() {
  applicationsList.innerHTML = "<p>Loading applications...</p>";

  try {
    const appsSnapshot = await getDocs(collection(db, "applications"));
    const apps = appsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (apps.length === 0) {
      applicationsList.innerHTML = "<p>No applications found.</p>";
      return;
    }

    displayApplications(apps);

    // Filter functionality
    searchInput.addEventListener("input", () => filterApps(apps));
    jobFilter.addEventListener("change", () => filterApps(apps));

    // Populate job filter dynamically
    const jobs = [...new Set(apps.map(a => a.jobTitle))];
    jobs.forEach(job => {
      const option = document.createElement("option");
      option.value = job;
      option.textContent = job;
      jobFilter.appendChild(option);
    });

  } catch (err) {
    console.error(err);
    applicationsList.innerHTML = "<p>Error loading applications.</p>";
  }
}

function displayApplications(apps) {
  applicationsList.innerHTML = "";
  apps.forEach(app => {
    const div = document.createElement("div");
    div.classList.add("application-card");
    div.innerHTML = `
      <h3>${app.name}</h3>
      <p><strong>Email:</strong> ${app.email}</p>
      <p><strong>Job:</strong> ${app.jobTitle}</p>
      <p><strong>Message:</strong> ${app.message}</p>
    `;
    applicationsList.appendChild(div);
  });
}

function filterApps(apps) {
  const keyword = searchInput.value.toLowerCase();
  const job = jobFilter.value;

  const filtered = apps.filter(app => {
    const matchesKeyword = app.name.toLowerCase().includes(keyword) || app.email.toLowerCase().includes(keyword);
    const matchesJob = job === "" || app.jobTitle === job;
    return matchesKeyword && matchesJob;
  });

  displayApplications(filtered);
}

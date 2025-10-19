// job-details.js

// === Fetch Job ID from URL ===
const urlParams = new URLSearchParams(window.location.search);
const jobId = parseInt(urlParams.get("id"), 10);

// === DOM Elements ===
const jobDetailsSection = document.getElementById("job-details");
const form = document.getElementById("application-form");
const appSection = document.getElementById("application-section");

// === Load Jobs ===
const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
const job = jobs[jobId];

// === Display Job Details ===
function displayJobDetails() {
  if (!job) {
    jobDetailsSection.innerHTML = `<p>❌ Job not found or has been removed.</p>`;
    if (appSection) appSection.style.display = "none";
    return;
  }

  jobDetailsSection.innerHTML = `
    <div class="job-card details">
      <h2>${job.title}</h2>
      <p><strong>Category:</strong> ${job.category}</p>
      <p><strong>Location:</strong> ${job.location}</p>
      <p><strong>Type:</strong> ${job.type || "Not specified"}</p>
      <p><strong>Posted by:</strong> ${job.employer || "Anonymous"}</p>
      <p><strong>Date Posted:</strong> ${job.date || "Unknown"}</p>
      <p><strong>Description:</strong></p>
      <p>${job.description}</p>
    </div>
  `;
}


// === Handle Application Submission ===
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    // Basic Validation
    const name = document.getElementById("applicant-name").value.trim();
    const email = document.getElementById("applicant-email").value.trim();
    const message = document.getElementById("applicant-message").value.trim();

    if (!name || !email || !message) {
      alert("⚠️ Please fill in all fields before submitting.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      alert("⚠️ Please enter a valid email address.");
      return;
    }

    if (!job) {
      alert("⚠️ Job no longer exists.");
      return;
    }

    const applications = JSON.parse(localStorage.getItem("applications")) || [];

    const newApp = {
      id: Date.now(), // Unique ID for tracking
      jobId,
      jobTitle: job.title,
      name,
      email,
      message,
      date: new Date().toLocaleString(),
    };

    applications.push(newApp);
    localStorage.setItem("applications", JSON.stringify(applications));

    alert("✅ Application submitted successfully!");
    form.reset();
  });
}


// === Initialize ===
window.addEventListener("load", displayJobDetails);

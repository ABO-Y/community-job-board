// dashboard.js

// === DOM Elements ===
const jobForm = document.getElementById("postJobForm");
const jobContainer = document.getElementById("job-container");

// === Utility Functions ===
function getJobs() {
  return JSON.parse(localStorage.getItem("jobs")) || [];
}

function saveJobs(jobs) {
  localStorage.setItem("jobs", JSON.stringify(jobs));
}

function showAlert(message, type = "info") {
  // Simple alert wrapper (replace later with styled notification if needed)
  alert(message);
}


// === Display Jobs ===
function displayJobs(jobs = getJobs()) {
  if (!jobContainer) return;
  jobContainer.innerHTML = "";

  if (jobs.length === 0) {
    jobContainer.innerHTML = "<p>No jobs posted yet.</p>";
    return;
  }

  jobs.forEach((job, index) => {
    const card = document.createElement("div");
    card.classList.add("job-card");

    card.innerHTML = `
      <h3>${job.title}</h3>
      <p><strong>Category:</strong> ${job.category}</p>
      <p><strong>Location:</strong> ${job.location}</p>
      <p>${job.description}</p>
      <div class="job-actions">
        <button class="edit-btn" data-index="${index}">✏️ Edit</button>
        <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
      </div>
    `;

    jobContainer.appendChild(card);
  });

  // Attach event listeners for dynamic buttons
  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", e => deleteJob(e.target.dataset.index))
  );

  document.querySelectorAll(".edit-btn").forEach(btn =>
    btn.addEventListener("click", e => editJob(e.target.dataset.index))
  );
}


// === Post New Job ===
if (jobForm) {
  jobForm.addEventListener("submit", e => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const location = document.getElementById("location").value.trim();
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();

    // Validation
    if (!title || !location || !category || !description) {
      showAlert("Please fill in all fields.", "warning");
      return;
    }

    const jobs = getJobs();
    jobs.push({
      title,
      location,
      category,
      description,
      date: new Date().toLocaleDateString(),
    });

    saveJobs(jobs);
    showAlert("✅ Job posted successfully!", "success");

    jobForm.reset();
    displayJobs(jobs);
  });
}


// === Delete Job ===
function deleteJob(index) {
  const jobs = getJobs();
  const job = jobs[index];

  if (!confirm(`Are you sure you want to delete "${job.title}"?`)) return;

  jobs.splice(index, 1);
  saveJobs(jobs);
  displayJobs(jobs);
  showAlert("🗑️ Job deleted successfully!", "info");
}


// === Edit Job ===
function editJob(index) {
  const jobs = getJobs();
  const job = jobs[index];

  if (!jobForm) return;

  document.getElementById("title").value = job.title;
  document.getElementById("location").value = job.location;
  document.getElementById("category").value = job.category;
  document.getElementById("description").value = job.description;

  // Remove job temporarily to avoid duplication on save
  jobs.splice(index, 1);
  saveJobs(jobs);

  showAlert("✏️ Edit the job details and click 'Post Job' to save changes.", "info");
  displayJobs(jobs);
}


// === On Page Load ===
window.addEventListener("load", () => {
  displayJobs();
});

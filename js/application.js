// applications.js
document.getElementById("applyForm").addEventListener("submit", e => {
  e.preventDefault();
  const application = {
    jobId: selectedJobId,
    userId: auth.currentUser.uid,
    coverLetter: coverLetter.value,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection("applications").add(application)
    .then(() => alert("Application submitted!"))
    .catch(err => alert(err.message));
});


// Group applications by job title
const grouped = {};
applications.forEach(app => {
  if (!grouped[app.jobTitle]) grouped[app.jobTitle] = [];
  grouped[app.jobTitle].push(app);
});

// Populate dropdown filter
Object.keys(grouped).forEach(jobTitle => {// applications.js

// === Submit Application Form ===
const applyForm = document.getElementById("applyForm");
const coverLetter = document.getElementById("coverLetter");

applyForm?.addEventListener("submit", async e => {
  e.preventDefault();

  try {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in to apply.");

    const application = {
      jobId: selectedJobId,
      userId: user.uid,
      coverLetter: coverLetter.value.trim(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("applications").add(application);

    alert("✅ Application submitted successfully!");
    applyForm.reset();
  } catch (err) {
    console.error("Application submission error:", err);
    alert(`❌ Failed to submit application: ${err.message}`);
  }
});


// === Group Applications by Job Title ===
function groupByJobTitle(applications) {
  return applications.reduce((acc, app) => {
    if (!acc[app.jobTitle]) acc[app.jobTitle] = [];
    acc[app.jobTitle].push(app);
    return acc;
  }, {});
}


// === Populate Dropdown Filter ===
function populateJobFilter(grouped) {
  jobFilter.innerHTML = '<option value="">All Jobs</option>';

  Object.keys(grouped).forEach(jobTitle => {
    const option = document.createElement("option");
    option.value = jobTitle;
    option.textContent = jobTitle;
    jobFilter.appendChild(option);
  });
}


// === Render Applications ===
function renderApplications(filterJob = "", searchTerm = "") {
  applicationsList.innerHTML = "";

  if (!applications || applications.length === 0) {
    applicationsList.innerHTML = "<p>No applications received yet.</p>";
    return;
  }

  const grouped = groupByJobTitle(applications);
  let output = "";

  for (const jobTitle in grouped) {
    if (filterJob && jobTitle !== filterJob) continue;

    const filteredApps = grouped[jobTitle].filter(app =>
      app.name.toLowerCase().includes(searchTerm) ||
      app.email.toLowerCase().includes(searchTerm)
    );

    if (filteredApps.length === 0) continue;

    const cards = filteredApps.map(app => `
      <div class="application-card">
        <p><strong>Name:</strong> ${app.name}</p>
        <p><strong>Email:</strong> ${app.email}</p>
        <p><strong>Date:</strong> ${app.date || "N/A"}</p>
        <p><strong>Message:</strong><br>${app.message || "(No message provided)"}</p>
      </div>
    `).join("");

    output += `
      <div class="application-group">
        <h3>${jobTitle}</h3>
        ${cards}
      </div>
    `;
  }

  applicationsList.innerHTML = output || "<p>No matching applications found.</p>";
}


// === Filter Event Listeners ===
jobFilter.addEventListener("change", () => {
  renderApplications(jobFilter.value, searchInput.value.toLowerCase());
});

searchInput.addEventListener("input", () => {
  renderApplications(jobFilter.value, searchInput.value.toLowerCase());
});


// === Initial Setup ===
if (Array.isArray(applications) && applications.length > 0) {
  const grouped = groupByJobTitle(applications);
  populateJobFilter(grouped);
  renderApplications();
} else {
  applicationsList.innerHTML = "<p>Loading or no applications yet...</p>";
}

  const option = document.createElement("option");
  option.value = jobTitle;
  option.textContent = jobTitle;
  jobFilter.appendChild(option);
});

// Function to render applications
function renderApplications(filterJob = "", searchTerm = "") {
  if (applications.length === 0) {
    applicationsList.innerHTML = "<p>No applications received yet.</p>";
    return;
  }

  let output = "";

  for (const jobTitle in grouped) {
    // Skip if filtered by job title and this doesn’t match
    if (filterJob && jobTitle !== filterJob) continue;

    // Filter applicants by search
    const filteredApps = grouped[jobTitle].filter(app =>
      app.name.toLowerCase().includes(searchTerm) ||
      app.email.toLowerCase().includes(searchTerm)
    );

    if (filteredApps.length === 0) continue;

    output += `
      <div class="application-group">
        <h3>${jobTitle}</h3>
        ${filteredApps.map(app => `
          <div class="application-card">
            <p><strong>Name:</strong> ${app.name}</p>
            <p><strong>Email:</strong> ${app.email}</p>
            <p><strong>Date:</strong> ${app.date}</p>
            <p><strong>Message:</strong><br>${app.message}</p>
          </div>
        `).join("")}
      </div>
    `;
  }

  applicationsList.innerHTML = output || "<p>No matching applications found.</p>";
}

// Event listeners for filters
jobFilter.addEventListener("change", () => {
  renderApplications(jobFilter.value, searchInput.value.toLowerCase());
});

searchInput.addEventListener("input", () => {
  renderApplications(jobFilter.value, searchInput.value.toLowerCase());
});

// Initial render
renderApplications();

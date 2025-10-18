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
Object.keys(grouped).forEach(jobTitle => {
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

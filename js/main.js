// main.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Community Job Board frontend initialized.");

  // 🔹 Reusable function to fetch job listings
  async function fetchJobs() {
    const jobsEndpoint = "/api/jobs"; // adjust once backend route is confirmed
    try {
      const response = await fetch(jobsEndpoint);

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const jobs = await response.json();
      console.log("🧩 Jobs fetched successfully:", jobs);

      // Optional: display them on the page
      if (Array.isArray(jobs) && jobs.length > 0) {
        renderJobs(jobs);
      } else {
        console.warn("⚠️ No jobs available to display.");
      }

    } catch (error) {
      console.error("❌ Error fetching jobs:", error.message);
      showError("Unable to load job listings. Please try again later.");
    }
  }

  // 🔹 Example render function (can be replaced with real UI logic)
  function renderJobs(jobs) {
    const container = document.getElementById("job-list");
    if (!container) return;

    container.innerHTML = jobs.map(job => `
      <div class="job-card">
        <h3>${job.title}</h3>
        <p>${job.category} — ${job.location}</p>
        <p>${job.description || "No description provided."}</p>
      </div>
    `).join("");
  }

  // 🔹 Show user-friendly error message
  function showError(message) {
    const container = document.getElementById("job-list");
    if (container) container.innerHTML = `<p class="error">${message}</p>`;
  }

  // Uncomment this when backend is connected
  // fetchJobs();
});

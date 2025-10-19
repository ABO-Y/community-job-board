// === Job Data ===
const jobs = [
  { title: "Web Developer", category: "IT", location: "Windhoek" },
  { title: "Teacher", category: "Education", location: "Katutura" },
  { title: "Shop Assistant", category: "Retail", location: "Swakopmund" },
  { title: "Nurse", category: "Health", location: "Walvis Bay" },
];


// === Display Jobs ===
function displayJobs(list) {
  const container = document.getElementById("job-list");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p>No jobs found matching your search.</p>`;
    return;
  }

  list.forEach(job => {
    const card = document.createElement("div");
    card.classList.add("job-card");
    card.innerHTML = `
      <h3>${job.title}</h3>
      <p><strong>Category:</strong> ${job.category}</p>
      <p><strong>Location:</strong> ${job.location}</p>
    `;
    container.appendChild(card);
  });
}


// === Filter Jobs ===
function filterJobs() {
  const keyword = document.getElementById("keyword").value.toLowerCase().trim();
  const category = document.getElementById("category").value;

  const filtered = jobs.filter(j => {
    const matchesKeyword =
      j.title.toLowerCase().includes(keyword) ||
      j.location.toLowerCase().includes(keyword);

    const matchesCategory = !category || j.category === category;

    return matchesKeyword && matchesCategory;
  });

  displayJobs(filtered);
}


// === Event Listeners ===
document.getElementById("search-btn").addEventListener("click", filterJobs);

// Allow real-time filtering as user types
document.getElementById("keyword").addEventListener("input", filterJobs);

// Optional: reset button
const resetBtn = document.getElementById("reset-btn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    document.getElementById("keyword").value = "";
    document.getElementById("category").value = "";
    displayJobs(jobs);
  });
}


// === Initial Display ===
displayJobs(jobs);

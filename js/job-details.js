// js/job-details.js
import { db, auth } from "./firebase-init.js";
import { collection, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const form = document.getElementById("application-form");
const status = document.getElementById("application-status");

// Load job details dynamically based on URL param ?id=
async function loadJob() {
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("id");
  if (!jobId) return;

  const jobDoc = await getDoc(doc(db, "jobs", jobId));
  const job = jobDoc.data();
  if (!job) {
    document.getElementById("job-details-content").textContent = "Job not found.";
    return;
  }

  document.getElementById("job-details-content").innerHTML = `
    <h3>${job.title}</h3>
    <p>${job.description}</p>
    <p><strong>Category:</strong> ${job.category}</p>
  `;
}

// Submit application
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("id");
  if (!jobId) return;

  const name = form["name"].value.trim();
  const email = form["email"].value.trim();
  const message = form["message"].value.trim();

  if (!name || !email || !message) {
    status.textContent = "Please fill in all fields.";
    status.hidden = false;
    return;
  }

  try {
    await addDoc(collection(db, "applications"), {
      jobId,
      jobTitle: document.querySelector("#job-details-content h3").textContent,
      name,
      email,
      message,
      appliedAt: new Date()
    });
    status.textContent = "Application submitted!";
    status.hidden = false;
    form.reset();
  } catch (err) {
    console.error(err);
    status.textContent = "Error submitting application.";
    status.hidden = false;
  }
});

window.addEventListener("DOMContentLoaded", loadJob);

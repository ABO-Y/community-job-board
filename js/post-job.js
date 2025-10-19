// js/post-job.js
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const postForm = document.getElementById("post-job-form");
const status = document.getElementById("post-job-status");
const submitBtn = postForm?.querySelector('button[type="submit"]');

// Set up status element for accessibility
if (status) {
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
}

function showStatus(message, type = "info") {
  if (!status) return;
  status.textContent = message;
  status.className = `post-job-status ${type}`;
  status.hidden = false;
}

function clearStatus() {
  if (!status) return;
  status.textContent = "";
  status.className = "";
  status.hidden = true;
}

function setLoading(isLoading) {
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Posting..." : "Post Job";
  }
  Array.from(postForm.elements).forEach(el => {
    if (el.type !== "submit") el.disabled = isLoading;
  });
}

// Ensure user is logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  
  // Enable form once we confirm user is logged in
  if (postForm) postForm.hidden = false;
});

postForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearStatus();

  const title = postForm["title"].value.trim();
  const description = postForm["description"].value.trim();
  const category = postForm["category"].value;
  const salary = postForm["salary"]?.value?.trim() || "";
  const location = postForm["location"]?.value?.trim() || "";

  // Validation
  if (!title) {
    showStatus("Please enter a job title", "error");
    postForm["title"].focus();
    return;
  }
  if (title.length < 5 || title.length > 100) {
    showStatus("Job title must be between 5 and 100 characters", "error");
    postForm["title"].focus();
    return;
  }
  if (!description) {
    showStatus("Please enter a job description", "error");
    postForm["description"].focus();
    return;
  }
  if (description.length < 50) {
    showStatus("Job description must be at least 50 characters", "error");
    postForm["description"].focus();
    return;
  }
  if (!category) {
    showStatus("Please select a job category", "error");
    postForm["category"].focus();
    return;
  }

  setLoading(true);
  showStatus("Posting job...");

  try {
    // Get current user
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in to post jobs");

    const jobData = {
      title,
      description,
      category,
      salary,
      location,
      status: "pending",
      postedBy: user.uid,
      postedByEmail: user.email,
      postedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "jobs"), jobData);

    showStatus("Job posted successfully! Awaiting approval.", "success");
    postForm.reset();

    // Redirect to job details after short delay
    setTimeout(() => {
      window.location.href = `job-details.html?id=${docRef.id}`;
    }, 1500);

  } catch (err) {
    console.error("Error posting job:", err);
    showStatus(
      err.code === "permission-denied" 
        ? "You don't have permission to post jobs" 
        : "Error posting job. Please try again.",
      "error"
    );
  } finally {
    setLoading(false);
  }
});

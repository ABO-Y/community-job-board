// js/post-job.js
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const postForm = document.getElementById("post-job-form");
const status = document.getElementById("post-job-status");

// Ensure user is logged in
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
});

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = postForm["title"].value.trim();
  const description = postForm["description"].value.trim();
  const category = postForm["category"].value;

  if (!title || !description || !category) {
    status.textContent = "Please fill in all fields.";
    status.hidden = false;
    return;
  }

  try {
    await addDoc(collection(db, "jobs"), {
      title,
      description,
      category,
      status: "pending",
      postedAt: new Date()
    });

    status.textContent = "Job posted successfully! Awaiting approval.";
    status.hidden = false;
    postForm.reset();

  } catch (err) {
    console.error(err);
    status.textContent = "Error posting job.";
    status.hidden = false;
  }
});

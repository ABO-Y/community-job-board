// js/login.js
import { auth } from "./firebase-init.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const loginForm = document.getElementById("login-form");
const status = document.getElementById("login-status");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm["email"].value.trim();
  const password = loginForm["password"].value;

  if (!email || !password) {
    status.textContent = "Please enter email and password.";
    status.hidden = false;
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    status.textContent = "Login successful! Redirecting...";
    status.hidden = false;
    setTimeout(() => {
      window.location.href = "dashboard.html"; // redirect to dashboard after login
    }, 1000);
  } catch (err) {
    console.error(err);
    status.textContent = "Invalid email or password.";
    status.hidden = false;
  }
});

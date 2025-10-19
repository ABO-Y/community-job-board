import { auth } from "./firebase-init.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

// DOM Elements
const elements = {
  loginForm: document.getElementById("login-form"),
  statusEl: document.getElementById("login-status"),
  submitBtn: document.querySelector("#login-form button[type='submit']"),
  togglePassword: document.querySelector(".toggle-password"),
  passwordInput: document.getElementById("password"),
  rememberMe: document.getElementById("remember")
};

// Helper Functions
function setLoading(isLoading) {
  if (elements.submitBtn) {
    elements.submitBtn.disabled = isLoading;
    elements.submitBtn.textContent = isLoading ? "Signing in..." : "Sign In";
  }
}

function showStatus(message, type = 'error') {
  if (elements.statusEl) {
    elements.statusEl.textContent = message;
    elements.statusEl.className = `alert alert-${type}`;
    elements.statusEl.hidden = false;
  }
}

// Toggle password visibility
if (elements.togglePassword && elements.passwordInput) {
  elements.togglePassword.addEventListener("click", () => {
    const type = elements.passwordInput.type === "password" ? "text" : "password";
    elements.passwordInput.type = type;
    elements.togglePassword.setAttribute("aria-label", 
      `${type === "password" ? "Show" : "Hide"} password`);
  });
}

// Handle login form submission
if (elements.loginForm) {
  // Check for remembered email
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail) {
    elements.loginForm.email.value = savedEmail;
    elements.rememberMe.checked = true;
  }

  elements.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setLoading(true);
    elements.statusEl.hidden = true;
    
    try {
      const email = elements.loginForm.email.value.trim();
      const password = elements.loginForm.password.value;

      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      await signInWithEmailAndPassword(auth, email, password);

      // Handle remember me
      if (elements.rememberMe?.checked) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      showStatus("Login successful! Redirecting...", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);

    } catch (error) {
      console.error("Login error:", error);
      let message = "Login failed. Please try again.";
      
      // Provide user-friendly error messages
      if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please try again later.";
      }
      
      showStatus(message);
    } finally {
      setLoading(false);
    }
  });
}

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});
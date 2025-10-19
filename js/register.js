// js/register.js
import { auth, db } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

/**
 * Elements
 */
const registerForm = document.getElementById("register-form");
const statusEl = document.getElementById("register-status");

if (!registerForm) {
  console.warn("register-form not found on the page.");
} else {
  // ensure status element is a polite live region for screen readers
  if (statusEl) {
    statusEl.setAttribute("role", "status");
    statusEl.setAttribute("aria-live", "polite");
  }

  const submitBtn = registerForm.querySelector('button[type="submit"]') || null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showStatus(message, opts = {}) {
    if (!statusEl) return;
    const { type = "info" } = opts;
    statusEl.textContent = message;
    statusEl.hidden = false;
    statusEl.className = `register-status ${type}`; // allow styling via CSS (.register-status.success/.error)
  }

  function clearStatus() {
    if (!statusEl) return;
    statusEl.textContent = "";
    statusEl.hidden = true;
    statusEl.className = "";
  }

  function setBusy(isBusy) {
    if (submitBtn) {
      submitBtn.disabled = isBusy;
      submitBtn.textContent = isBusy ? "Registering…" : "Register";
    }
    // optionally disable fields while busy
    Array.from(registerForm.elements).forEach((el) => {
      if (el.type !== "submit") el.disabled = isBusy;
    });
  }

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();

    const name = (registerForm["name"]?.value || "").trim();
    const email = (registerForm["email"]?.value || "").trim();
    const password = registerForm["password"]?.value || "";

    // Simple client-side validation
    if (!name) {
      showStatus("Please enter your full name.", { type: "error" });
      registerForm["name"]?.focus();
      return;
    }
    if (!email || !emailRegex.test(email)) {
      showStatus("Please enter a valid email address.", { type: "error" });
      registerForm["email"]?.focus();
      return;
    }
    if (!password || password.length < 8) {
      showStatus("Password must be at least 8 characters.", { type: "error" });
      registerForm["password"]?.focus();
      return;
    }

    setBusy(true);
    showStatus("Creating account, please wait...");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update auth profile with display name
      try {
        await updateProfile(user, { displayName: name });
      } catch (profileErr) {
        // non-fatal; continue even if profile update fails
        console.warn("updateProfile failed:", profileErr);
      }

      // Save basic profile to Firestore
      try {
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          createdAt: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn("Failed saving user profile to Firestore:", dbErr);
        // continue — user account exists in Auth even if Firestore write failed
      }

      showStatus("Registration successful! Redirecting to login...", { type: "success" });

      // Short delay to show success message, then redirect to login page in same folder
      setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
    } catch (err) {
      console.error("Registration error:", err);
      // Map common Firebase Auth error codes to friendly messages
      const code = err?.code || "";
      let msg = err?.message || "Registration failed. Try again.";

      if (code === "auth/email-already-in-use") {
        msg = "This email is already registered. Try logging in.";
      } else if (code === "auth/invalid-email") {
        msg = "Invalid email address.";
      } else if (code === "auth/weak-password") {
        msg = "Password is too weak. Use at least 8 characters.";
      } else if (code === "auth/network-request-failed") {
        msg = "Network error. Check your connection and try again.";
      }

      showStatus(msg, { type: "error" });
    } finally {
      setBusy(false);
    }
  });
}

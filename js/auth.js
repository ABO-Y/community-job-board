// auth.js
import { auth, db } from "./firebase-init.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const elements = {
  registerForm: document.getElementById("registerForm"),
  loginForm: document.getElementById("loginForm"),
  statusMessage: document.getElementById("status-message")
};

function showStatus(message, type = "info") {
  if (!elements.statusMessage) return;
  
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = `alert alert-${type}`;
  elements.statusMessage.hidden = false;
  
  // Accessibility
  elements.statusMessage.setAttribute("role", "alert");
  elements.statusMessage.setAttribute("aria-live", "polite");
}

function setLoading(form, isLoading) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Please wait..." : 
      (form.id === "registerForm" ? "Register" : "Login");
  }
  
  Array.from(form.elements).forEach(el => {
    if (el.type !== "submit") el.disabled = isLoading;
  });
}

// Registration
if (elements.registerForm) {
  elements.registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get("name")?.trim();
    const email = formData.get("email")?.trim().toLowerCase();
    const password = formData.get("password")?.trim();

    // Validation
    if (!name || !email || !password) {
      showStatus("Please fill in all fields", "error");
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      showStatus("Please enter a valid email address", "error");
      return;
    }

    if (password.length < 8) {
      showStatus("Password must be at least 8 characters", "error");
      return;
    }

    setLoading(elements.registerForm, true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: name
      });

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role: "user",
        createdAt: new Date().toISOString()
      });

      showStatus("Registration successful! Redirecting...", "success");
      
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);

    } catch (error) {
      console.error("Registration error:", error);
      let message = "Registration failed. Please try again.";
      
      if (error.code === "auth/email-already-in-use") {
        message = "This email is already registered. Try logging in.";
      }
      
      showStatus(message, "error");
    } finally {
      setLoading(elements.registerForm, false);
    }
  });
}

// Login
if (elements.loginForm) {
  elements.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get("email")?.trim().toLowerCase();
    const password = formData.get("password")?.trim();

    if (!email || !password) {
      showStatus("Please enter both email and password", "error");
      return;
    }

    setLoading(elements.loginForm, true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      showStatus("Login successful! Redirecting...", "success");
      
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);

    } catch (error) {
      console.error("Login error:", error);
      let message = "Login failed. Please check your credentials.";
      
      if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password.";
      }
      
      showStatus(message, "error");
    } finally {
      setLoading(elements.loginForm, false);
    }
  });
}

// Export logout function for use in other files
export async function logout() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
    showStatus("Failed to log out. Please try again.", "error");
  }
}

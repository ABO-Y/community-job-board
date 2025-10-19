// register.js

// --- DOM Elements ---
const registerForm = document.getElementById("registerForm");
const emailInput = document.getElementById("signupEmail");
const passwordInput = document.getElementById("signupPassword");
const roleInput = document.getElementById("role"); // optional dropdown: user/admin

// --- Helper Function for Alerts ---
function showAlert(message) {
  alert(message); // Replace with custom modal if desired
}

// --- Register Form Submit Handler ---
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const role = roleInput.value || "user";

    // --- Basic Validation ---
    if (!email || !password) {
      showAlert("⚠️ Please fill in all fields.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      showAlert("⚠️ Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      showAlert("⚠️ Password must be at least 6 characters long.");
      return;
    }

    try {
      // --- Create User in Firebase Auth ---
      const userCred = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCred.user;

      // --- Save User in Firestore ---
      await db.collection("users").doc(user.uid).set({
        email: user.email,
        role: role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showAlert("✅ Registration successful!");

      // --- Role-Based Redirect ---
      if (role === "admin") {
        window.location.href = "admin-dashboard.html";
      } else {
        window.location.href = "dashboard.html";
      }

    } catch (error) {
      console.error("❌ Registration error:", error.message);
      showAlert(error.message);
    }
  });
}

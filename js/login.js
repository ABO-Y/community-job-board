document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    // Firebase Authentication
    await auth.signInWithEmailAndPassword(email, password);
    // Redirect on success
    window.location.href = "dashboard.html";
  } catch (error) {
    // Show friendly message
    alert("Login failed: " + error.message);
  }
});

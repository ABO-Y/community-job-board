// auth.js

// === Helper Functions ===
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function showAlert(message, type = "info") {
  // Simple alert wrapper (can be styled later)
  alert(message);
}


// === Registration ===
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    // Basic validation
    if (!name || !email || !password) {
      showAlert("Please fill in all fields.", "warning");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      showAlert("Please enter a valid email address.", "warning");
      return;
    }

    if (password.length < 6) {
      showAlert("Password must be at least 6 characters long.", "warning");
      return;
    }

    const users = getUsers();
    const userExists = users.some(u => u.email === email);

    if (userExists) {
      showAlert("Email already registered!", "error");
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    saveUsers(users);

    showAlert("✅ Registration successful! You can now log in.", "success");
    registerForm.reset();
    setTimeout(() => (window.location.href = "login.html"), 500);
  });
}


// === Login ===
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      showAlert("Please fill in all fields.", "warning");
      return;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      showAlert("Invalid email or password!", "error");
      return;
    }

    setCurrentUser(user);
    showAlert(`👋 Welcome, ${user.name}!`, "success");

    setTimeout(() => (window.location.href = "dashboard.html"), 500);
  });
}


// === Logout Helper (Optional) ===
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

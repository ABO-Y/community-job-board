document.getElementById("loginForm").addEventListener("submit", e => {
    e.preventDefault();
    const email = loginEmail.value;
    const password = loginPassword.value;
  
    auth.signInWithEmailAndPassword(email, password)
      .then(() => window.location.href = "dashboard.html")
      .catch(err => alert(err.message));
  });
  
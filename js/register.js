// js/register.js
import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const registerForm = document.getElementById("register-form");
const status = document.getElementById("register-status");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = registerForm["name"].value.trim();
  const email = registerForm["email"].value.trim();
  const password = registerForm["password"].value;

  if (!name || !email || !password) {
    status.textContent = "Please fill in all fields.";
    status.hidden = false;
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save additional info to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      createdAt: new Date()
    });

    status.textContent = "Registration successful! Redirecting to login...";
    status.hidden = false;
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

  } catch (err) {
    console.error(err);
    status.textContent = err.message;
    status.hidden = false;
  }
});

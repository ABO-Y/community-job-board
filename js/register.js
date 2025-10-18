auth.createUserWithEmailAndPassword(email, password)
  .then(userCred => {
    return db.collection("users").doc(userCred.user.uid).set({
      email,
      role: "user"
    });
  });

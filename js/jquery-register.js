//jquery-register.js
function registerUser(email, password) {
    const deferred = $.Deferred();

    auth.createUserWithEmailAndPassword(email, password)
    .then(function(userCred) {
        return db.collection("users").doc(userCred.user.uid).set({
            email: email,
            role: "user",
            createdAt: new Date()
        });
    })

    .then(function(){
        deferred.resolve("User registered succesfully.");

    })
    .catch(function(error){
        deferred.reject(error.message);
    });

return deferred.promise();
}

//Usage
registerUser(email, password)
    .done(function(message) {
        console.log("Success:", message);
        //Show success message
        window.location.href = 'dashboard.html';
    })
    .fail(function(error) {
        console.error("Error:, error");
        //Shows error to user
        alert("Registration failed:" + error);
    });
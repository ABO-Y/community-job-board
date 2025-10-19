//jquery-login.js
function registerUserWithJQuery(email, password) {
    const deferred = $.Deferred();

    auth.createUserWithEmailAndPassword(email, password)
    .then(function(userCred) {
        return db.collection("users").doc(userCred.user.uid).set({
            email: email,
            role: "user"
        });
    })

    .then(function(){
        deferred.resolve("User registered succesfully");

    })

    .catch(function(error){
        deferred.reject(error.message);
    });

    return deferred.promise();

    //Usage
    registerUserWithJQuery(email, password)
    .done(function(message){
        console.log("Success:", message);
    })
    .fail(function(error){
        console.error("Error:", error);
    })

}


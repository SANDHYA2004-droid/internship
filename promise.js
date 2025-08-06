let myPromise = new Promise((resolve, reject) => {
    let success = true; 
    if (success) {
        resolve("Promise fulfilled!");
    } else {
        reject("Promise rejected!");
    }
});

myPromise
    .then((message) => {
        console.log("Success: " + message);
    })
    .catch((error) => {
        console.log("Error: " + error);
    });

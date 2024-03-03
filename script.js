const firebaseConfig = {
    apiKey: "AIzaSyCbI-IcXlzk4vMWYNDktr5HJdNO2JSZuWI",
    authDomain: "project-no1-59dff.firebaseapp.com",
    projectId: "project-no1-59dff",
    storageBucket: "project-no1-59dff.appspot.com",
    messagingSenderId: "942816467392",
    appId: "1:942816467392:web:17e5eb37cb1ec3b06ed025",
    measurementId: "G-QJQD9Q8XB2"
  };


const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(app);
const db = firebase.firestore(app);

function addJournalEntry() {
    const entryText = document.getElementById("journal-entry").value;
    const user = firebase.auth().currentUser;
    const today = new Date().toISOString().slice(0, 10);

    if (user && entryText.trim() !== "") {
        db.collection("journalEntries")
            .where("userId", "==", user.uid)
            .where("date", "==", today)
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {

                    db.collection("journalEntries").add({
                        text: entryText,
                        userId: user.uid,
                        date: today,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        console.log("Entry added successfully");
                        document.getElementById("journal-entry").value = ""; // Clear the textarea
                        displayJournalEntries(); // Refresh the entries display
                    }).catch((error) => {
                        console.error("Error adding entry: ", error);
                    });

                } else {
                    alert("You have already written a journal entry for today.");
                }
            });
    } else {
        alert("Please sign in and write something in your journal.");
    }
}

function displayJournalEntries() {
    const user = firebase.auth().currentUser;
    const entriesContainer = document.getElementById("journal-entries");
    entriesContainer.innerHTML = ""; // Clear previous entries

    if (user) {
        db.collection("journalEntries")
            .where("userId", "==", user.uid)
            .orderBy("date", "desc")
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const entry = doc.data();
                    const entryElement = document.createElement("div");
                    entryElement.classList.add("journal-entry");
                    entryElement.innerHTML = `<strong>${entry.date}:</strong> ${entry.text}`;
                    entriesContainer.appendChild(entryElement);
                });
            }).catch((error) => {
                console.error("Error getting entries: ", error);
            });
    }
}

function logout() {
    firebase.auth().signOut().then(() => {
        console.log("User signed out");
    }).catch((error) => {
        console.error("Error signing out: ", error);
    });
}

var uiConfig = {
    signInSuccessUrl: '/',
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            return false; // Avoid redirects after sign-in
        }
    }
};



// Initialize the FirebaseUI Widget
var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start('#firebaseui-auth-container', uiConfig);

// Listen for auth state changes
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        document.getElementById("journal-app").style.display = "block";
        displayJournalEntries();
    } else {
        document.getElementById("journal-app").style.display = "none";
    }
});

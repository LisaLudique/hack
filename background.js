// Background logic once purchase has been made. Update database.


// Initialize Firebase
  var config = {
    apiKey: "AIzaSyCEVBQEHtw6q0VZV8-G0jbOTfAuresxXmI",
    authDomain: "heartofgold-2496d.firebaseapp.com",
    databaseURL: "https://heartofgold-2496d.firebaseio.com",
    projectId: "heartofgold-2496d",
    storageBucket: "heartofgold-2496d.appspot.com",
    messagingSenderId: "536324270949"
  };
  firebase.initializeApp(config);

  var database = firebase.database
  //  create a function that fire; in the background; will only be loaded once s

function initApp() {
  // Listen for auth state changes.
  firebase.auth().onAuthStateChanged(function(user) {
    console.log('User state change detected from the Background script of the Chrome Extension:', user);
  });
}

window.onload = function() {
  initApp();
};

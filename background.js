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

  //  create a function that fire; in the background; will only be loaded once s
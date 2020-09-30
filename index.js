// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

var rsvpListener = null;
var guestbookListener = null;

async function main() {

  // Add Firebase project configuration object here
  var firebaseConfig = {
    apiKey: "AIzaSyD0ur1zf8B8EjUraK0nwnM7gjM_-FDENMw",
    authDomain: "fir-web-codelab-e04ff.firebaseapp.com",
    databaseURL: "https://fir-web-codelab-e04ff.firebaseio.com",
    projectId: "fir-web-codelab-e04ff",
    storageBucket: "fir-web-codelab-e04ff.appspot.com",
    messagingSenderId: "650091709903",
    appId: "1:650091709903:web:0a2464404b4c9e14acbeba"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // var firebaseConfig = {};

  // firebase.initializeApp(firebaseConfig);

  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      // Email / Password Provider.
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // Handle sign-in.
        // Return false to avoid redirect.
        return false;
      }
    }
  };

  const ui = new firebaseui.auth.AuthUI(firebase.auth());

  // listen to RSVP button clicks
  startRsvpButton.addEventListener('click', () => {
    if (firebase.auth().currentUser) {
      // user is signed in, allow the user to sign out
      firebase.auth().signOut();
    } else {
      // no user is signed in, allow the user to sign in
      ui.start("#firebaseui-auth-container", uiConfig);
    }
  });

  // listen to the current Auth state
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      startRsvpButton.textContent = "LOGOUT";
    } else {
      startRsvpButton.textContent = "RSVP";
    }
  });
 }
main();


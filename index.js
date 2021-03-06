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
      // show guestbook to logged-in users
      guestbookContainer.style.diplay = "block";


    } else {
      // no user is signed in, allow the user to sign in
      ui.start("#firebaseui-auth-container", uiConfig);
      // hide guestbook for non-logged-in users
      guestbookContainer.style.display = "none";
    }
  });

  // listen to the current Auth state
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      startRsvpButton.textContent = "LOGOUT";

      // Show guestbook to logged-in users
      guestbookContainer.style.display = "block";

      // Subscribe to the guestbook collection
      subscribeGuestbook();
      // Subscribe to the attendees collection
      subscribeCurrentRSVP(user);
    } else {
      startRsvpButton.textContent = "RSVP";

      // Hide guestbook for non-logged-in users
      guestbookContainer.style.display = "none";

      // Unsubscribe from the guestbook collection
      unsubscribeGuestbook();
      // Unsubscribe from the attendees collection
      unsubscribeCurrentRSVP();
    }
  });

  // listen to form submission
  form.addEventListener('submit', (e) => {
    // prevent form redirect
    e.preventDefault();
    // write a new message to the database collection "guestbook"
    firebase.firestore().collection("guestbook").add({
      text: input.value,
      timestamp: Date.now(),
      name: firebase.auth().currentUser.displayName,
      userId: firebase.auth().currentUser.uid
    })
    // clear the input field
    input.value = "";
    // return false to avoid redirect
    return false;
  })

  // listen to guest book updates
  function subscribeGuestbook() {
    // create query for messages
    guestbookListener = firebase.firestore().collection("guestbook")
    .orderBy("timestamp", "desc")
    .onSnapshot((snaps) => {
      // reset page
      guestbook.innerHTML = "";
      // loop through documents in the database
      snaps.forEach((doc) => {
        // create an HTML entry for each document and add it to the chat
        const entry = document.createElement("p");
        entry.textContent = doc.data().name + ": " + doc.data().text;
        guestbook.appendChild(entry);
      })
    })
  }

  // Unsubscribe from guestbook updates
  function unsubscribeGuestbook(){
    if (guestbookListener != null)
    {
      guestbookListener();
      guestbookListener = null;
    }
  };

  // Listen to RSVP responses
  rsvpYes.onclick = () => {
    // Get a reference to the user's document in the attendees collection
    const userDoc = firebase.firestore().collection('attendees').doc(firebase.auth().currentUser.uid);

    // If they RSVP'd yes, save a document with attending: true
    userDoc.set({
      attending: true
    }).catch(console.error)
  }

  rsvpNo.onclick = () => {
    // Get a reference to the user's document in the attendees collection
    const userDoc = firebase.firestore().collection('attendees').doc(firebase.auth().currentUser.uid);

    // If they RSVP'd no, save a document with attending: false
    userDoc.set({
      attending: false
    }).catch(console.error)
  }

  // Listen for attendee list
  firebase.firestore()
  .collection('attendees')
  .where("attending", "==", true)
  .onSnapshot(snap => {
    const newAttendeeCount = snap.docs.length;

    numberAttending.innerHTML = newAttendeeCount+' people going'; 
  })

  function subscribeCurrentRSVP(user){
    rsvpListener = firebase.firestore()
    .collection('attendees')
    .doc(user.uid)
    .onSnapshot((doc) => {
      if (doc && doc.data()){
        const attendingResponse = doc.data().attending;

        // Update css classes for buttons
        if (attendingResponse){
          rsvpYes.className="clicked";
          rsvpNo.className="";
        }
        else{
          rsvpYes.className="";
          rsvpNo.className="clicked";
        }
      }
  });
  }

  function unsubscribeCurrentRSVP(){
    if (rsvpListener != null)
    {
      rsvpListener();
      rsvpListener = null;
    }
    rsvpYes.className="";
    rsvpNo.className="";
  }


 }
main();


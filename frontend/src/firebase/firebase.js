import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyBrjtD-_bzsdqgOigfYzHvCfrsGob-qmQc",
    authDomain: "instagram-clone-edc17.firebaseapp.com",
    projectId: "instagram-clone-edc17",
    storageBucket: "instagram-clone-edc17.appspot.com",
    messagingSenderId: "1040492453050",
    appId: "1:1040492453050:web:c55bea48a87f5aa769f683",
    measurementId: "G-K89QK98NZE"
})

const db = firebaseApp.firestore()
const auth = firebase.auth()
const storage = firebase.storage()

export { db, auth, storage }
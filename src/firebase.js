// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";



// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDj8w3zTa3Oj-Q2uevS0YeFsahKN4AIiw",
  authDomain: "react-kanban-board-753a9.firebaseapp.com",
  projectId: "react-kanban-board-753a9",
  storageBucket: "react-kanban-board-753a9.appspot.com",
  messagingSenderId: "145154966396",
  appId: "1:145154966396:web:ddd174db7ab172258c9af9",
  measurementId: "G-D8F8NHHDWD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);




export default db;
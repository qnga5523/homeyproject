import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider  } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2aA4uIvFlZwHiZVekCV5i6NPonqDUMHk",
  authDomain: "homehide-69f18.firebaseapp.com",
  projectId: "homehide-69f18",
  storageBucket: "homehide-69f18.appspot.com",
  messagingSenderId: "706710097603",
  appId: "1:706710097603:web:dcd3316357f4c76b9cdc76",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);
// Initialize Firebase Cloud Messaging and get a reference to the service
export const provider = new GoogleAuthProvider();
export default app;

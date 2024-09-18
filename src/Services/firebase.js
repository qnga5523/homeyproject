// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGa765C3xXDEjEmHvj5qdkOx_iBh41KE0",
  authDomain: "management-211-be7a7.firebaseapp.com",
  databaseURL:
    "https://management-211-be7a7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "management-211-be7a7",
  storageBucket: "management-211-be7a7.appspot.com",
  messagingSenderId: "671651143726",
  appId: "1:671651143726:web:d631fda340650481e9bfbf",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);
export default app;

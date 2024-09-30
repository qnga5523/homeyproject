// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
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
export const messaging = getMessaging(app);
export const generateToken = async () => {
  const messaging = getMessaging(); // Get the messaging instance

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Get the registration token
      const token = await getToken(messaging, {
        vapidKey:
          "BOXUgkTO1YvHsnWe-MbwhGn2aKKXgvkiKLnI1BIe5u99F9qJ6Ism7PJnO9dru0w-MSUQx0hCTk6p91N6OXw9lmc", // Replace with your VAPID key from Firebase console
      });

      console.log("FCM Registration Token:", token);
      // You can store this token in your database here
    } else {
      console.error("Unable to get permission to notify.");
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
};

export default app;

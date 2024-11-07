import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedRoute({ role, children }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "Users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            console.error("No user document found!");
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false); 
    });
    return () => unsubscribe();
  }, []);
  if (loading) return <p>Loading...</p>;
  if (userRole === role) {
    return children;
  }
  return <Navigate to="/login" />;
}

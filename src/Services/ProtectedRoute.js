import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedRoute({ role, children }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const userDoc = await getDoc(doc(db, "Users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        }
        setLoading(false);
      });
    };
    fetchUserRole();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (userRole === role) {
    return children;
  }

  return <Navigate to="/login" />;
}

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import OwnersDashboard from "./pages/Owners/Dashboard/OwnersDashboard";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Homepage from "./pages/Home";
import Signup from "./pages/Auth/Signup";
import { auth } from "./Services/firebase";
import RequestAccount from "./pages/Admin/Accounts/RequestAccounts";
import ManagementAccount from "./pages/Admin/Accounts/ManagementAccounts";
import Event from "./pages/Events/Event";
import ProtectedRoute from "./Services/ProtectedRoute";
import CreateEvent from "./pages/Events/CreateEvent";
import DetailEvent from "./pages/Events/DetailEvent";
import EditEvent from "./pages/Events/EditEvent";
import EditProfile from "./pages/Profile/edit";
import Profile from "./pages/Profile";
import SetFee from "./pages/Managements/ServicesFee/SetFee";
import SetPrices from "./pages/Managements/ServicesFee/SetPrices";
import VehicleRegistrationForm from "./pages/Transportation";
import ListApartment from "./pages/Apartments/ListApartment";

function App() {
  const [user, setUser] = useState("");
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  });
  return (
    <Router>
      <Routes>
        {/* public */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} />
        {/* Event */}
        <Route path="/event" element={<Event />} />
        <Route path="/event/:id" element={<DetailEvent />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/requestAccount" element={<RequestAccount />} />
        <Route
          path="/admin/managementAccount"
          element={<ManagementAccount />}
        />
        <Route path="/admin/setFee" element={<SetFee />} />
        {/* Event */}
        <Route path="/admin/CreateEvent" element={<CreateEvent />} />
        <Route path="/admin/edit-event/:id" element={<EditEvent />} />
        <Route path="/admin/profile" element={<Profile />} />
        <Route path="/admin/setPrice" element={<SetPrices />} />
        <Route path="/admin/listapart" element={<ListApartment />} />

        {/* Owner */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute role="owner">
              <OwnersDashboard />
            </ProtectedRoute>
          }
        />
        {/* Profile */}
        <Route path="/owner/edit-profile" element={<EditProfile />} />
        <Route path="/owner/profile" element={<Profile />} />
        <Route path="/trans" element={<VehicleRegistrationForm />} />
      </Routes>
    </Router>
  );
}

export default App;

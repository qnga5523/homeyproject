import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { auth } from "./Services/firebase";
import { messaging, generateToken } from "./Services/firebase";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import OwnersDashboard from "./pages/Owners/Dashboard/OwnersDashboard";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Homepage from "./pages/Home";
import Signup from "./pages/Auth/Signup";

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

import ListApartment from "./pages/Apartments/ListApartment";
import AddData from "./pages/Apartments/AddData";
import ChangePassword from "./pages/Profile/changepassword";

import AppContact from "./pages/Home/contact";
import Aboutus from "./pages/Home/about";
import Feature from "./pages/Home/feature";

import PricesWater from "./pages/Managements/Prices/Water/PricesWater";
import PricesClean from "./pages/Managements/Prices/FeeClean/PricesClean";
import PricesParking from "./pages/Managements/Prices/Parking/PricesParking";
import { onMessage } from "firebase/messaging";
import ShowRooms from "./pages/Apartments/ListRoom";
import RequestVehicle from "./pages/Transportation/RequestVehicle";
import VehicleRegister from "./pages/Transportation/VehicleRegister";
import VehicleShow from "./pages/Transportation/VehicleShow";
import ListVehicle from "./pages/Transportation/ListVehicle";
import FormBook from "./pages/Managements/ServiceBook/FormBook";
import ReqBook from "./pages/Managements/ServiceBook/ReqBook";
import HistoryFee from "./pages/Managements/ServicesFee/HistoryFee";

function App() {
  const [user, setUser] = useState("");
  useEffect(() => {
    generateToken();
    onMessage(messaging, (payload) => {
      console.log(payload);
    });
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
        <Route path="/contact" element={<AppContact />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/features" element={<Feature />} />

        
        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          {/* Use relative paths for nested routes */}
          <Route path="requestAccount" element={<RequestAccount />} />
          <Route path="managementAccount" element={<ManagementAccount />} />
          <Route path="setFee" element={<SetFee />} />
          <Route path="CreateEvent" element={<CreateEvent />} />
          <Route path="edit-event/:id" element={<EditEvent />} />
          <Route path="profile" element={<Profile />} />
          <Route path="listapart" element={<ListApartment />} />
          <Route path="add" element={<AddData />} />
          <Route path="changepassword" element={<ChangePassword />} />
          <Route path="water" element={<PricesWater />} />
          <Route path="clean" element={<PricesClean />} />
          <Route path="parking" element={<PricesParking />} />
          <Route path="requestvehicle" element={<RequestVehicle />} />
          <Route path="allvehicle" element={<ListVehicle />} />
          <Route path="requestbook" element={<ReqBook />} />
          <Route path="history" element={<HistoryFee />} />
          <Route path="room" element={<ShowRooms />} />
        </Route>
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
        <Route path="/owner/vehicleregister" element={<VehicleRegister />} />
        <Route path="/owner/changepassword" element={<ChangePassword />} />
        <Route path="/owner/vehicle" element={<VehicleShow />} />
        <Route path="/book" element={<FormBook/>}/>
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;

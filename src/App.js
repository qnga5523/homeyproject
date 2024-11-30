import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { auth } from "./Services/firebase";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
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

import PricesWater from "./pages/Managements/Prices/Water/PricesWater";
import PricesClean from "./pages/Managements/Prices/FeeClean/PricesClean";
import PricesParking from "./pages/Managements/Prices/Parking/PricesParking";

import ShowRooms from "./pages/Apartments/ListRoom";
import RequestVehicle from "./pages/Transportation/RequestVehicle";
import VehicleRegister from "./pages/Transportation/VehicleRegister";
import ListVehicle from "./pages/Transportation/ListVehicle";
import FormBook from "./pages/Managements/ServiceBook/FormBook";
import ReqBook from "./pages/Managements/ServiceBook/ReqBook";
import HistoryFee from "./pages/Managements/ServicesFee/HistoryFee";
import Dashboard from "./pages/Dashboard";
import DetailNotification from "./pages/Notification/DetailNotification";



import OwnerFee from "./pages/Managements/ServicesFee/OwnerFee";
import UserBookings from "./pages/Managements/ServiceBook/UserBookings";
import { NotFound } from "./components/common/NotFound";
import InvoiceReviewPage from "./components/common/Invoice/InvoiceReviewPage";
import Feedback from "./pages/Feedbacks/Feedback";
import FeedbackReport from "./components/common/Chart/FeedbackReport";
import ServicePriceCharts from "./components/common/Chart/ServicePriceCharts";
import ServiceBookingChart from "./components/common/Chart/ServiceBookingChart";
import MonthlyServiceFeeChart from "./components/common/Chart/MonthlyServiceChart";



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
        <Route path="/login" element={<Login />} />
        <Route path="/password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} />
        {/* Event */}      
        <Route path="*" element={<NotFound />} />      
      
        {/* Admin */}
        <Route
          path="/"
          element={
            <ProtectedRoute role="admin">
              <Dashboard/>
            </ProtectedRoute>
          }
        >
          {/* Account  */}
          <Route path="requestAccount" element={<RequestAccount />} />
          <Route path="managementAccount" element={<ManagementAccount />} />
          {/* Fee */}
          <Route path="setFee" element={<SetFee />} />
          <Route path="water" element={<PricesWater />} />
          <Route path="clean" element={<PricesClean />} />
          <Route path="parking" element={<PricesParking />} />
          <Route path="history" element={<HistoryFee />} />
          <Route path="invoice-review" element={<InvoiceReviewPage/>}/>
          {/* Event */}
          <Route path="CreateEvent" element={<CreateEvent />} />
          <Route path="edit-event/:id" element={<EditEvent />} />
          <Route path="event" element={<Event />} />
         <Route path="event/:id" element={<DetailEvent />} />
          {/* Profile */}
          <Route path="profile" element={<Profile />} />
          <Route path="changepassword" element={<ChangePassword />} />
          {/* Apartment & building */}
          <Route path="listapart" element={<ListApartment />} />
          <Route path="add" element={<AddData />} />
          <Route path="room" element={<ShowRooms />} />
          {/* Vehicle */}
          <Route path="requestvehicle" element={<RequestVehicle />} />
          <Route path="allvehicle" element={<ListVehicle />} />
          {/* Service Book */}
          <Route path="requestbook" element={<ReqBook />} />
          {/* Notification */}
          <Route path="notification" element={<DetailNotification/>}/>
          <Route path="feedback" element={<Feedback/>}/>
          <Route path="reportFeedback" element={<FeedbackReport/>}/>
          <Route path="ServicePriceCharts" element={<ServicePriceCharts/>}/>
          <Route path="ServiceBookingCharts" element={<ServiceBookingChart/>}/>
          <Route path="compfee" element={<MonthlyServiceFeeChart/>}/>
   
          {/* Chart */}
         </Route>
        {/* Owner */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute role="owner">
              <Dashboard/>
            </ProtectedRoute>
          }
        >
        {/* Profile */}
        <Route path="edit-profile" element={<EditProfile />} />
        <Route path="profile" element={<Profile />} />       
        <Route path="changepassword" element={<ChangePassword />} />

        {/* Event */}
        <Route path="event" element={<Event />} />
        <Route path="event/:id" element={<DetailEvent />} />

        {/* Vehicle */}
        <Route path="vehicleregister" element={<VehicleRegister />} />

        
        {/* serviceBook */}
        <Route path="book" element={<FormBook/>}/>
        <Route path="user-book" element={<UserBookings/>}/>

        {/* notification */}
        <Route path="notification" element={<DetailNotification/>}/>

        {/* feedback */}
        <Route path="feedback" element={<Feedback/>}/>

        {/* Fees */}
        <Route path="feehistory" element={<OwnerFee/>}/>

        {/* dataStatistics */}
        <Route path="feechart" element={<MonthlyServiceFeeChart/>}/>


        </Route>   
        </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;

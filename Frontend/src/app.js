import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import SearchTrainForm from "./components/searchTrainForm";
import SearchTrainFormStationMaster from "./components/SearchTrainFormStationMaster";
import NotFound from "./pages/404";
import TrainInfo from "./pages/trainInfo";
import Signup from "./pages/signup";
import Login from "./pages/login";
import BookingDetails from "./pages/booking";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentCancelled from "./pages/paymentCancelled";
import PaymentFailed from "./pages/paymentFailed";
import MyBookings from "./components/MyBookings";
import Profile from "./pages/profile";
import ProfileStationMaster from "./pages/profileStationMaster";
import AdminDashboard from "./pages/adminDashboard";
import AdminStations from "./pages/adminStations";
import AdminTrains from "./pages/adminTrains";
import AddTrain from "./pages/addTrain";
import MyBookingsStationMaster from "./components/MyBookingsStationMaster";
import BookingDetailsStationMaster from "./pages/bookingStationMaster";
import PaymentSuccessStationMaster from "./components/PaymentSuccessStationMaster";
import AdminTrainDetails from "./pages/adminTrainDetails";
import AdminRules from "./pages/adminRules";
import AdminTickets from "./pages/adminTickets";
import AdminCancellation from "./pages/adminCancellation";
import AdminRoutes from "./pages/adminRoutes";
import LandingPage from "./components/landingPage";
import ErrorPage from "./components/error";

function App() {
    return (
        <Routes>
            
            <Route path="/" element={<LandingPage />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/search" element={<SearchTrainForm />} />
            <Route path="/search/stationmaster" element={<SearchTrainFormStationMaster />} />
            <Route path="/trainInfo" element={<TrainInfo />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/booking/:bookingId" element={<BookingDetails />} />
            <Route path="/booking/stationMaster/:bookingId" element={<BookingDetailsStationMaster />} />

            <Route path="/payment/success/:paymentId" element={<PaymentSuccess />} />
            <Route path="/payment/stationMaster/success/:paymentId" element={<PaymentSuccessStationMaster />} />
            <Route path="/payment/cancelled" element={<PaymentCancelled />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/bookings/stationMaster" element={<MyBookingsStationMaster />} />
            <Route path="/user/profile" element={<Profile />} />
            <Route path="/master/profile" element={<ProfileStationMaster />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/stations" element={<AdminStations />} />
            <Route path="/admin/trains" element={<AdminTrains />} />
            <Route path="/admin/trains/add" element={<AddTrain />} />
            <Route path="/admin/train/:trainId" element={<AdminTrainDetails />} />
            <Route path="/admin/rules" element={<AdminRules />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/cancellation" element={<AdminCancellation />} />
            <Route path="/admin/routes" element={<AdminRoutes />} />
        </Routes>
    );
}

export default App;
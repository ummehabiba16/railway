import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Search from "./pages/searchTrain";
import SearchPage from "./pages/searchTrain";
import NotFound from "./pages/404";
import TrainInfo from "./pages/trainInfo";
import Signup from "./pages/signup";
import Login from "./pages/login";
import BookingDetails from "./pages/booking";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentCancelled from "./pages/paymentCancelled";
import PaymentFailed from "./pages/paymentFailed";
import MyBookings from "./components/MyBookings";

function App() {
    return (
        <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/search" element={<Search />} />
            <Route path="/error" element={<NotFound />} />
            <Route path="/trainInfo" element={<TrainInfo />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/booking/:bookingId" element={<BookingDetails />} />
            <Route path="/payment/success/:paymentId" element={<PaymentSuccess />} />
            <Route path="/payment/cancelled" element={<PaymentCancelled />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            <Route path="/bookings" element={<MyBookings />} />
        </Routes>
    );
}

export default App;
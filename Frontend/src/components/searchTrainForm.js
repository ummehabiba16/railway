import React, { useState, useEffect } from "react";
import api from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

function SearchTrainForm() {
  const navigate = useNavigate();

  const [coachWiseTicketResponse, setCoachWiseTicketResponse] = useState(null);
  const [bookingResponse, setBookingResponse] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [currCoach, setCurrCoach] = useState(null);

  const [fromStations, setFromStations] = useState([]);
  const [toStations, setToStations] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [classes, setClasses] = useState([]);
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchData, setSearchData] = useState({
    fromStation: "",
    toStation: "",
    date: null,
    class_: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [fromRes, toRes, dateRes, classRes] = await Promise.all([
          api.get("/public/stations/from"),
          api.get("/public/stations/to"),
          api.get("/public/date"),
          api.get("/public/classes"),
        ]);

        setFromStations(fromRes.data);
        setToStations(toRes.data);
        setAvailableDates(dateRes.data.map((d) => new Date(d)));
        setClasses(classRes.data);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Something went wrong while loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleDateChange = (d) => {
    setSearchData((prev) => ({ ...prev, date: d }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedDate = searchData.date
        ? searchData.date.toLocaleDateString("en-GB").replace(/\//g, "-")
        : null;

      const formattedSearchData = {
        ...searchData,
        date: formattedDate,
      };

      const res = await api.post("/public/search", formattedSearchData);
      setResponseData(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed.");
    }
  };

  const handleBookNow = async (trainId, classId) => {
    try {
      const formattedDate = searchData.date
        ? searchData.date.toLocaleDateString("en-GB").replace(/\//g, "-")
        : null;

      if (!formattedDate) {
        alert("Please select a valid date before booking.");
        return;
      }

      console.log(
        `Booking: trainId=${trainId}, classId=${classId}, date=${formattedDate}`
      );

      const response = await api.get("/book", {
        params: {
          trainId: trainId,
          classId: classId,
          date: formattedDate,
          fromStation: searchData.fromStation,
          toStation: searchData.toStation,
        },
      });

      const enhancedBookingResponse = response.data.map((coach) => ({
        ...coach,
        trainId: trainId,
        classId: classId,
        date: formattedDate,
      }));

      setBookingResponse(enhancedBookingResponse);
      // Reset coach selection and seat selection when new booking is made
      setCoachWiseTicketResponse(null);
      setSelectedSeats([]);
      console.log("Booking response:", enhancedBookingResponse);
    } catch (err) {
      console.error("Booking failed:", err);
      if (err.response && err.response.status === 401) {
        alert("Please login to continue.");
        window.location.href = "/login"; // or use navigate()
      } else {
        alert("Booking failed. Please try again.");
      }
    }
  };

  const handleCoachSelection = async (coachId) => {
    try {
      const formattedDate = searchData.date
        ? searchData.date.toLocaleDateString("en-GB").replace(/\//g, "-")
        : null;

      if (!formattedDate) {
        alert("Please select a valid date before proceeding.");
        return;
      }
      setCurrCoach(coachId);
      setCoachWiseTicketResponse(null);
      // Find the selected coach data to get additional info
      const selectedCoach = bookingResponse.find(
        (coach) => coach.coachId === coachId
      );

      console.log(`Coach selected: coachId=${coachId}, date=${formattedDate}`);
      console.log("Selected coach details:", selectedCoach);

      const requestData = {
        trainId: selectedCoach.trainId || "",
        classId: selectedCoach.classId || "",
        date: formattedDate,
        coachId: coachId,
        fromStation: searchData.fromStation,
        toStation: searchData.toStation,
      };

      const response = await api.post("/book/coach", requestData);

      // Enhanced response with trainId and coachId
      const enhancedCoachResponse = {
        trainId: selectedCoach.trainId,
        coachId: coachId,
        classId: selectedCoach.classId,
        date: formattedDate,
        seatCount: selectedCoach.seatCount,
        tickets: response.data, // Original ticket array
      };

      setCoachWiseTicketResponse(enhancedCoachResponse);
      // Reset seat selection when a new coach is selected
      setSelectedSeats([]);
      console.log("Coach selection response:", enhancedCoachResponse);

      // Handle response (navigate to seat selection, show modal, etc.)
      // navigate("/seat-selection", { state: { bookingData: response.data } });
    } catch (err) {
      console.error("Coach selection failed:", err);
      if (err.response && err.response.status === 401) {
        window.location.href = "/login";
      } else {
        alert("Coach selection failed. Please try again.");
      }
    }
  };

  const handleBookSelectedSeats = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat."); //??remove alert
      return;
    }

    try {
      const userId = localStorage.getItem("userId");

      const formattedDate = searchData.date
        ? searchData.date.toLocaleDateString("en-GB").replace(/\//g, "-")
        : null;

  
      // Step 1: Create booking
      const createBookingResponse = await api.post("/booking/create", {
        userId,
        travelDate : formattedDate,
        ticketIds: selectedSeats,
      });
  
      const bookingId = createBookingResponse.data;
  
      // Step 2: Navigate to the booking details page
      navigate(`/booking/${bookingId}`);  //alert(`Successfully booked ${selectedSeats.length} seats!`);

      // Reset selections and refresh data
      setSelectedSeats([]);
      // You might want to refresh the coach data here
    } catch (err) {
      console.error("Seat booking failed:", err);
      if (err.response && err.response.status === 401) {
        window.location.href = "/login";
      } else {
        alert("Seat booking failed. Please try again.");
      }
    }
  };

  const handleSeatSelection = async (ticket) => {
    if (ticket.ticketStatus !== "AVAILABLE") {
      alert("This seat is not available for booking.");
      return;
    }
  
    // Check if seat is already selected
    if (selectedSeats.includes(ticket.ticketId)) {
      // Remove from selection
      setSelectedSeats((prev) => prev.filter((id) => id !== ticket.ticketId));
      return;
    }
  
    // Check if maximum seats selected
    if (selectedSeats.length >= 4) {
      alert("You can select maximum 4 seats.");
      return;
    }
  
    try {
      // Make POST request to check seat availability
      const response = await api.post("/book/seat/select", {
        ticketId: ticket.ticketId
      });
  
      // Get the status from response
      const status = response.data; // This should be the status string
  
      if (status === "AVAILABLE") {
        // Add to selection if available
        setSelectedSeats((prev) => [...prev, ticket.ticketId]);
      } else {
        // Update the ticket status in local state with the received status
        setCoachWiseTicketResponse(prev => ({
          ...prev,
          tickets: prev.tickets.map(t => 
            t.ticketId === ticket.ticketId 
              ? { ...t, ticketStatus: status }
              : t
          )
        }));
  
        // Show appropriate error message based on status
        let errorMessage = "This seat is not available.";
        if (status === "BOOKED") {
          errorMessage = "This seat has already been booked.";
        } else if (status === "IN PROGRESS") {
          errorMessage = "This seat is currently being booked by another user.";
        }
        
        alert(errorMessage);
      }
    } catch (err) {
      console.error("Seat selection failed:", err);
      
      // Handle HTTP errors
      if (err.response) {
        if (err.response.status === 404) {
          alert("Seat information not found.");
        } else if (err.response.status === 500) {
          alert("Server error. Please try again.");
        } else {
          alert("Something went wrong. Please try again.");
        }
      } else {
        alert("Network error. Please check your connection.");
      }
    }
  };

  const getSeatColor = (ticket) => {
    if (selectedSeats.includes(ticket.ticketId)) {
      return "bg-success"; // Green for selected
    }

    switch (ticket.ticketStatus) {
      case "AVAILABLE":
        return "bg-light border-success"; // Light with green border
      case "IN PROGRESS":
        return "bg-warning"; // Yellow for in progress
      case "BOOKED":
        return "bg-danger"; // Red for booked
      default:
        return "bg-secondary"; // Gray for unknown status
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Search Trains</h2>

      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label className="form-label">From Station</label>
          <select
            className="form-select"
            name="fromStation"
            value={searchData.fromStation}
            onChange={handleChange}
            required
          >
            <option value="">Select Station</option>
            {fromStations.map((st) => (
              <option key={st.stationId} value={st.stationId}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">To Station</label>
          <select
            className="form-select"
            name="toStation"
            value={searchData.toStation}
            onChange={handleChange}
            required
          >
            <option value="">Select Station</option>
            {toStations.map((st) => (
              <option key={st.stationId} value={st.stationId}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Journey Date</label>
          <div>
            <DatePicker
              selected={searchData.date}
              onChange={handleDateChange}
              includeDates={availableDates}
              placeholderText="Select Journey Date"
              className="form-control"
              dateFormat="dd-MM-yyyy"
              required
            />
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label">Class</label>
          <select
            className="form-select"
            name="class_"
            value={searchData.class_}
            onChange={handleChange}
            required
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 d-grid">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>

      <hr className="my-4" />

      {error && <div className="alert alert-danger">{error}</div>}
      {responseData && responseData.length > 0 ? (
        <>
          <h4>Available Trains</h4>
          <div className="row">
            {responseData.map((train) => (
              <div className="col-md-6" key={train.trainId}>
                <div className="card mb-4 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">
                      {train.trainName} ({train.trainId})
                    </h5>
                    <p className="card-text">
                      <strong>Departure:</strong> {train.departureTime}
                      <br />
                      <strong>Arrival:</strong> {train.arrivalTime}
                    </p>
                    {train.classes.map((cls, index) => (
                      <div
                        className="border p-2 mb-2 rounded bg-light"
                        key={index}
                      >
                        <p className="mb-1">
                          <strong>Class:</strong> {cls.className}
                        </p>
                        <p className="mb-1">
                          <strong>Fare:</strong> {cls.fare} BDT
                        </p>
                        <p className="mb-2">
                          <strong>Available Seats:</strong> {cls.availableCount}
                        </p>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() =>
                            handleBookNow(train.trainId, cls.classId)
                          }
                        >
                          Book Now
                        </button>

                        {/* Show coaches for this specific train and class */}
                        {bookingResponse &&
                          bookingResponse.length > 0 &&
                          bookingResponse[0].trainId === train.trainId &&
                          bookingResponse[0].classId === cls.classId && (
                            <>
                              <div className="mt-3">
                                <h6 className="text-primary">
                                  Available Coaches:
                                </h6>
                                <div className="row">
                                  {bookingResponse.map((coach, coachIndex) => (
                                    <div
                                      className="col-md-6 mb-2"
                                      key={coachIndex}
                                    >
                                      <>
                                        <div
                                          className="card shadow-sm cursor-pointer hover-card"
                                          onClick={() =>
                                            handleCoachSelection(coach.coachId)
                                          }
                                          style={{
                                            cursor: "pointer",
                                            transition: "transform 0.2s",
                                          }}
                                          onMouseEnter={(e) =>
                                            (e.currentTarget.style.transform =
                                              "translateY(-2px)")
                                          }
                                          onMouseLeave={(e) =>
                                            (e.currentTarget.style.transform =
                                              "translateY(0)")
                                          }
                                        >
                                          <div className="card-body text-center py-2">
                                            <h6 className="card-title text-primary mb-1">
                                              {coach.coachName}
                                            </h6>
                                            <span className="badge bg-success">
                                              {coach.ticketCount} Available
                                            </span>
                                          </div>
                                        </div>
                                        {coachWiseTicketResponse &&
                                          coachWiseTicketResponse.tickets &&
                                          coachWiseTicketResponse.tickets
                                            .length > 0 &&
                                          coachWiseTicketResponse.trainId ===
                                            train.trainId &&
                                          coachWiseTicketResponse.classId ===
                                            cls.classId &&
                                          coachWiseTicketResponse.coachId ===
                                            coach.coachId && (
                                            <div className="mt-4">
                                              <div className="card">
                                                <div className="card-header">
                                                  <h5 className="mb-0">
                                                    Select Your Seats - Coach:{" "}
                                                    {bookingResponse.find(
                                                      (coach) =>
                                                        coach.coachId ===
                                                        coachWiseTicketResponse.coachId
                                                    )?.coachName ||
                                                      coachWiseTicketResponse.coachId}
                                                  </h5>
                                                  <small className="text-muted">
                                                    Selected:{" "}
                                                    {selectedSeats.length}/4
                                                    seats
                                                  </small>
                                                </div>
                                                <div className="card-body">
                                                  {/* Legend */}
                                                  <div className="row mb-3">
                                                    <div className="col-12">
                                                      <div className="d-flex flex-wrap gap-3">
                                                        <div className="d-flex align-items-center">
                                                          <div
                                                            className="bg-light border-success border rounded"
                                                            style={{
                                                              width: "20px",
                                                              height: "20px",
                                                            }}
                                                          ></div>
                                                          <small className="ms-1">
                                                            Available
                                                          </small>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                          <div
                                                            className="bg-success rounded"
                                                            style={{
                                                              width: "20px",
                                                              height: "20px",
                                                            }}
                                                          ></div>
                                                          <small className="ms-1">
                                                            Selected
                                                          </small>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                          <div
                                                            className="bg-warning rounded"
                                                            style={{
                                                              width: "20px",
                                                              height: "20px",
                                                            }}
                                                          ></div>
                                                          <small className="ms-1">
                                                            In Progress
                                                          </small>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                          <div
                                                            className="bg-danger rounded"
                                                            style={{
                                                              width: "20px",
                                                              height: "20px",
                                                            }}
                                                          ></div>
                                                          <small className="ms-1">
                                                            Booked
                                                          </small>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  {/* Seat Layout */}
                                                  <div className="coach-layout">
                                                    <div className="row justify-content-center">
                                                      {/* Group seats in rows of 5 (2 + corridor + 3) */}
                                                      {Array.from(
                                                        {
                                                          length: Math.ceil(
                                                            coachWiseTicketResponse.seatCount /
                                                              5
                                                          ),
                                                        },
                                                        (_, rowIndex) => {
                                                          const startSeatNum =
                                                            rowIndex * 5 + 1;
                                                          const endSeatNum =
                                                            Math.min(
                                                              startSeatNum + 4,
                                                              coachWiseTicketResponse.seatCount
                                                            );

                                                          return (
                                                            <div
                                                              key={rowIndex}
                                                              className="col-12 mb-2"
                                                            >
                                                              <div className="d-flex justify-content-center align-items-center gap-2">
                                                                {/* Left side - 2 seats */}
                                                                <div className="d-flex gap-1">
                                                                  {Array.from(
                                                                    {
                                                                      length: 2,
                                                                    },
                                                                    (
                                                                      _,
                                                                      seatIndex
                                                                    ) => {
                                                                      const seatNum =
                                                                        startSeatNum +
                                                                        seatIndex;
                                                                      if (
                                                                        seatNum >
                                                                        endSeatNum
                                                                      )
                                                                        return null;

                                                                      // Find ticket for this seat number (convert to string for comparison)
                                                                      const ticket =
                                                                        coachWiseTicketResponse.tickets.find(
                                                                          (t) =>
                                                                            t.seatNum ===
                                                                            seatNum.toString()
                                                                        );

                                                                      const getSeatColorForNum =
                                                                        (
                                                                          seatNum,
                                                                          ticket
                                                                        ) => {
                                                                          if (
                                                                            !ticket
                                                                          ) {
                                                                            return "bg-secondary"; // Gray for unavailable seats
                                                                          }

                                                                          if (
                                                                            selectedSeats.includes(
                                                                              ticket.ticketId
                                                                            )
                                                                          ) {
                                                                            return "bg-success"; // Green for selected
                                                                          }

                                                                          switch (
                                                                            ticket.ticketStatus
                                                                          ) {
                                                                            case "AVAILABLE":
                                                                              return "bg-light border-success"; // Light with green border
                                                                            case "IN PROGRESS":
                                                                              return "bg-warning"; // Yellow for in progress
                                                                            case "BOOKED":
                                                                              return "bg-danger"; // Red for booked
                                                                            default:
                                                                              return "bg-secondary"; // Gray for unknown status
                                                                          }
                                                                        };

                                                                      return (
                                                                        <div
                                                                          key={
                                                                            seatNum
                                                                          }
                                                                          className={`seat-box ${getSeatColorForNum(
                                                                            seatNum,
                                                                            ticket
                                                                          )} ${
                                                                            ticket &&
                                                                            ticket.ticketStatus ===
                                                                              "AVAILABLE"
                                                                              ? "seat-clickable"
                                                                              : ""
                                                                          }`}
                                                                          onClick={() =>
                                                                            ticket &&
                                                                            handleSeatSelection(
                                                                              ticket
                                                                            )
                                                                          }
                                                                          style={{
                                                                            width:
                                                                              "40px",
                                                                            height:
                                                                              "40px",
                                                                            display:
                                                                              "flex",
                                                                            alignItems:
                                                                              "center",
                                                                            justifyContent:
                                                                              "center",
                                                                            cursor:
                                                                              ticket &&
                                                                              ticket.ticketStatus ===
                                                                                "AVAILABLE"
                                                                                ? "pointer"
                                                                                : "not-allowed",
                                                                            border:
                                                                              "1px solid #ccc",
                                                                            borderRadius:
                                                                              "4px",
                                                                            fontSize:
                                                                              "12px",
                                                                            fontWeight:
                                                                              "bold",
                                                                            transition:
                                                                              "all 0.2s",
                                                                          }}
                                                                          onMouseEnter={(
                                                                            e
                                                                          ) => {
                                                                            if (
                                                                              ticket &&
                                                                              ticket.ticketStatus ===
                                                                                "AVAILABLE"
                                                                            ) {
                                                                              e.currentTarget.style.transform =
                                                                                "scale(1.1)";
                                                                            }
                                                                          }}
                                                                          onMouseLeave={(
                                                                            e
                                                                          ) => {
                                                                            e.currentTarget.style.transform =
                                                                              "scale(1)";
                                                                          }}
                                                                        >
                                                                          {
                                                                            seatNum
                                                                          }
                                                                        </div>
                                                                      );
                                                                    }
                                                                  )}
                                                                </div>

                                                                {/* Corridor */}
                                                                <div
                                                                  className="corridor"
                                                                  style={{
                                                                    width:
                                                                      "30px",
                                                                    textAlign:
                                                                      "center",
                                                                  }}
                                                                >
                                                                  <small className="text-muted">
                                                                    ||
                                                                  </small>
                                                                </div>

                                                                {/* Right side - 3 seats */}
                                                                <div className="d-flex gap-1">
                                                                  {Array.from(
                                                                    {
                                                                      length: 3,
                                                                    },
                                                                    (
                                                                      _,
                                                                      seatIndex
                                                                    ) => {
                                                                      const seatNum =
                                                                        startSeatNum +
                                                                        2 +
                                                                        seatIndex;
                                                                      if (
                                                                        seatNum >
                                                                        endSeatNum
                                                                      )
                                                                        return null;

                                                                      // Find ticket for this seat number (convert to string for comparison)
                                                                      const ticket =
                                                                        coachWiseTicketResponse.tickets.find(
                                                                          (t) =>
                                                                            t.seatNum ===
                                                                            seatNum.toString()
                                                                        );

                                                                      const getSeatColorForNum =
                                                                        (
                                                                          seatNum,
                                                                          ticket
                                                                        ) => {
                                                                          if (
                                                                            !ticket
                                                                          ) {
                                                                            return "bg-secondary"; // Gray for unavailable seats
                                                                          }

                                                                          if (
                                                                            selectedSeats.includes(
                                                                              ticket.ticketId
                                                                            )
                                                                          ) {
                                                                            return "bg-success"; // Green for selected
                                                                          }

                                                                          switch (
                                                                            ticket.ticketStatus
                                                                          ) {
                                                                            case "AVAILABLE":
                                                                              return "bg-light border-success"; // Light with green border
                                                                            case "IN PROGRESS":
                                                                              return "bg-warning"; // Yellow for in progress
                                                                            case "BOOKED":
                                                                              return "bg-danger"; // Red for booked
                                                                            default:
                                                                              return "bg-secondary"; // Gray for unknown status
                                                                          }
                                                                        };

                                                                      return (
                                                                        <div
                                                                          key={
                                                                            seatNum
                                                                          }
                                                                          className={`seat-box ${getSeatColorForNum(
                                                                            seatNum,
                                                                            ticket
                                                                          )} ${
                                                                            ticket &&
                                                                            ticket.ticketStatus ===
                                                                              "AVAILABLE"
                                                                              ? "seat-clickable"
                                                                              : ""
                                                                          }`}
                                                                          onClick={() =>
                                                                            ticket &&
                                                                            handleSeatSelection(
                                                                              ticket
                                                                            )
                                                                          }
                                                                          style={{
                                                                            width:
                                                                              "40px",
                                                                            height:
                                                                              "40px",
                                                                            display:
                                                                              "flex",
                                                                            alignItems:
                                                                              "center",
                                                                            justifyContent:
                                                                              "center",
                                                                            cursor:
                                                                              ticket &&
                                                                              ticket.ticketStatus ===
                                                                                "AVAILABLE"
                                                                                ? "pointer"
                                                                                : "not-allowed",
                                                                            border:
                                                                              "1px solid #ccc",
                                                                            borderRadius:
                                                                              "4px",
                                                                            fontSize:
                                                                              "12px",
                                                                            fontWeight:
                                                                              "bold",
                                                                            transition:
                                                                              "all 0.2s",
                                                                          }}
                                                                          onMouseEnter={(
                                                                            e
                                                                          ) => {
                                                                            if (
                                                                              ticket &&
                                                                              ticket.ticketStatus ===
                                                                                "AVAILABLE"
                                                                            ) {
                                                                              e.currentTarget.style.transform =
                                                                                "scale(1.1)";
                                                                            }
                                                                          }}
                                                                          onMouseLeave={(
                                                                            e
                                                                          ) => {
                                                                            e.currentTarget.style.transform =
                                                                              "scale(1)";
                                                                          }}
                                                                        >
                                                                          {
                                                                            seatNum
                                                                          }
                                                                        </div>
                                                                      );
                                                                    }
                                                                  )}
                                                                </div>
                                                              </div>
                                                            </div>
                                                          );
                                                        }
                                                      )}
                                                    </div>
                                                  </div>
                                                  {/* Booking Button */}
                                                  {selectedSeats.length > 0 && (
                                                    <div className="text-center mt-4">
                                                      <button
                                                        className="btn btn-primary btn-lg"
                                                        onClick={
                                                          handleBookSelectedSeats
                                                        }
                                                      >
                                                        Book{" "}
                                                        {selectedSeats.length}{" "}
                                                        Seat
                                                        {selectedSeats.length >
                                                        1
                                                          ? "s"
                                                          : ""}
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                      </>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* FIXED: Show seat selection for the currently selected coach */}
                            </>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        responseData && (
          <div className="alert alert-warning mt-4" role="alert">
            No trains found for the selected criteria.
          </div>
        )
      )}
    </div>
  );
}

export default SearchTrainForm;

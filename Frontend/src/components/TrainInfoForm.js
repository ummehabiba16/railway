import React, { useState, useEffect } from "react";
import api from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

function TrainInfoForm() {
  const navigate = useNavigate();

  const [fromStations, setFromStations] = useState([]);
  const [toStations, setToStations] = useState([]);
  //const [responseData, setResponseData] = useState(null);
  const [trains, setTrains] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);

  const [searchData, setSearchData] = useState({
    fromStation: "",
    toStation: ""
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [fromRes, toRes] = await Promise.all([
          api.get("/public/stations/from"),
          api.get("/public/stations/to"),
        ]);

        setFromStations(fromRes.data);
        setToStations(toRes.data);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Something went wrong while loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

//   useEffect(() => {
//     if (error) {
//       navigate("/error");
//     }
//   }, [error, navigate]);

    const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log(searchData);
      const res = await api.post("/public/trains", searchData);
      setTrains(res.data);
      
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed.");
    }
  };
  const handleShowDetails = async (trainId) => {
    console.log("Train ID:", trainId);
    try {
      const response = await api.post("/public/fullDetails", { trainId: trainId });
      setRouteDetails(response.data);
      console.log("Route details:", response.data);
    } catch (err) {
      console.error("Search error:", err);
      setError("Cannot fetch Details");
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

        <div className="col-12 d-grid">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>

      <hr className="my-4" />
      {error && <div className="alert alert-danger">{error}</div>}
      {trains && trains.length > 0 ? (
          <div className="container mt-5">
          <h2 className="mb-4">Available Trains</h2>
          <div className="row">
            {trains.map((train) => (
              <div className="col-md-4" key={train.trainId}>
                <div className="card mb-4 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Train No: {train.trainNum}</h5>
                    <p className="card-text">Name: {train.trainName}</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleShowDetails(train.trainId)}
                    >
                      Show Details
                    </button>
                  </div>
                  {routeDetails && routeDetails.some(r => r.trainId === train.trainId) && (
                    <div className="card-body">
                    <h5 className="card-title">Route Details</h5>
                    {routeDetails
                      .filter(r => r.trainId === train.trainId)
                      .sort((a, b) => a.routeSequence - b.routeSequence)
                      .map((step, index) => (
                        <div key={index} className="mb-2">
                          <strong>{step.stationName}</strong><br />
                          Arrival: {step.arrivalTime || "Start Point"}<br />
                          Departure: {step.departureTime || "End Point"}<br />
                        </div>
                      ))}
                  </div>
                  )}
                </div>
              </div>
            ))}
          </div>
    
        </div>
      ) : trains &&
        <div className="alert alert-info">No trains found.</div>
      
      }
    </div>
  );
}

export default TrainInfoForm;

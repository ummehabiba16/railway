import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navBar';
import '../CSS/admin.css';

const AdminRoutes = () => {
    const navigate = useNavigate();
    
    // Check authentication and authorization
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        if (!token || userRole !== 'ADMIN') {
            navigate('/login');
            return;
        }
    }, [navigate]);

    // State for different views
    const [currentView, setCurrentView] = useState('routes'); // routes, coaches, seats, allocations
    
    // Route Management State
    const [selectedTrainId, setSelectedTrainId] = useState('');
    const [routes, setRoutes] = useState([]);
    const [stations, setStations] = useState([]);
    const [trains, setTrains] = useState([]);
    const [newRoute, setNewRoute] = useState({
        trainId: '',
        stationId: '',
        sequenceNumber: 1
    });
    
    // Coach Management State
    const [coaches, setCoaches] = useState([]);
    const [classes, setClasses] = useState([]);
    const [newCoach, setNewCoach] = useState({
        trainId: '',
        classId: '',
        seatCount: 60
    });
    
    // Seat Management State
    const [selectedCoachId, setSelectedCoachId] = useState('');
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    
    // Seat Allocation State
    const [allocationData, setAllocationData] = useState({
        trainId: '',
        classId: '',
        fromStationId: '',
        toStationId: '',
        fare: 0
    });
    
    // Loading and message states
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Load initial data
    useEffect(() => {
        loadStations();
        loadTrains();
        loadClasses();
    }, []);

    // Load data when train is selected
    useEffect(() => {
        if (selectedTrainId) {
            loadRoutes(selectedTrainId);
            loadCoaches(selectedTrainId);
        }
    }, [selectedTrainId]);

    // API calls
    const loadStations = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/stations');
            const data = await response.json();
            if (data.success) {
                setStations(data.stations);
            }
        } catch (error) {
            showMessage('Failed to load stations', 'error');
        }
    };

    const loadTrains = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/trains');
            const data = await response.json();
            if (data.success) {
                setTrains(data.trains);
            }
        } catch (error) {
            showMessage('Failed to load trains', 'error');
        }
    };

    const loadRoutes = async (trainId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/routes/train/${trainId}`);
            const data = await response.json();
            if (data.success) {
                setRoutes(data.routes);
            }
        } catch (error) {
            showMessage('Failed to load routes', 'error');
        }
    };

    const loadCoaches = async (trainId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/train/${trainId}/coaches`);
            const data = await response.json();
            if (data.success) {
                setCoaches(data.coaches);
            }
        } catch (error) {
            showMessage('Failed to load coaches', 'error');
        }
    };

    const loadClasses = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/classes');
            const data = await response.json();
            if (data.success) {
                setClasses(data.classes);
            }
        } catch (error) {
            showMessage('Failed to load classes', 'error');
        }
    };

    const loadSeats = async (coachId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/coach/${coachId}/seats`);
            const data = await response.json();
            if (data.success) {
                setSeats(data.seats);
                setSelectedSeats([]);
            }
        } catch (error) {
            showMessage('Failed to load seats', 'error');
        }
    };

    // Event handlers
    const handleAddRoute = async (e) => {
        e.preventDefault();
        if (!newRoute.trainId || !newRoute.stationId) {
            showMessage('Please select train and station', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/routes/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRoute)
            });
            
            const data = await response.json();
            if (data.success) {
                showMessage('Route added successfully', 'success');
                loadRoutes(newRoute.trainId);
                setNewRoute({ trainId: newRoute.trainId, stationId: '', sequenceNumber: routes.length + 2 });
            } else {
                showMessage(data.message, 'error');
            }
        } catch (error) {
            showMessage('Failed to add route', 'error');
        }
        setLoading(false);
    };

    const handleAddCoach = async (e) => {
        e.preventDefault();
        if (!newCoach.trainId || !newCoach.classId) {
            showMessage('Please select train and class', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/coaches/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCoach)
            });
            
            const data = await response.json();
            if (data.success) {
                showMessage('Coach added successfully', 'success');
                loadCoaches(newCoach.trainId);
                setNewCoach({ trainId: newCoach.trainId, classId: '', seatCount: 60 });
            } else {
                showMessage(data.message, 'error');
            }
        } catch (error) {
            showMessage('Failed to add coach', 'error');
        }
        setLoading(false);
    };

    const handleAddSeatAllocations = async () => {
        if (selectedSeats.length === 0) {
            showMessage('Please select at least one seat', 'error');
            return;
        }

        if (!allocationData.fromStationId || !allocationData.toStationId || !allocationData.fare) {
            showMessage('Please fill in all allocation details', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/seat-allocations/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...allocationData,
                    seatIds: selectedSeats
                })
            });
            
            const data = await response.json();
            if (data.success) {
                showMessage(`Allocated ${selectedSeats.length} seats successfully`, 'success');
                setSelectedSeats([]);
                loadSeats(selectedCoachId); // Refresh seats
            } else {
                showMessage(data.message, 'error');
            }
        } catch (error) {
            showMessage('Failed to allocate seats', 'error');
        }
        setLoading(false);
    };

    const handleCoachClick = (coach) => {
        setSelectedCoachId(coach.coachId);
        setAllocationData({
            trainId: selectedTrainId,
            classId: coach.classId,
            fromStationId: '',
            toStationId: '',
            fare: 0
        });
        loadSeats(coach.coachId);
        setCurrentView('seats');
    };

    const handleSeatToggle = (seatId) => {
        setSelectedSeats(prev => 
            prev.includes(seatId) 
                ? prev.filter(id => id !== seatId)
                : [...prev, seatId]
        );
    };

    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <>
            <Navbar />
            <div className="container-fluid mt-4">
                <div className="admin-routes-container">
                    <div className="admin-header">
                        <h2>Train Management System</h2>
                        <div className="view-tabs">
                            <button 
                                className={currentView === 'routes' ? 'active' : ''}
                                onClick={() => setCurrentView('routes')}
                            >
                                Routes
                            </button>
                            <button 
                                className={currentView === 'coaches' ? 'active' : ''}
                                onClick={() => setCurrentView('coaches')}
                                disabled={!selectedTrainId}
                            >
                                Coaches
                            </button>
                            <button 
                                className={currentView === 'seats' ? 'active' : ''}
                                onClick={() => setCurrentView('seats')}
                                disabled={!selectedCoachId}
                            >
                                Seat Allocation
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className={`alert alert-${messageType === 'error' ? 'danger' : 'success'}`}>
                            {message}
                        </div>
                    )}

                    {/* Train Selection */}
                    <div className="train-selection mb-4">
                        <label className="form-label">Select Train:</label>
                        <select 
                            className="form-select"
                            value={selectedTrainId}
                            onChange={(e) => {
                                setSelectedTrainId(e.target.value);
                                setNewRoute({ ...newRoute, trainId: e.target.value });
                                setNewCoach({ ...newCoach, trainId: e.target.value });
                                setCurrentView('routes');
                            }}
                        >
                            <option value="">Choose a train...</option>
                            {trains.map(train => (
                                <option key={train.trainId} value={train.trainId}>
                                    {train.trainId} - {train.trainName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Routes View */}
                    {currentView === 'routes' && selectedTrainId && (
                        <div className="routes-view">
                            <h3>Route Management</h3>
                            
                            {/* Existing Routes */}
                            {routes.length > 0 && (
                                <div className="existing-routes mb-4">
                                    <h4>Existing Routes</h4>
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Sequence</th>
                                                    <th>Station</th>
                                                    <th>Station ID</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {routes.map(route => (
                                                    <tr key={route.routeId}>
                                                        <td>{route.sequenceNumber}</td>
                                                        <td>{route.stationName}</td>
                                                        <td>{route.stationId}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Add New Route */}
                            <div className="add-route-form">
                                <h4>Add New Route</h4>
                                <form onSubmit={handleAddRoute}>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label">Station:</label>
                                            <select
                                                className="form-select"
                                                value={newRoute.stationId}
                                                onChange={(e) => setNewRoute({ ...newRoute, stationId: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Station</option>
                                                {stations.map(station => (
                                                    <option key={station.stationId} value={station.stationId}>
                                                        {station.stationName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Sequence Number:</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={newRoute.sequenceNumber}
                                                onChange={(e) => setNewRoute({ ...newRoute, sequenceNumber: parseInt(e.target.value) })}
                                                min="1"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">&nbsp;</label>
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary d-block w-100"
                                                disabled={loading}
                                            >
                                                {loading ? 'Adding...' : 'Add Route'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Coaches View */}
                    {currentView === 'coaches' && selectedTrainId && (
                        <div className="coaches-view">
                            <h3>Coach Management</h3>
                            
                            {/* Existing Coaches */}
                            {coaches.length > 0 && (
                                <div className="existing-coaches mb-4">
                                    <h4>Existing Coaches</h4>
                                    <div className="coach-grid">
                                        {coaches.map(coach => (
                                            <div 
                                                key={coach.coachId} 
                                                className="coach-card"
                                                onClick={() => handleCoachClick(coach)}
                                            >
                                                <h5>{coach.coachId}</h5>
                                                <p>Class: {coach.className}</p>
                                                <p>Seats: {coach.seatCount}</p>
                                                <small>Click to manage seats</small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add New Coach */}
                            <div className="add-coach-form">
                                <h4>Add New Coach</h4>
                                <form onSubmit={handleAddCoach}>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label">Class:</label>
                                            <select
                                                className="form-select"
                                                value={newCoach.classId}
                                                onChange={(e) => setNewCoach({ ...newCoach, classId: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Class</option>
                                                {classes.map(cls => (
                                                    <option key={cls.classId} value={cls.classId}>
                                                        {cls.className}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Seat Count:</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={newCoach.seatCount}
                                                onChange={(e) => setNewCoach({ ...newCoach, seatCount: parseInt(e.target.value) })}
                                                min="1"
                                                max="100"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">&nbsp;</label>
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary d-block w-100"
                                                disabled={loading}
                                            >
                                                {loading ? 'Adding...' : 'Add Coach'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Seats View */}
                    {currentView === 'seats' && selectedCoachId && (
                        <div className="seats-view">
                            <h3>Seat Allocation Management</h3>
                            <p>Coach: {selectedCoachId}</p>
                            
                            {/* Allocation Form */}
                            <div className="allocation-form mb-4">
                                <h4>Allocation Details</h4>
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label">From Station:</label>
                                        <select
                                            className="form-select"
                                            value={allocationData.fromStationId}
                                            onChange={(e) => setAllocationData({ ...allocationData, fromStationId: e.target.value })}
                                        >
                                            <option value="">Select Station</option>
                                            {routes.map(route => (
                                                <option key={route.stationId} value={route.stationId}>
                                                    {route.stationName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">To Station:</label>
                                        <select
                                            className="form-select"
                                            value={allocationData.toStationId}
                                            onChange={(e) => setAllocationData({ ...allocationData, toStationId: e.target.value })}
                                        >
                                            <option value="">Select Station</option>
                                            {routes.map(route => (
                                                <option key={route.stationId} value={route.stationId}>
                                                    {route.stationName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Fare:</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={allocationData.fare}
                                            onChange={(e) => setAllocationData({ ...allocationData, fare: parseFloat(e.target.value) })}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">&nbsp;</label>
                                        <button 
                                            className="btn btn-success d-block w-100"
                                            onClick={handleAddSeatAllocations}
                                            disabled={loading || selectedSeats.length === 0}
                                        >
                                            Allocate {selectedSeats.length} Seats
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Seat Grid */}
                            {seats.length > 0 && (
                                <div className="seats-grid">
                                    <h4>Select Seats ({selectedSeats.length} selected)</h4>
                                    <div className="seat-map">
                                        {seats.map(seat => (
                                            <div 
                                                key={seat.seatId}
                                                className={`seat ${seat.isAllocated ? 'allocated' : 'available'} ${selectedSeats.includes(seat.seatId) ? 'selected' : ''}`}
                                                onClick={() => !seat.isAllocated && handleSeatToggle(seat.seatId)}
                                                title={`${seat.seatNumber} - ${seat.berthPosition}`}
                                            >
                                                {seat.seatNumber}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="seat-legend">
                                        <span className="legend-item"><span className="seat available"></span> Available</span>
                                        <span className="legend-item"><span className="seat allocated"></span> Allocated</span>
                                        <span className="legend-item"><span className="seat selected"></span> Selected</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminRoutes;

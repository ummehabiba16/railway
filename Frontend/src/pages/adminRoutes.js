import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/navBar';

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
            <Navbar />
            <div className="container mx-auto px-6 pt-24 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                        <h1 className="text-3xl font-bold font-bengali">ট্রেন ব্যবস্থাপনা সিস্টেম</h1>
                        
                        {/* Tab Navigation */}
                        <div className="flex space-x-2 mt-4">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 font-bengali ${
                                    currentView === 'routes' 
                                        ? 'bg-white text-blue-600 shadow-md' 
                                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                                }`}
                                onClick={() => setCurrentView('routes')}
                            >
                                রুট
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 font-bengali ${
                                    currentView === 'coaches' 
                                        ? 'bg-white text-blue-600 shadow-md' 
                                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                                } ${!selectedTrainId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setCurrentView('coaches')}
                                disabled={!selectedTrainId}
                            >
                                কোচ
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 font-bengali ${
                                    currentView === 'seats' 
                                        ? 'bg-white text-blue-600 shadow-md' 
                                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                                } ${!selectedCoachId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setCurrentView('seats')}
                                disabled={!selectedCoachId}
                            >
                                আসন বরাদ্দ
                            </motion.button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Message Display */}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mb-6 p-4 rounded-lg border ${
                                    messageType === 'error' 
                                        ? 'bg-red-50 border-red-200 text-red-800' 
                                        : 'bg-green-50 border-green-200 text-green-800'
                                }`}
                            >
                                {message}
                            </motion.div>
                        )}

                        {/* Train Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-bengali">ট্রেন নির্বাচন করুন:</label>
                            <select 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                value={selectedTrainId}
                                onChange={(e) => {
                                    setSelectedTrainId(e.target.value);
                                    setNewRoute({ ...newRoute, trainId: e.target.value });
                                    setNewCoach({ ...newCoach, trainId: e.target.value });
                                    setCurrentView('routes');
                                }}
                            >
                                <option value="">একটি ট্রেন বেছে নিন...</option>
                                {trains.map(train => (
                                    <option key={train.trainId} value={train.trainId}>
                                        {train.trainId} - {train.trainName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Routes View */}
                        {currentView === 'routes' && selectedTrainId && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-bold text-gray-800 font-bengali">রুট ব্যবস্থাপনা</h2>
                                
                                {/* Existing Routes */}
                                {routes.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4 font-bengali">বিদ্যমান রুট</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full bg-white rounded-lg shadow-sm">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ক্রম</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্টেশন</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্টেশন ID</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {routes.map((route, index) => (
                                                        <motion.tr 
                                                            key={route.routeId}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                                            className="hover:bg-gray-50"
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.sequenceNumber}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.stationName}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.stationId}</td>
                                                        </motion.tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Add New Route */}
                                <div className="bg-white rounded-lg p-6 border border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 font-bengali">নতুন রুট যোগ করুন</h3>
                                    <form onSubmit={handleAddRoute} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2 font-bengali">স্টেশন:</label>
                                                <select
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    value={newRoute.stationId}
                                                    onChange={(e) => setNewRoute({ ...newRoute, stationId: e.target.value })}
                                                    required
                                                >
                                                    <option value="">স্টেশন নির্বাচন করুন</option>
                                                    {stations.map(station => (
                                                        <option key={station.stationId} value={station.stationId}>
                                                            {station.stationName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2 font-bengali">ক্রম নম্বর:</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    value={newRoute.sequenceNumber}
                                                    onChange={(e) => setNewRoute({ ...newRoute, sequenceNumber: parseInt(e.target.value) })}
                                                    min="1"
                                                    required
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    type="submit" 
                                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bengali"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'যোগ হচ্ছে...' : 'রুট যোগ করুন'}
                                                </motion.button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {/* Coaches View */}
                        {currentView === 'coaches' && selectedTrainId && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-bold text-gray-800 font-bengali">কোচ ব্যবস্থাপনা</h2>
                                
                                {/* Existing Coaches */}
                                {coaches.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4 font-bengali">বিদ্যমান কোচ</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {coaches.map((coach, index) => (
                                                <motion.div 
                                                    key={coach.coachId}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                    whileHover={{ scale: 1.05, y: -5 }}
                                                    className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg cursor-pointer border border-gray-200 transition-all duration-300"
                                                    onClick={() => handleCoachClick(coach)}
                                                >
                                                    <h4 className="text-lg font-bold text-blue-600 mb-2">{coach.coachId}</h4>
                                                    <p className="text-gray-600 mb-1 font-bengali">শ্রেণী: <span className="font-medium">{coach.className}</span></p>
                                                    <p className="text-gray-600 mb-2 font-bengali">আসন: <span className="font-medium">{coach.seatCount}</span></p>
                                                    <p className="text-xs text-blue-500 font-bengali">আসন পরিচালনার জন্য ক্লিক করুন</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add New Coach */}
                                <div className="bg-white rounded-lg p-6 border border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 font-bengali">নতুন কোচ যোগ করুন</h3>
                                    <form onSubmit={handleAddCoach} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2 font-bengali">শ্রেণী:</label>
                                                <select
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    value={newCoach.classId}
                                                    onChange={(e) => setNewCoach({ ...newCoach, classId: e.target.value })}
                                                    required
                                                >
                                                    <option value="">শ্রেণী নির্বাচন করুন</option>
                                                    {classes.map(cls => (
                                                        <option key={cls.classId} value={cls.classId}>
                                                            {cls.className}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2 font-bengali">আসন সংখ্যা:</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    value={newCoach.seatCount}
                                                    onChange={(e) => setNewCoach({ ...newCoach, seatCount: parseInt(e.target.value) })}
                                                    min="1"
                                                    max="100"
                                                    required
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    type="submit" 
                                                    className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bengali"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'যোগ হচ্ছে...' : 'কোচ যোগ করুন'}
                                                </motion.button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {/* Seats View */}
                        {currentView === 'seats' && selectedCoachId && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 font-bengali">আসন বরাদ্দ ব্যবস্থাপনা</h2>
                                    <p className="text-gray-600 font-bengali">কোচ: <span className="font-medium">{selectedCoachId}</span></p>
                                </div>
                                
                                {/* Allocation Form */}
                                <div className="bg-white rounded-lg p-6 border border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 font-bengali">বরাদ্দের বিবরণ</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 font-bengali">থেকে স্টেশন:</label>
                                            <select
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                value={allocationData.fromStationId}
                                                onChange={(e) => setAllocationData({ ...allocationData, fromStationId: e.target.value })}
                                            >
                                                <option value="">স্টেশন নির্বাচন করুন</option>
                                                {routes.map(route => (
                                                    <option key={route.stationId} value={route.stationId}>
                                                        {route.stationName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 font-bengali">গন্তব্য স্টেশন:</label>
                                            <select
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                value={allocationData.toStationId}
                                                onChange={(e) => setAllocationData({ ...allocationData, toStationId: e.target.value })}
                                            >
                                                <option value="">স্টেশন নির্বাচন করুন</option>
                                                {routes.map(route => (
                                                    <option key={route.stationId} value={route.stationId}>
                                                        {route.stationName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 font-bengali">ভাড়া:</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                value={allocationData.fare}
                                                onChange={(e) => setAllocationData({ ...allocationData, fare: parseFloat(e.target.value) })}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <motion.button 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bengali"
                                                onClick={handleAddSeatAllocations}
                                                disabled={loading || selectedSeats.length === 0}
                                            >
                                                {selectedSeats.length} আসন বরাদ্দ করুন
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>

                                {/* Seat Grid */}
                                {seats.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4 font-bengali">
                                            আসন নির্বাচন করুন ({selectedSeats.length} টি নির্বাচিত)
                                        </h3>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 mb-4">
                                            {seats.map((seat, index) => (
                                                <motion.div 
                                                    key={seat.seatId}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.2, delay: index * 0.02 }}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`
                                                        w-12 h-12 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200 border-2
                                                        ${seat.isAllocated 
                                                            ? 'bg-red-100 border-red-300 text-red-700 cursor-not-allowed' 
                                                            : selectedSeats.includes(seat.seatId)
                                                                ? 'bg-blue-500 border-blue-600 text-white shadow-lg'
                                                                : 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                                                        }
                                                    `}
                                                    onClick={() => !seat.isAllocated && handleSeatToggle(seat.seatId)}
                                                    title={`${seat.seatNumber} - ${seat.berthPosition}`}
                                                >
                                                    {seat.seatNumber}
                                                </motion.div>
                                            ))}
                                        </div>
                                        
                                        {/* Legend */}
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                                                <span className="font-bengali">উপলব্ধ</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                                                <span className="font-bengali">বরাদ্দকৃত</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded"></div>
                                                <span className="font-bengali">নির্বাচিত</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminRoutes;

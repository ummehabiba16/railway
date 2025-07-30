import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/navBar';
import api from '../api';

function AdminStations() {
    const navigate = useNavigate();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingField, setEditingField] = useState(null);
    const [showMasterForm, setShowMasterForm] = useState(null);
    const [passwordVisibility, setPasswordVisibility] = useState({});
    const [masterForm, setMasterForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [validationErrors, setValidationErrors] = useState({});

    // Add Station states
    const [showAddStation, setShowAddStation] = useState(false);
    const [addStationStep, setAddStationStep] = useState('station'); // 'station' or 'master'
    const [newStationData, setNewStationData] = useState({
        name: '',
        isOnline: 'Y',
        location: '',
        division: '',
        contactNum: '',
        status: 'ACTIVE'
    });
    const [newMasterData, setNewMasterData] = useState({
        name: '',
        email: '',
        phoneNum: '',
        password: ''
    });
    const [createdStationId, setCreatedStationId] = useState('');
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
    const [showNewMasterPassword, setShowNewMasterPassword] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        if (!token || userRole !== 'ADMIN') {
            navigate('/login');
            return;
        }

        fetchStations();
    }, [navigate]);

    const fetchStations = async () => {
        try {
            const response = await api.get('/admin/stations');
            setStations(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stations:', error);
            setError('Failed to load stations data');
            setLoading(false);
        }
    };

    const validateField = (fieldName, value) => {
        const requiredFields = ['stationName', 'location', 'division', 'contactNum'];

        if (requiredFields.includes(fieldName) && (!value || value.trim() === '')) {
            return `${fieldName} is required`;
        }

        if (fieldName === 'contactNum' && value && !/^\d{10,14}$/.test(value)) {
            return 'Contact number must be 10-14 digits';
        }

        if (fieldName === 'masterEmail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Invalid email format';
        }

        if (fieldName === 'masterPhone' && value && !/^\d{10,14}$/.test(value)) {
            return 'Phone number must be 10-14 digits';
        }

        if (fieldName === 'password' && value && value.length < 6) {
            return 'Password must be at least 6 characters';
        }

        return null;
    };

    const togglePasswordVisibility = (stationId) => {
        setPasswordVisibility(prev => ({
            ...prev,
            [stationId]: !prev[stationId]
        }));
    };

    const updateField = async (stationId, fieldName, value) => {
        const validationError = validateField(fieldName, value);
        if (validationError) {
            setValidationErrors(prev => ({
                ...prev,
                [`${stationId}_${fieldName}`]: validationError
            }));
            return;
        }

        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`${stationId}_${fieldName}`];
            return newErrors;
        });

        try {
            await api.put(`/admin/stations/${stationId}?fieldName=${fieldName}&value=${encodeURIComponent(value)}`);

            setStations(prevStations =>
                prevStations.map(station =>
                    station.stationId === stationId
                        ? { ...station, [fieldName]: value }
                        : station
                )
            );
            setEditingField(null);
        } catch (error) {
            console.error('Error updating field:', error);
            setError('Failed to update field');
        }
    };

    const handleMasterFormSubmit = async (stationId) => {
        const errors = {};
        if (!masterForm.name.trim()) errors.name = 'Name is required';
        if (!masterForm.email.trim()) errors.email = 'Email is required';
        if (!masterForm.phone.trim()) errors.phone = 'Phone is required';
        if (!masterForm.password.trim()) errors.password = 'Password is required';

        if (masterForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(masterForm.email)) {
            errors.email = 'Invalid email format';
        }

        if (masterForm.phone && !/^\d{10,14}$/.test(masterForm.phone)) {
            errors.phone = 'Phone number must be 10-14 digits';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', masterForm.name);
            formData.append('email', masterForm.email);
            formData.append('phone', masterForm.phone);
            formData.append('password', masterForm.password);

            await api.post(`/admin/stations/${stationId}/master`, formData);

            setShowMasterForm(null);
            setMasterForm({ name: '', email: '', phone: '', password: '' });
            setValidationErrors({});
            fetchStations();
        } catch (error) {
            console.error('Error creating station master:', error);
            setError('Failed to create station master');
        }
    };

    // Add Station Functions
    const handleCreateStation = async () => {
        setSubmitMessage({ type: '', text: '' });

        // Validate station data
        const errors = {};
        if (!newStationData.name.trim()) {
            errors.name = 'Station name is required';
        }
        if (newStationData.contactNum && !/^\d{10,14}$/.test(newStationData.contactNum)) {
            errors.contactNum = 'Contact number must be 10-14 digits';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            const response = await api.post("/admin/stations", newStationData);

            if (response.data.status === 'success') {
                setCreatedStationId(response.data.stationId);
                setSubmitMessage({
                    type: 'success',
                    text: response.data.message
                });
                setAddStationStep('master');
                setValidationErrors({});
            } else {
                setSubmitMessage({
                    type: 'error',
                    text: response.data.message || 'Failed to create station'
                });
            }
        } catch (error) {
            console.error('Error creating station:', error);
            let errorMessage = 'Failed to create station';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setSubmitMessage({ type: 'error', text: errorMessage });
        }
    };

    const handleCreateStationMaster = async () => {
        setSubmitMessage({ type: '', text: '' });

        // Validate master data
        const errors = {};
        if (!newMasterData.name.trim()) errors.masterName = 'Station master name is required';
        if (!newMasterData.email.trim()) errors.masterEmail = 'Email is required';
        if (!newMasterData.phoneNum.trim()) errors.masterPhone = 'Phone number is required';
        if (!newMasterData.password.trim()) errors.masterPassword = 'Password is required';

        if (newMasterData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMasterData.email)) {
            errors.masterEmail = 'Invalid email format';
        }

        if (newMasterData.phoneNum && !/^\d{10,14}$/.test(newMasterData.phoneNum)) {
            errors.masterPhone = 'Phone number must be 10-14 digits';
        }

        if (newMasterData.password && newMasterData.password.length < 6) {
            errors.masterPassword = 'Password must be at least 6 characters';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            const response = await api.post(`/admin/stations/${createdStationId}/station-master`, newMasterData);

            if (response.data.status === 'success') {
                setSubmitMessage({
                    type: 'success',
                    text: 'Station and station master created successfully!'
                });

                // Reset all form data and close the form
                setTimeout(() => {
                    setShowAddStation(false);
                    setAddStationStep('station');
                    setNewStationData({
                        name: '',
                        isOnline: 'Y',
                        location: '',
                        division: '',
                        contactNum: '',
                        status: 'ACTIVE'
                    });
                    setNewMasterData({
                        name: '',
                        email: '',
                        phoneNum: '',
                        password: ''
                    });
                    setCreatedStationId('');
                    setSubmitMessage({ type: '', text: '' });
                    setValidationErrors({});
                    fetchStations(); // Refresh the station list
                }, 2000);
            } else {
                setSubmitMessage({
                    type: 'error',
                    text: response.data.message || 'Failed to create station master'
                });
            }
        } catch (error) {
            console.error('Error creating station master:', error);
            let errorMessage = 'Failed to create station master';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setSubmitMessage({ type: 'error', text: errorMessage });
        }
    };

    const resetAddStationForm = () => {
        setShowAddStation(false);
        setAddStationStep('station');
        setNewStationData({
            name: '',
            isOnline: 'Y',
            location: '',
            division: '',
            contactNum: '',
            status: 'ACTIVE'
        });
        setNewMasterData({
            name: '',
            email: '',
            phoneNum: '',
            password: ''
        });
        setCreatedStationId('');
        setSubmitMessage({ type: '', text: '' });
        setValidationErrors({});
    };

    const renderEditableField = (station, fieldName, displayName) => {
        const fieldValue = station[fieldName] || '';
        const fieldId = `${station.stationId}_${fieldName}`;
        const isEditing = editingField === fieldId;
        const errorKey = `${station.stationId}_${fieldName}`;
        const hasError = validationErrors[errorKey];

        if (fieldName === 'isOnline' || fieldName === 'status') {
            const options = fieldName === 'isOnline'
                ? [{ value: 'Y', label: 'Online' }, { value: 'N', label: 'Offline' }]
                : [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }];

            return (
                <div className="mb-3" key={fieldName}>
                    <strong className="text-blue-800 font-semibold">{displayName}:</strong>
                    {isEditing ? (
                        <select
                            className="w-full mt-1 px-3 py-2 bg-white/50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                            value={fieldValue}
                            onChange={(e) => updateField(station.stationId, fieldName, e.target.value)}
                            onBlur={() => setEditingField(null)}
                            autoFocus
                        >
                            {options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <span
                            className="text-blue-600 cursor-pointer ml-2 hover:text-blue-800 transition-colors duration-200 underline decoration-blue-300 hover:decoration-blue-500"
                            onClick={() => setEditingField(fieldId)}
                        >
                            {options.find(opt => opt.value === fieldValue)?.label || fieldValue}
                        </span>
                    )}
                    {hasError && <div className="text-red-500 text-sm mt-1">{validationErrors[errorKey]}</div>}
                </div>
            );
        }

        // Special handling for password field
        if (fieldName === 'password') {
            const isPasswordVisible = passwordVisibility[station.stationId];

            return (
                <div className="mb-3" key={fieldName}>
                    <strong className="text-blue-800 font-semibold">{displayName}:</strong>
                    <div className="flex items-center mt-1 space-x-2">
                        {isEditing ? (
                            <div className="flex-grow">
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 bg-white/50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                                    placeholder="Enter new password"
                                    onBlur={(e) => {
                                        if (e.target.value.trim()) {
                                            updateField(station.stationId, fieldName, e.target.value);
                                        } else {
                                            setEditingField(null);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            updateField(station.stationId, fieldName, e.target.value);
                                        } else if (e.key === 'Escape') {
                                            setEditingField(null);
                                        }
                                    }}
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <>
                                <span className="flex-grow text-blue-700">
                                    {isPasswordVisible ? fieldValue : '••••••••'}
                                </span>
                                <button
                                    className="px-2 py-1 bg-blue-100/50 border border-blue-200 rounded-lg hover:bg-blue-200/50 transition-colors duration-200 backdrop-blur-sm"
                                    onClick={() => togglePasswordVisibility(station.stationId)}
                                    type="button"
                                >
                                    {isPasswordVisible ? '👁️‍🗨️' : '👁️'}
                                </button>
                                <button
                                    className="px-2 py-1 bg-blue-100/50 border border-blue-200 rounded-lg hover:bg-blue-200/50 transition-colors duration-200 backdrop-blur-sm"
                                    onClick={() => setEditingField(fieldId)}
                                    type="button"
                                >
                                    ✏️
                                </button>
                            </>
                        )}
                    </div>
                    {hasError && <div className="text-red-500 text-sm mt-1">{validationErrors[errorKey]}</div>}
                </div>
            );
        }

        return (
            <div className="mb-3" key={fieldName}>
                <strong className="text-blue-800 font-semibold">{displayName}:</strong>
                {isEditing ? (
                    <input
                        type="text"
                        className="w-full mt-1 px-3 py-2 bg-white/50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                        value={fieldValue}
                        onChange={(e) => {
                            setStations(prevStations =>
                                prevStations.map(s =>
                                    s.stationId === station.stationId
                                        ? { ...s, [fieldName]: e.target.value }
                                        : s
                                )
                            );
                        }}
                        onBlur={(e) => updateField(station.stationId, fieldName, e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                updateField(station.stationId, fieldName, e.target.value);
                            } else if (e.key === 'Escape') {
                                setEditingField(null);
                                fetchStations();
                            }
                        }}
                        autoFocus
                    />
                ) : (
                    <span
                        className="text-blue-600 cursor-pointer ml-2 hover:text-blue-800 transition-colors duration-200 underline decoration-blue-300 hover:decoration-blue-500"
                        onClick={() => setEditingField(fieldId)}
                    >
                        {fieldValue || 'Click to edit'}
                    </span>
                )}
                {hasError && <div className="text-red-500 text-sm mt-1">{validationErrors[errorKey]}</div>}
            </div>
        );
    };

    const renderMasterForm = (stationId) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-4 mt-4 shadow-lg"
        >
            <h6 className="text-lg font-bold text-blue-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                Create Station Master
            </h6>
            <div className="mb-3">
                <label className="block text-blue-700 font-semibold mb-1">Name:</label>
                <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    value={masterForm.name}
                    onChange={(e) => setMasterForm(prev => ({ ...prev, name: e.target.value }))}
                />
                {validationErrors.name && <div className="text-red-500 text-sm mt-1">{validationErrors.name}</div>}
            </div>
            <div className="mb-3">
                <label className="block text-blue-700 font-semibold mb-1">Email:</label>
                <input
                    type="email"
                    className="w-full px-3 py-2 bg-white/50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    value={masterForm.email}
                    onChange={(e) => setMasterForm(prev => ({ ...prev, email: e.target.value }))}
                />
                {validationErrors.email && <div className="text-red-500 text-sm mt-1">{validationErrors.email}</div>}
            </div>
            <div className="mb-3">
                <label className="block text-blue-700 font-semibold mb-1">Phone:</label>
                <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    value={masterForm.phone}
                    onChange={(e) => setMasterForm(prev => ({ ...prev, phone: e.target.value }))}
                />
                {validationErrors.phone && <div className="text-red-500 text-sm mt-1">{validationErrors.phone}</div>}
            </div>
            <div className="mb-4">
                <label className="block text-blue-700 font-semibold mb-1">Password:</label>
                <input
                    type="password"
                    className="w-full px-3 py-2 bg-white/50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    value={masterForm.password}
                    onChange={(e) => setMasterForm(prev => ({ ...prev, password: e.target.value }))}
                />
                {validationErrors.password && <div className="text-red-500 text-sm mt-1">{validationErrors.password}</div>}
            </div>
            <div className="flex space-x-3">
                <button
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg"
                    onClick={() => handleMasterFormSubmit(stationId)}
                >
                    Create Master
                </button>
                <button
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg"
                    onClick={() => {
                        setShowMasterForm(null);
                        setMasterForm({ name: '', email: '', phone: '', password: '' });
                        setValidationErrors({});
                    }}
                >
                    Cancel
                </button>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
                <Navbar />
                <main className="relative min-h-screen px-6 pt-24 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-12 shadow-2xl"
                        >
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
                            <h3 className="text-2xl font-bold text-blue-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                স্টেশন তথ্য লোড হচ্ছে...
                            </h3>
                        </motion.div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
                <Navbar />
                <main className="relative min-h-screen px-6 pt-24 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/20 backdrop-blur-xl border border-red-300 rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <span className="text-4xl animate-pulse">❌</span>
                                    <div>
                                        <h3 className="text-2xl font-bold text-red-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            এরর
                                        </h3>
                                        <p className="text-red-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={fetchStations}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors duration-200 shadow-lg"
                                >
                                    পুনরায় চেষ্টা করুন
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
            <Navbar />
            <main className="relative min-h-screen px-6 pt-24 pb-12">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-blue-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] mb-4 sm:mb-0">
                            স্টেশন ব্যবস্থাপনা
                        </h2>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                            <button
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                onClick={() => setShowAddStation(true)}
                            >
                                + নতুন স্টেশন যোগ করুন
                            </button>
                            <button
                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                onClick={() => navigate('/admin/dashboard')}
                            >
                                ← ড্যাশবোর্ডে ফিরুন
                            </button>
                        </div>
                    </motion.div>

                    {/* Add Station Form */}
                    {showAddStation && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl mb-8"
                        >
                            <div className="border-b border-blue-200 pb-4 mb-6">
                                <h5 className="text-2xl font-bold text-blue-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                    {addStationStep === 'station' ? 'নতুন স্টেশন যোগ করুন' : 'স্টেশন মাস্টার নিয়োগ করুন'}
                                </h5>
                            </div>

                            {/* Submit Message */}
                            {submitMessage.text && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mb-6 p-4 rounded-xl font-semibold ${submitMessage.type === 'success'
                                            ? 'bg-green-100/50 text-green-800 border border-green-200'
                                            : 'bg-red-100/50 text-red-800 border border-red-200'
                                        } backdrop-blur-sm`}
                                >
                                    {submitMessage.text}
                                </motion.div>
                            )}

                            {addStationStep === 'station' ? (
                                /* Station Form */
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-blue-700 font-semibold mb-2">স্টেশনের নাম *</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                                                value={newStationData.name}
                                                onChange={(e) => setNewStationData(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="স্টেশনের নাম লিখুন"
                                            />
                                            {validationErrors.name && <div className="text-red-500 text-sm mt-1">{validationErrors.name}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-blue-700 font-semibold mb-2">অনলাইন স্ট্যাটাস</label>
                                            <select
                                                className="w-full px-4 py-3 bg-white/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                                                value={newStationData.isOnline}
                                                onChange={(e) => setNewStationData(prev => ({ ...prev, isOnline: e.target.value }))}
                                            >
                                                <option value="Y">অনলাইন</option>
                                                <option value="N">অফলাইন</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <div>
                                            <label className="block text-blue-700 font-semibold mb-2">অবস্থান</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                                                value={newStationData.location}
                                                onChange={(e) => setNewStationData(prev => ({ ...prev, location: e.target.value }))}
                                                placeholder="অবস্থান লিখুন"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-blue-700 font-semibold mb-2">বিভাগ</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                                                value={newStationData.division}
                                                onChange={(e) => setNewStationData(prev => ({ ...prev, division: e.target.value }))}
                                                placeholder="বিভাগ লিখুন"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <div>
                                            <label className="block text-blue-700 font-semibold mb-2">যোগাযোগ নম্বর</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                                                value={newStationData.contactNum}
                                                onChange={(e) => setNewStationData(prev => ({ ...prev, contactNum: e.target.value }))}
                                                placeholder="যোগাযোগ নম্বর লিখুন (১০-১৪ ডিজিট)"
                                            />
                                            {validationErrors.contactNum && <div className="text-red-500 text-sm mt-1">{validationErrors.contactNum}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-blue-700 font-semibold mb-2">স্ট্যাটাস</label>
                                            <select
                                                className="w-full px-4 py-3 bg-white/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                                                value={newStationData.status}
                                                onChange={(e) => setNewStationData(prev => ({ ...prev, status: e.target.value }))}
                                            >
                                                <option value="ACTIVE">সক্রিয়</option>
                                                <option value="INACTIVE">নিষ্ক্রিয়</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex space-x-4 mt-8">
                                        <button
                                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                            onClick={handleCreateStation}
                                        >
                                            স্টেশন তৈরি করুন
                                        </button>
                                        <button
                                            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                            onClick={resetAddStationForm}
                                        >
                                            বাতিল
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Station Master Form */
                                <div>
                                    <div className="bg-blue-100/50 border border-blue-200 rounded-xl p-4 mb-6 backdrop-blur-sm">
                                        স্টেশন সফলভাবে তৈরি হয়েছে! স্টেশন আইডি: <strong className="text-blue-800">{createdStationId}</strong>
                                        <br />এখন সেটআপ সম্পূর্ণ করতে একজন স্টেশন মাস্টার নিয়োগ করুন।
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-blue-700 font-semibold mb-2">মাস্টারের নাম *</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                                                value={newMasterData.name}
                                                onChange={(e) => setNewMasterData(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="স্টেশন মাস্টারের নাম লিখুন"
                                            />
                                            {validationErrors.masterName && <div className="text-red-500 text-sm mt-1">{validationErrors.masterName}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-blue-700 font-semibold mb-2">ইমেইল *</label>
                                            <input
                                                type="email"
                                                className="w-full px-4 py-3 bg-white/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                                                value={newMasterData.email}
                                                onChange={(e) => setNewMasterData(prev => ({ ...prev, email: e.target.value }))}
                                                placeholder="ইমেইল ঠিকানা লিখুন"
                                            />
                                            {validationErrors.masterEmail && <div className="text-red-500 text-sm mt-1">{validationErrors.masterEmail}</div>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <div>
                                            <label className="block text-blue-700 font-semibold mb-2">ফোন নম্বর *</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                                                value={newMasterData.phoneNum}
                                                onChange={(e) => setNewMasterData(prev => ({ ...prev, phoneNum: e.target.value }))}
                                                placeholder="ফোন নম্বর লিখুন (১০-১৪ ডিজিট)"
                                            />
                                            {validationErrors.masterPhone && <div className="text-red-500 text-sm mt-1">{validationErrors.masterPhone}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-blue-700 font-semibold mb-2">পাসওয়ার্ড *</label>
                                            <div className="relative">
                                                <input
                                                    type={showNewMasterPassword ? "text" : "password"}
                                                    className="w-full px-4 py-3 bg-white/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 pr-12"
                                                    value={newMasterData.password}
                                                    onChange={(e) => setNewMasterData(prev => ({ ...prev, password: e.target.value }))}
                                                    placeholder="পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর)"
                                                />
                                                <button
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                                    type="button"
                                                    onClick={() => setShowNewMasterPassword(!showNewMasterPassword)}
                                                >
                                                    {showNewMasterPassword ? '👁️‍🗨️' : '👁️'}
                                                </button>
                                            </div>
                                            {validationErrors.masterPassword && <div className="text-red-500 text-sm mt-1">{validationErrors.masterPassword}</div>}
                                        </div>
                                    </div>
                                    <div className="flex space-x-4 mt-8">
                                        <button
                                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                            onClick={handleCreateStationMaster}
                                        >
                                            স্টেশন মাস্টার তৈরি করুন
                                        </button>
                                        <button
                                            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                            onClick={resetAddStationForm}
                                        >
                                            বাতিল
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Stations List */}
                    {stations.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-blue-100/50 backdrop-blur-xl border border-blue-200 rounded-3xl p-8 shadow-2xl text-center"
                        >
                            <p className="text-blue-800 text-lg font-semibold font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                কোন স্টেশন পাওয়া যায়নি।
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stations.map((station, index) => (
                                <motion.div
                                    key={station.stationId}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2"
                                >
                                    <div className="border-b border-blue-200 pb-4 mb-6">
                                        <h5 className="text-xl font-bold text-blue-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            স্টেশন: {station.stationId}
                                        </h5>
                                    </div>

                                    {/* Station Information */}
                                    <div className="mb-6">
                                        <h6 className="text-lg font-semibold text-blue-700 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            স্টেশনের তথ্য
                                        </h6>
                                        {renderEditableField(station, 'stationName', 'স্টেশনের নাম')}
                                        {renderEditableField(station, 'isOnline', 'অনলাইন স্ট্যাটাস')}
                                        {renderEditableField(station, 'location', 'অবস্থান')}
                                        {renderEditableField(station, 'division', 'বিভাগ')}
                                        {renderEditableField(station, 'contactNum', 'যোগাযোগ নম্বর')}
                                        {renderEditableField(station, 'status', 'স্ট্যাটাস')}
                                    </div>

                                    <hr className="border-blue-200 my-6" />

                                    {/* Station Master Information */}
                                    <div>
                                        <h6 className="text-lg font-semibold text-blue-700 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            স্টেশন মাস্টারের তথ্য
                                        </h6>
                                        {station.masterName ? (
                                            <div>
                                                {renderEditableField(station, 'masterName', 'মাস্টারের নাম')}
                                                {renderEditableField(station, 'masterEmail', 'মাস্টারের ইমেইল')}
                                                {renderEditableField(station, 'masterPhone', 'মাস্টারের ফোন')}
                                                {renderEditableField(station, 'password', 'পাসওয়ার্ড')}
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-blue-600 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    কোন স্টেশন মাস্টার নিয়োগ করা হয়নি
                                                </p>
                                                {showMasterForm === station.stationId ? (
                                                    renderMasterForm(station.stationId)
                                                ) : (
                                                    <button
                                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                                        onClick={() => setShowMasterForm(station.stationId)}
                                                    >
                                                        স্টেশন মাস্টার নিয়োগ করুন
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AdminStations;

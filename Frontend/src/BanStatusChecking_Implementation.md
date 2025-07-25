# Ban Status Checking Implementation

## Overview
Added comprehensive ban status checking throughout the booking flow to prevent banned users from proceeding with any booking-related actions.

## Ban Check Points Implemented

### 1. **Search and Initial Booking** (`searchTrainForm.js`)
- **Location**: `handleBookNow()` function
- **Purpose**: Prevents banned users from starting the booking process
- **Behavior**: Shows ban popup with countdown timer if user is banned

### 2. **Seat Selection** (`searchTrainForm.js`)
- **Location**: `handleSeatSelection()` function  
- **Purpose**: Prevents banned users from selecting seats
- **Behavior**: Shows ban popup immediately when user tries to select a seat while banned

### 3. **Booking Confirmation** (`searchTrainForm.js`)
- **Location**: `handleBookSelectedSeats()` function
- **Purpose**: Final check before creating the booking record
- **Behavior**: Prevents booking creation if user gets banned during seat selection

### 4. **Invoice Generation** (`booking.js`)
- **Location**: `handleGenerateInvoice()` function
- **Purpose**: Prevents banned users from generating invoices for passenger details
- **Behavior**: Shows ban popup if user tries to proceed while banned

### 5. **Payment Processing** (`booking.js`)
- **Location**: `handleBkashPayment()` function
- **Purpose**: Final check before payment gateway redirect
- **Behavior**: Prevents payment initiation if user is banned

## Ban Popup Features

### **Timer Display**
- Shows remaining time in MM:SS format (e.g., "04:23")
- Counts down in real-time every second
- Updates display until it reaches "00:00"

### **Auto-Unban Detection**
- When timer reaches "00:00", shows "UNBAN_READY" message
- Auto-closes popup after 2 seconds
- Enables "Try Again" button

### **User Controls**
- **Close Button**: Allows user to dismiss popup (ban still active)
- **Try Again Button**: Only enabled when ban expires
- **Try Again** clears ban state and allows user to continue

## Technical Implementation

### **Ban Status API**
```javascript
const response = await api.get(`/user/banned/${userId}`);
```

**Response Format:**
```json
{
  "status": "BANNED",
  "bannedUntil": "04:23"  // MM:SS format
}
```

### **Frontend Ban Check Function**
```javascript
const checkBannedStatus = async () => {
  try {
    const userId = localStorage.getItem("userId");
    if (userId) {
      const response = await api.get(`/user/banned/${userId}`);
      const banStatus = response.data.bannedUntil;
      
      if (banStatus && banStatus !== "NOT_BANNED") {
        setBannedUntil(banStatus);
        setShowBanPopup(true);
        return true; // User is banned
      } else {
        setBannedUntil(null);
        setShowBanPopup(false);
        return false; // User is not banned
      }
    }
  } catch (err) {
    console.error("Error checking banned status:", err);
    return false;
  }
};
```

### **Ban Timer Effect**
```javascript
useEffect(() => {
  if (!bannedUntil || !showBanPopup || bannedUntil === "NOT_BANNED") return;

  setBanTimeRemaining(bannedUntil);

  const updateBanTimer = () => {
    const timeString = banTimeRemaining || bannedUntil;
    
    if (!timeString || !timeString.includes(':')) {
      setBanTimeRemaining("00:00");
      return;
    }
    
    const [minutes, seconds] = timeString.split(':').map(Number);
    
    if (isNaN(minutes) || isNaN(seconds)) {
      setBanTimeRemaining("00:00");
      return;
    }
    
    let totalSeconds = minutes * 60 + seconds - 1;
    
    if (totalSeconds <= 0) {
      setBanTimeRemaining("UNBAN_READY");
      setTimeout(() => {
        setShowBanPopup(false);
        setBannedUntil(null);
        setBanTimeRemaining("");
      }, 2000);
      return;
    }

    const newMinutes = Math.floor(totalSeconds / 60);
    const newSeconds = totalSeconds % 60;
    const newTimeString = `${newMinutes}:${newSeconds.toString().padStart(2, '0')}`;
    
    setBanTimeRemaining(newTimeString);
    setBannedUntil(newTimeString);
  };

  const banInterval = setInterval(updateBanTimer, 1000);
  return () => clearInterval(banInterval);
}, [bannedUntil, showBanPopup, banTimeRemaining]);
```

## User Experience Flow

### **Normal User (Not Banned)**
1. User clicks "Book Now" → Proceeds to seat selection
2. User selects seats → Seats get selected normally  
3. User clicks "Book X Seats" → Goes to booking details page
4. User fills passenger details → Invoice gets generated
5. User clicks "Pay Now" → Redirected to payment gateway

### **Banned User**
1. User clicks "Book Now" → Ban popup appears with timer
2. User tries to select seats → Ban popup appears immediately
3. User tries any booking action → Ban popup prevents action
4. Timer counts down → When expires, "Try Again" button enables
5. User clicks "Try Again" → Ban state clears, can proceed normally

## Error Handling

### **Network Errors**
- If ban check API fails, assume user is not banned
- Log error for debugging but don't block user

### **Invalid Time Format**
- If backend returns invalid time format, fallback to "00:00"
- Log error and handle gracefully

### **Race Conditions**
- Multiple ban checks can run simultaneously
- Each check is independent and won't interfere

## Benefits

✅ **Complete Protection**: All booking actions check ban status
✅ **Real-time Updates**: Timer counts down live
✅ **User Friendly**: Clear messaging and visual countdown
✅ **Graceful Recovery**: Easy to try again when ban expires
✅ **Error Resilient**: Handles network errors and invalid data
✅ **Performance Optimized**: Only checks when user takes action

## Testing Scenarios

1. **Create booking** → Get banned → **Timer should appear**
2. **Try seat selection while banned** → **Should show popup**
3. **Wait for timer to expire** → **"Try Again" should enable**
4. **Click "Try Again"** → **Should allow normal booking**
5. **Network error during ban check** → **Should allow booking (fail-safe)**

The implementation ensures that banned users cannot proceed with any part of the booking process while providing a smooth experience with clear feedback and easy recovery when the ban expires.

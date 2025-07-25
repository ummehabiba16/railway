# Fix for NaN:NaN Ban Timer Issue

## Problem
The ban timer was showing "NaN:NaN" instead of the proper MM:SS format. The backend was returning a timestamp format like `"+000000000 00:03:51.223326000"` instead of the expected "MM:SS" format.

## Root Cause
The Oracle SQL query was using `NUMTODSINTERVAL` with `TO_CHAR(..., 'MI:SS')` which doesn't work correctly for INTERVAL data types in Oracle.

## Solution

### 1. **Fixed Backend SQL Query**
Updated the `getBanStatus()` method in `USER_INFO_REPOSITORY.java` to use proper Oracle functions:

```sql
SELECT 
  CASE 
    WHEN MAX(BOOKINGTIME) > CURRENT_TIMESTAMP - INTERVAL '5' MINUTE THEN
      LPAD(FLOOR((300 - (EXTRACT(HOUR FROM (CURRENT_TIMESTAMP - MAX(BOOKINGTIME))) * 3600 +
                         EXTRACT(MINUTE FROM (CURRENT_TIMESTAMP - MAX(BOOKINGTIME))) * 60 +
                         EXTRACT(SECOND FROM (CURRENT_TIMESTAMP - MAX(BOOKINGTIME))))) / 60), 2, '0')
      || ':' || 
      LPAD(MOD((300 - (EXTRACT(HOUR FROM (CURRENT_TIMESTAMP - MAX(BOOKINGTIME))) * 3600 +
                       EXTRACT(MINUTE FROM (CURRENT_TIMESTAMP - MAX(BOOKINGTIME))) * 60 +
                       EXTRACT(SECOND FROM (CURRENT_TIMESTAMP - MAX(BOOKINGTIME))))), 60), 2, '0')
    ELSE
      'NOT_BANNED'
  END AS TIME_REMAINING
FROM BOOKING
WHERE USERID = ?
  AND BOOKINGTIME > CURRENT_TIMESTAMP - INTERVAL '5' MINUTE
```

**Key Changes:**
- Uses `EXTRACT(HOUR/MINUTE/SECOND FROM ...)` to get time components
- Calculates total elapsed seconds manually
- Subtracts from 300 (5 minutes in seconds) to get remaining seconds
- Uses `FLOOR()` and `MOD()` to convert to MM:SS format
- Uses `LPAD()` to ensure zero-padding (e.g., "04:23" instead of "4:23")

### 2. **Enhanced Frontend Error Handling**
Updated both `booking.js` and `searchTrainForm.js` to handle parsing errors:

```javascript
// Parse the current time remaining (MM:SS format)
const timeString = banTimeRemaining || bannedUntil;

// Check if the format is valid MM:SS
if (!timeString || !timeString.includes(':')) {
  console.error("Invalid time format:", timeString);
  setBanTimeRemaining("00:00");
  return;
}

const [minutes, seconds] = timeString.split(':').map(Number);

// Check if parsing was successful
if (isNaN(minutes) || isNaN(seconds)) {
  console.error("Failed to parse time:", timeString);
  setBanTimeRemaining("00:00");
  return;
}
```

**Key Improvements:**
- Validates time string format before parsing
- Checks for NaN values after parsing
- Falls back to "00:00" if parsing fails
- Added error logging for debugging

### 3. **Test Script**
Created `TestBanStatusQuery.sql` to verify the query returns proper MM:SS format.

## Expected Results

### **Before Fix:**
```json
{
  "status": "BANNED",
  "bannedUntil": "+000000000 00:03:51.223326000"
}
```
Frontend shows: **NaN:NaN**

### **After Fix:**
```json
{
  "status": "BANNED", 
  "bannedUntil": "04:23"
}
```
Frontend shows: **04:23** (and counts down properly)

## Testing Steps

1. **Create a booking** to trigger the ban
2. **Check the backend logs** for the debug output showing the returned format
3. **Verify frontend** shows proper MM:SS format and counts down
4. **Run the test SQL** to verify the query works correctly

## Technical Details

### **Time Calculation Logic:**
1. Get time difference between now and last booking
2. Extract hours, minutes, and seconds from the interval
3. Convert to total elapsed seconds: `(hours * 3600) + (minutes * 60) + seconds`
4. Calculate remaining seconds: `300 - elapsed_seconds`
5. Convert remaining seconds to MM:SS format:
   - Minutes: `FLOOR(remaining_seconds / 60)`
   - Seconds: `MOD(remaining_seconds, 60)`
6. Format with zero-padding: `LPAD(value, 2, '0')`

### **Frontend Timer Logic:**
1. Receive MM:SS format from backend
2. Parse into minutes and seconds
3. Convert to total seconds for countdown
4. Decrease by 1 every second
5. Convert back to MM:SS format for display
6. Handle expiration when reaching 00:00

## Benefits
- ✅ **Proper MM:SS format** from database
- ✅ **Robust error handling** prevents NaN display
- ✅ **Accurate countdown** timer
- ✅ **Better debugging** with console logs
- ✅ **Graceful fallbacks** for invalid data

The ban timer should now display correctly as "04:23" and count down properly to "00:00".

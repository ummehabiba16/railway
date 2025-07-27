import React, { useState, useEffect } from "react";
import SearchTrainForm from "../components/searchTrainForm";
import Navbar from "../components/navBar";
import SearchTrainFormStationMaster from "../components/SearchTrainFormStationMaster";

function SearchPage(){
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        // Get user role from localStorage
        const role = localStorage.getItem('userRole');
        setUserRole(role);
        console.log('User role:', userRole);
    }, []);

    return (
        <div>
            <div>
                <Navbar/>
            </div>
            <div style = {{
                display: 'flex',
                justifyContent: 'center',
            }}>
                {userRole === 'STATION_MASTER' ? (
                    <SearchTrainFormStationMaster />
                ) : (
                    <SearchTrainForm />
                )}
            </div>
        </div>
    );
}

export default SearchPage;
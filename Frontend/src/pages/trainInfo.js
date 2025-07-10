import React from "react";
import TrainInfoForm from "../components/TrainInfoForm";
import Navbar from "../components/navBar";
function TrainInfo(){
    return (
        <div>
            <div>
                <Navbar/>
            </div>
            <div style = {{
                display: 'flex',
                justifyContent: 'center',
            }}>
                <TrainInfoForm />

            </div>
        </div>
    );
}

export default TrainInfo;
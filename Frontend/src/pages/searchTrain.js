import React from "react";
import SearchTrainForm from "../components/searchTrainForm";
import Navbar from "../components/navBar";
function SearchPage(){
    return (
        <div>
            <div>
                <Navbar/>
            </div>
            <div style = {{
                display: 'flex',
                justifyContent: 'center',
            }}>
                <SearchTrainForm />

            </div>
        </div>
    );
}

export default SearchPage;
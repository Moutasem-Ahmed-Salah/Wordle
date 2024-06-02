import React from "react";

const InfoBar = ({ isLoading }) => (
    <div className="info-bar">
        <div className={`spiral ${isLoading ? "" : "hidden"}`}>🌀</div>
    </div>
);

export default InfoBar;

import React from "react";
import LetterBox from "./LetterBox";

const Scoreboard = ({ letters }) => {
    return (
        <div className="scoreboard">
            {letters.map((letter, index) => (
                <LetterBox key={index} letter={letter} />
            ))}
        </div>
    );
};

export default Scoreboard;

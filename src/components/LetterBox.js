import React from "react";

const LetterBox = ({ letter }) => {
    const { letter: char, className } = letter;
    return (
        <div className={`scoreboard-letter ${className || ""}`}>
            {char}
        </div>
    );
};

export default LetterBox;

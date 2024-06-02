import React, { useState, useEffect } from "react";
import "./App.css";
import Scoreboard from "./components/Scoreboard";
import InfoBar from "./components/InfoBar";

const ANSWER_LENGTH = 5;
const ROUNDS = 6;

const App = () => {
    const [currentRow, setCurrentRow] = useState(0);
    const [currentGuess, setCurrentGuess] = useState("");
    const [done, setDone] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [letters, setLetters] = useState(Array(ANSWER_LENGTH * ROUNDS).fill({ letter: "", className: "" }));
    const [word, setWord] = useState("");
    const [showReplay, setShowReplay] = useState(false);

    useEffect(() => {
        const fetchWord = async () => {
            const res = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
            const { word: wordRes } = await res.json();
            const upperWord = wordRes.toUpperCase();
            setWord(upperWord);
            setIsLoading(false);
        };
        fetchWord();
    }, []);

    console.log("word:", word);

    const addLetter = (letter) => {
        if (currentGuess.length < ANSWER_LENGTH) {
            const newGuess = currentGuess + letter;
            setCurrentGuess(newGuess);
            const newLetters = [...letters];
            newLetters[currentRow * ANSWER_LENGTH + newGuess.length - 1] = { letter, className: "" };
            setLetters(newLetters);
        }
    };

    const commit = async () => {
        if (currentGuess.length !== ANSWER_LENGTH) return;
        setIsLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess }),
        });
        const { validWord } = await res.json();
        setIsLoading(false);

        if (!validWord) {
            markInvalidWord();
            return;
        }

        const guessParts = currentGuess.split("");
        const wordParts = word.split("");
        const map = makeMap(wordParts);
        let allRight = true;
        const newLetters = [...letters];

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] === wordParts[i]) {
                newLetters[currentRow * ANSWER_LENGTH + i] = {
                    letter: guessParts[i],
                    className: "correct",
                };
                map[guessParts[i]]--;
            }
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] === wordParts[i]) {
                // do nothing
            } else if (map[guessParts[i]] && map[guessParts[i]] > 0) {
                allRight = false;
                newLetters[currentRow * ANSWER_LENGTH + i] = {
                    letter: guessParts[i],
                    className: "close",
                };
                map[guessParts[i]]--;
            } else {
                allRight = false;
                newLetters[currentRow * ANSWER_LENGTH + i] = {
                    letter: guessParts[i],
                    className: "wrong",
                };
            }
        }

        setLetters(newLetters);
        setCurrentRow(currentRow + 1);
        setCurrentGuess("");

        if (allRight) {
            alert("you win");
            document.querySelector(".brand").classList.add("winner");
            setDone(true);
            setShowReplay(true);
        } else if (currentRow === ROUNDS - 1) {
            alert(`you lose, the word was ${word}`);
            setDone(true);
            setShowReplay(true);
        }
    };

    const backspace = () => {
        if (currentGuess.length > 0) {
            const newGuess = currentGuess.slice(0, -1);
            setCurrentGuess(newGuess);
            const newLetters = [...letters];
            newLetters[currentRow * ANSWER_LENGTH + newGuess.length] = { letter: "", className: "" };
            setLetters(newLetters);
        }
    };

    const markInvalidWord = () => {
        const newLetters = [...letters];
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            newLetters[currentRow * ANSWER_LENGTH + i] = {
                ...newLetters[currentRow * ANSWER_LENGTH + i],
                className: "invalid",
            };
        }
        setLetters(newLetters);
    };

    const handleKeyPress = (event) => {
        if (done || isLoading) return;

        const action = event.key;

        if (action === "Enter") {
            commit();
        } else if (action === "Backspace") {
            backspace();
        } else if (/^[a-zA-Z]$/.test(action)) {
            addLetter(action.toUpperCase());
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handleKeyPress);
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    });

    return (
        <div className="App">
            <header className="navbar">
                <h1 className="brand">Wordle</h1>
            </header>
            <InfoBar isLoading={isLoading} />
            <Scoreboard letters={letters} />
            {showReplay && (
                <button className="replay-button" onClick={() => window.location.reload()}>Play Again?</button>
            )}
            <input
                type="text"
                className="hidden-input"
                onKeyPress={handleKeyPress}
                onChange={(e) => addLetter(e.target.value.toUpperCase())}
                value=""
                autoFocus
            />
        </div>
    );
};

const makeMap = (array) => {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        obj[array[i]] = (obj[array[i]] || 0) + 1;
    }
    return obj;
};

export default App;

import React, { useState, useEffect } from "react";

export default function SimonSays() {
  const btns = ["yellow", "red", "purple", "green"];

  const tw = {
    yellow: "bg-amber-400",
    red: "bg-rose-400",
    purple: "bg-indigo-400",
    green: "bg-emerald-400",
  };

  const [gameSeq, setGameSeq] = useState([]);
  const [userSeq, setUserSeq] = useState([]);
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(0);
  const [flash, setFlash] = useState(""); // game flash
  const [userFlashColor, setUserFlashColor] = useState(""); // user flash
  const [message, setMessage] = useState("Press any key to start");
  const [bgColor, setBgColor] = useState("bg-red-400");

  // Start game on keypresss
  useEffect(() => {
    const start = () => {
      if (!started) {
        setStarted(true);
        levelUp();
      }
    };
    document.addEventListener("keypress", start);
    return () => document.removeEventListener("keypress", start);
  }, [started]);

  // Game flash (exact JS behavior)
  const gameFlashFx = (color) => {
    setFlash(color);
    setTimeout(() => setFlash(""), 250);
  };

  // User flash (exact JS behavior)
  const userFlashFx = (color) => {
    setUserFlashColor(color);
    setTimeout(() => setUserFlashColor(""), 250);
  };

  // Level up (same as JS logic)
  const levelUp = () => {
    setUserSeq([]);
    setLevel((prev) => prev + 1);

    setMessage(`Level ${level + 1}`);

    const randIdx = Math.floor(Math.random() * 4);
    const randColor = btns[randIdx];

    setGameSeq((prev) => {
      const newSeq = [...prev, randColor];
      console.log("Game Sequence:", newSeq);
      gameFlashFx(randColor);
      return newSeq;
    });
  };

  // Check answer (exact JS logic)
  const checkAns = (idx, newUserSeq) => {
    if (newUserSeq[idx] === gameSeq[idx]) {
      if (newUserSeq.length === gameSeq.length) {
        setTimeout(levelUp, 1000);
      }
    } else {
      setMessage(`Game Over! Score was ${level}. Press any key to restart.`);
      setBgColor("bg-red-600");

      setTimeout(() => setBgColor("bg-red-400"), 550);
      reset();
    }
  };

  // Button press (same as JS)
  const btnPress = (color) => {
    userFlashFx(color);

    const newUserSeq = [...userSeq, color];
    setUserSeq(newUserSeq);

    checkAns(newUserSeq.length - 1, newUserSeq);
  };

  // Reset (same logic)
  const reset = () => {
    setStarted(false);
    setGameSeq([]);
    setUserSeq([]);
    setLevel(0);
  };

  return (
    <div className={`min-h-screen p-6 text-center ${bgColor}`}>
      <h1 className="text-4xl text-white font-bold">Simon Says Game</h1>
      <h2 className="text-2xl mt-4 text-white">{message}</h2>

      <div className="mt-10 flex flex-col items-center space-y-4">

        <div className="flex space-x-4">

          {/* RED */}
          <div
            onClick={() => btnPress("red")}
            className={`h-40 w-40 rounded-3xl border-8 border-black flex items-center justify-center 
              text-xl font-bold cursor-pointer
              ${
                flash === "red"
                  ? "bg-white"
                  : userFlashColor === "red"
                  ? "bg-green-500"
                  : tw.red
              }
            `}
          >
            1
          </div>

          {/* YELLOW */}
          <div
            onClick={() => btnPress("yellow")}
            className={`h-40 w-40 rounded-3xl border-8 border-black flex items-center justify-center 
              text-xl font-bold cursor-pointer
              ${
                flash === "yellow"
                  ? "bg-white"
                  : userFlashColor === "yellow"
                  ? "bg-green-500"
                  : tw.yellow
              }
            `}
          >
            2
          </div>

        </div>

        <div className="flex space-x-4">

          {/* GREEN */}
          <div
            onClick={() => btnPress("green")}
            className={`h-40 w-40 rounded-3xl border-8 border-black flex items-center justify-center 
              text-xl font-bold cursor-pointer
              ${
                flash === "green"
                  ? "bg-white"
                  : userFlashColor === "green"
                  ? "bg-green-500"
                  : tw.green
              }
            `}
          >
            3
          </div>

          {/* PURPLE */}
          <div
            onClick={() => btnPress("purple")}
            className={`h-40 w-40 rounded-3xl border-8 border-black flex items-center justify-center 
              text-xl font-bold cursor-pointer
              ${
                flash === "purple"
                  ? "bg-white"
                  : userFlashColor === "purple"
                  ? "bg-green-500"
                  : tw.purple
              }
            `}
          >
            4
          </div>

        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import "./App.css";
import sound from "./assets/timer.wav";
import NoSleep from "nosleep.js";

var noSleep = new NoSleep()

function App() {
  const [hr, setHr] = useState<any>(undefined);
  const [min, setMin] = useState<any>(undefined);
  const [sec, setSec] = useState<any>(undefined);

  const handleInput = (
    e: ChangeEvent<HTMLInputElement>,
    type: "sec" | "min" | "hr"
  ) => {
    switch (type) {
      case "hr":
        setHr(e.target.value !== "" ? e.target.value : 0);
        break;
      case "min":
        setMin(e.target.value !== "" ? e.target.value : 0);
        break;
      case "sec":
        setSec(e.target.value !== "" ? e.target.value : 0);
        break;

      default:
        throw Error("Invalid");
    }
  };

  const showStartbtn = useMemo(() => {
    if ((hr !== undefined && hr > 0) || (min !== undefined && min > 0) || (sec !== undefined && sec > 0)) {
      return true;
    }
    return false;
  }, [hr, min, sec]);

  const [timerStart, setTimerStart] = useState(false);
  const [timerStop, setTimerStop] = useState(false);
  const [timerReset, setTimerReset] = useState(false);
  const [playAudio, setPlayAudio] = useState(false);
  const [time, setTime] = useState(0);
  const convertTime = () => {
    let secTime = 0;
    if (hr > 0) secTime += 3600 * hr;
    if (min > 0) secTime += 60 * min;
    if (sec > 0) secTime += sec;
    setTime(secTime);
  };

  const resetTimer = () => {
    setTime(0);
    setHr(undefined);
    setMin(undefined);
    setSec(undefined);
    setTimerReset(false);
    setTimerStart(false);
    setTimerStop(false);
  };

  useEffect(() => {
    let timeout: any;
    if (timerReset) {
      resetTimer();
    }
    if (time > 0 && !timerStop) {
      timeout = setTimeout(() => {
        let newTime = time - 1;
        if (newTime > 0) {
          setTime(newTime);
        } else {
          resetTimer();
          setPlayAudio(true);
        }
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
      noSleep.disable()
    };
  }, [time, timerStop, timerReset]);

  const timerSound = useRef<any>(null)

  useEffect(() => {
    let audioInterval: any;
    if (timerSound.current !== null) timerSound.current = null
    timerSound.current = new Audio(sound);
    timerSound.current.currentTime = 0
    let count = 0;
    if (playAudio) {
      timerSound.current.play();
      audioInterval = setInterval(() => {
        count++;
        if (timerSound.current.ended) {
          timerSound.current.currentTime = 0;
          timerSound.current.play();
        }
        if (count >= 10) {
          clearInterval(audioInterval);
          timerSound.current.currentTime = 0
          timerSound.current = null;
          setPlayAudio(false)
        }
      }, 1000);
    }
    return () => {
      clearInterval(audioInterval);
      timerSound.current = null;

    };
  }, [playAudio]);

  // useEffect(() => {
  //   return () => {
  //     noSleep.disable()
  //   }
  // },[])

  const countDown = useMemo(() => {
    let hours = Math.floor(time / 3600);
    let mins = Math.floor((time % 3600) / 60);
    let secs = time % 60;

    return `${hours.toString().padStart(2, "0")} : ${mins
      .toString()
      .padStart(2, "0")} : ${secs.toString().padStart(2, "0")}`;
  }, [time]);

  const handleStartTimer = () => {
    noSleep.enable()
    setTimerStart(true);
    convertTime();
  };

  return (
    <>
      {!timerStart ? (
        <div className="input-container">
          <div className="group">
            <label htmlFor="" className="">
              Hours
            </label>
            <input
              type="number"
              name=""
              id=""
              placeholder="00"
              defaultValue={hr}
              onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                handleInput(e, "hr")
              }
            />
          </div>
          <div className="group">
            <label htmlFor="">Minutes</label>
            <input
              type="number"
              name=""
              id=""
              placeholder="00"
              defaultValue={min}
              onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                handleInput(e, "min")
              }
            />
          </div>
          <div className="group">
            <label htmlFor="">Seconds</label>
            <input
              type="number"
              name=""
              id=""
              placeholder="00"
              defaultValue={sec}
              onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                handleInput(e, "sec")
              }
            />
          </div>
        </div>
      ) : (
        <h2>{countDown}</h2>
      )}

      {showStartbtn && !timerStart ? (
        <button type="button" className="btn" onClick={handleStartTimer}>
          Start
        </button>
      ) : timerStart ? (
        <div className="btn-group">
          <button
            type="button"
            className="btn"
            onClick={() => setTimerReset(!timerReset)}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setTimerStop(!timerStop)}
          >
            {timerStop ? "Continue" : "Pause"}
          </button>
        </div>
      ) : null}
    </>
  );
}

export default App;

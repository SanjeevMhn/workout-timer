import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import "./App.css";
import sound from "./assets/timer.wav";
import NoSleep from "nosleep.js";

var noSleep = new NoSleep();

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
    if (
      (hr !== undefined && hr > 0) ||
      (min !== undefined && min > 0) ||
      (sec !== undefined && sec > 0)
    ) {
      return true;
    }
    return false;
  }, [hr, min, sec]);

  const [timerStart, setTimerStart] = useState(false);
  const [timerStop, setTimerStop] = useState(false);
  const [timerReset, setTimerReset] = useState(false);
  const [playAudio, setPlayAudio] = useState(false);
  const [time, setTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const convertTime = () => {
    let secTime = 0;
    if (!showIntervalTimer) {
      if (hr > 0) secTime += 3600 * hr;
      if (min > 0) secTime += 60 * min;
      if (sec > 0) secTime += sec;
    } else {
      if (intervalTime > 0) {
        secTime += intervalTimeType == "min" ? 60 * intervalTime : intervalTime;
      }
    }
    setTime(secTime);
    setTotalTime(secTime);
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
    if (!showIntervalTimer) {
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
    } else {
      if (time > 0 && !timerStop && intervalRound > 0 && !intervalRestStart) {
        timeout = setTimeout(() => {
          let newTime = time - 1;
          if (newTime > 0) {
            setTime(newTime);
          } else {
            if (intervalRound > 0) {
              setIntervalRest(intervalRound - 1);
              setIntervalRestStart(true);
              setPlayAudio(true);
            } else {
              setPlayAudio(true)
              setIntervalRestStart(false);
              resetTimer();
              clearTimeout(timeout)
            }
          }
        }, 1000);
      }
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [time, timerStop, timerReset]);

  const timerSound = useRef<any>(null);

  useEffect(() => {
    let audioInterval: any;
    if (playAudio) {
      timerSound.current = new Audio(sound);
      let count = 0;
      timerSound.current.play();
      audioInterval = setInterval(() => {
        count++;
        if (timerSound.current.ended) {
          timerSound.current.currentTime = 0;
          timerSound.current.play();
        }
        if (count >= 10) {
          clearInterval(audioInterval);
          setPlayAudio(false);
        }
      }, 1000);
    }
    return () => {
      clearInterval(audioInterval);
    };
  }, [playAudio]);

  const countDown = useMemo(() => {
    let hours = Math.floor(time / 3600);
    let mins = Math.floor((time % 3600) / 60);
    let secs = time % 60;

    return `${hours.toString().padStart(2, "0")} : ${mins
      .toString()
      .padStart(2, "0")} : ${secs.toString().padStart(2, "0")}`;
  }, [time]);

  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (time > 0) {
      let progress = ((time / totalTime) * 100).toString();
      progressRef.current?.setAttribute("aria-valuenow", progress);
      progressRef.current?.style.setProperty("--progress", `${progress}%`);
    }
  }, [time]);

  const handleStartTimer = () => {
    noSleep.enable();
    setTimerStart(true);
    progressRef.current?.setAttribute("role", "progressbar");
    progressRef.current?.setAttribute("aria-live", "polite");
    convertTime();
  };

  const [showIntervalTimer, setShowIntervalTimer] = useState<boolean>(false);
  const [intervalRound, setIntervalRound] = useState<number>(1);
  const [intervalTime, setIntervalTime] = useState<number>(1);
  const [intervalRest, setIntervalRest] = useState<number>(1);
  const [intervalRestStart, setIntervalRestStart] = useState<boolean>(false);
  const [intervalTimeType, setIntervalTimeType] = useState<
    "min" | "sec" | string
  >("min");
  const [intervalRestTimeType, setIntervalRestTimeType] = useState<
    "min" | "sec" | string
  >("sec");

  useEffect(() => {
    let timeout: any;
    if (intervalRestStart) {
      let resetTime =
        intervalRestTimeType == "min" ? 60 * intervalRest : intervalRest;
      timeout = setTimeout(() => {
        if (resetTime > 0) {
          resetTime = resetTime - 1;
        } else {
          setIntervalRestStart(false);
          // setTime(intervalTime)
          convertTime()
          clearTimeout(timeout);
        }
      }, 1000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [intervalRestStart]);

  return (
    <div className={`${timerStart ? "progress" : ""}`} ref={progressRef}>
      <div className="inner">
        {!timerStart && (
          <ul className="tab-list">
            <li className="item">
              <button
                type="button"
                className={`${!showIntervalTimer && "active"}`}
                onClick={() => setShowIntervalTimer(false)}
              >
                Timer
              </button>
            </li>
            <li className="item">
              <button
                type="button"
                className={`${showIntervalTimer && "active"}`}
                onClick={() => setShowIntervalTimer(true)}
              >
                Interval Timer
              </button>
            </li>
          </ul>
        )}
        {!timerStart ? (
          !showIntervalTimer ? (
            <>
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
            </>
          ) : (
            <div className="interval-timer-form">
              <div className="form-group">
                <label htmlFor="rounds" className="form-label">
                  Total Rounds
                </label>
                <input
                  type="number"
                  name=""
                  id="rounds"
                  className="form-control"
                  defaultValue={intervalRound}
                  onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                    Number(e.target.value) > 0 &&
                    setIntervalRound(Number(e.target.value))
                  }
                />
              </div>
              <div className="form-group">
                <div className="label-container">
                  <label htmlFor="time" className="form-label">
                    Time per round
                  </label>
                  <select
                    name=""
                    id=""
                    defaultValue={intervalTimeType}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      e.target.value !== "" &&
                      setIntervalTimeType(e.target.value)
                    }
                  >
                    <option value="">Select Time Type</option>
                    <option value="min">Minutes</option>
                    <option value="sec">Seconds</option>
                  </select>
                </div>

                <input
                  type="number"
                  name=""
                  id="time"
                  className="form-control"
                  defaultValue={intervalTime}
                  onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                    Number(e.target.value) > 0 &&
                    setIntervalTime(Number(e.target.value))
                  }
                />
              </div>
              <div className="form-group">
                <div className="label-container">
                  <label htmlFor="rest" className="form-label">
                    Rest per round
                  </label>
                  <select
                    name=""
                    id=""
                    defaultValue={intervalRestTimeType}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      e.target.value !== "" &&
                      setIntervalRestTimeType(e.target.value)
                    }
                  >
                    <option value="">Select Time Type</option>
                    <option value="min">Minutes</option>
                    <option value="sec">Seconds</option>
                  </select>
                </div>

                <input
                  type="number"
                  name=""
                  id="rest"
                  className="form-control"
                  defaultValue={intervalRest}
                  onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                    Number(e.target.value) > 0 &&
                    setIntervalRest(Number(e.target.value))
                  }
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={handleStartTimer}
                >
                  Start
                </button>
              </div>
            </div>
          )
        ) : (
          <h2 className="count-down">{countDown}</h2>
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
      </div>
    </div>
  );
}

export default App;

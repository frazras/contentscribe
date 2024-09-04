import React, { useState, useEffect, useRef } from 'react';

const ProgressBar = ({ executionTime, renderProgressMessage }) => {
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);
  const [bars, setBars] = useState(["░"]);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    const intervalDuration = executionTime * 1000 / 100; // Convert executionTime to milliseconds and divide by 100 for percentage

    progressInterval.current = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress < 100 ? prevProgress + 1 : 100;
        if (newProgress === 100) {
          clearInterval(progressInterval.current);
          setBars(Array(41).fill("░")); // Assuming 41 bars represent 100%
          console.log("progress complete");
        } else if (newProgress % 5 === 0) {
          setBars((prevBars) => [...prevBars, "░░"]);
          console.log("progress", newProgress)
        }

        // Update the current message if renderProgressMessage is available
        if (renderProgressMessage) {
          const messageKeys = Object.keys(renderProgressMessage).map(Number).sort((a, b) => b - a);
          for (let key of messageKeys) {
            if (newProgress >= key) {
              setCurrentMessage(renderProgressMessage[key]);
              break;
            }
          }
        }

        return newProgress;
      });
    }, intervalDuration);

    // Display the initial message at 0% if renderProgressMessage is available
    if (renderProgressMessage) {
      const messageKeys = Object.keys(renderProgressMessage).map(Number).sort((a, b) => a - b);
      if (messageKeys.length > 0) {
        setCurrentMessage(renderProgressMessage[messageKeys[0]]);
      }
    }

    return () => clearInterval(progressInterval.current);
  }, [executionTime, renderProgressMessage]);

  return (
    <>
      <div className="pbar mt-5">
        <div className="progress-bar">
          <div className="bg-blue-500 h-1" style={{ width: `${progress}%` }}></div>
          {bars.join('')}{progress}%
        </div>
      </div>
      {renderProgressMessage && currentMessage && (
        <div className="text-center mt-2">
          {currentMessage}
        </div>
      )}
    </>
  );
};

export default ProgressBar;

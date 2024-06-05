import React, { useState, useEffect, useRef } from 'react';

function StepOne({ nextStep, stepData }) {
  const [inputKeyword, setInputKeyword] = useState('Best Time to Travel to Jamaica');
  const [isInputKeywordValid, setIsInputKeywordValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);
  const [bars, setBars] = useState("░");

  const handleInputKeywordChange = (event) => {
    setInputKeyword(event.target.value);
    setIsInputKeywordValid(!!event.target.value.trim());
  };

  const handleSubmit = async () => {
    if (!inputKeyword.trim()) {
      setIsInputKeywordValid(false);
      return;
    }
    setIsSubmitting(true);
    nextStep({ input_keyword: inputKeyword, country: 'US' });
    initProgressBar();
  };

  const initProgressBar = () => {
    const wordCount = inputKeyword.trim().split(/\s+/).length;
    let intervalDuration;
    if (wordCount <= 2) {
      intervalDuration = 120000 / 100; // 2 minutes
    } else if (wordCount <= 4) {
      intervalDuration = 60000 / 100; // 1 minute
    } else {
      intervalDuration = 35000 / 100; // 35 seconds
    }

    progressInterval.current = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress < 100 ? prevProgress + 1 : 100;
        if (newProgress === 100) {
          clearInterval(progressInterval.current);
          setBars("░".repeat(41)); // Assuming 41 bars represent 100%
          console.log("progress complete");
        } else if (newProgress % 5 === 0) {
          setBars((prevBars) => prevBars + "░");
          console.log("progress", newProgress)
        }
        return newProgress;
      });
    }, intervalDuration);
  };

  useEffect(() => {
    return () => clearInterval(progressInterval.current);
  }, []);

  const renderProgressMessage = () => {
    if (progress <= 5) return "Analyzing Keywords...";
    if (progress <= 10) return "Generating Keyword Variations...";
    if (progress <= 30) return "Using AI to Categorize and Rank Keyword Variations...";
    if (progress <= 60) return "Removing Duplicates and Contextually Similar Keyword Variations...";
    if (progress <= 80) return "Semantically Grouping Keyword Variations...";
    if (progress <= 99) return "Wrapping up...";
    if (progress === 100) return "Complete! ...But it looks like there are a few extra things to iron out, please give it a few more seconds";
    return "";
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">What do you want to write about?</h2>
      <p className="mb-4">Enter your main keyword phrase, this is the general topic of your article. <br/><span className='text-sm text-gray-500'>eg: Toys for Golden Retriever, Camping in Winter, Solo Traveller Vacation. </span></p>
      <input
        type="text"
        value={inputKeyword}
        onChange={handleInputKeywordChange}
        placeholder="Enter your keyword here..."
        className={`mt-2 px-4 py-2 border ${isInputKeywordValid ? 'border-gray-300' : 'border-red-500'} rounded w-full`}
      />
      {!isInputKeywordValid && <p className="text-red-500 text-xs mt-1">Keyword is required.</p>}
      <button
        className={`mt-4 px-4 py-2 ${isSubmitting ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'} text-white rounded transition-colors`}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processing...' : 'Perform Keyword Research'}
      </button>
      {isSubmitting && (
        <>
          <div className="pbar mt-5">
            <div className="progress-bar">{bars}{progress}%</div> </div>
          <div className="text-center mt-2">{renderProgressMessage()}</div>
        </>
      )}
    </div>
  );
}
export default StepOne;

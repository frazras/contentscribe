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

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
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
      intervalDuration = 30000 / 100; // 30xx  seconds
    }

    progressInterval.current = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress < 100 ? prevProgress + 1 : 100;
        if (newProgress === 100) {
          clearInterval(progressInterval.current);
          setBars("░".repeat(41)); // Assuming 41 bars represent 100%
          console.log("progress complete");
        } else if (newProgress % 5 === 0) {
          setBars((prevBars) => prevBars + "░░");
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
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputKeyword}
          onChange={handleInputKeywordChange}
          placeholder="Enter your keyword here..."
          className={`mt-2 px-4 py-2 border ${isInputKeywordValid ? 'border-gray-300' : 'border-red-500'} rounded w-full`}
        />
        {!isInputKeywordValid && <p className="text-red-500 text-xs mt-1">Keyword is required.</p>}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className={`mt-4 px-4 py-2 ${isSubmitting ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'} text-white rounded transition-colors`}
            disabled={isSubmitting}
          >
           {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : 'Perform Keyword Research'}
          </button>
        </div>
      </form>
      {isSubmitting && (
        <>
          <div className="pbar mt-5">
            <div className="progress-bar">
            <div className="bg-blue-500 h-1" style={{ width: `${progress}%` }}></div>
              {bars}{progress}%
              
            </div>
           </div>
          <div className="text-center mt-2">{renderProgressMessage()}</div>
        </>
      )}
    </div>
  );
}
export default StepOne;

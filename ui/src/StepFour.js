import React, { useState, useEffect, useRef } from 'react';

function StepFour({ nextStep, stepData }) {
  const [selectedHeadings, setSelectedHeadings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bars, setBars] = useState("░");
  const [validationError, setValidationError] = useState(false); // Added state to handle validation error
  const progressInterval = useRef(null);

  useEffect(() => {
    console.log('Headings Stepdata on load:', stepData)
  }, [stepData]);

  const handleHeadingChange = (heading) => {
    if (selectedHeadings.includes(heading)) {
      setSelectedHeadings(selectedHeadings.filter(h => h !== heading));
    } else {
      setSelectedHeadings([...selectedHeadings, heading]);
    }
  };
  
  const handleSubmit = async () => {
    if (selectedHeadings.length === 0) {
      setValidationError(true); // Set validation error if no headings are selected
      return;
    }
    setIsSubmitting(true);
    initProgressBar();
    await nextStep({selected_headings: selectedHeadings});
  };

  const initProgressBar = () => {
    let intervalDuration = 200; // 50 seconds for demo purposes
    progressInterval.current = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress < 100 ? prevProgress + 1 : 100;
        if (newProgress === 100) {
          clearInterval(progressInterval.current);
          setBars("░".repeat(41)); // Assuming 41 bars represent 100%
          console.log("progress complete");
        } else if (newProgress % 5 === 0) {
          setBars((prevBars) => prevBars + "░");
          console.log("progress", newProgress);
        }
        return newProgress;
      });
    }, intervalDuration);
  };

  useEffect(() => {
    return () => clearInterval(progressInterval.current);
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Select headings for Article Structure</h2>
      <p className="mb-4">These headings are used in top ranking articles for the topic. <br /> 
      Choose the headings you want to consider in creating your article.</p>
      
      <div className="overflow-y-scroll h-64 border border-gray-300 rounded px-4 py-2 mb-4">
        {stepData?.headings ? stepData.headings.map((heading, index) => (
          <label key={index} className="block">
            <input
              type="checkbox"
              checked={selectedHeadings.includes(heading)}
              onChange={() => handleHeadingChange(heading)}
              className="mr-2"
            />
            {heading}
          </label>
        )) : "No headings found"}
      </div>
      {validationError && <p className="text-red-500 text-sm mt-1 font-bold">Please select at least one heading.</p>}

      <div className="flex justify-end mt-4">
        <button
          className={`px-4 py-2 ${isSubmitting ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'} text-white rounded transition-colors`}
          onClick={handleSubmit}
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
          ) : 'Next: Generate Titles'}
        </button>
      </div>
      {isSubmitting && (
        <>
          <div className="mt-5">
            <div className="progress-bar">
              <div className="bg-blue-500 h-1" style={{ width: `${progress}%` }}></div>
              {bars}{progress}%
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StepFour;

import React, { useState, useEffect } from 'react';

function StepThree({ prevStep, nextStep, stepData }) {
  const [isSubmitting, setIsSubmitting] = useState(false); // Added state to track submission status

  useEffect(() => {
    console.log('StepData on load:', stepData);
  }, [stepData]); // Include stepData in the dependency array




  const handleSubmit = async () => {
    setIsSubmitting(true); // Disable button and show spinner
    await nextStep({ ...stepData });
    //setIsSubmitting(false); // Re-enable button after submission
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Research Similar Articles</h2>
      <p className="mb-4">These articles are the best results for the topic. <br /> 
      Choose the articles you want to consider in the research process.</p>
      
      <div className="flex justify-between mt-4">
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition-colors"
          onClick={() => prevStep(stepData)}
        >
          Back
        </button>
        <button
          className={`px-4 py-2 ${isSubmitting ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-700'} text-white rounded transition-colors`}
          onClick={handleSubmit}
          disabled={isSubmitting} // Disable button during submission
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            'Next: Review'
          )}
        </button>
      </div>
    </div>
  );
}

export default StepThree;

import React, { useState, useEffect } from 'react';

function StepFour({ prevStep, nextStep, stepData }) {
  const [selectedHeadings, setSelectedHeadings] = useState([]); // Corrected state variable name
  const [isSubmitting, setIsSubmitting] = useState(false); // Added state to track submission status

  useEffect(() => {
    console.log('Headings Stepdata on load:', stepData)
  }, [stepData]); // Include stepData in the dependency array

  const handleSelectAll = () => {
    const allHeadings = stepData?.headings || [];
    setSelectedHeadings(allHeadings);
  };

  const handleSelectNone = () => {
    setSelectedHeadings([]);
  };

  const handleHeadingChange = (heading) => {
    if (selectedHeadings.includes(heading)) {
      setSelectedHeadings(selectedHeadings.filter(h => h !== heading));
    } else {
      setSelectedHeadings([...selectedHeadings, heading]);
    }
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true); // Disable button and show spinner
    await nextStep({selected_headings: selectedHeadings});
    setIsSubmitting(false); // Re-enable button after submission
  };
  const handleBack = () => {
    console.log('Back button clicked, attempting to move to previous step with current stepData:', JSON.stringify(stepData)); // Debugging line with JSON.stringify for better visibility in console
    prevStep(stepData); // Passing stepData directly to prevStep function
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Select headings for Article Structure</h2>
      <p className="mb-4">These headings are used in top top ranking articles for the topic. <br /> 
      Choose the headings you want to consider in creating your article.</p>
      
      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition-colors"
          onClick={handleSelectAll}
        >
          Select All
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors"
          onClick={handleSelectNone}
        >
          Select None
        </button>
      </div>

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

      <div className="flex justify-between mt-4">
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition-colors"
          onClick={handleBack}
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
            'Next: Generate Titles'
          )}
        </button>
      </div>
    </div>
  );
}

export default StepFour;

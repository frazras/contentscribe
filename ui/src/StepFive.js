import React, { useState, useEffect } from 'react';

function StepFive({ prevStep, nextStep, stepData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [useCustomTitle, setUseCustomTitle] = useState(false);

  useEffect(() => {
    console.log('Titles Stepdata on load:', stepData);
  }, [stepData]);

  const handleSelectAll = () => {
    setSelectedTitle('');
  };

  const handleSelectNone = () => {
    setSelectedTitle('');
  };

  const handleTitleChange = (title) => {
    setSelectedTitle(title);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const submissionData = useCustomTitle && customTitle ? { customTitle } : { selectedTitle };
    await nextStep({ ...stepData, ...submissionData });
    setIsSubmitting(false);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Select a Title</h2>
      <p className="mb-4">These titles are suggested based on the topic and titles we found. <br /> 
      Choose the Title that best suits your article or create a custom title below.</p>
      
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
        {stepData?.titles ? stepData.titles.map((title, index) => (
          <label key={index} className="block">
            <input
              type="radio"
              name="titleSelection"
              checked={selectedTitle === title}
              onChange={() => handleTitleChange(title)}
              className="mr-2"
            />
            {title}
          </label>
        )) : null}
      </div>

      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={useCustomTitle}
            onChange={(e) => {
              setUseCustomTitle(e.target.checked);
              if (e.target.checked) {
                setSelectedTitle('');
              }
            }}
            className="form-checkbox"
          />
          <span className="ml-2">Create a custom title</span>
        </label>
      </div>

      {useCustomTitle && (
        <div className="mb-4">
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Enter your custom title here"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      )}

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
          ) : (
            'Next: Create Article Outline (TBD)'
          )}
        </button>
      </div>
    </div>
  );
}

export default StepFive;

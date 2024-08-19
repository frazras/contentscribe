import React, { useState, useEffect } from 'react';
import ProgressBar from '../lib/Progressbar';

function Titles({ nextStep, stepData, nextModule }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [useCustomTitle, setUseCustomTitle] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log('Titles Stepdata on load:', stepData);
    console.log('Next Module:', nextModule);
  }, [stepData]);

  const handleTitleChange = (title) => {
    setSelectedTitle(title);
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    if (!useCustomTitle && !selectedTitle) {
      setErrorMessage("Please select a title or create a custom title.");
      return;
    }
    if (useCustomTitle && !customTitle) {
      setErrorMessage("Please enter your custom title.");
      return;
    }
    setIsSubmitting(true);
    const submissionData = useCustomTitle && customTitle ? { customTitle } : { selectedTitle };
    await nextStep({ ...stepData, ...submissionData });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Select a Title</h2>
      <p className="mb-4">These titles are suggested based on the topic and titles we found. <br /> 
      Choose the Title that best suits your article or create a custom title below.</p>
      
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
              setErrorMessage('');
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
            onChange={(e) => {
              setCustomTitle(e.target.value);
              setErrorMessage('');
            }}
            placeholder="Enter your custom title here"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      )}

      {errorMessage && (
        <div className="text-red-500 mb-4">
          {errorMessage}
        </div>
      )}

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
          ) : nextModule.buttonLabel ? nextModule.buttonLabel : 'Next'}
        </button>
      </div>
      {isSubmitting && nextModule.hasProgressBar && (
        <ProgressBar 
          executionTime={nextModule.executionTime} 
          renderProgressMessage={nextModule.renderProgressMessage} 
        />
      )}
    </div>
  );
}

export default Titles;

// src/StepTwo.js
import React, { useState, useEffect } from 'react';

function StepTwo({ prevStep, nextStep, stepData }) {
  const [selectedKeywords, setSelectedKeywords] = useState([]);

  useEffect(() => {
    console.log('StepData on load:', stepData);
  }, [stepData]); // Include stepData in the dependency array

  const handleSelectAll = () => {
    const keywords = stepData?.data.ai_report?.keywords || [];
    setSelectedKeywords(keywords);
  };

  const handleSelectNone = () => {
    setSelectedKeywords([]);
  };

  const handleKeywordChange = (keyword) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const handleSubmit = () => {
    nextStep({ ...stepData, selectedKeywords });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Select keywords for your creation</h2>
      <p className="mb-4">Choose relevant keywords to enhance your content's visibility.</p>
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
      <div className="overflow-y-scroll h-64 border border-gray-300 rounded px-4 py-2">
        {(stepData?.data.ai_report?.keywords || []).map((keyword, index) => (
          <label key={index} className="block">
            <input
              type="checkbox"
              checked={selectedKeywords.includes(keyword)}
              onChange={() => handleKeywordChange(keyword)}
              className="mr-2"
            />
            {keyword}
          </label>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition-colors"
          onClick={() => prevStep(stepData)}
        >
          Back
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={handleSubmit}
        >
          Next: Review
        </button>
      </div>
    </div>
  );
}

export default StepTwo;

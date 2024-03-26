// src/StepOne.js
import React, { useState } from 'react';

function StepOne({ nextStep, stepData }) {
  const [keyword, setKeyword] = useState('');
  const [additionalKeywords, setAdditionalKeywords] = useState([]);
  const [showTextArea, setShowTextArea] = useState(false);

  const handleCheckboxChange = () => {
    setShowTextArea(!showTextArea);
  };

  const handleKeywordChange = (event) => {
    setKeyword(event.target.value);
  };

  const handleAdditionalKeywordsChange = (event) => {
    setAdditionalKeywords(event.target.value.split('\n').map(kw => kw.trim()).filter(kw => kw));
  };

  const handleSubmit = () => {
    nextStep({ keyword, country: 'US', additional_keywords: JSON.stringify(additionalKeywords) });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">What do you want to write about?</h2>
      <p className="mb-4">Enter your main keyword phrase, this is the general topic of your article. <br/><span className='text-sm text-gray-500'>eg: Toys for Golden Retriever, Camping in Winter, Solo Traveller Vacation </span>.</p>
      <input
        type="text"
        value={keyword}
        onChange={handleKeywordChange}
        placeholder="Enter your keyword here..."
        className="mt-2 px-4 py-2 border border-gray-300 rounded w-full"
      />
      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            onChange={handleCheckboxChange}
          />
          <span className="ml-2">Optional - provide additional supporting keywords for context (separate by newline)</span>
        </label>
      </div>
      {showTextArea && (
        <textarea
          value={additionalKeywords.join('\n')}
          onChange={handleAdditionalKeywordsChange}
          placeholder="Enter additional keywords here, separated by newline..."
          className="mt-2 px-4 py-2 border border-gray-300 rounded w-full"
        ></textarea>
      )}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors"
        onClick={handleSubmit}
      >
       Perform Keyword Research
      </button>
    </div>
  );
}
export default StepOne;

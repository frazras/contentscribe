import React, { useState } from 'react';
import ProgressBar from '../lib/Progressbar';

function MainKeyword({ nextStep, stepData, nextModule }) {
  const [inputKeyword, setInputKeyword] = useState('How to Make Money Online');
  const [isInputKeywordValid, setIsInputKeywordValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">What do you want to write about?</h2>
      <p className="mb-4">Enter your <strong>main keyword</strong> phrase, this is the general topic of your article. <br/><span className='text-sm text-gray-500'>eg: Toys for Golden Retriever, Camping in Winter, Solo Traveller Vacation. </span></p>
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
            ) : nextModule.buttonLabel}
          </button>
        </div>
      </form>
      {isSubmitting && (
        <>
          {nextModule.hasProgressBar&& (
            <ProgressBar executionTime={nextModule.executionTime} renderProgressMessage={() => nextModule.renderProgressMessage} />
          )}
        </>
      )}
    </div>
  );
}
export default MainKeyword;

import React, { useState, useEffect } from 'react';

function KeywordResearch({ nextStep, stepData }) {
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('Keywords StepData on load:', stepData);
  }, [stepData]);

  const handleKeywordChange = (keyword) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await nextStep({ selected_keywords: selectedKeywords });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Select your Keywords</h2>
      <p className="mb-4">Choose relevant keywords to enhance your content's visibility.</p>

      <div className="overflow-y-scroll h-64 border border-gray-300 rounded px-4 py-2">
        {stepData?.keywords && stepData.keywords.length > 0 ? stepData.keywords.map((keyword, index) => (
          <label key={index} className="block">
            <input
              type="checkbox"
              checked={selectedKeywords.includes(keyword)}
              onChange={() => handleKeywordChange(keyword)}
              className="mr-2"
            />
            {keyword}
          </label>
        )) : (
          <div className="text-center p-4">
            <h3 className="text-lg font-semibold mb-2 text-red-600">No related keywords found.</h3>
            <p className='text-sm'>
              <strong>Refresh</strong> to try a <strong>broader search term</strong> for more <strong>related keywords</strong>, or you can proceed without them.
              <br /><br />
              Having more <strong>relevant keywords</strong> will improve your article's quality and performance.
            </p>
          </div>
        )}
      </div>

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
          ) : 'Research Similar Articles'}
        </button>
      </div>
    </div>
  );
}

export default KeywordResearch;


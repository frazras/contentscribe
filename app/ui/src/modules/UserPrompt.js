import React, { useState, useEffect } from 'react';
import ProgressBar from '../components/ProgressBar';

function UserPrompt({ nextStep, stepData, nextModule }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');

  useEffect(() => {
    console.log('UserPrompt Stepdata on load:', stepData);
  }, [stepData]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await nextStep({ userPrompt });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Enter Your Prompt</h2>
      <p className="mb-4">Provide specific directions for the article you want to create. Instruct the AI by outlining specific details, including examples and formatting structure, as if you were prompting ChatGPT.</p>

      <textarea
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        placeholder="Enter your prompt here"
        className="w-full p-2 border border-gray-300 rounded mb-4"
        rows="6"
      />

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
          ) : nextModule.buttonLabel}
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

export default UserPrompt;
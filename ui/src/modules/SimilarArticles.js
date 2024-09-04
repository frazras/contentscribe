import React, { useState, useEffect } from 'react';
import ProgressBar from '../lib/ProgressBar';

function SimilarArticles({ nextStep, stepData, nextModule }) {
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added state to track submission status
  const [validationError, setValidationError] = useState(false); // State to handle validation error

  useEffect(() => {
    console.log('Serp Articles Stepdata on load:', stepData);
  }, [stepData]); // Include stepData in the dependency array

  const handleArticleChange = (article) => {
    const articleIndex = selectedArticles.findIndex(a => a.title === article.title);
    if (articleIndex > -1) {
      setSelectedArticles(selectedArticles.filter((_, index) => index !== articleIndex));
    } else {
      setSelectedArticles([...selectedArticles, article]);
    }
    if (selectedArticles.length > 0) {
      setValidationError(false); // Reset validation error if there are selected articles
    }
  };
  
  const handleSubmit = async () => {
    if (selectedArticles.length === 0) {
      setValidationError(true); // Set validation error if no articles are selected
      return;
    }
    setIsSubmitting(true); // Disable button and show spinner
    await nextStep({selected_articles: selectedArticles});
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Research Similar Articles</h2>
      <p className="mb-4">These articles are the best search results for the topic. <br /> 
      Choose the articles you want to consider in the research process.</p>
      
      <div className="overflow-y-scroll h-64 border border-gray-300 rounded px-4 py-2 mb-4">
        {stepData?.serp ? stepData?.serp.map((result, index) => (
          <div key={index} className="mb-2 border-b border-gray-200 pb-2">
            <label className="block">
              <input
                type="checkbox"
                checked={selectedArticles.some(article => article.title === result.title)}
                onChange={() => handleArticleChange({title: result.title, url: result.url})}
                className="mr-2"
              />
              <small>{result.title }<br /><b>{new URL(result.url).hostname}</b></small>
            </label>
          </div>
        )) : "No results found here"}
      </div>
      {validationError && <p className="text-red-500 text-sm mt-1 font-bold">Please select at least one article.</p>}

      <div className="flex justify-end mt-4">
        <button
          className={`px-4 py-2 ${isSubmitting ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'} text-white rounded transition-colors`}
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
          ) : nextModule.buttonLabel}
        </button>
      </div>
      {isSubmitting && nextModule.hasProgressBar && (
        <ProgressBar executionTime={nextModule.executionTime} renderProgressMessage={nextModule.renderProgressMessage} />
      )}
    </div>
  );
}

export default SimilarArticles;

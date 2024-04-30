import React, { useState, useEffect } from 'react';

function StepThree({ prevStep, nextStep, stepData }) {
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added state to track submission status

  useEffect(() => {
    console.log('Serp Articles Stepdata on load:', stepData);
  }, [stepData]); // Include stepData in the dependency array

  const handleSelectAll = () => {
    const allArticles = stepData?.serp?.map(article => {
      return {title: article.title, url: article.url}; // Changed 'position' to 'url' to match the expected structure
    }) || [];
    setSelectedArticles(allArticles);
  };

  const handleSelectNone = () => {
    setSelectedArticles([]);
  };


  const handleArticleChange = (article) => {
    const articleIndex = selectedArticles.findIndex(a => a.title === article.title);
    if (articleIndex > -1) {
      setSelectedArticles(selectedArticles.filter((_, index) => index !== articleIndex));
    } else {
      setSelectedArticles([...selectedArticles, article]);
    }
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true); // Disable button and show spinner
    await nextStep({selected_articles: selectedArticles});
    setIsSubmitting(false); // Re-enable button after submission
  };
  const handleBack = () => {
    console.log('Back button clicked, attempting to move to previous step with current stepData:', JSON.stringify(stepData)); // Debugging line with JSON.stringify for better visibility in console
    prevStep(stepData); // Passing stepData directly to prevStep function
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Research Similar Articles</h2>
      <p className="mb-4">These articles are the best results for the topic. <br /> 
      Choose the articles you want to consider in the research process.</p>
      
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
        {stepData?.serp ? stepData?.serp.map((result, index) => (
          <label key={index} className="block">
            <input
              type="checkbox"
              checked={selectedArticles.some(article => article.title === result.title)}
              onChange={() => handleArticleChange({title: result.title, url: result.url})}
              className="mr-2"
            />
            <small>{result.title }<br /><b>{new URL(result.url).hostname}</b></small>
          </label>
        )) : "No results found here"}
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
            'Next: Review Headings'
          )}
        </button>
      </div>
    </div>
  );
}

export default StepThree;


import React, { useEffect } from 'react';
import ClipboardJS from 'clipboard';

function ArticleGeneration({ stepData }) {
  useEffect(() => {
    console.log('Article Generation Stepdata on load:', stepData);
  }, [stepData]);

  useEffect(() => {
    const clipboard = new ClipboardJS('.copy-btn', {
      target: () => document.querySelector('.article-content')
    });

    clipboard.on('success', () => {
      console.log('HTML content copied to clipboard');
    });

    clipboard.on('error', (err) => {
      console.error('Failed to copy HTML content: ', err);
    });

    return () => {
      clipboard.destroy();
    };
  }, [stepData]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">{stepData?.title}</h1>
      
      <div className="overflow-y-scroll h-auto border border-gray-300 rounded px-4 py-2 mb-4 article-content">
        {stepData && stepData.length > 0 ? (
          stepData.map((section, index) => (
            <div key={index} className="mb-4">
              {Object.keys(section).map((heading, subIndex) => (
                <div key={subIndex}>
                  <div dangerouslySetInnerHTML={{ __html: section[heading] }} />
                </div>
              ))}
            </div>
          ))
        ) : (
          "No article generated"
        )}
      </div>
      <button 
        className="copy-btn bg-blue-500 text-white px-4 py-2 rounded"
      >
        Copy to Clipboard
      </button>
    </div>
  );
}

export default ArticleGeneration;

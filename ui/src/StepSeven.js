import React, { useState, useEffect } from 'react';
import ClipboardJS from 'clipboard';

function StepSeven({ nextStep, stepData }) {
  const [selectedHeadings, setSelectedHeadings] = useState([]);
  const [validationError, setValidationError] = useState(false);

  useEffect(() => {
    console.log('Headings Stepdata on load:', stepData)
  }, [stepData]);

  const handleHeadingChange = (heading) => {
    if (selectedHeadings.includes(heading)) {
      setSelectedHeadings(selectedHeadings.filter(h => h !== heading));
    } else {
      setSelectedHeadings([...selectedHeadings, heading]);
    }
  };
  
  const handleSubmit = async () => {
    if (selectedHeadings.length === 0) {
      setValidationError(true);
      return;
    }
    await nextStep({selected_headings: selectedHeadings});
  };

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
                  <h3 className="font-semibold">{heading}</h3>
                  {typeof section[heading] === 'string' ? (
                    <p>{section[heading]}</p>
                  ) : (
                    Object.keys(section[heading]).map((subHeading, subSubIndex) => (
                      <div key={subSubIndex} className="ml-4">
                        <h4 className="font-semibold">{subHeading}</h4>
                        <p>{section[heading][subHeading]}</p>
                      </div>
                    ))
                  )}
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

export default StepSeven;

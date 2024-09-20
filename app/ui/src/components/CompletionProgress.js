import React from 'react';
import moduleData from '../moduleData';

const CompletionProgress = ({ currentStep }) => {
  return (
    <div className="flex justify-center items-center my-8 overflow-x-auto">
      {moduleData.map((module, index) => (
        <React.Fragment key={module.order}>
          <div className="flex flex-col items-center mx-2">
            <div
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center
                ${index <= currentStep ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'}`}
            >
              {module.order + 1}
            </div>
            <span className="text-xs mt-1 text-center w-20 break-words">{module.name}</span>
          </div>
          {index < moduleData.length - 1 && (
            <div
              className={`w-8 h-0.5 mt-5 ${
                index < currentStep ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CompletionProgress;
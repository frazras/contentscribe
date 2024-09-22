import React, { useState, useEffect } from 'react';
import { CheckIcon } from 'lucide-react';
import moduleData from '../moduleData';

const CompletionProgress = ({ currentStep }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getVisibleSteps = () => {
    if (isMobile) {
      if (currentStep === 0) return [moduleData[0], moduleData[1], moduleData[moduleData.length - 1]];
      if (currentStep === moduleData.length - 1) return [moduleData[0], moduleData[moduleData.length - 2], moduleData[moduleData.length - 1]];
      return [moduleData[0], moduleData[currentStep], moduleData[moduleData.length - 1]];
    }
    return moduleData;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-8 py-8 mb-8">
      <div className="flex items-center">
        {getVisibleSteps().map((module, index, visibleSteps) => (
          <React.Fragment key={module.order}>
            <div className="flex flex-col items-center relative">
              <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-semibold z-10
                  ${
                    module.order <= currentStep
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-blue-200 text-blue-200'
                  }`}
              >
                {module.order < currentStep ? (
                  <CheckIcon className="w-6 h-6" />
                ) : (
                  module.order + 1
                )}
              </div>
              <span className="absolute top-14 text-xs font-medium text-center w-24 break-words">
                {module.name}
              </span>
            </div>
            {index < visibleSteps.length - 1 && (
              <div className="flex-1 mx-[-6px] relative z-0">
                <div
                  className={`absolute top-1/2 transform -translate-y-1/2 h-2 w-full
                    ${module.order < currentStep ? 'bg-blue-500' : 'bg-blue-200'}`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CompletionProgress;
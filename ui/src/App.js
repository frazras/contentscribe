// src/App.js
import React, { useState } from 'react';
import './App.css'; // This now imports Tailwind CSS
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import axios from 'axios'; // Import axios for API calls
// Import other steps as needed

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState({});
  const serverUrl = 'http://127.0.0.1:5000';

  // Set up axios defaults for CORS
  axios.defaults.baseURL = serverUrl;
  axios.defaults.headers.post['Content-Type'] = 'application/json';

  const callApiForStep = async (step, params) => {
    let endpoint = '';
    let data = {};

    switch (step) {
      case 1:
        endpoint = 'api/keygen';
        data = { keyword: params.keyword, country: params.country, additional_keywords: params.additional_keywords };
        break;
      case 2:
        endpoint = 'api/titlegen';
        data = { param1: params.param1, param2: params.param2, param3: params.param3 };
        break;
      case 3:
        endpoint = 'api/topicgen';
        data = { param1: params.param1, param2: params.param2 };
        break;
      default:
        console.error('Invalid step');
        return;
    }

    try {
      const response = await axios.post(endpoint, data);
      setStepData(response.data);
      setCurrentStep(step);
    } catch (error) {
      console.error(`Failed to call API for step ${step}`, error);
    }
  };

  const nextStep = (params) => {
    const nextStepNumber = currentStep + 1;
    callApiForStep(nextStepNumber, params);
  };

  const prevStep = (params) => {
    if (currentStep > 1) {
      const prevStepNumber = currentStep - 1;
      setCurrentStep(prevStepNumber);
      //callApiForStep(prevStepNumber, params);
    }
  };

  return (
    <div className="App">
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
        <div className="max-w-xl mx-auto p-8 bg-white border border-gray-300 rounded-lg shadow-lg text-left">
          {currentStep === 0 && <StepOne nextStep={nextStep} stepData={stepData} />}
          {currentStep === 1 && <StepTwo prevStep={prevStep} nextStep={nextStep} stepData={stepData} />}
          {/* Add additional steps here */}
        <div className="flex justify-center items-center mt-4">
          <div className="w-64 bg-gray-200 rounded-full">
            <div className={`w-${(currentStep - 1) * 33}% h-2 bg-blue-500 rounded-full`}></div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default App;

// src/App.js
import React, { useState, useRef } from 'react';
import './App.css'; // This now imports Tailwind CSS
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import StepFour from './StepFour';
import StepFive from './StepFive';
import axios from 'axios'; // Import axios for API calls
// Import other steps as needed

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState({});
  const serverUrl =  window.location.origin;

  // Set up axios defaults for CORS
  axios.defaults.baseURL = serverUrl;
  axios.defaults.headers.post['Content-Type'] = 'application/json';

  // Using useRef to persist globalData across renders without causing re-renders
  const globalData = useRef({});

  const callApiForStep = async (step, params) => {
    let endpoint = '';

    switch (step) {
      case 1:
        endpoint = '/api/keygen';
        if(params.input_keyword) {
          globalData.current = { 
            input_keyword: params.input_keyword,
            country: params.country,
            additional_keywords: params.additional_keywords
          };
        }
        if((!params.input_keyword || params.input_keyword.trim() === '') 
        && (!globalData.current.input_keyword || globalData.current.input_keyword.trim() === '')) {
          console.error('Keyword is required for SerpScrape');
          return;
        }
        break;
      case 2:
        endpoint = '/api/serpscrape';
        // Ensure input_keyword is not empty or undefined
        if(params.input_keyword) {
          globalData.current.input_keyword = params.input_keyword;
        }

        if((!params.input_keyword || params.input_keyword.trim() === '') 
        && (!globalData.current.input_keyword || globalData.current.input_keyword.trim() === '')) {
          console.error('Keyword is required for SerpScrape');
          return;
        }
        break;
      case 3:
        endpoint = '/api/headerscrape';
        
        if(params.selected_articles) {
          globalData.current.selected_articles = params.selected_articles;
        }
        console.log("params headerscrape", params);
        console.log("globalData.current", globalData.current);
        // Ensure input_keyword is not empty or undefined
        if (!globalData.current.selected_articles || globalData.current.selected_articles.length === 0) {
          console.error('No Article Selected');
          return;
        }
        break;
      case 4:
        endpoint = '/api/newtitlegen';
        // Ensure selectedArticles is not empty or undefined
        if (!globalData.current.input_keyword || globalData.current.input_keyword.trim() === '') {
          console.error('Keyword is required for Title Generation');
          return;
        }
        break;
      default:
        console.error('Invalid step');
        return;
    }

    
      console.log("Api: " + endpoint + " called with params", globalData.current);
      try {
        // Append contents of params to globalData.current with its own key
        Object.entries(params).forEach(([key, value]) => {
          globalData.current[key] = value;
        });
        let response = await axios.post(endpoint, globalData.current);
        // Append contents of response.data.results to globalData.current with its own key
        Object.entries(response.data.results).forEach(([key, value]) => {
          globalData.current[key] = value;
        });
        setStepData(response.data.results);
        console.log("response", response);



      } catch (error) {
        console.error(`Axios Failed to call API for step ${step}, ${endpoint}`, error);
        return;
      }
      console.log("GlobalData", globalData.current);
      setCurrentStep(step);
  };

  const nextStep = (params) => {
    const nextStepNumber = currentStep + 1;
    callApiForStep(nextStepNumber, params);
    console.log("nextStepNumber", nextStepNumber);
    return;
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepNumber = currentStep - 1;
      setCurrentStep(prevStepNumber);
    }
  };

  return (
    <div className="App">
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
        <div className="max-w-xl mx-auto p-8 bg-white border border-gray-300 rounded-lg shadow-lg text-left">
          {currentStep === 0 && <StepOne nextStep={nextStep} stepData={stepData} />}
          {currentStep === 1 && <StepTwo prevStep={prevStep} nextStep={nextStep} stepData={stepData} />}
          {currentStep === 2 && <StepThree prevStep={prevStep} nextStep={nextStep} stepData={stepData} />}
          {currentStep === 3 && <StepFour prevStep={prevStep} nextStep={nextStep} stepData={stepData} />}
          {currentStep === 4 && <StepFive prevStep={prevStep} nextStep={nextStep} stepData={stepData} />}
          {/* Add additional steps here */}
        </div>
      </div>
    </div>
  );
}

export default App;

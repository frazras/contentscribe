// src/App.js
import React, { useState, useRef } from 'react';
import './App.css'; // This now imports Tailwind CSS
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import StepFour from './StepFour';
import StepFive from './StepFive';
import ArticleBrief from './ArticleBrief';
import StepSix from './StepSix';
import StepSeven from './StepSeven';
import axios from 'axios'; // Import axios for API calls
// Import other steps as needed

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const state = {
      "article_content": [
        {
          "Introduction": "Jamaica's climate and seasons play a significant role in determining the best time to travel to this beautiful island. Understanding the weather patterns and seasonal variations can help you make the most of your trip, whether you're seeking sunny beach days or exploring the lush landscapes of Jamaica."
        },
        {
          "Best Time to Visit Jamaica": {
            "Low Season: June - November": "The low season in Jamaica is from June to November, when the weather is more unpredictable with a higher chance of rain. However, this is also the time when you can find great deals on accommodations and fewer crowds at popular tourist attractions.",
            "Peak Season: Mid-December – Mid-April": "The peak season in Jamaica is from mid-December to mid-April, when the weather is dry and the temperatures are comfortable. This is the perfect time to visit if you want to enjoy the beautiful beaches and outdoor activities without the risk of rain."
          }
        },
        {
          "Weather and Activities": {
            "Best time to go to Hedonism Jamaica": "The best time to visit Hedonism Jamaica is during the dry season, which runs from mid-December to mid-April. This is when you can enjoy the beautiful beaches and outdoor activities without the risk of rain. The resort also hosts special events and parties during this time, making it an ideal period for a lively and vibrant experience.",
            "What to pack for your trip": "When packing for your trip to Jamaica, it's important to consider the warm and humid climate. Be sure to pack lightweight and breathable clothing, such as shorts, t-shirts, and swimwear. Don't forget to bring sunscreen, sunglasses, and a hat to protect yourself from the strong Caribbean sun. It's also a good idea to pack insect repellent and a light jacket or sweater for cooler evenings. Lastly, remember to bring any necessary travel documents, medications, and personal items to ensure a comfortable and enjoyable trip."
          }
        },
        {
          "Conclusion": "When deciding the best time to travel to Jamaica, it's important to consider the peak season versus the low season. Peak season, which runs from mid-December to mid-April, offers ideal weather and a lively atmosphere, but it also comes with higher prices and larger crowds. On the other hand, the low season from June to November may have more affordable rates and fewer tourists, but it also brings the risk of hurricanes and more unpredictable weather. Ultimately, the best time to book your trip to Jamaica depends on your preferences for weather, budget, and crowd levels."
        }
      ],
      "title": "Each month reviewed"
  }
  //const [stepData, setStepData] = useState(state);
  const [stepData, setStepData] = useState({});
  const serverUrl =  window.location.origin;

  // Set up axios defaults for CORS
  axios.defaults.baseURL = serverUrl;
  axios.defaults.headers.post['Content-Type'] = 'application/json';

  // Using useRef to persist globalData across renders without causing re-renders
  const globalData = useRef({});

  const callApiForStep = async (step, params) => {
    let endpoint = '';
    let callApi = true;

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
      case 5:
        endpoint = '/api/articlebrief';
        callApi = false;
        break;
      case 6:
        endpoint = '/api/outlinegen';
        break;
      case 7:
        endpoint = '/api/articlegen';
        break;
      default:
        console.error('Invalid step for callApiForStep', step);
        return;
    }

    
      console.log("Api: " + endpoint + " called with params", globalData.current);
      try {
        // Append contents of params to globalData.current with its own key
        Object.entries(params).forEach(([key, value]) => {
          globalData.current[key] = value;
        });
        if (callApi) {
          let response = await axios.post(endpoint, globalData.current);
          // Append contents of response.data.results to globalData.current with its own key
          Object.entries(response.data.results).forEach(([key, value]) => {
            globalData.current[key] = value;
          });
          setStepData(response.data.results);
          console.log("response", response);
        }


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
          {currentStep === 5 && <ArticleBrief prevStep={prevStep} nextStep={nextStep} stepData={stepData} />}
          {currentStep === 6 && <StepSix prevStep={prevStep} nextStep={nextStep} stepData={stepData} />}
          {currentStep === 7 && <StepSeven prevStep={prevStep} nextStep={nextStep} stepData={stepData} />}
          {/* Add additional steps here */}
        </div>
      </div>
    </div>
  );
}

export default App;

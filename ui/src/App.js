// src/App.js
import React, { useState, useRef, useEffect } from 'react';
import './App.css'; // This now imports Tailwind CSS
import axios from 'axios'; // Import axios for API calls
import { JsonView, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [modules, setModules] = useState([]);
  const [stepData, setStepData] = useState({});
  const [loading, setLoading] = useState(true); // New state for loading
  const serverUrl = window.location.origin;

  // Set up axios defaults for CORS
  axios.defaults.baseURL = serverUrl;
  axios.defaults.headers.post['Content-Type'] = 'application/json';

  // Using useRef to persist globalData across renders without causing re-renders
  const globalData = useRef({});

  useEffect(() => {
    const fetchModules = async () => {
      // Simulate fetching module data from an API or file
      const moduleData = [
        {
          order: 0,
          name: "Main Keyword",
          component: 'MainKeyword',
          prerequisites: [],
          executionTime: 0,
          hasProgressBar: false,
          buttonLabel: "Get Main Keyword",
          renderProgressMessage: null
        },
        {
          order: 1,
          name: "Keyword Research",
          component: 'KeywordResearch',
          prerequisites: ["MainKeyword"],
          executionTime: 60, // in seconds
          hasProgressBar: true,
          buttonLabel: "Perform Keyword Research",
          renderProgressMessage: {
            5: "Analyzing Keywords...",
            10: "Generating Keyword Variations...",
            30: "Using AI to Categorize and Rank Keyword Variations...",
            60: "Removing Duplicates and Contextually Similar Keyword Variations...",
            80: "Semantically Grouping Keyword Variations...",
            99: "Wrapping up...",
            100: "Complete! ...But it looks like there are a few extra things to iron out, please give it a few more seconds"
          }
        },
        {
          order: 2,
          name: "Research Similar Articles",
          component: 'SimilarArticles',
          prerequisites: ["KeywordResearch"],
          executionTime: 90, // in seconds
          hasProgressBar: true,
          buttonLabel: "Analyze Articles",
          renderProgressMessage: null
        },
        {
          order: 3,
          name: "Select Headings",
          component: 'Headings',
          prerequisites: ["SimilarArticles"],
          executionTime: 45, // in seconds
          hasProgressBar: true,
          buttonLabel: "Select Headings",
          renderProgressMessage: null
        },
        {
          order: 4,
          name: "Titles",
          component: 'Titles',
          prerequisites: ["Headings"],
          executionTime: 180, // in seconds
          hasProgressBar: true,
          buttonLabel: "Select a Title",
          renderProgressMessage: null
        },
        {
          order: 5,
          name: "Article Outline",
          component: 'ArticleOutline',
          prerequisites: ["Titles"],
          executionTime: 120, // in seconds
          hasProgressBar: true,
          buttonLabel: "Generate Article Outline",
          renderProgressMessage: null
        },
        {
          order: 6,
          name: "Article Generation",
          component: 'ArticleGeneration',
          prerequisites: ["ArticleOutline"],
          executionTime: 60, // in seconds
          hasProgressBar: true,
          buttonLabel: "Generate Article",
          renderProgressMessage: null
        }
      ];

      // Dynamically import the components
      const importedModules = await Promise.all(
        moduleData.map(async (module) => {
          const component = await import(`./modules/${module.component}`);
          return { ...module, component: component.default };
        })
      );

      setModules(importedModules);
      setLoading(false); // Set loading to false after modules are fetched
    };

    fetchModules();
  }, []);

  const callApiForStep = async (step, params) => {
    let endpoint = '';
    let callApi = true;

    switch (step) {
      case 1:
        endpoint = '/api/keygen';
        if (params.input_keyword) {
          globalData.current = {
            input_keyword: params.input_keyword,
            country: params.country,
            additional_keywords: params.additional_keywords
          };
        }
        if ((!params.input_keyword || params.input_keyword.trim() === '') &&
          (!globalData.current.input_keyword || globalData.current.input_keyword.trim() === '')) {
          console.error('Keyword is required for SerpScrape');
          return;
        }
        break;
      case 2:
        endpoint = '/api/serpscrape';
        // Ensure input_keyword is not empty or undefined
        if (params.input_keyword) {
          globalData.current.input_keyword = params.input_keyword;
        }

        if ((!params.input_keyword || params.input_keyword.trim() === '') &&
          (!globalData.current.input_keyword || globalData.current.input_keyword.trim() === '')) {
          console.error('Keyword is required for SerpScrape');
          return;
        }
        break;
      case 3:
        endpoint = '/api/headerscrape';

        if (params.selected_articles) {
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

  const nextStep = (params, executionTime) => {
    const nextStepNumber = currentStep + 1;
    callApiForStep(nextStepNumber, params);
    console.log("nextStepNumber", nextStepNumber);
    
    // Update the next module's execution time
    const updatedModules = [...modules];
    const nextModuleIndex = updatedModules.findIndex(mod => mod.order === nextStepNumber);
    if (nextModuleIndex !== -1) {
      updatedModules[nextModuleIndex] = {
        ...updatedModules[nextModuleIndex],
        executionTime: executionTime || updatedModules[nextModuleIndex].executionTime
      };
      setModules(updatedModules);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepNumber = currentStep - 1;
      setCurrentStep(prevStepNumber);
    }
  };

  return (
    <div className="App">
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <h1 className="text-3xl font-bold mt-3 self-center">ContentScribe</h1>
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-xl mx-auto p-8 bg-white border border-gray-300 rounded-lg shadow-lg text-left">
            {loading ? (
              <div className="flex justify-center items-center">
                <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              modules.map((module, index) => (
                currentStep === index && React.createElement(module.component, {
                  key: module.order, // Add unique key prop
                  prevStep: prevStep,
                  nextStep: nextStep,
                  stepData: stepData,
                  nextModule: modules.find(mod => mod.order === index + 1)
                })
              ))
            )}
          </div>
        </div>
      </div>

      {Object.keys(globalData.current).length > 0 && (
        <div style={{ textAlign: 'left' }}>
          Context Data:
          <JsonView data={globalData.current} shouldExpandNode={() => false} clickToExpandNode={true} allExpanded={false} style={darkStyles} />
        </div>
      )}
    </div>
  );
}

export default App;
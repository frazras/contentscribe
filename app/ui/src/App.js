import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { JsonView, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import moduleData, { debug } from './moduleData';
import debugdata from './debug';
import { DEBUG_MODE } from './config'; // Import the debug mode setting
import CompletionProgress from './components/CompletionProgress';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [modules, setModules] = useState([]);
  const [stepData, setStepData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const serverUrl = window.location.origin;
  const apiBasePath = '/api';

  axios.defaults.baseURL = serverUrl;
  axios.defaults.headers.post['Content-Type'] = 'application/json';

  const globalData = useRef({});
  const [selectedLLM, setSelectedLLM] = useState(() => {
    const savedLLM = localStorage.getItem('selectedLLM');
    return savedLLM || 'gemini';
  });
  const llmOptions = [
    { name: 'Google Gemini', key: 'gemini' },
    { name: 'OpenAI', key: 'openai' },
    { name: 'Anthropic (Experimental)', key: 'anthropic' }
  ];

  useEffect(() => {
    const fetchModules = async () => {
      const importedModules = await Promise.all(
        moduleData.map(async (module) => {
          try {
            const importedModule = await import(`./modules/${module.component}`);
            return { ...module, code: importedModule.default };
          } catch (error) {
            console.error(`Failed to import module ${module.component}:`, error);
            return { ...module, code: null };
          }
        })
      );

      setModules(importedModules);
      setLoading(false);
    };

    fetchModules();
  }, []);

  useEffect(() => {
    // Initialize globalData with debugdata if in debug mode
    if (DEBUG_MODE) {
      globalData.current = { ...debugdata };
      setStepData(debugdata);
    }
  }, []);

  useEffect(() => {
    globalData.current.selectedLLM = selectedLLM;
    localStorage.setItem('selectedLLM', selectedLLM);
    console.log("Selected LLM Global Data:DN " + globalData.current.selectedLLM);
    console.log(globalData.current);
  }, [selectedLLM]);

  const handleLLMChange = (event) => {
    setSelectedLLM(event.target.value);
    console.log("Selected LLM: " + event.target.value);
  };

  const callApiForStep = async (step, params) => {
    if (DEBUG_MODE) {
      // In debug mode, check if the step is in the list of debug modules
      const isDebugModule = debug.some(module => module.order === step);
      if (!isDebugModule) {
        // If not in the list of debug modules, just update the current step
        setCurrentStep(step);
        return;
      }
    }

    let endpoint = '';
    let callApi = true;

    switch (step) {
      case 1:
        endpoint = '/keygen';
        if (params.input_keyword) {
          globalData.current.input_keyword = params.input_keyword;
          globalData.current.country = params.country;
          globalData.current.additional_keywords = params.additional_keywords;
        }
        if ((!params.input_keyword || params.input_keyword.trim() === '') &&
          (!globalData.current.input_keyword || globalData.current.input_keyword.trim() === '')) {
          console.error('Keyword is required for SerpScrape');
          return;
        }
        break;
      case 2:
        endpoint = '/serpscrape';
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
        endpoint = '/headerscrape';

        if (params.selected_articles) {
          globalData.current.selected_articles = params.selected_articles;
        }
        
        // Ensure input_keyword is not empty or undefined
        if (!globalData.current.selected_articles || globalData.current.selected_articles.length === 0) {
          console.error('No Article Selected');
          return;
        }
        break;
      case 4:
        endpoint = '/newtitlegen';
        // Ensure selectedArticles is not empty or undefined
        if (!globalData.current.input_keyword || globalData.current.input_keyword.trim() === '') {
          console.error('Keyword is required for Title Generation');
          return;
        }
        break;
      case 5:
        endpoint = '/articlebrief';
        break;
      case 6:
        endpoint = '/outlinegen';
        break;
      case 7:
        endpoint = '/articlegen';
        callApi = false;
        break;
      default:
        console.error('Invalid step for callApiForStep', step);
        return;
    }

    // Check if the request is originating from port 3000
    const port = window.location.port;
    if (port === '3000') {
      endpoint = `http://localhost:8000${apiBasePath}${endpoint}`;
    } else {
      endpoint = `${apiBasePath}${endpoint}`;
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
      if (error.response) {
        console.log("first")
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Error ${error.response.status}: ${error.response.data}`);
      } else if (error.request) {
        // The request was made but no response was received
        setError("No response received from server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${error.message}`);
      }
      return;
    }
    console.log("GlobalData", globalData.current);
    setCurrentStep(step);
  };

  const nextStep = (params, executionTime, reset, stepNumber) => {
    console.log("Reset", reset);
    if (reset) {
      globalData.current = {};
      setStepData({});
      setCurrentStep(0);
    } 

    let nextStepNumber;
    if (stepNumber) {
      nextStepNumber = stepNumber;
    } else {
      nextStepNumber = currentStep + 1;
    }
    
    console.log("Next Step Number", nextStepNumber);
    const nextModule = modules.find(mod => mod.order === nextStepNumber);
    console.log(debug);
    const shouldCallApi = debug.some(item => item.component === nextModule?.component);

    if (DEBUG_MODE && !shouldCallApi) {
      setCurrentStep(nextStepNumber);
    } else {
      if (DEBUG_MODE && shouldCallApi) {
        // Temporarily exit debug mode for this step
        callApiForStep(nextStepNumber, params);
      } else {
        callApiForStep(nextStepNumber, params);
      }
    }

    // Update the next module's execution time
    const updatedModules = [...modules];
    const nextModuleIndex = updatedModules.findIndex(mod => mod.order === nextStepNumber);
    if (nextModuleIndex !== -1) {
      let updatedExecutionTime = executionTime || updatedModules[nextModuleIndex].executionTime;
      
      // If the selected LLM is OpenAI, increase execution time by 25%
      if (selectedLLM === 'openai') {
        updatedExecutionTime *= 1.25;
      }

      updatedModules[nextModuleIndex] = {
        ...updatedModules[nextModuleIndex],
        executionTime: updatedExecutionTime
      };
      setModules(updatedModules);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="App">
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <h1 className="text-3xl font-bold mt-3 self-center">ContentScribe</h1>
        <div className="flex justify-end items-center mt-2">
          <div className="text-right">
            <label htmlFor="llm-select" className="mr-12 block mb-1">Select LLM:</label>
            <select
              id="llm-select"
              value={selectedLLM}
              onChange={handleLLMChange}
              className="p-2 border border-gray-300 rounded-md mr-12"
            >
              {llmOptions.map((llm) => (
                <option key={llm.key} value={llm.key}>{llm.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Add the CompletionProgress component here */}
        <CompletionProgress currentStep={currentStep} />
        
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
                currentStep === index && module.code && React.createElement(module.code, {
                  key: module.order,
                  prevStep: prevStep,
                  nextStep: nextStep,
                  stepData: DEBUG_MODE ? debugdata : stepData,
                  globalData: globalData, // Pass globalData as a prop
                  nextModule: modules.find(mod => mod.order === index + 1)
                })
              ))
            )}
          </div>
        </div>
      </div>

      {(Object.keys(globalData.current).length > 0 || DEBUG_MODE) && (
        <div style={{ textAlign: 'left' }}>
          Context Data:
          <JsonView 
            data={DEBUG_MODE ? debugdata : globalData.current} 
            shouldExpandNode={() => false} 
            clickToExpandNode={true} 
            allExpanded={false} 
            style={darkStyles} 
          />
        </div>
      )}
      {error && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Error</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: error }} />
                <p className="text-sm text-gray-500">You may need to reload the page.</p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={() => setError(null)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
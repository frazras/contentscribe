import React, { useState, useEffect, useRef, useCallback } from 'react';
import Clipboard from 'clipboard/dist/clipboard.min.js'; // Ensure correct import for Clipboard

function ArticleGeneration({ nextStep, globalData }) {
  const [articleContent, setArticleContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showGenerateButton, setShowGenerateButton] = useState(true);
  const abortControllerRef = useRef(null);
  const articleContentRef = useRef(null); // Reference to the article content div
  const [autoScroll, setAutoScroll] = useState(true); // State to control auto-scrolling

  const appendArticleContent = useCallback((newContent) => {
    setArticleContent(prevContent => prevContent + newContent);
  }, []);

  const handleGenerateArticle = async () => {
    if (!isGenerating) {
      setIsGenerating(true);
      setError('');
      setArticleContent('');
      setShowGenerateButton(false);
      abortControllerRef.current = new AbortController();
      
      try {
        // Check if the request is originating from port 3000
        const port = window.location.port;
        const apiUrl = port === '3000' ? 'http://localhost:8000/api/articlegen' : '/api/articlegen';

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(globalData.current),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          appendArticleContent(chunk);
          // Scroll to the bottom of the article content if autoScroll is enabled
          if (autoScroll && articleContentRef.current) {
            articleContentRef.current.scrollTop = articleContentRef.current.scrollHeight;
          }
        }
      } catch (err) {
        console.error('Error in handleGenerateArticle:', err);
      } finally {
        setIsGenerating(false);
      }
    } else {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      setArticleContent('');
    }
  };

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = articleContentRef.current;
    // Check if the user has scrolled near the bottom
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      setAutoScroll(true); // Enable auto-scrolling
    } else {
      setAutoScroll(false); // Disable auto-scrolling
    }
  };

  useEffect(() => {
    //handleGenerateArticle(); // Run handleGenerateArticle on page load
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [globalData]);

  useEffect(() => {
    const clipboard = new Clipboard('.copy-btn', {
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
  }, [articleContent]);

  return (
    <div>
      {showGenerateButton && (
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          onClick={handleGenerateArticle}
        >
          Generate Article
        </button>
      )}
      
      <div 
        className="overflow-y-scroll h-96 border border-gray-300 rounded px-4 py-2 mb-4 article-content"
        ref={articleContentRef} // Attach the ref to the div
        onScroll={handleScroll} // Attach scroll event handler
      >
        <div dangerouslySetInnerHTML={{ __html: articleContent }} />
        {isGenerating && <p>Generating article...</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <button 
        className="copy-btn bg-blue-500 text-white px-4 py-2 rounded mr-2"
        disabled={isGenerating || !articleContent}
      >
        Copy to Clipboard
      </button>
      <button 
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={() => {nextStep({ reset: true }); console.log("resetted");}} // Assuming nextStep can handle a reset action
      >
        Go Back to Beginning!
      </button>
      {!showGenerateButton && (
        <button 
          className="bg-yellow-500 text-white px-4 py-2 rounded mt-4"
          onClick={handleGenerateArticle}
        >
          {isGenerating ? 'Stop Generation' : 'Regenerate Article'}
        </button>
      )}
    </div>
  );
}

export default ArticleGeneration;
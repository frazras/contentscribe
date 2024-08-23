import React, { useState, useEffect, useRef } from 'react';
import Clipboard from 'clipboard/dist/clipboard.min.js'; // Ensure correct import for Clipboard
import axios from 'axios';

function ArticleGeneration({ nextStep, globalData }) {
  const [articleContent, setArticleContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const abortControllerRef = useRef(null);

  const handleGenerateArticle = async () => {
    console.log('handleGenerateArticle');
    if (!isGenerating) {
      console.log('handleGenerateArticle 2');
      setIsGenerating(true);
      setError('');
      setArticleContent('');
      abortControllerRef.current = new AbortController();
      
      try {
        console.log('handleGenerateArticle 3b');
        const response = await fetch(`/api/articlegen`, {
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

        console.log('handleGenerateArticle 3c');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          console.log('Received chunk:', chunk);
          setArticleContent(prevContent => prevContent + chunk);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Request canceled:', err.message);
        } else {
          setError('An error occurred while generating the article.');
          console.error('Error generating article:', err);
        }
      } finally {
        setIsGenerating(false);
      }
    } else {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      setArticleContent('');
    }
  };

  useEffect(() => {
    console.log('Article Generation globalData on load:', globalData.current);

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
      <h1 className="text-2xl font-semibold mb-4">{globalData.current?.customTitle || globalData.current?.selectedTitle}</h1>
      
      <div className="overflow-y-scroll h-96 border border-gray-300 rounded px-4 py-2 mb-4 article-content">
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
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={() => nextStep({})}
        disabled={isGenerating || !articleContent}
      >
        Next
      </button>
      <button 
        className="bg-yellow-500 text-white px-4 py-2 rounded mt-4"
        onClick={handleGenerateArticle}
      >
        Start Generation
      </button>
    </div>
  );
}

export default ArticleGeneration;
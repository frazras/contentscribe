import React, { useState, useEffect, useRef } from 'react';

function Tooltip({ children, content }) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    function handleResize() {
      if (tooltipRef.current) {
        const isMobile = window.innerWidth <= 768; // Adjust this breakpoint as needed
        tooltipRef.current.style.maxWidth = isMobile ? '90vw' : '300px'; // Adjust these values as needed
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div 
          ref={tooltipRef}
          className="absolute z-10 p-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 break-words"
        >
          {content}
        </div>
      )}
    </div>
  );
}

export default Tooltip;
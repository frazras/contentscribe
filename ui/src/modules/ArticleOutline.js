import React, { useState, useEffect, useCallback } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon, ArrowsUpDownIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProgressBar from '../lib/Progressbar';

const Section = ({ section, index, moveSection }) => {
  const ref = React.useRef(null);
  const [, drop] = useDrop({
    accept: 'section',
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'section',
    item: { type: 'section', index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const sectionTitle = Object.keys(section)[0];

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-blue-900 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
              <div className="flex items-center">
                <ArrowsUpDownIcon className="w-4 h-4 text-blue-500 mr-2" />
                <PencilSquareIcon className="editable w-4 h-4 text-blue-500 mr-2" />
                <span className='text-label'>{sectionTitle}</span>
              </div>
              <div className="flex items-center ml-auto">
                <ChevronRightIcon
                  className={`${open ? 'transform rotate-90' : ''} w-5 h-5 text-blue-500`}
                />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
              <ul>
                {section[sectionTitle].map((item, idx) => (
                  <li key={idx} className="list-disc list-inside">{item}</li>
                ))}
              </ul>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
};

const ArticleOutline = ({ nextStep, stepData, nextModule }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outline, setOutline] = useState(stepData?.outline || []);

  useEffect(() => {
    console.log('Titles Stepdata on load:', stepData);
  }, [stepData]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    await nextStep({ ...stepData, outline });
  }, [nextStep, stepData, outline]);

  const moveSection = useCallback((dragIndex, hoverIndex) => {
    setOutline(prevOutline => {
      const newOutline = [...prevOutline];
      const [removed] = newOutline.splice(dragIndex, 1);
      newOutline.splice(hoverIndex, 0, removed);
      return newOutline;
    });
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h2 className="text-lg font-semibold mb-4">Article Outline Editor</h2>
        <p className="mb-4">Edit the outline sections below:</p>

        <div className="space-y-4">
          {outline.map((section, index) => (
            <Section key={index} section={section} index={index} moveSection={moveSection} />
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <button
            className={`px-4 py-2 ${isSubmitting ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-700'} text-white rounded transition-colors`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              'Generate Article'
            )}
          </button>
        </div>
        {isSubmitting && nextModule.hasProgressBar && (
          <ProgressBar 
            executionTime={nextModule.executionTime} 
            renderProgressMessage={nextModule.renderProgressMessage} 
          />
        )}
      </div>
    </DndProvider>
  );
};

export default ArticleOutline;

import React from 'react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

/**
 * Floating controls for zoom functionality (desktop only)
 */
export const ZoomControls: React.FC<ZoomControlsProps> = ({ 
  onZoomIn, 
  onZoomOut, 
  onReset 
}) => {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 hidden lg:flex">
      <button 
        onClick={onZoomIn} 
        className="bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-xl"
      >
        +
      </button>
      <button 
        onClick={onZoomOut} 
        className="bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-xl"
      >
        -
      </button>
      <button 
        onClick={onReset} 
        className="bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-xs"
      >
        Reset
      </button>
    </div>
  );
};

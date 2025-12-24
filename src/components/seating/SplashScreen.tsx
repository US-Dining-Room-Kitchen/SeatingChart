import React from 'react';
import type { LayoutOption } from '../../types';

interface SplashScreenProps {
  layoutOptions: LayoutOption[];
  selectedLayout: string;
  onSelectLayout: (layoutFile: string) => void;
  onImportGuests: () => void;
  onStart: () => void;
}

/**
 * Initial splash screen for layout selection and guest import
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  layoutOptions, 
  selectedLayout, 
  onSelectLayout, 
  onImportGuests, 
  onStart 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm space-y-4" 
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">Select Layout</h2>
        <select 
          value={selectedLayout} 
          onChange={e => onSelectLayout(e.target.value)} 
          className="w-full border rounded p-2"
        >
          <option value="">-- Choose Layout --</option>
          {layoutOptions.map(opt => (
            <option key={opt.file} value={opt.file}>{opt.name}</option>
          ))}
        </select>
        <button 
          onClick={onImportGuests} 
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
        >
          Import Guests
        </button>
        <button 
          onClick={onStart} 
          disabled={!selectedLayout} 
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Start
        </button>
      </div>
    </div>
  );
};

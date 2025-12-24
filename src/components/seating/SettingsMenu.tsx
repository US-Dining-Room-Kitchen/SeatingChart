import React, { useState, useEffect, useRef } from 'react';

interface SettingsMenuProps {
  onImportLayout: () => void;
  onImportGuests: () => void;
  onCreateLayout: () => void;
}

/**
 * Dropdown menu for accessing import and layout creation features
 */
export const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
  onImportLayout, 
  onImportGuests, 
  onCreateLayout 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-indigo-600 text-white font-semibold rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Menu
      </button>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onImportLayout(); setIsOpen(false); }} 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
              role="menuitem"
            >
              Import Layout
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onImportGuests(); setIsOpen(false); }} 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
              role="menuitem"
            >
              Import Guests
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onCreateLayout(); setIsOpen(false); }} 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
              role="menuitem"
            >
              Create Layout
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

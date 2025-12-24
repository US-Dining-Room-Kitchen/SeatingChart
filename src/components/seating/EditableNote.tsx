import React, { useState, useEffect, useRef } from 'react';
import type { Guest } from '../../types';
import { PencilIcon } from '../ui/icons/PencilIcon';

interface EditableNoteProps {
  guest: Guest;
  onNotesChange: (guestId: string, notes: string) => void;
}

/**
 * Component for editing guest notes with inline editing functionality
 */
export const EditableNote: React.FC<EditableNoteProps> = ({ 
  guest, 
  onNotesChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(guest.notes || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (note !== guest.notes) {
      onNotesChange(guest.id, note);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setNote(guest.notes || '');
      setIsEditing(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="mt-2 text-sm text-gray-700 w-full relative">
      {isEditing ? (
        <textarea
          ref={textareaRef}
          autoFocus
          value={note}
          onChange={handleTextChange}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="w-full p-1 text-sm bg-white border border-indigo-300 rounded resize-none pr-6"
          placeholder="Add a note..."
          rows={1}
        />
      ) : (
        <div 
          className={`w-full p-1 rounded min-h-[2.5rem] whitespace-pre-wrap select-none ${note ? 'text-gray-700' : 'text-gray-400 italic'}`}
        >
          {note || 'Add a note...'}
        </div>
      )}
      {!isEditing && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className="absolute top-1 right-1 p-1 text-gray-500 hover:text-indigo-600"
          title="Edit notes"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

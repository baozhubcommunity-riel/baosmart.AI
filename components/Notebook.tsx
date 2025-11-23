import React, { useState } from 'react';
import { Note } from '../types';
import { Trash2, Plus, X, BookOpen, StickyNote } from 'lucide-react';

interface NotebookProps {
  notes: Note[];
  onAddNote: (text: string) => void;
  onDeleteNote: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Notebook: React.FC<NotebookProps> = ({ notes, onAddNote, onDeleteNote, isOpen, onClose }) => {
  const [newNoteText, setNewNoteText] = useState('');

  const handleAdd = () => {
    if (newNoteText.trim()) {
      onAddNote(newNoteText.trim());
      setNewNoteText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 border-l border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2 text-slate-700">
          <BookOpen size={20} className="text-indigo-600" />
          <h2 className="font-bold text-lg">Study Notebook</h2>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 custom-scrollbar">
        {notes.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-400 flex flex-col items-center">
            <div className="bg-slate-100 p-3 rounded-full mb-3">
              <StickyNote size={32} className="opacity-30" />
            </div>
            <p className="text-sm font-medium">No notes yet</p>
            <p className="text-xs mt-1 max-w-[200px]">Save highlights from chat or add your own thoughts here.</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group animate-fade-in-up">
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(note.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <button 
                  onClick={() => onDeleteNote(note.id)}
                  className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="relative">
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a note to remember..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-10 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none h-24 outline-none transition-all placeholder:text-slate-400"
          />
          <button
            onClick={handleAdd}
            disabled={!newNoteText.trim()}
            className="absolute bottom-3 right-3 p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors shadow-sm"
            title="Add Note"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notebook;
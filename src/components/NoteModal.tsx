import React, { useState, useEffect } from 'react';
import { Student } from '../types/attendance';
import { X, Check, MessageSquare } from 'lucide-react';

interface NoteModalProps {
  student: Student | null;
  currentNote?: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveNote: (studentId: string, note: string) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  student,
  currentNote = '',
  isOpen,
  onClose,
  onSaveNote,
}) => {
  const [noteText, setNoteText] = useState(currentNote);

  useEffect(() => {
    setNoteText(currentNote || '');
  }, [currentNote, isOpen]);

  if (!isOpen || !student) return null;

  const quickPills = [
    'Doctor appointment note',
    'Parent called - sick with flu',
    'Arrived late - School bus delayed',
    'Family emergency sanctioned',
    'Unexcused - No parent contact',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Attendance Note</h3>
              <p className="text-xs text-slate-500">For {student.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick presets */}
        <div className="mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Quick Presets
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPills.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => setNoteText(pill)}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Enter reason, parent call details, or excuse note..."
          className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        />

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSaveNote(student.id, noteText.trim());
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Save Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};

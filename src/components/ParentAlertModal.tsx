import React, { useState } from 'react';
import { Student } from '../types/attendance';
import { Sparkles, Send, Copy, Check, X, Mail, Phone, AlertCircle, RefreshCw } from 'lucide-react';

interface ParentAlertModalProps {
  student: Student | null;
  isOpen: boolean;
  selectedDate: string;
  classNameTitle: string;
  onClose: () => void;
}

export const ParentAlertModal: React.FC<ParentAlertModalProps> = ({
  student,
  isOpen,
  selectedDate,
  classNameTitle,
  onClose,
}) => {
  const [tone, setTone] = useState<'gentle' | 'formal' | 'urgent'>('gentle');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSubject, setGeneratedSubject] = useState<string>('');
  const [generatedBody, setGeneratedBody] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !student) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/generate-parent-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          parentName: student.parentName,
          date: selectedDate,
          status: 'absent',
          reason: customReason || student.notes || 'Unexcused absence recorded today',
          consecutiveDays: student.consecutiveAbsences || 1,
          tone:
            tone === 'gentle'
              ? 'gentle, caring and supportive'
              : tone === 'formal'
              ? 'official, professional and informative'
              : 'urgent administrative warning for chronic absence',
          schoolName: 'Oakridge Elementary School',
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error generating alert');
      }

      const data = await response.json();
      setGeneratedSubject(data.subject);
      setGeneratedBody(data.body);
    } catch (err: unknown) {
      console.error('Failed to generate parent alert:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to AI server');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const fullText = `Subject: ${generatedSubject}\n\n${generatedBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoLink = `mailto:${student.parentEmail}?subject=${encodeURIComponent(
    generatedSubject || `Absence Notice: ${student.name} (${selectedDate})`
  )}&body=${encodeURIComponent(generatedBody || '')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/60 to-purple-50/60 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                AI Parent Alert Generator
              </h3>
              <p className="text-xs text-slate-500">
                Craft a compassionate, professional absence notice in seconds with Gemini
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Student Recipient Card */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-11 h-11 rounded-full object-cover border border-slate-200"
              />
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  {student.name} <span className="text-xs font-normal text-slate-500">(#{student.rollNo})</span>
                </div>
                <div className="text-xs text-slate-500">
                  {classNameTitle} • {selectedDate}
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="font-semibold text-slate-700 flex items-center gap-1 justify-end">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <span>{student.parentName}</span>
              </div>
              <div className="text-slate-500 flex items-center gap-1 justify-end mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{student.parentPhone}</span>
              </div>
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Communication Tone
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setTone('gentle')}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  tone === 'gentle'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-xs text-slate-800">🌿 Gentle Check-in</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Warm & supportive welfare check</div>
              </button>

              <button
                type="button"
                onClick={() => setTone('formal')}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  tone === 'formal'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-xs text-slate-800">📄 Official Notice</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Standard school attendance policy</div>
              </button>

              <button
                type="button"
                onClick={() => setTone('urgent')}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  tone === 'urgent'
                    ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-xs text-rose-800">🚨 Urgent Follow-up</div>
                <div className="text-[11px] text-slate-500 mt-0.5">For chronic or repeat absence</div>
              </button>
            </div>
          </div>

          {/* Optional context */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Extra Context / Specific Note (Optional)
            </label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g. Missed math exam today, please bring doctor's note on return..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Button to Generate */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Drafting with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{generatedBody ? 'Regenerate Email Draft' : 'Draft Parent Email with Gemini'}</span>
                </>
              )}
            </button>

            {generatedBody && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Ready to review & send
              </span>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedBody && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={generatedSubject}
                  onChange={(e) => setGeneratedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Message Body
                </label>
                <textarea
                  rows={7}
                  value={generatedBody}
                  onChange={(e) => setGeneratedBody(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-sans leading-relaxed text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={mailtoLink}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open in Email App</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

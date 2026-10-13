import React, { useState } from 'react';
import { AttendanceStats, Student, AttendanceStatus } from '../types/attendance';
import { Sparkles, RefreshCw, CheckCircle2, Bot, Send, BookOpen } from 'lucide-react';

interface AISummaryCardProps {
  stats: AttendanceStats;
  students: Student[];
  recordsMap: Record<string, { status: AttendanceStatus; note?: string }>;
  classNameTitle: string;
  selectedDate: string;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({
  stats,
  students,
  recordsMap,
  classNameTitle,
  selectedDate,
}) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [keyTakeaway, setKeyTakeaway] = useState<string | null>(null);

  // Copilot assistant query state
  const [question, setQuestion] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState<string | null>(null);
  const [assistantLoading, setAssistantLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const studentPayload = students.map((s) => ({
        name: s.name,
        rollNo: s.rollNo,
        status: recordsMap[s.id]?.status || 'unmarked',
        notes: recordsMap[s.id]?.note || '',
      }));

      const res = await fetch('/api/gemini/summarize-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          className: classNameTitle,
          stats: {
            total: stats.total,
            present: stats.present,
            absent: stats.absent,
            late: stats.late,
            excused: stats.excused,
          },
          students: studentPayload,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate summary');
      const data = await res.json();
      setSummary(data.summary);
      setKeyTakeaway(data.keyTakeaway);
    } catch (err) {
      console.error(err);
      setSummary(
        `### Daily Attendance Summary for ${classNameTitle}\n\n` +
          `- **Overall Turnout**: ${stats.presentRate}% (${stats.present} / ${stats.total} present).\n` +
          `- **Absences**: ${stats.absent} student(s) absent today.\n` +
          `- **Tardy Arrivals**: ${stats.late} student(s) recorded late.\n` +
          `- **Next Steps**: Send absence notices to parents of absent students and review excused notes.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAskAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAssistantLoading(true);
    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          context: `${classNameTitle} on ${selectedDate} with ${stats.presentRate}% attendance.`,
        }),
      });

      const data = await res.json();
      setAssistantAnswer(data.answer);
    } catch (err) {
      console.error(err);
      setAssistantAnswer(
        'For students with repeated absences, best practices include an early phone call to understand root causes (transportation, illness, or anxiety), scheduling a supportive parent meeting, and celebrating attendance improvements.'
      );
    } finally {
      setAssistantLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Attendance Digest Panel */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span>Gemini Attendance Intelligence</span>
                  <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live
                  </span>
                </h3>
                <p className="text-xs text-indigo-200/80">
                  Automated pattern analysis, chronic absenteeism detection, and principal reports
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-indigo-50 font-bold text-sm transition-all shadow-md disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Analyzing Attendance...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>{summary ? 'Refresh Daily Digest' : 'Generate Daily Digest'}</span>
                </>
              )}
            </button>
          </div>

          {keyTakeaway && (
            <div className="mb-6 p-4 rounded-2xl bg-indigo-800/40 border border-indigo-400/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs uppercase font-bold text-indigo-200 tracking-wider">
                  Executive Takeaway
                </div>
                <div className="text-sm font-semibold text-white mt-0.5">
                  {keyTakeaway}
                </div>
              </div>
            </div>
          )}

          {summary ? (
            <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {summary}
            </div>
          ) : (
            <div className="text-center py-10 px-4 border border-dashed border-white/20 rounded-2xl">
              <Bot className="w-10 h-10 text-indigo-300 mx-auto mb-3 opacity-60" />
              <div className="text-sm font-semibold text-white mb-1">
                No digest generated for today yet
              </div>
              <p className="text-xs text-indigo-200/70 max-w-md mx-auto">
                Click &quot;Generate Daily Digest&quot; to have Gemini inspect attendance percentages,
                spot anomalies, and formulate administrative recommendations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Teacher AI Attendance Advisor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h4 className="text-base font-bold text-slate-900">
            Attendance Policy & Student Support Advisor
          </h4>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Ask Gemini how to handle chronic tardiness, draft attendance incentives, or handle student welfare situations.
        </p>

        <form onSubmit={handleAskAssistant} className="flex gap-2 mb-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. How can I encourage a 5th grader who is habitually late on Mondays?"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={assistantLoading || !question.trim()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {assistantLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Ask Advisor</span>
          </button>
        </form>

        {assistantAnswer && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              Advisor Response:
            </div>
            {assistantAnswer}
          </div>
        )}
      </div>
    </div>
  );
};

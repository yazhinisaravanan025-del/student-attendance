import React, { useState } from 'react';
import { BookOpen, Copy, Check, Sparkles, Layers, MousePointer, Database, Code2 } from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sections = [
    {
      title: 'Feature 1: Rapid Roll Call with Big Tactile Buttons',
      icon: <MousePointer className="w-5 h-5 text-emerald-600" />,
      rationale:
        'Teachers typically have less than 90 seconds to take morning attendance amidst classroom bustle. Small dropdowns or tiny checkboxes create mis-clicks and cognitive fatigue. By utilizing prominent (min-h-12) green "Present" and red "Absent" buttons with instant visual feedback, teachers can complete roll call with rapid muscle memory on laptops or iPads.',
      stateGuide:
        'Local state uses an immutable map `Record<string, AttendanceRecord>` keyed by student ID. Marking a student creates or updates a record and persists to `localStorage.setItem("attendance_records", ...)`. A "Mark All Present" batch action updates all current class students in O(N) time with a single re-render.',
      codeSnippet: `// 1. Big Tactile Button Component (Tailwind + React/JS)
<div className="grid grid-cols-2 gap-2">
  {/* Big Green PRESENT Button */}
  <button
    type="button"
    onClick={() => handleStatusChange(student.id, 'present')}
    className={\`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer \${
      status === 'present'
        ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-md ring-2 ring-emerald-600'
        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
    }\`}
  >
    <Check className="w-5 h-5 stroke-[2.5]" />
    <span>Present</span>
  </button>

  {/* Big Red ABSENT Button */}
  <button
    type="button"
    onClick={() => handleStatusChange(student.id, 'absent')}
    className={\`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer \${
      status === 'absent'
        ? 'bg-rose-600 text-white shadow-rose-200 shadow-md ring-2 ring-rose-600'
        : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
    }\`}
  >
    <X className="w-5 h-5 stroke-[2.5]" />
    <span>Absent</span>
  </button>
</div>`,
    },
    {
      title: 'Feature 2: Real-Time Attendance Metrics & Progress Bar',
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
      rationale:
        'Administrators and teachers need instant awareness of class headcount and district compliance thresholds (typically 95% target). Color-coded metrics (Emerald for >=95%, Amber for 85-94%, Rose for <85%) allow visual triage without mental arithmetic.',
      stateGuide:
        'Derived state: Computed reactively from the students array and the attendance map: `presentCount = students.filter(s => recordsMap[s.id]?.status === "present").length`, `presentRate = Math.round((presentCount / total) * 100)`. Avoid storing duplicate calculated values in state to prevent synchronization bugs.',
      codeSnippet: `// 2. Real-time Derived State Calculation
const attendanceStats = useMemo(() => {
  const total = classStudents.length;
  let present = 0, absent = 0, late = 0, excused = 0;

  classStudents.forEach((student) => {
    const status = recordsMap[student.id]?.status;
    if (status === 'present') present++;
    else if (status === 'absent') absent++;
    else if (status === 'late') late++;
    else if (status === 'excused') excused++;
  });

  const presentRate = total > 0 ? Math.round((present / total) * 100) : 0;
  return { total, present, absent, late, excused, presentRate };
}, [classStudents, recordsMap]);`,
    },
    {
      title: 'Feature 3: Gemini AI Automated Parent Alert Generator',
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      rationale:
        'Teachers dread writing individualized absence emails, often delaying notifications until the end of the day. With Gemini AI, a teacher can select an absent child, choose a tone ("Gentle Check-in", "Official Policy Notice", or "Urgent Truancy"), and click once to generate a warm, customized email with the guardian\'s name, date, and doctor note instructions. Pre-filled "mailto:" links allow one-click dispatch.',
      stateGuide:
        'Server-side Express proxy handles `@google/genai` calls with `gemini-3.8-flash`. Prompt incorporates student record, parent email/phone, consecutive missed days, and chosen tone. Client simply posts JSON and sets modal state.',
      codeSnippet: `// 3. Server-side Gemini API Integration (server.ts)
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

app.post('/api/gemini/generate-parent-alert', async (req, res) => {
  const { studentName, parentName, date, status, consecutiveDays, tone } = req.body;

  const prompt = \`
You are a school administrator drafting an attendance notice to a parent.
Student: \${studentName}, Parent: \${parentName}, Date: \${date}, Status: \${status}.
Consecutive missed days: \${consecutiveDays}.
Tone: \${tone}.

Return JSON: {"subject": string, "body": string} with a warm greeting, absence notice,
instructions for sick note/doctor note, and polite closing.\`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  res.json(JSON.parse(response.text));
});`,
    },
    {
      title: 'Feature 4: Daily AI Attendance Digest & Chronic Absenteeism Watch',
      icon: <Database className="w-5 h-5 text-blue-600" />,
      rationale:
        'Principals and administrative teams need daily roll summaries to identify school-wide trends (e.g. flu outbreaks, bus delays, unexcused spikes). Gemini generates an executive digest with key observations and statutory action items in under 2 seconds.',
      stateGuide:
        'Attendance records are aggregated and passed to `/api/gemini/summarize-attendance`. The resulting markdown summary is cached in component state or localStorage.',
      codeSnippet: `// 4. Client Request to Summarize Class Attendance
const summarizeAttendance = async () => {
  const response = await fetch('/api/gemini/summarize-attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: selectedDate,
      className: currentClass.name,
      stats: attendanceStats,
      students: classStudents.map(s => ({
        name: s.name,
        status: recordsMap[s.id]?.status || 'unmarked',
        notes: recordsMap[s.id]?.note || ''
      }))
    })
  });
  const data = await response.json();
  setAiSummary(data.summary);
};`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Developer &amp; UI/UX Architecture Guide
            </h3>
            <p className="text-xs text-slate-500">
              Detailed breakdown of UI/UX design rationale, frontend implementation, and local state management
            </p>
          </div>
        </div>
      </div>

      {sections.map((sec, idx) => (
        <div key={sec.title} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              {sec.icon}
              <h4 className="font-bold text-sm sm:text-base text-slate-900">{sec.title}</h4>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              Block {idx + 1}
            </span>
          </div>

          <div className="p-6 space-y-4 text-sm">
            {/* UI/UX Rationale */}
            <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1 flex items-center gap-1.5">
                <MousePointer className="w-3.5 h-3.5" />
                <span>UI/UX Rationale (Why this works for teachers)</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">{sec.rationale}</p>
            </div>

            {/* State Management */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>State &amp; Mock Data Strategy</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">{sec.stateGuide}</p>
            </div>

            {/* Code Block */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" /> Code Implementation
                </span>
                <button
                  type="button"
                  onClick={() => copyCode(sec.codeSnippet, idx)}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === idx ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                <pre>{sec.codeSnippet}</pre>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

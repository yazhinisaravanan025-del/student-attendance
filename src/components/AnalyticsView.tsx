import React from 'react';
import { Student, AttendanceStats } from '../types/attendance';
import { AlertTriangle, Download, Award, ShieldAlert, Mail } from 'lucide-react';

interface AnalyticsViewProps {
  stats: AttendanceStats;
  students: Student[];
  classNameTitle: string;
  selectedDate: string;
  onOpenAlert: (student: Student) => void;
  onOpenProfile: (student: Student) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats,
  students,
  classNameTitle,
  selectedDate,
  onOpenAlert,
  onOpenProfile,
}) => {
  // Chronic absenteeism risk list (<85% or consecutive >= 2)
  const atRiskStudents = students.filter(
    (s) => s.overallAttendanceRate < 85 || s.consecutiveAbsences >= 2
  );

  // Perfect attendance honor list
  const perfectAttendanceStudents = students.filter(
    (s) => s.overallAttendanceRate >= 98 && s.consecutiveAbsences === 0
  );

  const handleExportCSV = () => {
    const headers = ['Roll No', 'Student Name', 'Parent Name', 'Parent Email', 'Parent Phone', 'Attendance Rate %', 'Consecutive Absences'];
    const rows = students.map((s) => [
      s.rollNo,
      `"${s.name}"`,
      `"${s.parentName}"`,
      s.parentEmail,
      s.parentPhone,
      s.overallAttendanceRate,
      s.consecutiveAbsences,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${classNameTitle.replace(/\s+/g, '_')}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Attendance Analytics & Truancy Watch</h3>
          <p className="text-xs text-slate-500">
            Identify chronic absenteeism early, celebrate stellar streaks, and export compliance data.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Roster CSV</span>
        </button>
      </div>

      {/* 2-Column insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* At-Risk / Chronic Absenteeism Monitor */}
        <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-sm">Chronic Absenteeism Watchlist</h4>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {atRiskStudents.length} Students Flagged
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Students with under 85% attendance or 2+ consecutive missed school days requiring intervention.
          </p>

          <div className="space-y-3">
            {atRiskStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No students currently flagged for chronic absenteeism! 🎉
              </div>
            ) : (
              atRiskStudents.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={s.avatarUrl}
                      alt={s.name}
                      className="w-10 h-10 rounded-full object-cover border border-rose-200"
                    />
                    <div>
                      <button
                        type="button"
                        onClick={() => onOpenProfile(s)}
                        className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer text-left"
                      >
                        {s.name}
                      </button>
                      <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1.5">
                        <span>{s.overallAttendanceRate}% rate</span>
                        <span>•</span>
                        <span>{s.consecutiveAbsences} days consecutive</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenAlert(s)}
                    className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Mail className="w-3 h-3" />
                    <span>AI Alert</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* High Attendance Honor List */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <Award className="w-5 h-5" />
              <h4 className="font-bold text-sm">Attendance Champions (98%+)</h4>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {perfectAttendanceStudents.length} Students
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Recognize and encourage students demonstrating stellar punctuality and consistency.
          </p>

          <div className="space-y-3">
            {perfectAttendanceStudents.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={s.avatarUrl}
                    alt={s.name}
                    className="w-10 h-10 rounded-full object-cover border border-emerald-200"
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => onOpenProfile(s)}
                      className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer text-left"
                    >
                      {s.name}
                    </button>
                    <div className="text-[11px] text-emerald-700 font-semibold">
                      {s.overallAttendanceRate}% Attendance Streak
                    </div>
                  </div>
                </div>

                <span className="text-lg">⭐</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statutory Attendance Benchmarks */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-indigo-600" />
          <span>School District Attendance Threshold Guidelines</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="font-bold text-emerald-700">95% – 100%: Satisfactory</div>
            <p className="text-slate-500 mt-1">Student has maximum opportunity for academic progress.</p>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="font-bold text-amber-700">90% – 94%: At-Risk / Watch</div>
            <p className="text-slate-500 mt-1">Triggers early notification to guardians.</p>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="font-bold text-rose-700">&lt;90%: Chronic Absence Warning</div>
            <p className="text-slate-500 mt-1">Formal truancy officer review and student attendance contract.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

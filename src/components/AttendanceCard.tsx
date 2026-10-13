import React from 'react';
import { Student, AttendanceStatus } from '../types/attendance';
import { Check, X, Clock, ShieldCheck, Mail, MessageSquare, AlertTriangle, User } from 'lucide-react';

interface AttendanceCardProps {
  student: Student;
  status: AttendanceStatus;
  note?: string;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onOpenNotes: (student: Student) => void;
  onOpenAlert: (student: Student) => void;
  onOpenProfile: (student: Student) => void;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  student,
  status,
  note,
  onStatusChange,
  onOpenNotes,
  onOpenAlert,
  onOpenProfile,
}) => {
  const isPresent = status === 'present';
  const isAbsent = status === 'absent';
  const isLate = status === 'late';
  const isExcused = status === 'excused';

  // Highlight card border based on active status
  const cardBorderColor = isAbsent
    ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
    : isLate
    ? 'border-amber-300 ring-2 ring-amber-100 bg-amber-50/20'
    : isExcused
    ? 'border-sky-300 ring-2 ring-sky-100 bg-sky-50/20'
    : isPresent
    ? 'border-emerald-300 bg-white'
    : 'border-slate-200 bg-white';

  return (
    <div
      className={`rounded-2xl border p-4.5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${cardBorderColor}`}
    >
      {/* Student Top Row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                }}
              />
              <span className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                #{student.rollNo}
              </span>
            </div>

            <div>
              <button
                type="button"
                onClick={() => onOpenProfile(student)}
                className="text-left font-bold text-slate-900 hover:text-indigo-600 transition-colors text-base flex items-center gap-1.5 group"
              >
                <span>{student.name}</span>
                <User className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
              </button>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>Parent: {student.parentName}</span>
                <span>•</span>
                <span className="font-medium text-slate-600">{student.overallAttendanceRate}% avg</span>
              </div>
            </div>
          </div>

          {/* Consecutive absence or warning tag */}
          {student.consecutiveAbsences >= 2 && (
            <span
              title={`${student.consecutiveAbsences} days consecutive absence recorded`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 animate-pulse"
            >
              <AlertTriangle className="w-3 h-3" />
              {student.consecutiveAbsences}d absent
            </span>
          )}
        </div>

        {/* Existing Note or remarks banner */}
        {note && (
          <div className="mb-3 text-xs bg-slate-100 text-slate-700 p-2 rounded-lg flex items-start gap-1.5 border border-slate-200">
            <MessageSquare className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
            <span className="italic line-clamp-1">{note}</span>
          </div>
        )}
      </div>

      {/* Big Action Buttons - Sized for rapid teacher finger taps */}
      <div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* Big Green PRESENT Button */}
          <button
            type="button"
            onClick={() => onStatusChange(student.id, 'present')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm transition-all duration-150 cursor-pointer shadow-xs active:scale-98 ${
              isPresent
                ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-md ring-2 ring-emerald-600 ring-offset-1'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Check className={`w-5 h-5 ${isPresent ? 'stroke-[3]' : 'stroke-2'}`} />
            <span>Present</span>
          </button>

          {/* Big Red ABSENT Button */}
          <button
            type="button"
            onClick={() => onStatusChange(student.id, 'absent')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm transition-all duration-150 cursor-pointer shadow-xs active:scale-98 ${
              isAbsent
                ? 'bg-rose-600 text-white shadow-rose-200 shadow-md ring-2 ring-rose-600 ring-offset-1'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <X className={`w-5 h-5 ${isAbsent ? 'stroke-[3]' : 'stroke-2'}`} />
            <span>Absent</span>
          </button>
        </div>

        {/* Secondary options: Late & Excused & Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          {/* Late button */}
          <button
            type="button"
            onClick={() => onStatusChange(student.id, 'late')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isLate
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Late</span>
          </button>

          {/* Excused button */}
          <button
            type="button"
            onClick={() => onStatusChange(student.id, 'excused')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isExcused
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Excused</span>
          </button>
        </div>

        {/* Footer Quick Links: Add Note & AI Alert */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={() => onOpenNotes(student)}
            className="hover:text-indigo-600 font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{note ? 'Edit Note' : '+ Add Note'}</span>
          </button>

          {(isAbsent || isLate) && (
            <button
              type="button"
              onClick={() => onOpenAlert(student)}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>AI Alert Parent</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

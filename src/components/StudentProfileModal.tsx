import React from 'react';
import { Student, AttendanceRecord } from '../types/attendance';
import { X, Phone, Mail, Calendar, CheckCircle2, XCircle, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

interface StudentProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  historyRecords: AttendanceRecord[];
  onClose: () => void;
  onOpenAlert: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  isOpen,
  historyRecords,
  onClose,
  onOpenAlert,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Top banner */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 relative rounded-t-3xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
                <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  #{student.rollNo}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Enrolled Student</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Overall Attendance
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {student.overallAttendanceRate}%
              </div>
              <p className="text-[11px] text-emerald-600 mt-0.5">Annual cumulative average</p>
            </div>

            <div className={`p-4 rounded-2xl border ${
              student.consecutiveAbsences > 0
                ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="text-xs font-bold uppercase tracking-wider">
                Consecutive Absences
              </div>
              <div className="text-2xl font-black mt-1">
                {student.consecutiveAbsences} days
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                {student.consecutiveAbsences >= 2 ? '⚠️ High risk of chronic absenteeism' : 'Within normal limits'}
              </p>
            </div>
          </div>

          {/* Guardian & Emergency Contact */}
          <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Primary Guardian & Contact
            </h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs">Parent/Guardian:</span>
                <span className="font-bold text-slate-800">{student.parentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs">Phone:</span>
                <a
                  href={`tel:${student.parentPhone}`}
                  className="font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{student.parentPhone}</span>
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs">Email:</span>
                <a
                  href={`mailto:${student.parentEmail}`}
                  className="font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{student.parentEmail}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Student Profile Notes */}
          {student.notes && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
              <span className="font-bold">Teacher Note:</span> {student.notes}
            </div>
          )}

          {/* Recent Attendance Logs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Recent Recorded Days</span>
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {historyRecords.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No previous logs for this session.</div>
              ) : (
                historyRecords.slice(0, 5).map((rec, idx) => (
                  <div
                    key={`${rec.date}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="font-semibold text-slate-700">{rec.date}</span>
                    <div className="flex items-center gap-1.5">
                      {rec.status === 'present' && (
                        <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Present
                        </span>
                      )}
                      {rec.status === 'absent' && (
                        <span className="text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Absent
                        </span>
                      )}
                      {rec.status === 'late' && (
                        <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Late
                        </span>
                      )}
                      {rec.status === 'excused' && (
                        <span className="text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Excused
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action to Alert Parent */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAlert(student);
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Draft AI Absence Alert for {student.parentName}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

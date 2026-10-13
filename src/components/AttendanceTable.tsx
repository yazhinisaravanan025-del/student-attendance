import React from 'react';
import { Student, AttendanceStatus } from '../types/attendance';
import { Check, X, Clock, ShieldCheck, Mail, MessageSquare } from 'lucide-react';

interface AttendanceTableProps {
  students: Student[];
  recordsMap: Record<string, { status: AttendanceStatus; note?: string }>;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onOpenNotes: (student: Student) => void;
  onOpenAlert: (student: Student) => void;
  onOpenProfile: (student: Student) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  students,
  recordsMap,
  onStatusChange,
  onOpenNotes,
  onOpenAlert,
  onOpenProfile,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-16">Roll</th>
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-4">Parent Contact</th>
              <th className="py-3.5 px-4 text-center">Status Action</th>
              <th className="py-3.5 px-4">Notes</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {students.map((student) => {
              const record = recordsMap[student.id];
              const status = record?.status || 'unmarked';
              const note = record?.note;

              return (
                <tr
                  key={student.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    status === 'absent' ? 'bg-rose-50/30' : status === 'late' ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-500">
                    #{student.rollNo}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <button
                          type="button"
                          onClick={() => onOpenProfile(student)}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer text-left"
                        >
                          {student.name}
                        </button>
                        <div className="text-xs text-slate-400">
                          {student.overallAttendanceRate}% term rate
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-xs font-medium text-slate-700">{student.parentName}</div>
                    <div className="text-xs text-slate-400">{student.parentPhone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onStatusChange(student.id, 'present')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          status === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onStatusChange(student.id, 'absent')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          status === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onStatusChange(student.id, 'late')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                          status === 'late'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Late</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onStatusChange(student.id, 'excused')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                          status === 'excused'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Excused</span>
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {note ? (
                      <span className="text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block max-w-[180px] truncate">
                        {note}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No note</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenNotes(student)}
                        title="Add/Edit Note"
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      {(status === 'absent' || status === 'late') && (
                        <button
                          type="button"
                          onClick={() => onOpenAlert(student)}
                          title="Generate AI Parent Notice"
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

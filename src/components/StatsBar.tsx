import React from 'react';
import { AttendanceStats } from '../types/attendance';
import { Users, CheckCircle2, XCircle, Clock, ShieldAlert } from 'lucide-react';

interface StatsBarProps {
  stats: AttendanceStats;
  classNameTitle: string;
  selectedDate: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, classNameTitle, selectedDate }) => {
  const targetRate = 95;
  const isTargetMet = stats.presentRate >= targetRate;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>{classNameTitle}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selectedDate}
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time daily roll call metrics and attendance rate
          </p>
        </div>

        {/* Attendance Rate Pill */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Turnout Rate
            </div>
            <div className={`text-2xl font-black ${isTargetMet ? 'text-emerald-600' : 'text-amber-600'}`}>
              {stats.presentRate}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-slate-200 shadow-xs">
            <span className="text-lg">
              {stats.presentRate >= 95 ? '🎯' : stats.presentRate >= 80 ? '📈' : '⚠️'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
          style={{ width: `${stats.presentRate}%` }}
        />
      </div>

      {/* 5 Big Accessible Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{stats.total}</div>
          <span className="text-xs text-slate-500">Enrolled students</span>
        </div>

        {/* Present (Big Green) */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{stats.present}</div>
          <span className="text-xs font-medium text-emerald-600">{stats.presentRate}% in seats</span>
        </div>

        {/* Absent (Big Red) */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Absent</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700">{stats.absent}</div>
          <span className="text-xs font-medium text-rose-600">Requires follow-up</span>
        </div>

        {/* Late (Amber) */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Late (Tardy)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">{stats.late}</div>
          <span className="text-xs font-medium text-amber-600">Arrived late</span>
        </div>

        {/* Excused (Blue) */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-sky-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Excused</span>
            <ShieldAlert className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-sky-700">{stats.excused}</div>
          <span className="text-xs font-medium text-sky-600">Medical / Doctor note</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { Classroom, Student, AttendanceRecord, AttendanceStatus, AttendanceStats } from './types/attendance';
import { INITIAL_CLASSES, INITIAL_STUDENTS, getInitialAttendanceRecords } from './data/mockData';
import { StatsBar } from './components/StatsBar';
import { AttendanceCard } from './components/AttendanceCard';
import { AttendanceTable } from './components/AttendanceTable';
import { ParentAlertModal } from './components/ParentAlertModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { NoteModal } from './components/NoteModal';
import { AddStudentModal } from './components/AddStudentModal';
import { AISummaryCard } from './components/AISummaryCard';
import { AnalyticsView } from './components/AnalyticsView';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  BarChart3,
  ClipboardList,
  BookOpen,
  UserPlus,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';

export default function App() {
  // Format today's date YYYY-MM-DD
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // State initialization with localStorage persistence
  const [classes] = useState<Classroom[]>(INITIAL_CLASSES);
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return localStorage.getItem('cp_selected_class') || INITIAL_CLASSES[0].id;
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return localStorage.getItem('cp_selected_date') || getTodayDateString();
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('cp_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('cp_records');
    return saved ? JSON.parse(saved) : getInitialAttendanceRecords(getTodayDateString());
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'roll' | 'analytics' | 'ai' | 'guide'>('roll');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all');

  // Modal states
  const [selectedStudentForAlert, setSelectedStudentForAlert] = useState<Student | null>(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<Student | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cp_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('cp_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('cp_selected_class', selectedClassId);
  }, [selectedClassId]);

  useEffect(() => {
    localStorage.setItem('cp_selected_date', selectedDate);
  }, [selectedDate]);

  // Active classroom
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Students in selected classroom
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Map of studentId -> status and note for the current date
  const recordsMap = useMemo(() => {
    const map: Record<string, { status: AttendanceStatus; note?: string }> = {};
    attendanceRecords
      .filter((r) => r.date === selectedDate)
      .forEach((r) => {
        map[r.studentId] = { status: r.status, note: r.note };
      });
    return map;
  }, [attendanceRecords, selectedDate]);

  // Attendance stats for current class & date
  const stats: AttendanceStats = useMemo(() => {
    const total = classStudents.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let unmarked = 0;

    classStudents.forEach((st) => {
      const rec = recordsMap[st.id];
      const status = rec?.status || 'unmarked';
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
      else unmarked++;
    });

    const presentRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      late,
      excused,
      unmarked,
      presentRate,
    };
  }, [classStudents, recordsMap]);

  // Update a student's attendance status
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) => {
      const existingIndex = prev.findIndex(
        (r) => r.studentId === studentId && r.date === selectedDate
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            studentId,
            date: selectedDate,
            status,
            updatedAt: new Date().toISOString(),
          },
        ];
      }
    });

    // Update consecutive absences tracker for student
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          if (status === 'absent') {
            return { ...s, consecutiveAbsences: s.consecutiveAbsences + 1 };
          } else if (status === 'present') {
            return { ...s, consecutiveAbsences: 0 };
          }
        }
        return s;
      })
    );
  };

  // Mark all enrolled students in this classroom as Present
  const handleMarkAllPresent = () => {
    setAttendanceRecords((prev) => {
      // Remove any existing records for this class and date
      const otherRecords = prev.filter(
        (r) =>
          !(
            r.date === selectedDate &&
            classStudents.some((s) => s.id === r.studentId)
          )
      );

      // Create new present records for every student in this class
      const newClassRecords: AttendanceRecord[] = classStudents.map((s) => ({
        studentId: s.id,
        date: selectedDate,
        status: 'present',
        note: recordsMap[s.id]?.note || '',
        updatedAt: new Date().toISOString(),
      }));

      return [...otherRecords, ...newClassRecords];
    });

    // Reset consecutive absences for all marked present
    setStudents((prev) =>
      prev.map((s) => (s.classId === selectedClassId ? { ...s, consecutiveAbsences: 0 } : s))
    );
  };

  // Save student note
  const handleSaveNote = (studentId: string, note: string) => {
    setAttendanceRecords((prev) => {
      const existingIndex = prev.findIndex(
        (r) => r.studentId === studentId && r.date === selectedDate
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          note,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            studentId,
            date: selectedDate,
            status: 'present',
            note,
            updatedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  // Add a new student
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [...prev, newStudent]);
  };

  // Reset to default mock data
  const handleResetData = () => {
    if (window.confirm('Reset all attendance data and student rosters to default sample data?')) {
      const today = getTodayDateString();
      setStudents(INITIAL_STUDENTS);
      setAttendanceRecords(getInitialAttendanceRecords(today));
      setSelectedDate(today);
      localStorage.removeItem('cp_students');
      localStorage.removeItem('cp_records');
    }
  };

  // Date navigation helpers
  const changeDateByDays = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Filtered students for display
  const filteredStudents = useMemo(() => {
    return classStudents.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.includes(searchQuery);

      const studentStatus = recordsMap[student.id]?.status || 'unmarked';
      const matchesStatus =
        statusFilter === 'all' ? true : studentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [classStudents, searchQuery, statusFilter, recordsMap]);

  // History for student profile modal
  const studentHistory = useMemo(() => {
    if (!selectedStudentForProfile) return [];
    return attendanceRecords.filter((r) => r.studentId === selectedStudentForProfile.id);
  }, [attendanceRecords, selectedStudentForProfile]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Logo & School Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
                  ClassPulse
                </h1>
                <p className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                  <span>Oakridge Elementary</span>
                  <span>•</span>
                  <span className="text-indigo-600 font-bold">Attendance System</span>
                </p>
              </div>
            </div>

            {/* Quick date & class selector */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Classroom selector */}
              <div className="relative">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-bold rounded-xl px-3 py-2 sm:py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Controls */}
              <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => changeDateByDays(-1)}
                  title="Previous Day"
                  className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1 px-2 text-xs sm:text-sm font-bold text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent border-none text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => changeDateByDays(1)}
                  title="Next Day"
                  className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Reset to sample data */}
              <button
                type="button"
                onClick={handleResetData}
                title="Reset to default mock data"
                className="hidden lg:flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-t border-slate-100 overflow-x-auto no-scrollbar">
            <div className="flex space-x-1 sm:space-x-2 py-2">
              <button
                type="button"
                onClick={() => setActiveTab('roll')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'roll'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Daily Roll Call</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics &amp; Truancy</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'ai'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Gemini Intelligence</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'guide'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Code &amp; UX Guide</span>
              </button>
            </div>

            {/* Quick Actions for Roll Call */}
            {activeTab === 'roll' && (
              <div className="flex items-center gap-2 py-2">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark All Present</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Student</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Real-time stats bar */}
        <StatsBar
          stats={stats}
          classNameTitle={currentClass.name}
          selectedDate={selectedDate}
        />

        {/* Tab 1: Roll Call View */}
        {activeTab === 'roll' && (
          <div className="space-y-5">
            {/* Controls Bar: Search, Status filter pills, View mode toggle */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student name or roll #..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({classStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('present')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === 'present'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Present ({stats.present})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('absent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === 'absent'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  Absent ({stats.absent})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('late')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === 'late'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Late ({stats.late})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('excused')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === 'excused'
                      ? 'bg-sky-600 text-white'
                      : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                  }`}
                >
                  Excused ({stats.excused})
                </button>
              </div>

              {/* View Switcher (Cards vs Table) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  title="Card View (Large touch buttons)"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white text-indigo-600 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  title="Compact Table View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-indigo-600 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Students Grid / Table */}
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h4 className="font-bold text-slate-800 text-base">No students matched the filter</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Try clearing your search term or switching the status filter to &quot;All&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => {
                  const record = recordsMap[student.id];
                  const status = record?.status || 'unmarked';
                  const note = record?.note;

                  return (
                    <AttendanceCard
                      key={student.id}
                      student={student}
                      status={status}
                      note={note}
                      onStatusChange={handleStatusChange}
                      onOpenNotes={(s) => setSelectedStudentForNote(s)}
                      onOpenAlert={(s) => setSelectedStudentForAlert(s)}
                      onOpenProfile={(s) => setSelectedStudentForProfile(s)}
                    />
                  );
                })}
              </div>
            ) : (
              <AttendanceTable
                students={filteredStudents}
                recordsMap={recordsMap}
                onStatusChange={handleStatusChange}
                onOpenNotes={(s) => setSelectedStudentForNote(s)}
                onOpenAlert={(s) => setSelectedStudentForAlert(s)}
                onOpenProfile={(s) => setSelectedStudentForProfile(s)}
              />
            )}
          </div>
        )}

        {/* Tab 2: Analytics & Truancy Watch */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            stats={stats}
            students={classStudents}
            classNameTitle={currentClass.name}
            selectedDate={selectedDate}
            onOpenAlert={(s) => setSelectedStudentForAlert(s)}
            onOpenProfile={(s) => setSelectedStudentForProfile(s)}
          />
        )}

        {/* Tab 3: Gemini Intelligence & Parent Alerts */}
        {activeTab === 'ai' && (
          <AISummaryCard
            stats={stats}
            students={classStudents}
            recordsMap={recordsMap}
            classNameTitle={currentClass.name}
            selectedDate={selectedDate}
          />
        )}

        {/* Tab 4: Code & UX Architecture Guide */}
        {activeTab === 'guide' && <ArchitectureGuide />}
      </main>

      {/* Modals */}
      <ParentAlertModal
        student={selectedStudentForAlert}
        isOpen={Boolean(selectedStudentForAlert)}
        selectedDate={selectedDate}
        classNameTitle={currentClass.name}
        onClose={() => setSelectedStudentForAlert(null)}
      />

      <StudentProfileModal
        student={selectedStudentForProfile}
        isOpen={Boolean(selectedStudentForProfile)}
        historyRecords={studentHistory}
        onClose={() => setSelectedStudentForProfile(null)}
        onOpenAlert={(s) => {
          setSelectedStudentForProfile(null);
          setSelectedStudentForAlert(s);
        }}
      />

      <NoteModal
        student={selectedStudentForNote}
        currentNote={selectedStudentForNote ? recordsMap[selectedStudentForNote.id]?.note : ''}
        isOpen={Boolean(selectedStudentForNote)}
        onClose={() => setSelectedStudentForNote(null)}
        onSaveNote={handleSaveNote}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        classId={selectedClassId}
        onClose={() => setIsAddStudentOpen(false)}
        onAddStudent={handleAddStudent}
      />
    </div>
  );
}

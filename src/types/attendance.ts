export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'unmarked';

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  classId: string;
  avatarUrl: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  consecutiveAbsences: number;
  overallAttendanceRate: number; // percentage, e.g. 92
  notes?: string;
}

export interface AttendanceRecord {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
  updatedAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  grade: string;
  roomNumber: string;
  teacherName: string;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  unmarked: number;
  presentRate: number;
}

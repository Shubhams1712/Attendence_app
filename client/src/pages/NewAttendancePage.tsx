import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import * as services from '@/lib/services';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { getTodayDateString } from '@/lib/utils';
import { BookOpen, UserCheck, Hash, MapPin, Calendar, Play } from 'lucide-react';
import type { Subject, Faculty } from '@/types';

export function NewAttendancePage() {
  const navigate = useNavigate();
  const { showToast, addSubject, addFaculty } = useApp();
  const { classData } = useAuth();
  const [lectureCount, setLectureCount] = useState(1);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [date, setDate] = useState(getTodayDateString());
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [facultyId, setFacultyId] = useState<string | null>(null);
  const [lectureNumber, setLectureNumber] = useState(1);
  const [classroom, setClassroom] = useState('');
  const [searchSubject, setSearchSubject] = useState('');

  useEffect(() => {
    if (classData?.id) loadData();
  }, [classData?.id]);

  const loadData = async () => {
    if (!classData?.id) return;
    try {
      const [subs, facs, nextLN] = await Promise.all([
        services.getSubjects(classData.id),
        services.getFaculties(classData.id),
        services.getNextLectureNumber(classData.id),
      ]);
      setSubjects(subs);
      setFaculty(facs);
      setLectureNumber(nextLN);
    } catch (e) {
      console.error('Failed to load data:', e);
      showToast('Failed to load data', 'error');
    }
  };

  const filteredSubjects = subjects.filter(s =>
    (s.name || '').toLowerCase().includes(searchSubject.toLowerCase())
  );

  const isValid = date && subjectId && facultyId;

  const handleStart = () => {
    if (!isValid) return;
    navigate('/attendance/take', {
    state: {
        date,
        subjectId,
        facultyId,
        lectureNumber,
        lectureCount,
        classroom
    }
});

  const handleQuickAddSubject = async () => {
    const name = prompt('Enter subject name:');
    if (name?.trim()) {
      try {
        await addSubject(name.trim());
        if (classData?.id) {
          const subs = await services.getSubjects(classData.id);
          setSubjects(subs);
        }
      } catch (e) {
        console.error('Failed to add subject:', e);
        showToast('Failed to add subject', 'error');
      }
    }
  };

  const handleQuickAddFaculty = async () => {
    const name = prompt('Enter faculty name:');
    if (name?.trim()) {
      try {
        await addFaculty(name.trim());
        if (classData?.id) {
          const facs = await services.getFaculties(classData.id);
          setFaculty(facs);
        }
      } catch (e) {
        console.error('Failed to add faculty:', e);
        showToast('Failed to add faculty', 'error');
      }
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Date */}
      <Card>
        <label className="block text-sm font-medium text-text-secondary mb-2">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </Card>

      {/* Subject */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-text-secondary">Subject</label>
          {subjects.length === 0 && (
            <button onClick={handleQuickAddSubject} className="text-xs text-primary-600 font-medium">+ Add</button>
          )}
        </div>
        <SearchInput
          value={searchSubject}
          onChange={setSearchSubject}
          placeholder="Search subjects..."
          className="mb-2"
        />
        <div className="max-h-40 overflow-y-auto space-y-1">
          {filteredSubjects.map(subject => (
            <button
              key={subject.id}
              onClick={() => setSubjectId(subject.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                subjectId === subject.id
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium'
                  : 'text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              {subject.name}
            </button>
          ))}
          {filteredSubjects.length === 0 && (
            <p className="text-xs text-text-tertiary text-center py-2">
              {searchSubject ? 'No matching subjects' : 'No subjects yet'}
            </p>
          )}
        </div>
      </Card>

      {/* Faculty */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-text-secondary">Faculty</label>
          {faculty.length === 0 && (
            <button onClick={handleQuickAddFaculty} className="text-xs text-primary-600 font-medium">+ Add</button>
          )}
        </div>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {faculty.map(f => (
            <button
              key={f.id}
              onClick={() => setFacultyId(f.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                facultyId === f.id
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium'
                  : 'text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              {f.name}
            </button>
          ))}
          {faculty.length === 0 && (
            <p className="text-xs text-text-tertiary text-center py-2">No faculty yet</p>
          )}
        </div>
      </Card>

      {/* Lecture Number & Classroom */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            <Hash className="w-3.5 h-3.5 inline mr-1" />
            Lecture #
            
          </label>
          <input
            type="number"
            min={1}
            value={lectureNumber}
            onChange={(e) => setLectureNumber(Number(e.target.value))}
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <label>
            Number of Lectures
          </label>

          <input
            type="number"
            min={1}
            value={lectureCount}
            onChange={(e)=>setLectureCount(Number(e.target.value))}
          />
        </Card>
        <Card>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            <MapPin className="w-3.5 h-3.5 inline mr-1" />
            Classroom
          </label>
          <input
            type="text"
            value={classroom}
            onChange={e => setClassroom(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </Card>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!isValid}
        onClick={handleStart}
        icon={<Play className="w-5 h-5" />}
      >
        Start Attendance
      </Button>

      {(!subjects.length || !faculty.length) && (
        <p className="text-xs text-text-tertiary text-center">
          You need at least one subject and faculty member to start.
        </p>
      )}
    </div>
  );
}

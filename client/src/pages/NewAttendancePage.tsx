import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import * as services from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Calendar, BookOpen, User, MapPin, Hash, Layers } from 'lucide-react';
import type { Subject, Faculty } from '@/types';

export function NewAttendancePage() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { classData } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [classroom, setClassroom] = useState('');
  const [lectureNumber, setLectureNumber] = useState('1');
  const [lectureCount, setLectureCount] = useState('1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadFormMetadata() {
      if (!classData?.id) return;
      try {
        const [subList, facList] = await Promise.all([
          services.getSubjects(classData.id),
          services.getFaculties()
        ]);
        setSubjects(subList);
        setFaculties(facList);
        
        if (subList.length > 0) setSelectedSubject(subList[0].id);
        if (facList.length > 0) setSelectedFaculty(facList[0].id);
      } catch (err) {
        console.error('Failed to load form metadata:', err);
        showToast('Error loading configuration details', 'error');
      }
    }
    loadFormMetadata();
  }, [classData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !selectedFaculty || !classroom) {
      showToast('Please fill in all details', 'error');
      return;
    }

    setLoading(true);
    
    // Pass the configurations to the TakeAttendancePage via router state
    navigate('/attendance/take', {
      state: {
        subjectId: selectedSubject,
        facultyId: selectedFaculty,
        classroom: classroom.trim(),
        lectureNumber: parseInt(lectureNumber, 10),
        lectureCount: parseInt(lectureCount, 10),
        date
      }
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-surface border-b border-border px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="p-1 rounded-lg text-text-secondary hover:bg-surface-tertiary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-text-primary">New Session Details</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4 bg-surface p-5 rounded-2xl border border-border shadow-sm">
          
          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          {/* Subject Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" /> Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          {/* Faculty Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" /> Faculty
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            >
              {faculties.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name}
                </option>
              ))}
            </select>
          </div>

          {/* Classroom */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" /> Classroom / Lab Room
            </label>
            <input
              type="text"
              placeholder="e.g. Room 402, Lab A"
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Lecture Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-primary" /> Lecture No.
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={lectureNumber}
                onChange={(e) => setLectureNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            {/* Lecture Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" /> Duration (Lectures)
              </label>
              <input
                type="number"
                min="1"
                max="4"
                value={lectureCount}
                onChange={(e) => setLectureCount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full !mt-6"
            size="lg"
            loading={loading}
          >
            Configure & Start Session
          </Button>
        </form>
      </div>
    </div>
  );
}

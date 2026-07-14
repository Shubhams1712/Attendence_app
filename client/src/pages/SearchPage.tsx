import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as services from '@/lib/services';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import { Search, Users, Clock, BookOpen, UserCheck } from 'lucide-react';

interface SearchResult {
  type: 'student' | 'session' | 'subject' | 'faculty';
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

export function SearchPage() {
  const { classData } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2 || !classData?.id) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      if (!classData?.id) return;
      const q = query.toLowerCase().trim();
      const allResults: SearchResult[] = [];

      try {
        const [students, sessions, subs, facs] = await Promise.all([
          services.getStudents(classData.id),
          services.getSessions(classData.id),
          services.getSubjects(classData.id),
          services.getFaculties(classData.id),
        ]);

        students.forEach(s => {
          if ((s.name || '').toLowerCase().includes(q) || String(s.roll_number).includes(q)) {
            allResults.push({
              type: 'student', id: s.id, title: `${s.name || ''} (Roll ${s.roll_number})`,
              subtitle: s.notes || 'Student', link: '/students',
            });
          }
        });

        sessions.forEach(s => {
          const subj = subs.find(sub => sub.id === s.subject_id);
          const fac = facs.find(f => f.id === s.faculty_id);
          const matches = (subj?.name?.toLowerCase().includes(q) || fac?.name?.toLowerCase().includes(q) ||
            String(s.lecture_number).includes(q) || (s.date || '').includes(q));
          if (matches) {
            allResults.push({
              type: 'session', id: s.id, title: `${subj?.name || 'Unknown'} - Lec ${s.lecture_number}`,
              subtitle: `${formatDate(s.date)} • ${fac?.name || 'Unknown'}`, link: `/attendance/${s.id}`,
            });
          }
        });

        subs.forEach(s => {
          if ((s.name || '').toLowerCase().includes(q)) {
            allResults.push({
              type: 'subject', id: s.id, title: s.name,
              subtitle: 'Subject', link: '/settings',
            });
          }
        });

        facs.forEach(f => {
          if ((f.name || '').toLowerCase().includes(q)) {
            allResults.push({
              type: 'faculty', id: f.id, title: f.name,
              subtitle: 'Faculty', link: '/settings',
            });
          }
        });
      } catch (e) {
        console.error('Search error:', e);
      }

      setResults(allResults.slice(0, 50));
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, classData?.id]);

  const typeIcons: Record<string, React.ReactNode> = {
    student: <Users className="w-4 h-4" />,
    session: <Clock className="w-4 h-4" />,
    subject: <BookOpen className="w-4 h-4" />,
    faculty: <UserCheck className="w-4 h-4" />,
  };
  const typeColors: Record<string, string> = {
    student: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
    session: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',
    subject: 'bg-green-50 text-green-600 dark:bg-green-900/20',
    faculty: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <SearchInput value={query} onChange={setQuery} placeholder="Search students, subjects, lectures..." autoFocus />
      {loading && <p className="text-sm text-text-tertiary text-center animate-pulse">Searching...</p>}
      {results.length > 0 ? (
        <div className="space-y-2">
          {results.map((r, i) => (
            <Link key={`${r.type}-${r.id}-${i}`} to={r.link}>
              <Card hover className="p-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs ${typeColors[r.type]}`}>
                  {typeIcons[r.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{r.title}</p>
                  <p className="text-xs text-text-tertiary truncate">{r.subtitle}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : query.length >= 2 ? (
        <EmptyState icon={<Search className="w-8 h-8" />} title="No results" description="Try different search terms" />
      ) : (
        <EmptyState icon={<Search className="w-8 h-8" />} title="Search anything" description="Type at least 2 characters to search" />
      )}
    </div>
  );
}

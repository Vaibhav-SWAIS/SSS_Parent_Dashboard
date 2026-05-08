import { useState, useEffect } from 'react';

export function useDashboardState() {
  const [studentId, setStudentId] = useState<number>(1);
  const [language, setLanguage] = useState<string>('en');

  useEffect(() => {
    const savedStudent = localStorage.getItem('sgs_student_id');
    const savedLang = localStorage.getItem('sgs_language');
    if (savedStudent) setStudentId(Number(savedStudent));
    if (savedLang) setLanguage(savedLang);
  }, []);

  const updateStudentId = (id: number) => {
    setStudentId(id);
    localStorage.setItem('sgs_student_id', id.toString());
  };

  const updateLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('sgs_language', lang);
  };

  return { studentId, setStudentId: updateStudentId, language, setLanguage: updateLanguage };
}

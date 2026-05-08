'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { fetchQuizHistory } from '@/lib/api';
import { useDashboardState } from '@/lib/useDashboardState';

export default function QuizHistory() {
  const { studentId, setStudentId, language, setLanguage } = useDashboardState();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const result = await fetchQuizHistory(studentId);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [studentId]);

  return (
    <div className="min-h-full flex flex-col bg-[#F9FAFB] text-gray-800 font-sans">
      <TopBar studentId={studentId} setStudentId={setStudentId} language={language} setLanguage={setLanguage} isLoading={isLoading} />
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📊</span>
            <h1 className="text-2xl font-bold text-gray-800">Quiz Performance History</h1>
          </div>
          {isLoading ? (
            <div className="flex justify-center h-64 items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {data.length === 0 ? (
                <div className="col-span-full p-8 text-center text-gray-500 italic bg-white rounded-xl shadow-sm border border-gray-100">No quizzes found.</div>
              ) : (
                data.map((quiz, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 rounded-full bg-orange-50 border-4 border-orange-100 flex items-center justify-center mb-4">
                      <span className="text-orange-600 font-bold text-xl">{quiz.score}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">{quiz.subject}</h3>
                    <p className="text-sm text-gray-500 mt-1">Total Marks: {quiz.total}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

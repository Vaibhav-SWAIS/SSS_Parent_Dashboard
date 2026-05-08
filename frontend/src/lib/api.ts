import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchDashboardData = async (studentId: number) => {
  const response = await api.get(`/dashboard/${studentId}`);
  return response.data;
};

export const fetchParentChildren = async (parentId: number) => {
  const response = await api.get(`/parents/${parentId}/children`);
  return response.data;
};

export const fetchAssignmentsHistory = async (studentId: number) => {
  const response = await api.get(`/assignments/history/${studentId}`);
  return response.data;
};

export const fetchQuizHistory = async (studentId: number) => {
  const response = await api.get(`/quiz/history/${studentId}`);
  return response.data;
};

export const fetchRemarksHistory = async (studentId: number) => {
  const response = await api.get(`/remarks/history/${studentId}`);
  return response.data;
};

export const fetchNoticesHistory = async (studentId: number) => {
  const response = await api.get(`/notices/history/${studentId}`);
  return response.data;
};

export const fetchCallRequestsHistory = async (studentId: number) => {
  const response = await api.get(`/call-requests/history/${studentId}`);
  return response.data;
};

export const translateText = async (text: string, targetLang: string) => {
  if (!text) return { translated_text: text, original_text: text };
  if (targetLang === 'en') return { translated_text: text, original_text: text };
  
  const response = await api.post('/translate', {
    text,
    target_lang: targetLang,
  });
  return response.data;
};

export const requestCall = async (parentId: number, studentId: number, message: string) => {
  const response = await api.post('/request-call', {
    parent_id: parentId,
    student_id: studentId,
    message,
  });
  return response.data;
};

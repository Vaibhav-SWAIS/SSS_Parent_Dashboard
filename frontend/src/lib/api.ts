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
  try {
    const response = await api.get(`/assignments/history/${studentId}`);
    return response.data;
  } catch { return []; }
};

export const fetchAssignmentAnalytics = async (studentId: number) => {
  try {
    const response = await api.get(`/assignments/analytics/${studentId}`);
    return response.data;
  } catch { return { total: 0, submitted: 0, pending: 0, overdue: 0, graded: 0, completion_pct: 0 }; }
};

export const submitAssignment = async (payload: { assignment_id: number; student_id: number; submission_text: string; file_path?: string }) => {
  const response = await api.post('/assignments/submit', payload);
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

export const fetchChatThreads = async (parentId: number, studentId: number) => {
  const response = await api.get(`/chat/threads/${parentId}/${studentId}`);
  return response.data;
};

export const fetchChatMessages = async (threadId: number) => {
  const response = await api.get(`/chat/messages/${threadId}`);
  return response.data;
};

export const sendChatMessage = async (threadId: number, senderType: string, senderId: number, message: string) => {
  const response = await api.post('/chat/messages', {
    thread_id: threadId,
    sender_type: senderType,
    sender_id: senderId,
    message,
  });
  return response.data;
};

export const fetchAnalytics = async (studentId: number) => {
  const response = await api.get(`/analytics/${studentId}`);
  return response.data;
};

export const fetchCommunicationTimeline = async (studentId: number) => {
  const response = await api.get(`/communication/timeline/${studentId}`);
  return response.data;
};

export const fetchNotifications = async (studentId: number) => {
  const response = await api.get(`/notifications/${studentId}`);
  return response.data;
};

export const fetchTickets = async (parentId: number, studentId: number) => {
  const response = await api.get(`/tickets/${parentId}/${studentId}`);
  return response.data;
};

export const createTicket = async (parentId: number, studentId: number, subject: string, category: string, priority: string, message: string) => {
  const response = await api.post('/tickets', { parent_id: parentId, student_id: studentId, subject, category, priority, message });
  return response.data;
};

export const fetchTicketMessages = async (ticketId: number) => {
  const response = await api.get(`/tickets/${ticketId}/messages`);
  return response.data;
};

export const createTicketMessage = async (ticketId: number, senderType: string, senderName: string, message: string) => {
  const response = await api.post(`/tickets/${ticketId}/messages`, { ticket_id: ticketId, sender_type: senderType, sender_name: senderName, message });
  return response.data;
};

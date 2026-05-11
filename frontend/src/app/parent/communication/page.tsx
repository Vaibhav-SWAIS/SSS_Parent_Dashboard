'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { fetchTickets, createTicket, fetchTicketMessages, createTicketMessage } from '@/lib/api';
import { useDashboard } from '@/lib/DashboardContext';
import { MagnifyingGlassIcon, PlusIcon, ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function CommunicationCenterPage() {
  const { studentId, setStudentId, language, setLanguage } = useDashboard();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Academic');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newMessage, setNewMessage] = useState('');

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      // Mock parent_id = 1
      const data = await fetchTickets(1, studentId);
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadTickets();
      setSelectedTicket(null);
    }
  }, [studentId]);

  useEffect(() => {
    if (selectedTicket) {
      const loadMessages = async () => {
        setIsMessagesLoading(true);
        try {
          const data = await fetchTicketMessages(selectedTicket.ticket_id);
          setMessages(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsMessagesLoading(false);
        }
      };
      loadMessages();
    }
  }, [selectedTicket]);

  const handleCreateTicket = async (e: any) => {
    e.preventDefault();
    try {
      const newTicket = await createTicket(1, studentId, newSubject, newCategory, newPriority, newMessage);
      setTickets([newTicket, ...tickets]);
      setShowNewModal(false);
      setNewSubject('');
      setNewMessage('');
      setSelectedTicket(newTicket);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (e: any) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    try {
      const msg = await createTicketMessage(selectedTicket.ticket_id, "PARENT", "Parent", replyMessage);
      setMessages([...messages, msg]);
      setReplyMessage('');
      // Update local ticket status
      const updatedTickets = tickets.map(t => t.ticket_id === selectedTicket.ticket_id ? {...t, status: 'OPEN', updated_at: new Date().toISOString()} : t);
      setTickets(updatedTickets);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'Open' && t.status !== 'OPEN' && t.status !== 'IN_PROGRESS') return false;
    if (filter === 'Resolved' && t.status !== 'RESOLVED' && t.status !== 'CLOSED') return false;
    if (filter === 'High Priority' && t.priority !== 'HIGH') return false;
    if (searchQuery && !t.subject.toLowerCase().includes(searchQuery.toLowerCase()) && !t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-700';
      case 'AWAITING_PARENT': return 'bg-yellow-100 text-yellow-700';
      case 'RESOLVED': return 'bg-green-100 text-green-700';
      case 'CLOSED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#F9FAFB] text-gray-800 font-sans h-screen">
      <TopBar 
        studentId={studentId} 
        setStudentId={setStudentId} 
        language={language} 
        setLanguage={setLanguage} 
        isLoading={isLoading} 
      />

      <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full h-[calc(100vh-80px)] overflow-hidden">
        
        {/* LEFT PANE: Ticket List */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-orange-500" />
                Support Hub
              </h2>
              <button 
                onClick={() => setShowNewModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-xl transition-colors shadow-sm"
                title="Raise Concern"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative mb-3">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['All', 'Open', 'Resolved', 'High Priority'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${filter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoading ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center p-8 text-gray-400 text-sm">No tickets found</div>
            ) : (
              filteredTickets.map(t => (
                <div 
                  key={t.ticket_id} 
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${selectedTicket?.ticket_id === t.ticket_id ? 'bg-orange-50 border-orange-200' : 'bg-white border-transparent hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t.ticket_number}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${getStatusColor(t.status)}`}>{t.status.replace('_', ' ')}</span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{t.subject}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{t.latest_message ? t.latest_message.message : 'No messages'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANE: Selected Thread */}
        <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-md">{selectedTicket.ticket_number}</span>
                    <span className="text-xs font-semibold text-gray-500">{selectedTicket.category}</span>
                    {selectedTicket.priority === 'HIGH' && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">Urgent</span>}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">{selectedTicket.subject}</h2>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-lg ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status.replace('_', ' ')}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {isMessagesLoading ? (
                  <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>
                ) : (
                  messages.map((m, idx) => {
                    const isParent = m.sender_type === 'PARENT';
                    return (
                      <div key={idx} className={`flex flex-col ${isParent ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {!isParent && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{m.sender_type}</span>}
                          <span className="text-xs font-medium text-gray-500">{m.sender_name} • {new Date(m.created_at).toLocaleDateString()} {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className={`p-4 rounded-2xl max-w-[85%] text-sm ${isParent ? 'bg-gray-800 text-white rounded-tr-sm' : 'bg-orange-50 text-gray-800 border border-orange-100 rounded-tl-sm'}`}>
                          <p className="whitespace-pre-wrap">{m.message}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleReply} className="flex gap-3">
                  <input 
                    type="text" 
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..." 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!replyMessage.trim()}
                    className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed text-white px-5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-700">No Ticket Selected</h3>
              <p className="text-sm mt-2 max-w-md">Select a conversation from the left to view details and reply, or raise a new concern.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-xl text-gray-800">Raise Concern</h3>
              <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                <input required type="text" value={newSubject} onChange={e=>setNewSubject(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none" placeholder="Brief subject" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select value={newCategory} onChange={e=>setNewCategory(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none">
                    {['Academic', 'Attendance', 'Homework', 'PTM Request', 'Leave Request', 'Behavioral Concern', 'Transport', 'Fee Issue', 'General Query'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                  <select value={newPriority} onChange={e=>setNewPriority(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                <textarea required rows={4} value={newMessage} onChange={e=>setNewMessage(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none" placeholder="Describe your concern in detail..."></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-bold transition-colors">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

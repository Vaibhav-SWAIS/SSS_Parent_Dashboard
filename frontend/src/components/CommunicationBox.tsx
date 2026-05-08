import { useState } from 'react';
import { requestCall } from '../lib/api';

export default function CommunicationBox({ studentId, parentId = 1, recentRequests = [] }: { studentId: number, parentId?: number, recentRequests?: any[] }) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setStatus(null);

    try {
      await requestCall(parentId, studentId, message);
      setStatus({ type: 'success', text: 'Call request sent successfully!' });
      setMessage('');
      // In a real app we'd trigger a refetch here.
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', text: 'Failed to send request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-xl">✉️</span>
          <h2 className="text-lg font-bold text-gray-800">Request Teacher Call</h2>
        </div>
        <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">History</button>
      </div>
      
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Reason / Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g., I would like to discuss my child's recent quiz performance."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800 resize-none h-24 transition-shadow shadow-sm placeholder:text-gray-400 text-sm"
              disabled={isSubmitting}
            />
          </div>
          
          {status && (
            <div className={`p-3 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {status.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md w-full sm:w-auto self-end"
          >
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </button>
        </form>

        {recentRequests && recentRequests.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Recent Requests</h3>
            <div className="space-y-3">
              {recentRequests.slice(0, 2).map((req, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs text-gray-500">{req.created_at}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${req.status === 'completed' ? 'bg-green-100 text-green-700' : req.status === 'approved' ? 'bg-blue-100 text-blue-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 truncate">{req.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

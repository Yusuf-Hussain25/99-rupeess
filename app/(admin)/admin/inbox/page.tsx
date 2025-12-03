'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export default function InboxPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (token) {
      fetchMessages();
    }
  }, [token, filterStatus]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const query = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const res = await fetch(`/api/admin/messages${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'new' | 'read' | 'archived') => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Message marked as ${status}`);
        fetchMessages();
        if (selectedMessage?._id === id) {
          setSelectedMessage({ ...selectedMessage, status });
        }
      } else {
        toast.error(data.error || 'Failed to update message');
      }
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Message deleted successfully');
        if (selectedMessage?._id === id) {
          setSelectedMessage(null);
        }
        fetchMessages();
      } else {
        toast.error(data.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const openMessage = async (message: Message) => {
    setSelectedMessage(message);
    if (message.status === 'new') {
      updateStatus(message._id, 'read');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      archived: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const unreadCount = messages.filter((m) => m.status === 'new').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-600 mt-1">
            Manage customer messages and inquiries
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {unreadCount} new
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="all">All Messages</option>
            <option value="new">New Only</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {messages.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No messages found.
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      onClick={() => openMessage(message)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?._id === message._id ? 'bg-amber-50 border-l-4 border-amber-600' : ''
                      } ${message.status === 'new' ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {message.subject}
                            </h3>
                            {message.status === 'new' && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{message.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-xs text-gray-500">{message.name}</p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">{message.email}</p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4">{getStatusBadge(message.status)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-1">
          {selectedMessage ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Subject</label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedMessage.subject}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">From</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedMessage.name}</p>
                  <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                  {selectedMessage.phone && (
                    <p className="text-sm text-gray-600">{selectedMessage.phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Date</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Message</label>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex gap-2">
                    {selectedMessage.status !== 'read' && (
                      <button
                        onClick={() => updateStatus(selectedMessage._id, 'read')}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Mark as Read
                      </button>
                    )}
                    {selectedMessage.status !== 'archived' && (
                      <button
                        onClick={() => updateStatus(selectedMessage._id, 'archived')}
                        className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-700 font-medium rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="block w-full px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors text-sm text-center"
                  >
                    Reply via Email
                  </a>
                  <button
                    onClick={() => handleDelete(selectedMessage._id)}
                    className="w-full px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


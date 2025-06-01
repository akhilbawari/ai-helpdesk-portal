import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketService, ticketResponseService, profileService, attachmentService, aiService } from '../../services';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newResponse, setNewResponse] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [supportUsers, setSupportUsers] = useState([]);
  
  const isSupport = profile?.role === 'SUPPORT' || profile?.role === 'ADMIN';
  
  useEffect(() => {
    const fetchTicketData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch ticket details
        const { data: ticketData, error: ticketError } = await ticketService.getTicketById(id);
        if (ticketError) throw new Error(ticketError);
        setTicket(ticketData);
        
        // Fetch ticket responses
        const { data: responsesData, error: responsesError } = isSupport
          ? await ticketResponseService.getResponsesByTicket(id)
          : await ticketResponseService.getPublicResponsesByTicket(id);
        
        if (responsesError) throw new Error(responsesError);
        setResponses(responsesData || []);
        
        // Fetch attachments
        const { data: attachmentsData, error: attachmentsError } = await attachmentService.getAttachmentsByTicket(id);
        if (attachmentsError) throw new Error(attachmentsError);
        setAttachments(attachmentsData || []);
        
        // If user is support or admin, fetch support users for assignment
        if (isSupport) {
          const { data: supportData, error: supportError } = await profileService.getProfilesByRole('SUPPORT');
          if (supportError) throw new Error(supportError);
          setSupportUsers(supportData || []);
        }
      } catch (error) {
        console.error('Error fetching ticket data:', error);
        setError('Failed to load ticket details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchTicketData();
    }
  }, [id, isSupport]);
  
  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    
    if (!newResponse.trim()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const responseData = {
        ticket: { id: ticket.id },
        content: newResponse,
        internal: isInternal
      };
      
      const { data, error } = await ticketResponseService.createResponse(responseData);
      if (error) throw new Error(error);
      
      // Add the new response to the list
      setResponses([...responses, data]);
      
      // Clear the form
      setNewResponse('');
      setIsInternal(false);
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleStatusChange = async (newStatus) => {
    try {
      const updatedTicket = { ...ticket, status: newStatus };
      const { data, error } = await ticketService.updateTicket(ticket.id, updatedTicket);
      if (error) throw new Error(error);
      
      setTicket(data);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Failed to update ticket status. Please try again.');
    }
  };
  
  const handleAssignTicket = async (assigneeId) => {
    try {
      const { data, error } = await ticketService.assignTicket(ticket.id, assigneeId);
      if (error) throw new Error(error);
      
      setTicket(data);
    } catch (error) {
      console.error('Error assigning ticket:', error);
      alert('Failed to assign ticket. Please try again.');
    }
  };
  
  const handleGetAiSuggestions = async () => {
    if (!ticket) return;
    
    setLoadingSuggestions(true);
    
    try {
      // Get previous responses content
      const previousResponses = responses
        .filter(r => !r.internal)
        .map(r => r.content);
      
      const { data, error } = await aiService.suggestResponse(
        ticket.title,
        ticket.description,
        previousResponses
      );
      
      if (error) throw new Error(error);
      setAiSuggestions(data || []);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      alert('Failed to get AI suggestions. Please try again.');
    } finally {
      setLoadingSuggestions(false);
    }
  };
  
  const useSuggestion = (suggestion) => {
    setNewResponse(suggestion);
    setAiSuggestions([]);
  };
  
  const downloadAttachment = async (attachmentId, fileName) => {
    try {
      const { data, error } = await attachmentService.downloadAttachment(attachmentId);
      if (error) throw new Error(error);
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading attachment:', error);
      alert('Failed to download attachment. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="bg-beige-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-navy-600">Loading ticket details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-beige-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
            <p>{error}</p>
            <button
              onClick={() => navigate('/tickets')}
              className="mt-4 text-navy-600 hover:text-navy-800 underline"
            >
              Back to Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!ticket) {
    return (
      <div className="bg-beige-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-navy-600">Ticket not found.</p>
            <button
              onClick={() => navigate('/tickets')}
              className="mt-4 text-navy-600 hover:text-navy-800 underline"
            >
              Back to Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-beige-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/tickets')}
            className="text-navy-600 hover:text-navy-800 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Tickets
          </button>
        </div>
        
        {/* Ticket Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-beige-100 px-6 py-4 border-b border-beige-200">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-navy-800">{ticket.title}</h1>
              <div className="flex space-x-2">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                    ticket.status
                  )}`}
                >
                  {ticket.status.replace('_', ' ')}
                </span>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(
                    ticket.priority
                  )}`}
                >
                  {ticket.priority}
                </span>
              </div>
            </div>
            <div className="mt-2 text-sm text-navy-600">
              <span>Ticket #{ticket.id.substring(0, 8)}</span>
              <span className="mx-2">•</span>
              <span>Created: {formatDate(ticket.createdAt)}</span>
              {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                <>
                  <span className="mx-2">•</span>
                  <span>Updated: {formatDate(ticket.updatedAt)}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-navy-800 mb-2">Description</h2>
              <div className="text-navy-700 whitespace-pre-wrap">{ticket.description}</div>
            </div>
            
            {/* Ticket Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-navy-600 mb-1">Category</h3>
                <p className="text-navy-800">{ticket.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-navy-600 mb-1">Assigned To</h3>
                <p className="text-navy-800">
                  {ticket.assignedTo ? ticket.assignedTo.fullName : 'Unassigned'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-navy-600 mb-1">Created By</h3>
                <p className="text-navy-800">{ticket.createdBy?.fullName || 'Unknown'}</p>
              </div>
              {ticket.aiConfidenceScore && (
                <div>
                  <h3 className="text-sm font-medium text-navy-600 mb-1">AI Confidence</h3>
                  <p className="text-navy-800">{(ticket.aiConfidenceScore * 100).toFixed(0)}%</p>
                </div>
              )}
            </div>
            
            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-medium text-navy-800 mb-2">Attachments</h2>
                <ul className="space-y-2">
                  {attachments.map((attachment) => (
                    <li key={attachment.id} className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-navy-500 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <button
                        onClick={() => downloadAttachment(attachment.id, attachment.fileName)}
                        className="text-navy-600 hover:text-navy-800 hover:underline"
                      >
                        {attachment.fileName}
                        <span className="text-navy-500 text-xs ml-2">
                          ({Math.round(attachment.fileSize / 1024)} KB)
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Actions for Support/Admin */}
            {isSupport && (
              <div className="border-t border-beige-200 pt-4 mt-4">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label htmlFor="statusChange" className="block text-sm font-medium text-navy-700 mb-1">
                      Change Status
                    </label>
                    <select
                      id="statusChange"
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="assignTicket" className="block text-sm font-medium text-navy-700 mb-1">
                      Assign Ticket
                    </label>
                    <select
                      id="assignTicket"
                      value={ticket.assignedTo?.id || ''}
                      onChange={(e) => handleAssignTicket(e.target.value || null)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    >
                      <option value="">Unassigned</option>
                      {supportUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName} ({user.department})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      AI Assistance
                    </label>
                    <button
                      onClick={handleGetAiSuggestions}
                      disabled={loadingSuggestions}
                      className="bg-navy-600 hover:bg-navy-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {loadingSuggestions ? 'Loading...' : 'Get AI Suggestions'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-beige-100 px-6 py-3 border-b border-beige-200">
              <h2 className="text-lg font-medium text-navy-800">AI Response Suggestions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="border border-beige-200 rounded-md p-4">
                    <p className="text-navy-700 mb-2">{suggestion}</p>
                    <button
                      onClick={() => useSuggestion(suggestion)}
                      className="text-navy-600 hover:text-navy-800 text-sm font-medium"
                    >
                      Use this suggestion
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Responses */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-beige-100 px-6 py-3 border-b border-beige-200">
            <h2 className="text-lg font-medium text-navy-800">Responses</h2>
          </div>
          
          <div className="divide-y divide-beige-200">
            {responses.length === 0 ? (
              <div className="p-6 text-center text-navy-600">
                No responses yet.
              </div>
            ) : (
              responses.map((response) => (
                <div key={response.id} className={`p-6 ${response.internal ? 'bg-beige-50' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <span className="font-medium text-navy-800">
                        {response.user?.fullName || 'Unknown'}
                      </span>
                      {response.internal && (
                        <span className="ml-2 px-2 py-0.5 bg-navy-100 text-navy-800 text-xs rounded-full">
                          Internal Note
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-navy-500">
                      {formatDate(response.createdAt)}
                    </span>
                  </div>
                  <div className="text-navy-700 whitespace-pre-wrap">{response.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Add Response Form */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-beige-100 px-6 py-3 border-b border-beige-200">
            <h2 className="text-lg font-medium text-navy-800">Add Response</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleResponseSubmit}>
              <div className="mb-4">
                <textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Type your response here..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500"
                  required
                ></textarea>
              </div>
              
              {isSupport && (
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="isInternal"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isInternal" className="ml-2 block text-sm text-navy-700">
                    Internal note (only visible to support staff)
                  </label>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newResponse.trim()}
                  className="bg-navy-600 hover:bg-navy-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

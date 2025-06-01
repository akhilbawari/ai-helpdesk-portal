import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiClock, FiUser, FiTag, FiAlertTriangle, FiCheckCircle, FiMessageCircle, 
         FiDownload, FiPaperclip, FiSend, FiRefreshCw, FiLock, FiArrowLeft } from 'react-icons/fi';
import { apiService } from '../../services';
import { useAuth } from '../../context/AuthContext';

export default function TicketDetail() {
  const { id } = useParams(); // Fix: Extract 'id' instead of 'ticketId' to match the route parameter
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  console.log('Ticket ID from URL params:', id); // Debug log to verify the ID
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchTicket();
    } else {
      setError('No ticket ID provided');
      setLoading(false);
    }
  }, [id]);
  
  const fetchTicket = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching ticket with ID:', id);
      const response = await apiService.getTicketById(id);
      console.log('Ticket response received:', response);
      
      // Direct debugging to see exactly what we're getting
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null');
      
      // Check if the response has the expected structure
      if (response && response.data) {
        // This is for the wrapped response from the interceptor
        console.log('Setting ticket data from response.data:', response.data);
        setTicket(response.data);
      } else if (response && response.success === true && response.data) {
        // This is for the direct API response format
        console.log('Setting ticket data from success response:', response.data);
        setTicket(response.data);
      } else if (response && !response.success) {
        // API returned an error message
        setError(response.message || 'Failed to load ticket details');
        toast.error(response.message || 'Failed to load ticket details');
      } else if (response) {
        // Response exists but doesn't match expected formats - try to use it directly
        console.log('Using response directly as ticket data');
        setTicket(response);
      } else {
        // No usable response
        setError('Failed to load ticket details - invalid response format');
        toast.error('Failed to load ticket details');
        console.error('Invalid or empty API response');
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError('Failed to load ticket details. Please try again.');
      toast.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    
    try {
      const response = await apiService.addTicketComment(id, {
        content: newComment,
        userId: user.id,
        userName: profile?.name || user.email
      });
      
      console.log('Comment submission response:', response);
      
      // Check if the response indicates success
      if (response && (response.success || response.data)) {
        setNewComment('');
        toast.success('Comment added successfully');
        fetchTicket(); // Refresh ticket to show new comment
      } else {
        // Handle error in response
        const errorMessage = response?.message || 'Failed to add comment';
        toast.error(errorMessage);
        console.error('Error adding comment:', errorMessage);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };
  
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusUpdate) return;
    
    setUpdatingStatus(true);
    
    try {
      const response = await apiService.updateTicketStatus(id, statusUpdate);
      console.log('Status update response:', response);
      
      // Check if the response indicates success
      if (response && (response.success || response.data)) {
        toast.success(`Ticket status updated to ${statusUpdate}`);
        fetchTicket(); // Refresh ticket to show new status
        setStatusUpdate('');
      } else {
        // Handle error in response
        const errorMessage = response?.message || `Failed to update ticket status to ${statusUpdate}`;
        toast.error(errorMessage);
        console.error('Error updating status:', errorMessage);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update ticket status');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
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
    switch (priority?.toUpperCase()) {
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
  
  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleString();
  };
  
  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-indigo-100 rounded w-1/4"></div>
            <div className="h-32 bg-indigo-50 rounded"></div>
            <div className="h-64 bg-white rounded border border-indigo-100"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => fetchTicket()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <FiRefreshCw className="mr-2" /> Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!ticket) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Ticket Not Found</h2>
          <p className="text-yellow-600">The requested ticket could not be found.</p>
          <Link 
            to="/tickets"
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center inline-block"
          >
            <FiArrowLeft className="mr-2" /> Back to Tickets
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-indigo-50/30 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link 
          to="/tickets" 
          className="inline-flex items-center mb-6 text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Tickets
        </Link>
        
        {/* Ticket header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-indigo-100 p-6 mb-6"
        >
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-navy-900 mb-2">
              {ticket.title}
            </h1>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityClass(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
          </div>
          
          <div className="mt-4 text-navy-700">
            <p className="whitespace-pre-wrap">{ticket.description}</p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-indigo-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-navy-600">
            <div className="flex items-center">
              <FiUser className="mr-2 text-indigo-500" />
              <span>Submitted by: {ticket.createdBy?.fullName || ticket.createdBy?.email || 'Unknown'}</span>
            </div>
            <div className="flex items-center">
              <FiClock className="mr-2 text-indigo-500" />
              <span>Created: {formatDate(ticket.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <FiTag className="mr-2 text-indigo-500" />
              <span>Category: {ticket.category || 'Uncategorized'}</span>
            </div>
          </div>
          
          {/* Attachments section if applicable */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="mt-6 pt-4 border-t border-indigo-100">
              <h3 className="text-sm font-medium text-navy-700 mb-2 flex items-center">
                <FiPaperclip className="mr-2 text-indigo-500" /> Attachments
              </h3>
              <div className="flex flex-wrap gap-2">
                {ticket.attachments.map((attachment, index) => (
                  <a 
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md text-sm hover:bg-indigo-100 transition-colors"
                  >
                    <FiDownload className="mr-2" />
                    {attachment.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Status update section for support/admin users */}
        {(profile?.role === 'SUPPORT' || profile?.role === 'ADMIN') && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-indigo-100 p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-navy-800 mb-4 flex items-center">
              <FiRefreshCw className="mr-2 text-indigo-500" /> Update Status
            </h2>
            
            <form onSubmit={handleStatusUpdate} className="flex flex-col sm:flex-row gap-4">
              <select
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                className="flex-1 border border-indigo-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              
              <button
                type="submit"
                disabled={updatingStatus || !statusUpdate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {updatingStatus ? (
                  <>
                    <FiRefreshCw className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            </form>
          </motion.div>
        )}
        
        {/* Comments section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-indigo-100 p-6"
        >
          <h2 className="text-lg font-semibold text-navy-800 mb-4 flex items-center">
            <FiMessageCircle className="mr-2 text-indigo-500" /> Comments
          </h2>
          
          {/* Comments list */}
          <div className="space-y-4 mb-6">
            {ticket.comments && ticket.comments.length > 0 ? (
              ticket.comments.map((comment, index) => (
                <motion.div 
                  key={comment.id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-indigo-50/50 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-navy-800">{comment.userName || 'User'}</div>
                    <div className="text-xs text-navy-500">{formatDate(comment.createdAt)}</div>
                  </div>
                  <p className="text-navy-700 whitespace-pre-wrap">{comment.content}</p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-navy-500">
                <FiMessageCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No comments yet</p>
              </div>
            )}
          </div>
          
          {/* Add comment form */}
          <form onSubmit={handleCommentSubmit} className="border-t border-indigo-100 pt-4">
            <h3 className="text-sm font-medium text-navy-700 mb-2">Add a comment</h3>
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your comment here..."
                rows="3"
                className="w-full border border-indigo-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submittingComment ? (
                  <>
                    <FiRefreshCw className="animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

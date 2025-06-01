import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketService, profileService, attachmentService, aiService } from '../../services';

export default function CreateTicket() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    attachments: []
  });
  
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const categories = [
    'Hardware Issue',
    'Software Issue',
    'Network Problem',
    'Account Access',
    'Email Problem',
    'Printer Issue',
    'Data Recovery',
    'Security Concern',
    'Training Request',
    'Other'
  ];
  
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    // Fetch users for assignment dropdown (only if user is admin or support)
    const fetchUsers = async () => {
      if (profile?.role === 'ADMIN' || profile?.role === 'SUPPORT') {
        try {
          const { data, error } = await profileService.getAllProfiles();
          if (error) throw error;
          setUsers(data || []);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    };
    
    fetchUsers();
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      
      if (!formData.category) {
        throw new Error('Category is required');
      }
      
      // First, use AI to suggest routing if available
      let suggestedCategory = formData.category;
      let aiConfidenceScore = null;
      
      try {
        const { data: aiRouting } = await aiService.routeTicket(
          formData.title,
          formData.description
        );
        
        if (aiRouting && aiRouting.category && aiRouting.confidenceScore > 0.7) {
          suggestedCategory = aiRouting.category;
          aiConfidenceScore = aiRouting.confidenceScore;
        }
      } catch (aiError) {
        // If AI routing fails, just continue with user-selected category
        console.error('AI routing error:', aiError);
      }
      
      // Create ticket in database
      const ticketData = {
        title: formData.title,
        description: formData.description,
        category: suggestedCategory,
        priority: formData.priority,
        status: 'OPEN',
        aiConfidenceScore: aiConfidenceScore
      };
      
      const { data: ticket, error: ticketError } = await ticketService.createTicket(ticketData);
      if (ticketError) throw ticketError;
      
      // Upload attachments if any
      if (formData.attachments.length > 0) {
        for (const file of formData.attachments) {
          const { error: uploadError } = await attachmentService.uploadAttachment(ticket.id, file);
          if (uploadError) throw uploadError;
        }
      }
      
      setSuccessMessage('Ticket created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'Medium',
        attachments: []
      });
      
      // Redirect to ticket detail after a short delay
      setTimeout(() => {
        navigate(`/tickets/${ticket.id}`);
      }, 1500);
      
    } catch (error) {
      setError(error.message || 'An error occurred while creating the ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-beige-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-beige-100 px-6 py-4 border-b border-beige-200">
            <h1 className="text-2xl font-bold text-navy-800">Create New Support Ticket</h1>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
                <p>{error}</p>
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 text-green-700">
                <p>{successMessage}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-navy-700 mb-1">
                    Ticket Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief summary of the issue"
                    className="w-full px-3 py-2 border border-beige-300 rounded-md focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-navy-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-beige-300 rounded-md focus:outline-none focus:ring-2 focus:ring-beige-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-navy-700 mb-1">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-beige-300 rounded-md focus:outline-none focus:ring-2 focus:ring-beige-500"
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-navy-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="6"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Please provide detailed information about your issue"
                    className="w-full px-3 py-2 border border-beige-300 rounded-md focus:outline-none focus:ring-2 focus:ring-beige-500"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="attachments" className="block text-sm font-medium text-navy-700 mb-1">
                    Attachments
                  </label>
                  <input
                    type="file"
                    id="attachments"
                    name="attachments"
                    multiple
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-beige-300 rounded-md focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                  <p className="mt-1 text-xs text-navy-500">
                    You can attach screenshots or relevant files (max 5MB each)
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 border border-beige-300 rounded-md text-navy-700 hover:bg-beige-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-beige-600 text-white rounded-md hover:bg-beige-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige-500"
                >
                  {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

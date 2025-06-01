import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    bio: '',
    jobTitle: '',
    phoneNumber: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const departments = [
    'HR',
    'IT',
    'ADMIN'
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        email: profile.email || user?.email || '',
        department: profile.department || '',
        bio: profile.bio || '',
        jobTitle: profile.job_title || '',
        phoneNumber: profile.phone_number || ''
      });
    }
  }, [profile, user, loading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          department: formData.department,
          bio: formData.bio,
          job_title: formData.jobTitle,
          phone_number: formData.phoneNumber,
          updated_at: new Date()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh profile data
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (fetchError) throw fetchError;
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-beige-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-beige-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-beige-100 px-6 py-4 border-b border-beige-200">
            <h1 className="text-2xl font-bold text-navy-800">Your Profile</h1>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-navy-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border ${isEditing ? 'border-beige-300' : 'border-beige-200 bg-beige-50'} rounded-md focus:outline-none focus:ring-2 focus:ring-beige-500`}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-beige-200 bg-beige-50 rounded-md"
                  />
                  <p className="mt-1 text-xs text-navy-500">Email cannot be changed</p>
                </div>
                
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-navy-700 mb-1">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border ${isEditing ? 'border-beige-300' : 'border-beige-200 bg-beige-50'} rounded-md focus:outline-none focus:ring-2 focus:ring-beige-500`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-navy-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border ${isEditing ? 'border-beige-300' : 'border-beige-200 bg-beige-50'} rounded-md focus:outline-none focus:ring-2 focus:ring-beige-500`}
                  />
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-navy-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border ${isEditing ? 'border-beige-300' : 'border-beige-200 bg-beige-50'} rounded-md focus:outline-none focus:ring-2 focus:ring-beige-500`}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-navy-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border ${isEditing ? 'border-beige-300' : 'border-beige-200 bg-beige-50'} rounded-md focus:outline-none focus:ring-2 focus:ring-beige-500`}
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-beige-300 rounded-md text-navy-700 hover:bg-beige-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-beige-600 text-white rounded-md hover:bg-beige-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige-500"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-beige-600 text-white rounded-md hover:bg-beige-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige-500"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';

export default function Settings() {
  const { user, profile } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [notifications, setNotifications] = useState({
    emailNotifications: profile?.settings?.emailNotifications || true,
    newTicketAlerts: profile?.settings?.newTicketAlerts || true,
    statusUpdates: profile?.settings?.statusUpdates || true,
    marketingEmails: profile?.settings?.marketingEmails || false
  });
  
  const [notificationSuccess, setNotificationSuccess] = useState('');
  const [notificationError, setNotificationError] = useState(null);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess('');
    setIsChangingPassword(true);
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsChangingPassword(false);
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      setIsChangingPassword(false);
      return;
    }
    
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      
      if (signInError) {
        throw new Error('Current password is incorrect');
      }
      
      // If sign in successful, update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setPasswordSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const saveNotificationSettings = async (e) => {
    e.preventDefault();
    setNotificationError(null);
    setNotificationSuccess('');
    setIsSavingNotifications(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          settings: {
            ...profile?.settings,
            ...notifications
          },
          updated_at: new Date()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setNotificationSuccess('Notification preferences updated successfully');
      
    } catch (error) {
      setNotificationError(error.message);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  return (
    <div className="bg-beige-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy-800 mb-6">Account Settings</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-beige-100 px-6 py-4 border-b border-beige-200">
            <h2 className="text-xl font-semibold text-navy-800">Change Password</h2>
          </div>
          
          <div className="p-6">
            {passwordError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
                <p>{passwordError}</p>
              </div>
            )}
            
            {passwordSuccess && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 text-green-700">
                <p>{passwordSuccess}</p>
              </div>
            )}
            
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-navy-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-beige-300 rounded-md focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-navy-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-beige-300 rounded-md focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-beige-300 rounded-md focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-beige-600 text-white rounded-md hover:bg-beige-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige-500"
                >
                  {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-beige-100 px-6 py-4 border-b border-beige-200">
            <h2 className="text-xl font-semibold text-navy-800">Notification Preferences</h2>
          </div>
          
          <div className="p-6">
            {notificationError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
                <p>{notificationError}</p>
              </div>
            )}
            
            {notificationSuccess && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 text-green-700">
                <p>{notificationSuccess}</p>
              </div>
            )}
            
            <form onSubmit={saveNotificationSettings}>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={notifications.emailNotifications}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-beige-600 focus:ring-beige-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailNotifications" className="ml-3 block text-sm font-medium text-navy-700">
                    Email Notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newTicketAlerts"
                    name="newTicketAlerts"
                    checked={notifications.newTicketAlerts}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-beige-600 focus:ring-beige-500 border-gray-300 rounded"
                  />
                  <label htmlFor="newTicketAlerts" className="ml-3 block text-sm font-medium text-navy-700">
                    New Ticket Alerts
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="statusUpdates"
                    name="statusUpdates"
                    checked={notifications.statusUpdates}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-beige-600 focus:ring-beige-500 border-gray-300 rounded"
                  />
                  <label htmlFor="statusUpdates" className="ml-3 block text-sm font-medium text-navy-700">
                    Status Updates
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="marketingEmails"
                    name="marketingEmails"
                    checked={notifications.marketingEmails}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-beige-600 focus:ring-beige-500 border-gray-300 rounded"
                  />
                  <label htmlFor="marketingEmails" className="ml-3 block text-sm font-medium text-navy-700">
                    Marketing Emails
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSavingNotifications}
                  className="px-4 py-2 bg-beige-600 text-white rounded-md hover:bg-beige-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige-500"
                >
                  {isSavingNotifications ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

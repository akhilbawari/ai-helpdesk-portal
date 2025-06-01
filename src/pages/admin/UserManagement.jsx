import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fileInput, setFileInput] = useState(null);
  const [importStatus, setImportStatus] = useState({
    isImporting: false,
    success: false,
    message: '',
    data: null
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await apiService.getAllUsers();
      
      if (error) {
        if (error.status === 403) {
          toast.error('You do not have permission to view users');
        } else {
          throw new Error(error.message || 'Failed to load users');
        }
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await apiService.updateUserRole(userId, newRole);
      
      if (error) {
        if (error.status === 403) {
          toast.error('You do not have permission to update user roles');
        } else {
          throw new Error(error.message || 'Failed to update user role');
        }
      } else {
        toast.success('User role updated successfully');
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleFileChange = (e) => {
    setFileInput(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!fileInput) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      setImportStatus({
        isImporting: true,
        success: false,
        message: 'Importing users...',
        data: null
      });

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const csvText = e.target.result;
          const users = parseCSV(csvText);
          
          if (users.length === 0) {
            throw new Error('No valid users found in the CSV file');
          }
          
          const { data: response, error } = await apiService.importUsersFromCsv(users);
          
          if (error) {
            if (error.status === 403) {
              toast.error('You do not have permission to import users');
              setImportStatus({
                isImporting: false,
                success: false,
                message: 'Permission denied: You do not have access to import users',
                data: null
              });
            } else {
              throw new Error(error.message || 'Failed to import users');
            }
          } else {
            setImportStatus({
              isImporting: false,
              success: response.success,
              message: response.message,
              data: response.data
            });
            
            if (response.success) {
              toast.success(response.message);
              fetchUsers(); // Refresh the list
            } else {
              toast.error(response.message);
            }
          }
        } catch (error) {
          console.error('Error processing CSV:', error);
          setImportStatus({
            isImporting: false,
            success: false,
            message: 'Error processing CSV: ' + error.message,
            data: null
          });
          toast.error('Error processing CSV: ' + error.message);
        }
      };
      
      reader.readAsText(fileInput);
    } catch (error) {
      console.error('Error importing users:', error);
      setImportStatus({
        isImporting: false,
        success: false,
        message: 'Error importing users: ' + error.message,
        data: null
      });
      toast.error('Error importing users: ' + error.message);
    }
  };

  const parseCSV = (csvText) => {
    // Simple CSV parser - in a real app, you'd use a more robust library
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Check required headers
    if (!headers.includes('email')) {
      throw new Error('CSV must include an email column');
    }
    
    const users = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',').map(v => v.trim());
      const user = {};
      
      headers.forEach((header, index) => {
        if (index < values.length) {
          user[header] = values[index];
        }
      });
      
      if (user.email) {
        users.push(user);
      }
    }
    
    return users;
  };

  const downloadTemplateCSV = () => {
    const csvContent = "email,fullName,department,role\nexample@company.com,John Doe,IT,EMPLOYEE";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-8 bg-beige-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-beige-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy-900">User Management</h1>
        <Link to="/dashboard" className="text-beige-600 hover:text-beige-800">
          Back to Dashboard
        </Link>
      </div>

      {/* Bulk Import Section */}
      <div className="bg-white rounded-lg shadow-soft border border-beige-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-navy-900 mb-4">Bulk Import Users</h2>
        
        <div className="flex flex-col md:flex-row items-start gap-4 mb-4">
          <div className="w-full md:w-1/2">
            <label className="block text-navy-700 mb-2">Upload CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full border border-beige-200 rounded-md p-2"
            />
            <p className="text-sm text-navy-500 mt-1">
              CSV must include email column. Optional columns: fullName, department, role
            </p>
          </div>
          
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            <button
              onClick={handleFileUpload}
              disabled={!fileInput || importStatus.isImporting}
              className="px-4 py-2 bg-beige-600 text-white rounded-md hover:bg-beige-700 transition-colors disabled:bg-beige-300"
            >
              {importStatus.isImporting ? 'Importing...' : 'Import Users'}
            </button>
            
            <button
              onClick={downloadTemplateCSV}
              className="px-4 py-2 bg-beige-100 text-navy-700 rounded-md hover:bg-beige-200 transition-colors"
            >
              Download Template
            </button>
          </div>
        </div>
        
        {/* Import Status */}
        {importStatus.message && (
          <div className={`mt-4 p-4 rounded-md ${importStatus.success ? 'bg-green-100 text-green-800' : 'bg-coral-100 text-coral-800'}`}>
            <p className="font-medium">{importStatus.message}</p>
            
            {importStatus.data && (
              <div className="mt-2">
                <p>Successfully imported: {importStatus.data.successCount}</p>
                {importStatus.data.errorCount > 0 && (
                  <div className="mt-2">
                    <p>Errors: {importStatus.data.errorCount}</p>
                    <ul className="list-disc list-inside mt-1">
                      {importStatus.data.errors.slice(0, 5).map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                      {importStatus.data.errors.length > 5 && (
                        <li className="text-sm">...and {importStatus.data.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow-soft border border-beige-100 overflow-hidden">
        <div className="p-6 border-b border-beige-100">
          <h2 className="text-lg font-bold text-navy-900">Users ({users.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-beige-100">
            <thead className="bg-beige-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-beige-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-beige-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-beige-200 flex items-center justify-center text-beige-600">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-navy-900">{user.fullName || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-navy-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-navy-600">{user.department || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-sm border border-beige-200 rounded-md p-1"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="SUPPORT">Support</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link 
                      to={`/admin/users/${user.id}`}
                      className="text-beige-600 hover:text-beige-800 mr-3"
                    >
                      View
                    </Link>
                    <Link 
                      to={`/admin/user-activities?userId=${user.id}`}
                      className="text-navy-600 hover:text-navy-800"
                    >
                      Activity
                    </Link>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-navy-600">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

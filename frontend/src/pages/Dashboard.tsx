import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Ticket, FileText, MessageSquare, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  
  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = '';
    
    if (hour < 12) {
      newGreeting = 'Good Morning';
    } else if (hour < 18) {
      newGreeting = 'Good Afternoon';
    } else {
      newGreeting = 'Good Evening';
    }
    
    setGreeting(newGreeting);
  }, []);
  
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-semibold">
          {greeting}, {user?.name}
        </h2>
        <p className="text-zinc-500">
          {user?.role === 'employee' && 'Welcome to your employee dashboard'}
          {user?.role === 'support_agent' && 'Welcome to your support agent dashboard'}
          {user?.role === 'team_lead' && 'Welcome to your team lead dashboard'}
          {user?.role === 'admin' && 'Welcome to your admin dashboard'}
        </p>
      </div>
        
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-border p-4 flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-full">
            <Ticket size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Total Tickets</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-border p-4 flex items-center gap-4">
          <div className="bg-success/10 text-success p-3 rounded-full">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Resolution Rate</p>
            <p className="text-2xl font-semibold">0%</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-border p-4 flex items-center gap-4">
          <div className="bg-info/10 text-info p-3 rounded-full">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">KB Articles</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-border p-4 flex items-center gap-4">
          <div className="bg-warning/10 text-warning p-3 rounded-full">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Unread</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="secondary" asChild>
              <Link to="/tickets/new">Raise New Ticket</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/knowledge">Browse Knowledge Base</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Ticket Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-primary/10 rounded-md">
                <p className="text-xl font-medium">0</p>
                <p className="text-sm text-zinc-500">Open</p>
              </div>
              <div className="p-3 bg-success/10 rounded-md">
                <p className="text-xl font-medium">0</p>
                <p className="text-sm text-zinc-500">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Announcements Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              Welcome to the new AI-First Helpdesk Portal. This platform is designed to 
              streamline support across all departments using AI-powered features.
            </p>
            <hr className="my-3 border-border" />
            <p className="text-sm text-zinc-500">
              Need help? Try the self-service chatbot for instant answers to common questions.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
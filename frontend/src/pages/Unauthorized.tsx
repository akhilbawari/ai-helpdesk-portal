import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold text-error mb-4 font-heading">403</h1>
        <h2 className="text-2xl font-semibold mb-2 font-heading">Access Denied</h2>
        <p className="text-zinc-600 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="space-x-4">
          <Button asChild variant="outline">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
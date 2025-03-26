import React, { useContext } from 'react'
import { AuthContext } from './AuthProvider'
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  }
  return (
    <nav className="navbar bg-base-200 shadow-md px-6">
      <div className="container mx-auto flex justify-between items-center w-full">
        <Link to="/" className="text-2xl font-bold text-primary">Facebook Clone</Link>

        {!user ? (
          <div className="flex gap-4">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-secondary">Sign Up</Link>
          </div>
        ) : (
          <div className="flex gap-6 items-center">
            <Link to="/" className="btn btn-ghost">Home</Link>
            <Link to="/inbox" className="btn btn-ghost">Inbox</Link>
            <Link to="/groups" className="btn btn-ghost">Groups</Link>
            <Link to="/friend" className="btn btn-ghost">Friend</Link>
            <Link to="/profile" className="btn btn-ghost">Profile</Link>

            <button onClick={handleLogout} className="btn btn-error">Logout</button>
          </div>
        )}
      </div>
    </nav>
  )
}

import axios from 'axios';
import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { AuthContext } from './AuthProvider';

export default function Login() {
  const { login }=useContext(AuthContext);
  const navigate=useNavigate();
  const location=useLocation();
  const handleLogin=async (event)=>{
    event.preventDefault();
    try{
      const email=event.target.email.value;
      const password=event.target.password.value;
      //const response=await axios.post('http://localhost:5000/api/auth/login',{email,password},{withCredentials:true});
      await login({email,password});
      toast.success('Login successful!');
      navigate(location?.state ? location.state : "/");
    }
    catch(error){
      console.log(error);
      toast.error(error.message || 'Login failed');
    }
  };
  return (
    <div className='min-h-screen flex items-center justify-center'>
        <div className='card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl'>
          <div className="card-body">
            <form onSubmit={handleLogin} className="fieldset">
              <label className="fieldset-label">Email</label>
              <input name='email' type="email" className="input" placeholder="Email" />
              <label className="fieldset-label">Password</label>
              <input name='password' type="password" className="input" placeholder="Password" />
              <button type='submit' className="btn btn-neutral mt-4">Login</button>
            </form>
            <p className="text-center mt-2">Don't have an account? <Link to="/register" className="text-blue-500">Register</Link></p>
          </div>
        </div>
    </div>
  )
}

import React from 'react'
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function Register() {
    const navigate=useNavigate();
    const handleRegister=async (event)=>{
        event.preventDefault();
        try{
          const username=event.target.username.value;
          const email=event.target.email.value;
          const password=event.target.password.value;
          const response=await axios.post('http://localhost:5000/api/auth/register',{username,email,password});
          toast.success('Registration successful!');
          navigate('/login');
        }
        catch(error){
          //console.log(error);
          const errorMessage =error.response?.data?.errors?.[0]?.msg || error.response?.data?.message ||
          error.response?.data?.error || "Registration failed";
          toast.error(errorMessage);
        }
    };  
  return (
    <div className='min-h-screen flex items-center justify-center'>
        <div className='card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl'>
            <div className="card-body">
                <form onSubmit={handleRegister} className="fieldset">
                    <label className="fieldset-label">Username</label>
                    <input name='username' type="text" className="input" placeholder="Username" />
                    <label className="fieldset-label">Email</label>
                    <input name='email' type="email" className="input" placeholder="Email" />
                    <label className="fieldset-label">Password</label>
                    <input name='password' type="password" className="input" placeholder="Password" />
                    <button type='submit' className="btn btn-neutral mt-4">Register</button>
                </form>
                <p className="text-center mt-2">Already have an account? <Link to="/login" className="text-blue-500">Login</Link></p>
            </div>
        </div>
    </div>
  )
}

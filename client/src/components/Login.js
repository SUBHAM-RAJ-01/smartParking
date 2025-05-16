import React, { useState } from 'react';
import API from '../api';

export default function Login({ setUser, navigateTo }) {
  const [form, setForm] = useState({ licensePlate: '', password: '' });
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setMsg('');
    
    try {
      const res = await API.post('/auth/login', form);
      setUser(res.data);
      navigateTo('dashboard');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Welcome Back</h2>
      <p>Log in to manage your parking and wallet</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="licensePlate">License Plate</label>
          <input 
            id="licensePlate"
            name="licensePlate" 
            placeholder="Enter your license plate" 
            value={form.licensePlate}
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            name="password" 
            type="password" 
            placeholder="Enter your password" 
            value={form.password}
            onChange={handleChange} 
            required 
          />
        </div>
        
        {msg && <div className="message message-error">{msg}</div>}
        
        <button type="submit" className="btn btn-full" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-switch">
        Don't have an account? 
        <a href="#" onClick={() => navigateTo('register')}> Register here</a>
      </div>
    </div>
  );
} 
import React, { useState } from 'react';
import API from '../api';

export default function Register({ navigateTo }) {
  const [form, setForm] = useState({ 
    name: '', 
    licensePlate: '', 
    password: '',
    rfidTag: '' 
  });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setMsg('');
    
    try {
      const response = await API.post('/auth/register', form);
      if (response.data.success) {
        setMsg('Registration successful! You can now login.');
        setMsgType('success');
        setTimeout(() => navigateTo('login'), 2000);
      } else {
        setMsg(response.data.error || 'Registration failed. Please try again.');
        setMsgType('error');
      }
    } catch (err) {
      setMsg(err.response?.data?.error || 'Registration failed. Please try again.');
      setMsgType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create an Account</h2>
      <p>Register to use our smart parking services</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input 
            id="name"
            name="name" 
            placeholder="Enter your full name" 
            value={form.name}
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="licensePlate">License Plate</label>
          <input 
            id="licensePlate"
            name="licensePlate" 
            placeholder="Enter your vehicle license plate" 
            value={form.licensePlate}
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="rfidTag">RFID Tag</label>
          <input 
            id="rfidTag"
            name="rfidTag" 
            placeholder="Enter your RFID tag number" 
            value={form.rfidTag}
            onChange={handleChange} 
            required 
          />
          <small className="form-text">
            This is the unique number on your RFID card or tag
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            name="password" 
            type="password" 
            placeholder="Create a strong password" 
            value={form.password}
            onChange={handleChange} 
            required 
          />
        </div>
        
        {msg && (
          <div className={`message message-${msgType}`}>
            {msg}
          </div>
        )}
        
        <button type="submit" className="btn btn-full" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className="auth-switch">
        Already have an account? 
        <a href="#" onClick={() => navigateTo('login')}> Login here</a>
      </div>
    </div>
  );
} 
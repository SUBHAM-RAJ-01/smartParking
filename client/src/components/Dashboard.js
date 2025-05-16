import React, { useEffect, useState } from 'react';
import API from '../api';
import Wallet from './Wallet';
import '../App.css';

export default function Dashboard({ user, setUser, startPayment }) {
  const [slots, setSlots] = useState([]);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [reserved, setReserved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSlots();
    // Check if user already has a reserved slot
    checkReservation();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await API.get('/slots');
      setSlots(res.data);
    } catch (err) {
      setMsg('Error fetching available slots');
      setMsgType('error');
    }
  };

  const checkReservation = async () => {
    try {
      // Find if any slot is reserved with this user's license plate
      const res = await API.get('/slots');
      const userSlot = res.data.find(slot => 
        slot.occupied && slot.vehicle === user.licensePlate
      );
      
      if (userSlot) {
        setReserved(true);
      }
    } catch (err) {
      console.error('Error checking reservation status', err);
    }
  };

  const handleReserve = async () => {
    setIsLoading(true);
    setMsg('');
    
    try {
      const res = await API.post('/slots/reserve', { licensePlate: user.licensePlate });
      setMsg(`Successfully reserved parking slot #${res.data.slotNumber}`);
      setMsgType('success');
      setReserved(true);
      fetchSlots();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error reserving slot');
      setMsgType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = async () => {
    setIsLoading(true);
    setMsg('');
    
    try {
      const res = await API.post('/slots/release', { licensePlate: user.licensePlate });
      setMsg(`Successfully exited. Parking charge: ₹${res.data.charge}`);
      setMsgType('success');
      setReserved(false);
      fetchSlots();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error processing exit');
      setMsgType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const available = slots.filter(s => !s.occupied).length;
  const total = slots.length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h3 className="welcome-header">Welcome, {user.name}</h3>
      </div>
      
      <div className="location-info">
        <div className="location-name">RVCE Ground Parking</div>
        <div className="slots-info">
          {available}/{total} slots available
        </div>
      </div>
      
      {msg && (
        <div className={`status-message ${msgType === 'success' ? 'success-message' : 'error-message'}`}>
          {msg}
        </div>
      )}
      
      <div className="action-buttons">
        <button 
          className="action-btn reserve-btn" 
          onClick={handleReserve} 
          disabled={reserved || available === 0 || isLoading}
        >
          {isLoading ? 'Processing...' : 'Reserve Parking'}
        </button>
        
        <button 
          className="action-btn exit-btn" 
          onClick={handleExit} 
          disabled={!reserved || isLoading}
        >
          {isLoading ? 'Processing...' : 'Exit Parking'}
        </button>
      </div>
      
      <div className="wallet-section">
        <Wallet licensePlate={user.licensePlate} startPayment={startPayment} />
      </div>
    </div>
  );
} 
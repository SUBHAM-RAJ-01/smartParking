import React, { useEffect, useState } from 'react';
import API from '../api';
import '../App.css';

export default function AdminDashboard() {
  const [slots, setSlots] = useState([]);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [stats, setStats] = useState({
    total: 8,
    available: 0,
    occupied: 0
  });

  const fetchSlots = async () => {
    try {
      const res = await API.get('/slots');
      setSlots(res.data);
      
      // Calculate stats
      const available = res.data.filter(s => !s.occupied).length;
      setStats({
        total: res.data.length,
        available,
        occupied: res.data.length - available
      });
    } catch (error) {
      setMsg('Error fetching slots data');
      setMsgType('error');
    }
  };

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(fetchSlots, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleForceRelease = async (slotNumber) => {
    try {
      await API.post('/slots/admin/force-release', { slotNumber });
      setMsg(`Slot #${slotNumber} has been successfully released`);
      setMsgType('success');
      fetchSlots();
    } catch (error) {
      setMsg('Error releasing slot');
      setMsgType('error');
    }
  };

  const handleAssign = async (slotNumber) => {
    const licensePlate = prompt('Enter license plate to assign:');
    if (!licensePlate) return;
    
    try {
      await API.post('/slots/admin/assign', { slotNumber, licensePlate });
      setMsg(`Slot #${slotNumber} has been assigned to ${licensePlate}`);
      setMsgType('success');
      fetchSlots();
    } catch (error) {
      setMsg('Error assigning slot');
      setMsgType('error');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Parking Management Dashboard</h2>
      </div>
      
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-title">Total Slots</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-subtitle">Parking capacity</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Available Slots</div>
          <div className="stat-value">{stats.available}</div>
          <div className="stat-subtitle">Ready for parking</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Occupied Slots</div>
          <div className="stat-value">{stats.occupied}</div>
          <div className="stat-subtitle">Currently in use</div>
        </div>
      </div>
      
      {msg && (
        <div className={`message ${msgType === 'success' ? 'message-success' : 'message-error'}`}>
          {msg}
        </div>
      )}
      
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="dashboard-card-title">Parking Slots Status</h3>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Slot #</th>
                <th>Status</th>
                <th>Vehicle</th>
                <th>Entry Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map(slot => (
                <tr key={slot.slotNumber}>
                  <td>{slot.slotNumber}</td>
                  <td>
                    <span className={`status-badge ${slot.occupied ? 'status-occupied' : 'status-available'}`}>
                      {slot.occupied ? 'Occupied' : 'Available'}
                    </span>
                  </td>
                  <td>{slot.vehicle || '-'}</td>
                  <td>{formatTime(slot.entryTime)}</td>
                  <td className="action-btns">
                    <button 
                      className="release-btn" 
                      onClick={() => handleForceRelease(slot.slotNumber)}
                    >
                      Force Release
                    </button>
                    <button 
                      className="assign-btn" 
                      onClick={() => handleAssign(slot.slotNumber)}
                    >
                      Manual Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 
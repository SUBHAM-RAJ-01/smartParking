import React, { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import UsersList from './components/UsersList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Render the active tab component
  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersList />;
      case 'dashboard':
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <span>Smart Parking</span>
          </div>
        </div>
        <div className="admin-menu">
          <a 
            href="#dashboard" 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('dashboard');
            }}
          >
            <span>Dashboard</span>
          </a>
          <a 
            href="#users" 
            className={`menu-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('users');
            }}
          >
            <span>Users</span>
          </a>
          <a href="#" className="menu-item">
            <span>Transactions</span>
          </a>
          <a href="#" className="menu-item">
            <span>Reports</span>
          </a>
          <a href="#" className="menu-item">
            <span>Settings</span>
          </a>
        </div>
      </div>
      
      <div className="admin-content">
        <div className="admin-header">
          <h2>Admin Panel - Smart Parking</h2>
        </div>
        
        {renderTabContent()}
      </div>
    </div>
  );
}

export default App; 
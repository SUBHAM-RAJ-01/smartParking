import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PaymentPage from './components/payment/PaymentPage';
import PaymentConfirmation from './components/payment/PaymentConfirmation';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [paymentData, setPaymentData] = useState(null);

  // Handle page navigation
  const navigateTo = (page) => setCurrentPage(page);

  // Initialize payment process
  const startPayment = (amount) => {
    setPaymentData({ amount });
    navigateTo('payment');
  };

  // Complete payment and show confirmation
  const completePayment = (paymentDetails) => {
    setPaymentData({ ...paymentData, ...paymentDetails });
    navigateTo('payment-confirmation');
  };

  // Main application routing
  const renderPage = () => {
    if (!user) {
      // Auth flow
      switch (currentPage) {
        case 'register':
          return <Register navigateTo={navigateTo} />;
        case 'login':
        default:
          return <Login setUser={setUser} navigateTo={navigateTo} />;
      }
    } else {
      // Logged in user flow
      switch (currentPage) {
        case 'payment':
          return (
            <PaymentPage 
              amount={paymentData?.amount} 
              onComplete={completePayment}
              onCancel={() => navigateTo('dashboard')}
            />
          );
        case 'payment-confirmation':
          return (
            <PaymentConfirmation 
              data={paymentData} 
              onFinish={() => {
                setPaymentData(null);
                navigateTo('dashboard');
              }}
            />
          );
        case 'dashboard':
        default:
          return (
            <Dashboard 
              user={user} 
              setUser={setUser}
              startPayment={startPayment}
            />
          );
      }
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <a href="#" className="logo" onClick={() => navigateTo(user ? 'dashboard' : 'login')}>
              Smart Parking
            </a>
            {user && (
              <button className="btn btn-secondary" onClick={() => setUser(null)}>
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="container">
        {renderPage()}
      </main>
    </div>
  );
}

export default App; 
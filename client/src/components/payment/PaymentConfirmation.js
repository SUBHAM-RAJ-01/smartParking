import React from 'react';
import '../../App.css';

const PaymentConfirmation = ({ data, onFinish }) => {
  // Generate a random transaction ID
  const transactionId = `TXN${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
  // Format timestamp
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };
  
  // Get payment method details
  const getPaymentDetails = () => {
    switch (data.method) {
      case 'card':
        return `Card ending with ${data.cardNumber}`;
      case 'upi':
        return `UPI ID: ${data.upiId}`;
      case 'netbanking':
        return `Net Banking (${data.bankName})`;
      default:
        return 'Payment method';
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-confirmation">
        <div className="confirmation-header">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Your wallet has been credited with ₹{data.amount}</p>
        </div>
        
        <div className="payment-details">
          <h3>Payment Details</h3>
          
          <div className="detail-row">
            <div className="detail-label">Transaction ID</div>
            <div className="detail-value">{transactionId}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Amount</div>
            <div className="detail-value">₹{data.amount}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Payment Method</div>
            <div className="detail-value">{getPaymentDetails()}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Date & Time</div>
            <div className="detail-value">{formatDate(data.timestamp)}</div>
          </div>
        </div>
        
        <div className="receipt-actions">
          <button className="btn" onClick={onFinish}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation; 
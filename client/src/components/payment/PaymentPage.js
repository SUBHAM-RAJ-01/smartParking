import React, { useState } from 'react';
import '../../App.css';

const PaymentPage = ({ amount, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    bankName: '',
    accountNumber: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!paymentMethod) newErrors.paymentMethod = 'Please select a payment method';
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (paymentMethod === 'card') {
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
      else if (!/^\d{16}$/.test(formData.cardNumber)) newErrors.cardNumber = 'Card number must be 16 digits';
      
      if (!formData.nameOnCard) newErrors.nameOnCard = 'Name is required';
      if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) newErrors.expiryDate = 'Format: MM/YY';
      
      if (!formData.cvv) newErrors.cvv = 'CVV is required';
      else if (!/^\d{3}$/.test(formData.cvv)) newErrors.cvv = 'CVV must be 3 digits';
    } else if (paymentMethod === 'upi') {
      if (!formData.upiId) newErrors.upiId = 'UPI ID is required';
      else if (!formData.upiId.includes('@')) newErrors.upiId = 'Invalid UPI ID format';
    } else if (paymentMethod === 'netbanking') {
      if (!formData.bankName) newErrors.bankName = 'Bank name is required';
      if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
    }
    
    return newErrors;
  };

  const nextStep = () => {
    if (step === 1) {
      const stepErrors = validateStep1();
      if (Object.keys(stepErrors).length === 0) {
        setStep(2);
      } else {
        setErrors(stepErrors);
      }
    } else if (step === 2) {
      const stepErrors = validateStep2();
      if (Object.keys(stepErrors).length === 0) {
        // Process payment
        onComplete({
          method: paymentMethod,
          // Include only the relevant fields based on payment method
          ...(paymentMethod === 'card' && {
            cardNumber: formData.cardNumber.slice(-4), // Last 4 digits only
            nameOnCard: formData.nameOnCard
          }),
          ...(paymentMethod === 'upi' && {
            upiId: formData.upiId
          }),
          ...(paymentMethod === 'netbanking' && {
            bankName: formData.bankName
          }),
          timestamp: new Date().toISOString()
        });
      } else {
        setErrors(stepErrors);
      }
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Payment method selection form
  const renderMethodSelection = () => (
    <div className="payment-gateway">
      <h3>Select Payment Method</h3>
      <div className="payment-method-options">
        <div 
          className={`payment-method-option ${paymentMethod === 'card' ? 'selected' : ''}`}
          onClick={() => setPaymentMethod('card')}
        >
          <div className="method-icon">💳</div>
          <div>Credit/Debit Card</div>
        </div>
        
        <div 
          className={`payment-method-option ${paymentMethod === 'upi' ? 'selected' : ''}`}
          onClick={() => setPaymentMethod('upi')}
        >
          <div className="method-icon">📱</div>
          <div>UPI</div>
        </div>
        
        <div 
          className={`payment-method-option ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
          onClick={() => setPaymentMethod('netbanking')}
        >
          <div className="method-icon">🏦</div>
          <div>Net Banking</div>
        </div>
      </div>
      
      {errors.paymentMethod && <div className="message message-error">{errors.paymentMethod}</div>}
    </div>
  );

  // Payment details form based on selected method
  const renderPaymentDetails = () => (
    <div className="payment-gateway">
      <h3>Enter Payment Details</h3>
      {paymentMethod === 'card' && (
        <div className="payment-form">
          <div className="form-group">
            <label>Card Number</label>
            <input 
              type="text" 
              name="cardNumber" 
              placeholder="1234 5678 9012 3456" 
              value={formData.cardNumber}
              onChange={handleChange}
            />
            {errors.cardNumber && <div className="form-error">{errors.cardNumber}</div>}
          </div>
          
          <div className="form-group">
            <label>Name on Card</label>
            <input 
              type="text" 
              name="nameOnCard" 
              placeholder="John Doe" 
              value={formData.nameOnCard}
              onChange={handleChange}
            />
            {errors.nameOnCard && <div className="form-error">{errors.nameOnCard}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input 
                type="text" 
                name="expiryDate" 
                placeholder="MM/YY" 
                value={formData.expiryDate}
                onChange={handleChange}
              />
              {errors.expiryDate && <div className="form-error">{errors.expiryDate}</div>}
            </div>
            
            <div className="form-group">
              <label>CVV</label>
              <input 
                type="password" 
                name="cvv" 
                placeholder="123" 
                value={formData.cvv}
                onChange={handleChange}
              />
              {errors.cvv && <div className="form-error">{errors.cvv}</div>}
            </div>
          </div>
        </div>
      )}
      
      {paymentMethod === 'upi' && (
        <div className="payment-form">
          <div className="form-group">
            <label>UPI ID</label>
            <input 
              type="text" 
              name="upiId" 
              placeholder="yourname@upi" 
              value={formData.upiId}
              onChange={handleChange}
            />
            {errors.upiId && <div className="form-error">{errors.upiId}</div>}
          </div>
        </div>
      )}
      
      {paymentMethod === 'netbanking' && (
        <div className="payment-form">
          <div className="form-group">
            <label>Bank Name</label>
            <select 
              name="bankName" 
              value={formData.bankName}
              onChange={handleChange}
            >
              <option value="">Select Bank</option>
              <option value="HDFC Bank">HDFC Bank</option>
              <option value="ICICI Bank">ICICI Bank</option>
              <option value="State Bank of India">State Bank of India</option>
              <option value="Axis Bank">Axis Bank</option>
            </select>
            {errors.bankName && <div className="form-error">{errors.bankName}</div>}
          </div>
          
          <div className="form-group">
            <label>Account Number</label>
            <input 
              type="text" 
              name="accountNumber" 
              placeholder="Your account number" 
              value={formData.accountNumber}
              onChange={handleChange}
            />
            {errors.accountNumber && <div className="form-error">{errors.accountNumber}</div>}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="payment-page">
      <div className="payment-steps">
        <div className="payment-step">
          <div className={`step-number ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step-title ${step >= 1 ? 'active' : ''}`}>Payment Method</div>
        </div>
        <div className="payment-step">
          <div className={`step-number ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step-title ${step >= 2 ? 'active' : ''}`}>Payment Details</div>
        </div>
        <div className="payment-step">
          <div className={`step-number ${step >= 3 ? 'active' : ''}`}>3</div>
          <div className={`step-title ${step >= 3 ? 'active' : ''}`}>Confirmation</div>
        </div>
      </div>
      
      <div className="payment-summary">
        <h3>Payment Summary</h3>
        <div className="summary-row">
          <div>Add Money to Wallet</div>
          <div>₹{amount}</div>
        </div>
        <div className="summary-row">
          <div>Transaction Fee</div>
          <div>₹0</div>
        </div>
        <div className="summary-row summary-total">
          <div>Total Amount</div>
          <div>₹{amount}</div>
        </div>
      </div>
      
      {step === 1 && renderMethodSelection()}
      {step === 2 && renderPaymentDetails()}
      
      <div className="payment-actions">
        {step > 1 ? (
          <button className="btn btn-secondary" onClick={prevStep}>
            Back
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        
        <button className="btn" onClick={nextStep}>
          {step === 2 ? 'Make Payment' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage; 
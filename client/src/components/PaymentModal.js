import React, { useState } from 'react';
import '../App.css';

export default function PaymentModal({ show, onClose, onAdd }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Card');
  if (!show) return null;

  const handleSubmit = e => {
    e.preventDefault();
    onAdd(Number(amount), method);
    onClose();
  };

  return (
    <div className="payment-modal">
      <h4>Add Money</h4>
      <form onSubmit={handleSubmit}>
        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required />
        <select value={method} onChange={e => setMethod(e.target.value)}>
          <option>Card</option>
          <option>UPI</option>
          <option>Netbanking</option>
        </select>
        <button type="submit">Add</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
} 
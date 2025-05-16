import React, { useEffect, useState } from 'react';
import API from '../api';
import '../App.css';

export default function Wallet({ licensePlate, startPayment }) {
  const [wallet, setWallet] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');

  const fetchWallet = async () => {
    setIsLoading(true);
    try {
      const res = await API.get(`/wallet/${licensePlate}`);
      setWallet(res.data.wallet);
      setTransactions(res.data.transactions);
    } catch (err) {
      console.error('Error fetching wallet data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [licensePlate]);

  const handleAddMoney = (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return;
    }
    
    // Start payment flow with selected amount
    startPayment(Number(amount));
    setAmount('');
  };

  const formatTransactionDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN');
  };

  return (
    <div>
      <div className="wallet-header">
        <h4 className="wallet-balance">Wallet Balance: ₹{wallet}</h4>
        <div className="wallet-actions">
          <form onSubmit={handleAddMoney} className="add-money-form">
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              required
            />
            <button type="submit" className="btn">Add Money</button>
          </form>
        </div>
      </div>
      
      <div className="transactions-container">
        <h5>Recent Transactions</h5>
        
        {isLoading ? (
          <p>Loading transactions...</p>
        ) : transactions.length > 0 ? (
          <>
            <div className="transaction-header">
              <div>Transaction</div>
              <div>Amount</div>
            </div>
            <ul className="transaction-list">
              {transactions.map(txn => (
                <li key={txn._id} className="transaction-item">
                  <div>
                    <div>{txn.method}</div>
                    <div className="transaction-date">{formatTransactionDate(txn.timestamp)}</div>
                  </div>
                  <div className={`transaction-amount ${txn.type === 'add' ? 'amount-add' : 'amount-deduct'}`}>
                    {txn.type === 'add' ? '+' : '-'}₹{txn.amount}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>No recent transactions</p>
        )}
      </div>
    </div>
  );
} 
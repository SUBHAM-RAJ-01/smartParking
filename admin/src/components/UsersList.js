import React, { useEffect, useState } from 'react';
import API from '../api';
import '../App.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users from backend
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Using the slots endpoint to get users data (we should create a users endpoint in a production app)
      const slotsRes = await API.get('/slots');
      
      // Get unique license plates from slots
      const occupiedSlots = slotsRes.data.filter(slot => slot.occupied);
      const uniqueLicensePlates = [...new Set(occupiedSlots.map(slot => slot.vehicle))];
      
      // Fetch detailed user data for each license plate
      const usersPromises = uniqueLicensePlates.map(licensePlate => 
        API.get(`/wallet/${licensePlate}`)
          .then(walletRes => ({
            licensePlate,
            wallet: walletRes.data.wallet,
            transactions: walletRes.data.transactions,
            // Mock data (would come from real user endpoint)
            name: licensePlate.startsWith('KA') ? 'Karnataka User' : 'Standard User',
            email: `${licensePlate.toLowerCase().replace(/\s/g, '')}@example.com`,
            registeredDate: new Date().toISOString().split('T')[0],
            status: 'Active'
          }))
          .catch(() => null)
      );
      
      const usersData = (await Promise.all(usersPromises)).filter(Boolean);
      setUsers(usersData);
    } catch (err) {
      setError('Failed to fetch users data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.licensePlate.toLowerCase().includes(searchLower) ||
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  // View user details
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Render modal with user details
  const renderUserDetailsModal = () => {
    if (!selectedUser || !isModalOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3 className="modal-title">User Details</h3>
            <button 
              className="close-btn" 
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="user-detail-section">
              <h4>Personal Information</h4>
              <div className="detail-row">
                <div className="detail-label">Name</div>
                <div className="detail-value">{selectedUser.name}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">License Plate</div>
                <div className="detail-value">{selectedUser.licensePlate}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Email</div>
                <div className="detail-value">{selectedUser.email}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Registered</div>
                <div className="detail-value">{selectedUser.registeredDate}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  <span className="status status-active">{selectedUser.status}</span>
                </div>
              </div>
            </div>

            <div className="user-detail-section">
              <h4>Wallet Information</h4>
              <div className="detail-row">
                <div className="detail-label">Balance</div>
                <div className="detail-value">{formatCurrency(selectedUser.wallet)}</div>
              </div>
            </div>

            <div className="user-detail-section">
              <h4>Recent Transactions</h4>
              {selectedUser.transactions && selectedUser.transactions.length > 0 ? (
                <div className="transactions-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Method</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.transactions.map((txn, idx) => (
                        <tr key={idx}>
                          <td>{new Date(txn.timestamp).toLocaleDateString()}</td>
                          <td>{txn.type === 'add' ? 'Credit' : 'Debit'}</td>
                          <td>{txn.method}</td>
                          <td className={txn.type === 'add' ? 'amount-add' : 'amount-deduct'}>
                            {txn.type === 'add' ? '+' : '-'}{formatCurrency(txn.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No recent transactions</p>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">User Management</h2>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div className="dashboard-card-title">Users List</div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name or license plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="loading">Loading users data...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>License Plate</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Wallet Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={index}>
                      <td>{user.licensePlate}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{formatCurrency(user.wallet)}</td>
                      <td>
                        <span className="status status-active">{user.status}</span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => viewUserDetails(user)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      {searchTerm ? 'No users match your search' : 'No users found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {renderUserDetailsModal()}
    </div>
  );
};

export default UsersList; 
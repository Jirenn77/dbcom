"use client";

import { useState } from 'react';
import axios from 'axios';

export default function ViewBalance() {
  const [customerID, setCustomerID] = useState('');
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null); // State for customer info
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setBalance(null);
    setHistory([]);
    setCustomerInfo(null); // Reset customer info
    setLoading(true);

    // Validate customerID
    if (!customerID || isNaN(customerID) || customerID <= 0) {
      setMessage('Please enter a valid Customer ID');
      setLoading(false);
      return;
    }

    console.log("Fetching balance for CustomerID:", customerID);

    try {
      const response = await axios.get(`http://localhost/API/getBalance.php?action=view_balance&CustomerID=${customerID}`);
      console.log('API Response:', response.data);

      if (response.data.error) {
        setMessage(response.data.error);
      } else {
        setBalance(Number(response.data.balance) || 0);
        setHistory(Array.isArray(response.data.history) ? response.data.history : []);
        
        // Set customer info (assuming response.data has customer info)
        setCustomerInfo({
          name: response.data.customerName,
          email: response.data.customerEmail,
          contact: response.data.customerContact,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error fetching balance and history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-3xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">View Balance & History</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1" htmlFor="CustomerID">Customer ID</label>
            <input
              type="number"
              value={customerID}
              onChange={(e) => setCustomerID(e.target.value)}
              required
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-4 bg-blue-600 hover:bg-blue-500 transition rounded-md"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'View Balance'}
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}

        {customerInfo && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Customer Information:</h3>
            <p>Name: {customerInfo.name}</p>
            <p>Email: {customerInfo.email}</p>
            <p>Contact: {customerInfo.contact}</p>
          </div>
        )}

        {balance !== null && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">
              Current Balance: ₱{balance !== undefined ? balance.toFixed(2) : '0.00'}
            </h3>
            <h4 className="text-md font-semibold mt-4">Transaction History:</h4>
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full mt-2 bg-gray-700 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Transaction ID</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((transaction) => (
                      <tr key={transaction.TransactionID} className="border-b border-gray-600">
                        <td className="px-4 py-2">{transaction.TransactionID}</td>
                        <td className="px-4 py-2">{transaction.TransactionType}</td>
                        <td className="px-4 py-2">₱{parseFloat(transaction.Amount).toFixed(2)}</td>
                        <td className="px-4 py-2">{new Date(transaction.TransactionDate).toLocaleString()}</td>
                        <td className="px-4 py-2">{transaction.Description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 text-center">No transaction history available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

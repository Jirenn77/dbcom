"use client"

import { useState } from 'react';
import axios from 'axios';

export default function ViewBalance() {
  const [customerID, setCustomerID] = useState('');
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost/API/getBalance.php=${customerID}`);
      setBalance(response.data.balance);
      setHistory(response.data.history);
    } catch (error) {
      setMessage('Error fetching balance and history');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
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
          >
            View Balance
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
        
        {balance !== null && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Current Balance: {balance}</h3>
            <h4 className="text-md font-semibold mt-4">Transaction History:</h4>
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
                    <td className="px-4 py-2">{transaction.Amount}</td>
                    <td className="px-4 py-2">{new Date(transaction.TransactionDate).toLocaleString()}</td>
                    <td className="px-4 py-2">{transaction.Description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

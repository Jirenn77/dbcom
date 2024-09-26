"use client"

import { useState } from 'react';
import axios from 'axios';

export default function AddTransaction() {
  const [formData, setFormData] = useState({
    CustomerID: '',
    TransactionType: 'Credit',
    Amount: '',
    Description: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost/API/getBalance.php', formData);
      setMessage(response.data.success || response.data.error);
    } catch (error) {
      setMessage('Error adding transaction');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Add Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1" htmlFor="CustomerID">Customer ID</label>
            <input 
              type="number" 
              name="CustomerID" 
              value={formData.CustomerID} 
              onChange={handleChange} 
              required 
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1" htmlFor="TransactionType">Transaction Type</label>
            <select 
              name="TransactionType" 
              value={formData.TransactionType} 
              onChange={handleChange} 
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>
          </div>
          <div>
            <label className="block mb-1" htmlFor="Amount">Amount</label>
            <input 
              type="number" 
              step="0.01" 
              name="Amount" 
              value={formData.Amount} 
              onChange={handleChange} 
              required 
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block mb-1" htmlFor="Description">Description</label>
            <input 
              type="text" 
              name="Description" 
              value={formData.Description} 
              onChange={handleChange} 
              required 
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2 mt-4 bg-blue-600 hover:bg-blue-500 transition rounded-md"
          >
            Add Transaction
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}

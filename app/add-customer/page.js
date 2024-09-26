"use client"

import { useState } from 'react';
import axios from 'axios';

export default function AddCustomer() {
  const [formData, setFormData] = useState({ CustomerName: '', Email: '', ContactDetails: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost/API/getBalance.php', formData);
      setMessage(response.data.success || response.data.error);
    } catch (error) {
      setMessage('Error adding customer');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Add Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1" htmlFor="CustomerName">Customer Name</label>
            <input 
              type="text" 
              name="CustomerName" 
              value={formData.CustomerName} 
              onChange={handleChange} 
              required 
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1" htmlFor="Email">Email</label>
            <input 
              type="email" 
              name="Email" 
              value={formData.Email} 
              onChange={handleChange} 
              required 
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block mb-1" htmlFor="ContactDetails">Contact Details</label>
            <input 
              type="text" 
              name="ContactDetails" 
              value={formData.ContactDetails} 
              onChange={handleChange} 
              required 
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2 mt-4 bg-blue-600 hover:bg-blue-500 transition rounded-md"
          >
            Add Customer
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}

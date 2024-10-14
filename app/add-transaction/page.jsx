"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import BackButton from '../components/BackButton';
import { Toaster, toast } from 'sonner';

export default function AddTransaction() {
  const [formData, setFormData] = useState({
    CustomerName: '',
    TransactionType: 'Credit',
    Amount: '',
    Description: ''
  });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost/API/getBalance.php?action=get_customers');
        console.log("Fetched Customers:", response.data);
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting Form Data:", formData);
      const response = await axios.post('http://localhost/API/getBalance.php?action=add_transaction', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Response from server:", response.data);
      if (response.data.success) {
        toast.success('Transaction added successfully!');
        resetForm();
      } else {
        toast.error(response.data.error || 'Error adding transaction. Please try again.');
      }

    } catch (error) {
      console.error('Error details:', error.response ? error.response.data : error);
      toast.error('Error adding transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      CustomerName: '',
      TransactionType: 'Credit',
      Amount: '',
      Description: ''
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-6">
      <Toaster />
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Add Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1" htmlFor="CustomerName">Customer Name</label>
            <select
              name="CustomerName"
              value={formData.CustomerName}
              onChange={handleChange}
              required
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select a customer</option>
              {Array.isArray(customers) && customers.map((customer) => (
                <option key={customer.id} value={customer.name}>{customer.name}</option>
              ))}
            </select>
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
              placeholder="Enter amount"
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
              placeholder="Enter description"
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 mt-4 ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} transition rounded-md`}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <BackButton />
        </div>
      </div>
    </div>
  );
}

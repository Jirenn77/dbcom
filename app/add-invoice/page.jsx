"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import BackButton from '../components/BackButton';
import { useRouter } from 'next/navigation'; 

export default function AddInvoice() {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ CustomerName: '', ProductID: '', Quantity: '' });
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchCustomers = async () => {
            const res = await fetch('http://localhost/API/getBalance.php?action=get_customers');
            const data = await res.json();
            setCustomers(data);
        };

        const fetchProducts = async () => {
            const res = await fetch('http://localhost/API/getBalance.php?action=get_products');
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]); // or handle the error appropriately
            }
        };



        fetchCustomers();
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost/API/getBalance.php?action=add_invoice', {
                CustomerName: formData.CustomerName,
                ProductID: parseInt(formData.ProductID),
                Quantity: parseInt(formData.Quantity),
            }, {
                headers: { 'Content-Type': 'application/json' },
            });

            setMessage(response.data.success || response.data.error);
            setIsSuccess(response.data.success);

            if (response.data.success) {
                toast.success('Invoice added successfully!');
                setFormData({ CustomerName: '', ProductID: '', Quantity: '' });
                setTimeout(() => {
                    router.push('/'); // Redirect after successful addition
                }, 2000);
            }

        } catch (error) {
            setMessage('Error adding invoice');
            console.error('Error details:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-6">
            <Toaster />
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Add Invoice</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1" htmlFor="CustomerName">Customer</label>
                        <select
                            name="CustomerName"
                            value={formData.CustomerName}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a customer</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.name}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1" htmlFor="ProductID">Product</label>
                        <select
                            name="ProductID"
                            value={formData.ProductID}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a product</option>
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <option key={product.ProductID} value={product.ProductID}>
                                        {product.ProductName}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No products available</option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1" htmlFor="Quantity">Quantity</label>
                        <input
                            type="number"
                            name="Quantity"
                            value={formData.Quantity}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter Quantity"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 mt-4 bg-blue-600 hover:bg-blue-500 transition rounded-md shadow-md"
                    >
                        Add Invoice
                    </button>
                </form>
                {message && (
                    <p className={`mt-4 text-center ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                        {message}
                    </p>
                )}
                <div className="mt-6 text-center">
                    <BackButton />
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import axios from 'axios';
import { Toaster, toast } from 'sonner';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer'); // Default role
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => { 
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost/API/getBalance.php?action=register', new URLSearchParams({
                email,
                password,
                role,
            }));

            if (res.data.success) {
                toast.success('Registration successful! You can now log in.');
                router.push('/'); 
            } else {
                setError(res.data.error || 'Registration failed');
                toast.error('Registration failed. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
            toast.error('An error occurred. Please try again.');
        }
    };  

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-6">
            <Toaster />
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="role">Role</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="customer">Customer</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 transition rounded-md py-2">
                        Register
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <button onClick={() => router.push('/')} className="text-blue-400 hover:underline">
                        Already have an account? Login
                    </button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import BackButton from '../components/BackButton'; // Import the BackButton

export default function PaymentHistory({ customerID }) {
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const fetchPayments = async () => {
            const testCustomerID = 1; // Hardcoded for testing
            try {
                const res = await axios.get(`http://localhost/API/cust.php?action=get_payment_history&CustomerID=${testCustomerID}`);
                if (res.data.success) {
                    setPayments(res.data.payments);
                }            
            } catch (error) {
                console.error("Error fetching payment history:", error);
            }
        };
        fetchPayments();
    }, []);    

    return (
        <div className="p-6 bg-gray-900 text-white">
            <h1 className="text-3xl mb-6 text-center font-bold">Payment History</h1>
            {payments.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {payments.map(payment => (
                        <div key={payment.PaymentID} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
                            <p className="font-semibold">Payment ID: <span className="font-normal">{payment.PaymentID}</span></p>
                            <p className="font-semibold">Invoice ID: <span className="font-normal">{payment.InvoiceID}</span></p>
                            <p className="font-semibold">Amount: <span className="font-normal">₱{parseFloat(payment.Amount).toFixed(2)}</span></p>
                            <p className="font-semibold">Date: <span className="font-normal">{new Date(payment.PaymentDate).toLocaleString()}</span></p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center">No payment history found.</p>
            )}
            <div className="mt-6">
                <BackButton /> {/* Add the BackButton here */}
            </div>
        </div>
    );
}

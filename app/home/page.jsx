"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Toaster, toast } from 'sonner';

const navLinks = [
    { href: "/add-transaction", label: "Add Transaction", icon: "💳" },
    { href: "/view-invoice", label: "View Invoices", icon: "🧾" },
    { href: "/mark-invoice-paid", label: "Mark Paid", icon: "✅" },
    { href: "/get-aging-report", label: "Aging Report", icon: "📊" },
    { href: "/send-payment-reminders", label: "Reminders", icon: "🔔" },
    { href: "/view-balance", label: "Balance & History", icon: "💰" },
];

export default function Dashboard() {
    const [totalInvoices, setTotalInvoices] = useState(0);
    const [paidInvoices, setPaidInvoices] = useState(0);
    const [overdueInvoicesAmount, setOverdueInvoicesAmount] = useState(0); // Initialize as 0

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await fetch('http://localhost/API/getBalance.php?action=get_invoices');
                const data = await res.json();

                // Check if 'invoices' is in the data response
                const { invoices, totalInvoices } = data;

                // Calculate total and paid invoices
                const paid = invoices.filter(invoice => invoice.PaymentStatus === 'Paid').length;

                setTotalInvoices(totalInvoices);
                setPaidInvoices(paid);
            } catch (error) {
                toast.error('Error fetching invoices.');
                console.error('Error fetching invoices:', error);
            }
        };

        const fetchAgingReport = async () => {
            try {
                const res = await fetch('http://localhost/API/getBalance.php?action=get_aging_report');
                const agingData = await res.json();

                // Calculate total overdue amount based on aging report
                const totalOverdueAmount = agingData.reduce((sum, customer) => sum + (Number(customer.TotalAmountDue) || 0), 0);
                setOverdueInvoicesAmount(totalOverdueAmount);
            } catch (error) {
                toast.error('Error fetching aging report.');
                console.error('Error fetching aging report:', error);
            }
        };

        fetchInvoices();
        fetchAgingReport();
    }, []);

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <Toaster />
            
            {/* Sidebar */}
            <nav className="w-64 bg-gray-800 p-4 flex flex-col items-center space-y-6">
                <h1 className="text-2xl font-bold mb-4 text-blue-400">Accounts Receivable</h1>
                {navLinks.map(link => (
                    <Link href={link.href} key={link.href} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 w-full text-center">
                        <span className="text-2xl">{link.icon}</span>
                        <span className="font-semibold">{link.label}</span>
                    </Link>
                ))}
                {/* Logout Button */}
                <Link href="/" className="mt-auto flex items-center bg-red-600 p-2 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                    <span className="text-2xl mr-2">🚪</span>
                    <span className="font-semibold">Logout</span>
                </Link>
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-10 flex flex-col justify-center items-center">
                <h2 className="text-4xl font-bold text-blue-400 mb-8">Welcome Admin</h2>
                <p className="text-lg text-gray-300 text-center max-w-xl">
                    Use the navigation on the left to manage transactions, view invoices, send payment reminders, and analyze account data.
                </p>

                {/* Display Invoice Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full max-w-5xl">
                    <div className="p-6 bg-blue-600 rounded-lg shadow-lg text-center">
                        <h3 className="text-xl font-semibold">Total Invoices</h3>
                        <p className="text-3xl mt-4">{totalInvoices}</p>
                    </div>
                    <div className="p-6 bg-green-600 rounded-lg shadow-lg text-center">
                        <h3 className="text-xl font-semibold">Paid Invoices</h3>
                        <p className="text-3xl mt-4">{paidInvoices}</p>
                    </div>
                    <div className="p-6 bg-yellow-600 rounded-lg shadow-lg text-center">
                        <h3 className="text-xl font-semibold">Overdue Invoices (₱)</h3>
                        <p className="text-3xl mt-4">
                            ₱{!isNaN(overdueInvoicesAmount) ? overdueInvoicesAmount.toFixed(2) : "0.00"}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

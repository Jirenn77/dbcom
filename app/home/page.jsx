import Link from 'next/link';

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-6">
            <h1 className="text-4xl font-bold mb-6 text-blue-400 text-center">Accounts Receivable System</h1>
            <nav className="w-full max-w-md">
                <ul className="list-none p-0 space-y-4">
                    {[
                        { href: "/add-customer", label: "➕ Add Customer", bgColor: "bg-blue-600", hoverColor: "hover:bg-blue-500" },
                        { href: "/add-transaction", label: "💳 Add Transaction", bgColor: "bg-green-600", hoverColor: "hover:bg-green-500" },
                        { href: "/add-product", label: "📦 Add Product", bgColor: "bg-orange-600", hoverColor: "hover:bg-orange-500" },
                        { href: "/get-invoices", label: "🧾 View Invoices", bgColor: "bg-blue-600", hoverColor: "hover:bg-blue-500" },
                        { href: "/mark-invoice-paid", label: "✅ Mark Invoice as Paid", bgColor: "bg-green-600", hoverColor: "hover:bg-green-500" },
                        { href: "/get-aging-report", label: "📊 View Aging Report", bgColor: "bg-yellow-600", hoverColor: "hover:bg-yellow-500" },
                        { href: "/send-payment-reminders", label: "🔔 Send Payment Reminders", bgColor: "bg-orange-600", hoverColor: "hover:bg-orange-500" },
                        { href: "/view-balance", label: "💰 View Balance & History", bgColor: "bg-purple-600", hoverColor: "hover:bg-purple-500" },
                    ].map(item => (
                        <li key={item.href}>
                            <Link href={item.href} className={`block text-center text-lg text-white ${item.bgColor} ${item.hoverColor} transition rounded-md py-3 shadow-md`}>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

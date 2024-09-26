import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Accounts Receivable System</h1>
        <ul className="space-y-4">
          <li>
            <Link href="/add-customer" className="block text-center text-lg bg-blue-600 hover:bg-blue-500 transition rounded-md py-2">
              Add Customer
            </Link>
          </li>
          <li>
            <Link href="/add-transaction" className="block text-center text-lg bg-green-600 hover:bg-green-500 transition rounded-md py-2">
              Add Transaction
            </Link>
          </li>
          <li>
            <Link href="/view-balance" className="block text-center text-lg bg-purple-600 hover:bg-purple-500 transition rounded-md py-2">
              View Balance & History
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

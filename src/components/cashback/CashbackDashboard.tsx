'use client';

import { useState, useEffect, useCallback } from 'react';

interface CashbackData {
  user: {
    name: string;
    email: string;
    total_cashback_earned: number;
    total_cashback_withdrawn: number;
    total_cashback_pending: number;
    referral_code: string;
  };
  transactions: Array<{
    id: string;
    order_amount: number;
    cashback_amount: number;
    cashback_rate: number;
    status: string;
    purchased_at: string;
    stores: { name: string; logo_url: string };
    coupons?: { title: string };
  }>;
  payouts: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    requested_at: string;
  }>;
  availableBalance: number;
}

interface CashbackDashboardProps {
  userId: string;
}

export default function CashbackDashboard({ userId }: CashbackDashboardProps) {
  const [data, setData] = useState<CashbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('paypal');

  const fetchCashbackData = useCallback(async () => {
    try {
      const response = await fetch(`/api/cashback/user/${userId}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch cashback data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCashbackData();
  }, [fetchCashbackData]);

  const handlePayoutRequest = async () => {
    try {
      const response = await fetch(`/api/cashback/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_payout',
          amount: parseFloat(payoutAmount),
          method: payoutMethod,
          paymentDetails: { method: payoutMethod }
        })
      });

      if (response.ok) {
        setShowPayoutModal(false);
        setPayoutAmount('');
        fetchCashbackData();
      }
    } catch (error) {
      console.error('Failed to request payout:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-32 bg-gray-200 rounded mb-6"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!data) return <div>Loading failed</div>;

  const statusColors = {
    pending: 'text-yellow-600 bg-yellow-100',
    confirmed: 'text-green-600 bg-green-100',
    paid: 'text-blue-600 bg-blue-100',
    rejected: 'text-red-600 bg-red-100'
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cashback Account</h1>
      
      {/* Cashback Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Cashback</h3>
          <p className="text-2xl font-bold text-purple-600">
            ${data.user.total_cashback_earned.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Available Balance</h3>
          <p className="text-2xl font-bold text-green-600">
            ${data.availableBalance.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">
            ${data.user.total_cashback_pending.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Withdrawn</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${data.user.total_cashback_withdrawn.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Payout Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowPayoutModal(true)}
          disabled={data.availableBalance < 10}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
        >
          Request Withdrawal (Min $10)
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
        </div>
        <div className="divide-y">
          {data.transactions.map((transaction) => (
            <div key={transaction.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src={transaction.stores.logo_url} 
                  alt={transaction.stores.name}
                  className="w-10 h-10 rounded-lg mr-4"
                />
                <div>
                  <p className="font-medium">{transaction.stores.name}</p>
                  <p className="text-sm text-gray-500">
                    Order Amount: ${transaction.order_amount.toFixed(2)}
                  </p>
                  {transaction.coupons && (
                    <p className="text-sm text-gray-400">{transaction.coupons.title}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  +${transaction.cashback_amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {transaction.cashback_rate}% Cashback
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${statusColors[transaction.status as keyof typeof statusColors]}`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Withdrawal History</h2>
        </div>
        <div className="divide-y">
          {data.payouts.map((payout) => (
            <div key={payout.id} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium">${payout.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  {new Date(payout.requested_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">{payout.method}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${statusColors[payout.status as keyof typeof statusColors]}`}>
                  {payout.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Request Withdrawal</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Withdrawal Amount</label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter withdrawal amount"
                min="10"
                max={data.availableBalance}
              />
              <p className="text-sm text-gray-500 mt-1">
                Available Balance: ${data.availableBalance.toFixed(2)}
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Withdrawal Method</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="gift_card">Gift Card</option>
              </select>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handlePayoutRequest}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
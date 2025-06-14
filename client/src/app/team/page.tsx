'use client';

import { useEffect, useState } from 'react';
import { BinaryTree } from '@/components/team/BinaryTree';

export default function TeamPage() {
  const [binaryData, setBinaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBinaryData = async () => {
    try {
      const response = await fetch('/api/binary-business/me');
      const data = await response.json();
      setBinaryData(data);
    } catch (error) {
      console.error('Error fetching binary tree data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBinaryData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Team Structure</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <BinaryTree data={binaryData} isLoading={loading} />
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Binary System Information</h2>
          <p className="mb-4">
            Your binary organization consists of a left team and a right team. Each time you refer someone,
            you can place them on either your left or right side.
          </p>
          <p className="mb-4">
            <strong>How Binary Income Works:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>For your first binary match, the system uses a 2:1 or 1:2 ratio (two members on one side match with one member on the other side).</li>
            <li>For all subsequent matches, the system uses a 1:1 ratio (one member on each side creates a match).</li>
            <li>You earn 5% commission on the weaker leg's business volume for each match.</li>
            <li>Unmatched business volume is carried forward for future matching.</li>
          </ul>
          <p>
            <strong>Note:</strong> All referrals made by your team members also count toward your binary structure, 
            helping you build a stronger organization and earn more.
          </p>
        </div>
      </div>
    </div>
  );
}
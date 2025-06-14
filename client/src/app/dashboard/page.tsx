'use client';

import { useEffect, useState } from 'react';
import { Package } from '@shared/schema';
import { PackageInfo } from '@/components/dashboard/PackageInfo';
import { ReferralStats } from '@/components/dashboard/ReferralStats';
import { LevelStatistics } from '@/components/dashboard/LevelStatistics';
import { BinaryTree } from '@/components/team/BinaryTree';

export default function DashboardPage() {
  const [userPackage, setUserPackage] = useState<Package | null>(null);
  const [binaryData, setBinaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserPackage = async () => {
    try {
      const response = await fetch('/api/user/package');
      const data = await response.json();
      setUserPackage(data);
    } catch (error) {
      console.error('Error fetching user package:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBinaryData = async () => {
    try {
      const response = await fetch('/api/binary-business/me');
      const data = await response.json();
      setBinaryData(data);
    } catch (error) {
      console.error('Error fetching binary tree data:', error);
    }
  };

  useEffect(() => {
    fetchUserPackage();
    fetchBinaryData();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!userPackage) {
    return <div className="container mx-auto p-6">No package found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PackageInfo userPackage={userPackage} />
        <ReferralStats userPackage={userPackage} />
        
        <div className="md:col-span-2 mt-4">
          <BinaryTree data={binaryData} isLoading={loading} compact={true} />
        </div>
        
        <div className="md:col-span-2">
          <LevelStatistics userPackage={userPackage} onReset={fetchUserPackage} />
        </div>
      </div>
    </div>
  );
} 
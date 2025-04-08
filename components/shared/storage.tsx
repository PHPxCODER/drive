'use client';

import React, { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { byteConverter } from '@/lib/utils';
import { useSubscription } from '@/hooks/use-subscribtion';
import axios from 'axios';

interface StorageProps {
  totalSize: number;
}

const Storage = ({ totalSize }: StorageProps) => {
  const { subscription, totalStorage, setTotalStorage, setIsLoading, setSubscription } = useSubscription();

  useEffect(() => {
    const fetchStorageInfo = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/storage');
        
        setTotalStorage(response.data.storageUsed);
        if (response.data.subscription) {
          // Only update if the API returns a subscription value
          // This ensures we don't overwrite the subscription if the API doesn't provide it
          setSubscription(response.data.subscription);
        }
      } catch (error) {
        console.error('Failed to fetch storage info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorageInfo();
  }, [setTotalStorage, setIsLoading, totalSize]);

  // Calculate storage limit based on subscription
  const storageLimit = subscription === 'Basic' ? 1.5 * 1024 * 1024 * 1024 : 15 * 1024 * 1024 * 1024;
  const percentUsed = (totalStorage / storageLimit) * 100;

  return (
    <div className="mt-4">
      <div className="flex items-end space-x-1">
        <div className="text-4xl">{byteConverter(totalStorage, 1)}</div>
        <div className="opacity-75">
          of {subscription === 'Basic' ? '1.5 GB' : '15 GB'} used
        </div>
      </div>

      <Progress className="mt-4" value={percentUsed} />
    </div>
  );
};

export default Storage;
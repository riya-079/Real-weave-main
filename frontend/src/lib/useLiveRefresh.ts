import { useEffect } from 'react';
import { connectLiveUpdates } from '@/lib/live';

export function useLiveRefresh(onRefresh: () => void): void {
  useEffect(() => {
    const disconnect = connectLiveUpdates((message) => {
      if (message.type === 'refresh') {
        onRefresh();
      }
    });

    return disconnect;
  }, [onRefresh]);
}

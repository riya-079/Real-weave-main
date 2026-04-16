import { useEffect } from 'react';
import { connectLiveUpdates } from '@/lib/live';

export function useLiveRefresh(
  onRefresh: () => void, 
  onTelemetry?: (signals: any[]) => void, 
  onIntelligence?: (event: any) => void,
  onWhisper?: (signal: any) => void
): void {
  useEffect(() => {
    const disconnect = connectLiveUpdates((message) => {
      if (message.type === 'refresh') {
        onRefresh();
      } else if (message.type === 'telemetry' && onTelemetry) {
        onTelemetry(message.signals || []);
      } else if (message.type === 'intelligence' && onIntelligence) {
        onIntelligence(message.event);
      } else if (message.type === 'whisper' && onWhisper) {
        onWhisper(message.signal);
      }
    });

    return disconnect;
  }, [onRefresh, onTelemetry, onIntelligence, onWhisper]);
}

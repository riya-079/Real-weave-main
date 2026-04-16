type LiveMessage = {
  type: string;
  topic?: string;
  action?: string;
  entity_id?: string;
  signals?: any[];
  event?: any;
  signal?: any;
  at?: string;
};

function getLiveSocketUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  if (apiBase.startsWith('https://')) {
    return `${apiBase.replace('https://', 'wss://')}/ws/live`;
  }
  return `${apiBase.replace('http://', 'ws://')}/ws/live`;
}

export function connectLiveUpdates(onMessage: (message: LiveMessage) => void): () => void {
  let socket: WebSocket | null = null;
  let reconnectTimer: number | null = null;
  let closedManually = false;

  const connect = () => {
    const url = getLiveSocketUrl();
    console.log(`[WebSocket] Connecting to ${url}...`);
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('[WebSocket] Connection established');
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as LiveMessage;
        onMessage(payload);
      } catch {
        // Ignore malformed live messages.
      }
    };

    socket.onclose = (event) => {
      if (!closedManually) {
        console.warn(`[WebSocket] Connection closed (code: ${event.code}). Reconnecting in 2s...`);
        reconnectTimer = window.setTimeout(connect, 2000);
      } else {
        console.log('[WebSocket] Connection closed manually');
      }
    };

    socket.onerror = (err) => {
      console.error('[WebSocket] Error detected:', err);
      socket?.close();
    };
  };

  connect();

  return () => {
    closedManually = true;
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
    }
    socket?.close();
  };
}

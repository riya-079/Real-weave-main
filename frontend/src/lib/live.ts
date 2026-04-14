type LiveMessage = {
  type: string;
  topic?: string;
  action?: string;
  entity_id?: string;
  at?: string;
};

function getLiveSocketUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
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
    socket = new WebSocket(getLiveSocketUrl());

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as LiveMessage;
        onMessage(payload);
      } catch {
        // Ignore malformed live messages.
      }
    };

    socket.onclose = () => {
      if (!closedManually) {
        reconnectTimer = window.setTimeout(connect, 1500);
      }
    };

    socket.onerror = () => {
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

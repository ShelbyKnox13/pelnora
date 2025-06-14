// WebSocket connection handler
let socket: WebSocket | null = null;

export function setupWebSocket(token: string) {
  // Close existing connection if any
  if (socket) {
    socket.close();
  }

  // Use a fixed port for WebSocket connection
  // Make sure we're using the correct port (5051)
  const wsPort = 5051;
  const wsUrl = `ws://localhost:5051/ws?token=${token}`;
  
  try {
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (socket?.readyState === WebSocket.CLOSED) {
          setupWebSocket(token);
        }
      }, 5000);
    };
    
    return socket;
  } catch (error) {
    console.error('Error setting up WebSocket:', error);
    return null;
  }
}

export function closeWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

export function sendWebSocketMessage(message: string) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    return true;
  }
  return false;
}
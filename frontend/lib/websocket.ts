export function createWebSocketClient(url: string): WebSocket {
  return new WebSocket(url);
}

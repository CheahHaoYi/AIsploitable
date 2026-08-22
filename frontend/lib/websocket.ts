export type EventCallback = (eventType: string, data: any) => void;

export class InvestigationWebSocket {
  private ws: WebSocket | null = null;
  private id: string;
  private onEvent: EventCallback;
  private reconnectAttempts = 0;
  private isClosedManually = false;

  constructor(id: string, onEvent: EventCallback) {
    this.id = id;
    this.onEvent = onEvent;
    this.connect();
  }

  private connect() {
    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Connect directly to backend port 8000 for web socket streaming
    const host = window.location.hostname || '127.0.0.1';
    const wsUrl = `${protocol}//${host}:8000/ws/${this.id}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        console.log(`[WS Connected] Investigation stream ${this.id}`);
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type) {
            this.onEvent(payload.type, payload.data);
          }
        } catch (e) {
          console.error('[WS Parse Error]', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[WS Error]', err);
      };

      this.ws.onclose = () => {
        if (!this.isClosedManually && this.reconnectAttempts < 5) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
        }
      };
    } catch (e) {
      console.error('[WS Connection Exception]', e);
    }
  }

  public close() {
    this.isClosedManually = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

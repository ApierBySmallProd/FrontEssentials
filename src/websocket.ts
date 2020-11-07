import EventHandler from '@smallprod/eventhandler';

export default class WSocket extends EventHandler {
  private socket: WebSocket;
  private address: string;
  private connected = false;
  constructor(address: string) {
    super(true);
    this.address = address;
    this.connect();
  }

  public emit = (type: string, data: any, callback?: (data: any) => void) => {
    try {
      if (this.socket.OPEN) {
        if (callback) {
          this.on(`response_${type}`, callback);
        }
        this.socket.send(JSON.stringify({ type, data }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  private emitEvent = (type: string, data: any) => {
    const ev = this.events.find((e) => e.type === type);
    if (ev) {
      ev.func.forEach((f) => {
        try {
          f(data);
        } catch (err) {
          console.log(err);
        }
      });
    }
  };

  private onMessage = (event: MessageEvent) => {
    try {
      const parsed = JSON.parse(event.data);
      if (parsed.type) {
        this.emitEvent(parsed.type, parsed.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  private onConnected = (event) => {
    if (this.connected) {
      this.emitEvent('reconnect', event);
    } else {
      this.connected = true;
      this.emitEvent('connect', event);
    }
  };

  private onError = (event) => {
    this.emitEvent('error', event);
    setTimeout(this.reconnect, 5000);
  };

  private onClose = (event) => {
    this.emitEvent('close', event);
    setTimeout(this.reconnect, 5000);
  };

  private connect = () => {
    this.socket = new WebSocket(this.address);
    this.socket.onopen = this.onConnected;
    this.socket.onmessage = this.onMessage;
    this.socket.onerror = this.onError;
    this.socket.onclose = this.onClose;
  };

  private reconnect = () => {
    this.connect();
  };
}

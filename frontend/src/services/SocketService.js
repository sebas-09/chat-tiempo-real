import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

/** Una instancia por montaje evita compartir conexiones entre efectos de React. */
export default class SocketService {
  constructor() {
    this.client = null;
    this.accepted = false;
  }

  connect(username, callbacks = {}) {
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(process.env.REACT_APP_WEBSOCKET_URL || "http://localhost:8089/ws"),
      reconnectDelay: 0,
      connectionTimeout: 10000,
      debug: () => {},
    });
    this.client = client;
    const fail = (message) => {
      this.accepted = false;
      callbacks.onError?.(message);
    };
    client.onConnect = () => {
      if (this.client !== client) {
        void client.deactivate();
        return;
      }
      client.subscribe("/user/queue/registration", (frame) => {
        const registration = JSON.parse(frame.body);
        if (!registration.accepted) {
          fail(registration.error);
          this.client = null;
          void client.deactivate();
          return;
        }
        this.accepted = true;
        callbacks.onConnect?.();
        client.publish({ destination: "/app/request-users", body: "" });
      });
      client.subscribe("/topic/messages", (frame) =>
        callbacks.onMessage?.(JSON.parse(frame.body)),
      );
      client.subscribe("/topic/users", (frame) =>
        callbacks.onActiveUsersUpdated?.(JSON.parse(frame.body)),
      );
      client.subscribe("/topic/disconnected-users", (frame) =>
        callbacks.onDisconnectedUser?.(JSON.parse(frame.body).username),
      );
      // El nombre es texto plano; los mensajes del chat usan JSON.
      client.publish({ destination: "/app/connect", body: username });
    };
    client.onStompError = () => fail("El servidor rechazó la conexión.");
    client.onWebSocketError = () => fail("No se pudo conectar con el servidor.");
    client.onWebSocketClose = () => {
      if (this.client === client) fail("Conexión cerrada. Vuelve a ingresar.");
    };
    client.activate();
  }

  sendMessage(destination, payload) {
    if (!this.client?.connected || !this.accepted) return false;
    this.client.publish({ destination, body: JSON.stringify(payload) });
    return true;
  }

  disconnect() {
    const client = this.client;
    this.client = null;
    this.accepted = false;
    if (client?.connected) {
      client.publish({ destination: "/app/disconnect", body: "" });
    }
    if (client) void client.deactivate();
  }
}

import React, { useState, useEffect } from "react";
import SocketService from "../services/SocketService";
import { useRef } from "react";
import UserList from "./UserList";
import MessagePanel from "./MessagePanel";
import { Button } from "react-bootstrap";

const Chat = ({ username, onDisconnect }) => {
  const connectionRef = useRef(null);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [disconnectedUsers, setDisconnectedUsers] = useState([]); // Usuarios desconectados
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]); // Usuarios conectados

  useEffect(() => {
    const connection = new SocketService();
    connectionRef.current = connection;
    connection.connect(username, {
      onError: (message) => { setIsConnected(false); setError(message); },
      onConnect: () => setIsConnected(true),
      onMessage: (message) => setMessages((prev) => [...prev, message]),
      onActiveUsersUpdated: (activeUsers) => {
        setUsers(activeUsers); // Reemplazar en lugar de fusionar para evitar duplicados
      },
      onDisconnectedUser: (user) => {
        setDisconnectedUsers((prev) => [...prev, user]);
        setUsers((prevUsers) => prevUsers.filter((u) => u !== user)); // Remover de conectados
      },
    });

    return () => {
      connectionRef.current = null;
      connection.disconnect();
    };
  }, [username]);

  const sendMessage = (message) => {
    if (isConnected && message.trim()) {
      connectionRef.current?.sendMessage("/app/message", { user: username, message });
    } else {
      console.error("No se puede enviar el mensaje. WebSocket no está conectado o el mensaje está vacío.");
    }
  };

  return (
    <div className="container mt-4">
      {error ? <p role="alert">{error}</p> : null}
      <div className="row">
        {/* Columna izquierda: Usuarios conectados */}
        <div className="col-md-4">
          <UserList users={users} disconnectedUsers={disconnectedUsers} />
        </div>

        {/* Columna derecha: Chat */}
        <div className="col-md-8">
          <div className="chat-header mb-2">
            <h5>Chat - <strong>{username}</strong></h5>
            <Button variant="danger" size="sm" onClick={onDisconnect}>
              Disconnect
            </Button>
          </div>
          <MessagePanel disabled={!isConnected} messages={messages} onSendMessage={sendMessage} username={username} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
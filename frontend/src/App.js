import React, { useState } from "react";
import Chat from "./components/Chat";
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';


const App = () => {
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    if (username.trim() && username.length <= 16) {
      setUsername(username.trim());
      setIsConnected(true);
    } else {
      alert("Por favor, ingresa un nombre válido (máximo 16 caracteres).");
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setUsername("");
  };

  if (!isConnected) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card shadow-lg p-4 text-center" style={{ maxWidth: "400px" }}>
          <h3 className="mb-3">Bienvenido al Chat</h3>
          <input
            type="text"
            placeholder="Ingresa tu nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control mb-3"
          />
          <button className="btn btn-primary btn-block" onClick={handleConnect}>
            Conectar
          </button>
        </div>
      </div>
    );
  }

  return <Chat username={username} onDisconnect={handleDisconnect} />;
};

export default App;
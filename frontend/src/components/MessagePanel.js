import React, { useState } from "react";

const MessagePanel = ({ messages, onSendMessage, username, disabled = false }) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="chat-container">
      {/* Cuerpo del chat */}
      <div className="chat-body">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.user === username ? "own-message" : "other-message"
            }`}
          >
            <div className="message-bubble">
              <strong className="message-user">{msg.user}</strong>
              <p className="message-text">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Campo de entrada de mensajes */}
      <div className="chat-footer">
        <input
          disabled={disabled}
          maxLength={2000}
          type="text"
          className="message-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button disabled={disabled || !newMessage.trim()} aria-label="Enviar mensaje" className="send-button" onClick={handleSendMessage}>
          📩
        </button>
      </div>
    </div>
  );
};

export default MessagePanel;

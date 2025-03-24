import React from "react";
import "./ChatComponent.css";

const ChatComponent = ({ message, sender, timestamp, isSentByUser }) => {
  return (
    <div className={`message ${isSentByUser ? "sent-message" : "received-message"}`}>
      <div className="message-content">
        <span className="message-text">{message}</span>
        <span className="message-timestamp">{timestamp}</span>
      </div>
    </div>
  );
};

export default ChatComponent;

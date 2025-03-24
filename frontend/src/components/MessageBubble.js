import React from "react";
import "./MessageBubble.css";

const MessageBubble = ({ message }) => {
  return (
    <div className={`message-bubble ${message.isSent ? "sent" : "received"}`}>
      <p>{message.text}</p>
    </div>
  );
};

export default MessageBubble;

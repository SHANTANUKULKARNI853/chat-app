// frontend/src/components/Chat.js
import React, { useState } from "react";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (message) {
      setMessages((prev) => [...prev, message]);
      setMessage("");
    }
  };

  return (
    <div>
      <h3>Chat Room</h3>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default Chat;

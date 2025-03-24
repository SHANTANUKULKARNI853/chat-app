import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import io from "socket.io-client";
import "./ChatWindow.css";
import ChatComponent from "./ChatComponent";
import "./ChatComponent.css";


const ChatWindow = ({ username, selectedChat }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize socket connection once
  useEffect(() => {
    if (!username) return;
  
    // Establish socket connection only once
    socketRef.current = io("http://localhost:5000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  
    console.log("Socket connection established");
  
    // Handle received messages
    socketRef.current.on("receiveMessage", (messageData) => {
      console.log("Message received on frontend:", messageData);
      setChatHistory((prev) => [...prev, messageData]);
    });
  
    // Handle user status updates globally
    socketRef.current.on("userStatusChange", (statusData) => {
      console.log("Status update received:", statusData);
      if (selectedChat && selectedChat.username === statusData.username) {
        setSelectedChat((prev) => ({
          ...prev,
          isOnline: statusData.isOnline,
        }));
      }
    });
  
    // Handle socket errors and disconnections
    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });
  
    socketRef.current.on("disconnect", () => {
      console.warn("Socket disconnected");
    });
  
    socketRef.current.on("reconnect", (attempt) => {
      console.log(`Socket reconnected after ${attempt} attempts`);
    });
  
    return () => {
      socketRef.current.disconnect();
      console.log("Socket disconnected");
    };
  }, [username]);
  
  // Join room when selected chat changes
  useEffect(() => {
    if (!username || !selectedChat?.username || username === selectedChat.username) return;
  
    const roomName = [username, selectedChat.username].sort().join("-");
    console.log(`Joining room: ${roomName}`);
    socketRef.current.emit("joinRoom", roomName);
  
    // Clear previous chat history when switching rooms
    setChatHistory([]);
  
    return () => {
      console.log("Leaving room:", roomName);
      socketRef.current.emit("leaveRoom", roomName);
    };
  }, [username, selectedChat]);
  
  

  // Scroll to bottom when a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Send message to the server
  const handleSendMessage = (msg) => {
    const trimmedMessage = msg.trim();
    if (trimmedMessage && selectedChat) {
      const newMessage = {
        recipient: selectedChat.username,
        text: trimmedMessage,
        sender: username,
        timestamp: new Date().toLocaleTimeString(),
      };

      console.log("Sending message:", newMessage);
      setMessage("");

      // Emit message to the server with room name
      const roomName = [username, selectedChat.username].sort().join("-");
      socketRef.current.emit("sendMessage", { ...newMessage, roomName }, (ack) => {
        if (ack.status === "ok") {
          console.log("Message sent successfully!");
        } else {
          console.error("Message send failed:", ack.error);
        }
      });
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="avatar">
            {selectedChat?.username[0]?.toUpperCase()}
          </div>
          <div className="chat-details">
            <span className="chat-username">{selectedChat?.username}</span>
            {/* <span
              className={`chat-status ${
                selectedChat?.isOnline ? "online" : "offline"
              }`}
            >
              {selectedChat?.isOnline ? "Online" : "Offline"}
            </span> */}
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {chatHistory.map((chat, index) => (
          <ChatComponent
            key={index}
            message={chat.text}
            sender={chat.sender}
            timestamp={chat.timestamp}
            isSentByUser={chat.sender === username}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <input
          type="text"
          placeholder="Type a message..."
          className="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage(message)}
        />
        <button className="send-btn" onClick={() => handleSendMessage(message)}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send } from "lucide-react";
import axios from "axios";
import io from "socket.io-client";
import "./HomePage.css";

const HomePage = () => {
  const [contacts, setContacts] = useState([]); // State for contacts
  const [selectedChat, setSelectedChat] = useState(null); // State for selected chat (contact)
  const [message, setMessage] = useState(""); // State for the current message input
  const [chatHistory, setChatHistory] = useState([]); // State for chat history with selected contact
  const [username, setUsername] = useState(""); // State for logged-in username (this should stay constant)
  const socketRef = useRef(null); // Socket reference
  const messagesEndRef = useRef(null); // Scroll to the latest message


  // Utility function to send messages
  const sendMessage = (msg, roomName) => {
    const trimmedMessage = msg.trim();
    if (trimmedMessage && selectedChat) {
      const newMessage = {
        recipient: selectedChat.username,
        text: trimmedMessage,
        sender: username,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessage("");

      socketRef.current.emit(
        "sendMessage",
        { ...newMessage, roomName },
        (ack) => {
          if (ack.status === "ok") {
            console.log("Message sent successfully!");
          } else {
            console.error("Message send failed:", ack.error);
          }
        }
      );
    } else {
      console.log("Empty message cannot be sent");
    }
  };

  // Fetch user from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user"); // Retrieve user data from localStorage
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.username); // Set the new logged-in user's username
  
      // Ensure that contacts and other states are reset for the new user
      setContacts([]); // Clear the previous user's contacts
  
      // Establish socket connection after setting the username
      socketRef.current = io("https://chat-app-h1gr.onrender.com");
  
      socketRef.current.on("connect", () => {
        if (user.username) {
          socketRef.current.emit("userOnline", user.username); // Emit online status for the new user
        }
      });
    }
  
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency ensures this runs only once when the component is mounted
  
  // Fetch contacts (excluding the current user)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get("https://chat-app-h1gr.onrender.com/api/auth/users");
        const filteredContacts = response.data.filter((contact) => contact.username !== username); // Filter out the logged-in user
        setContacts(filteredContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    fetchContacts(); // Fetch contacts once the username is set
  }, [username]); // Dependency on username (fetch contacts after username is set)

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); // Scroll to the last message
    }
  }, [chatHistory]); // Dependency on chatHistory (scroll when messages change)

  // Rejoin room when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      const roomName = [username, selectedChat.username].sort().join("-");
      socketRef.current.emit("joinRoom", roomName); // Join the selected room
    }
  }, [selectedChat, username]); // Rejoin room when selectedChat or username changes

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("user"); // Remove user data from localStorage
    window.location.href = "/"; // Redirect to the login page
  }, []);

  // Handle sending a message
  const handleSendMessage = useCallback(
    (msg) => {
     const roomName = [username, selectedChat?.username].sort().join("-");
      sendMessage(msg, roomName);
    },
    [selectedChat, username] // Dependencies for sending message
  );
  
// Listen to user status changes (online/offline)
useEffect(() => {
  if (socketRef.current) {
    socketRef.current.on("userStatusChange", (statusData) => {
      console.log("Status update received:", statusData);
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.username === statusData.username
            ? { ...contact, isOnline: statusData.isOnline }
            : contact
        )
      );

      // Update the selected chat's online status if it matches
      if (selectedChat?.username === statusData.username) {
        setSelectedChat((prev) => ({
          ...prev,
          isOnline: statusData.isOnline,
        }));
      }
    });
  }
}, [selectedChat]);
// Listening for incoming messages
useEffect(() => {
  if (socketRef.current) {
    socketRef.current.on("receiveMessage", (message) => {
      console.log("Message received:", message);
      
      // Check if the message belongs to the selected chat
      if (
        message.sender === selectedChat?.username ||
        message.recipient === selectedChat?.username
      ) {
        setChatHistory((prevHistory) => [...prevHistory, message]);
      }
    });
  }
}, [selectedChat]);

  return (
    <div className="home-page">
      <div className="sidebar">
        <div className="profile-section">
          <div className="profile-picture">{username[0]?.toUpperCase()}</div> {/* Show first letter of username */}
          <h2 className="app-title">ChatterBox</h2>
          <span className="logged-in-user">Logged in as: {username}</span> {/* Display logged-in username */}
          <button className="logout-btn" onClick={handleLogout}>Logout</button> {/* Logout button */}
        </div>

        <div className="contacts">
          {contacts.map((contact) => (
            <div
              key={contact._id}
              className={`contact ${selectedChat?.username === contact.username ? "active" : ""}`}
              onClick={() => setSelectedChat(contact)} // Set selected chat when a contact is clicked
            >
              <div className="contact-info">
                <div className="contact-name">{contact.username}</div>
                {/* <div className="contact-message">{contact.isOnline ? "Online" : "Offline"}</div> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-area">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <div className="chat-user">
                <div className="avatar">{selectedChat.username[0].toUpperCase()}</div> {/* Show first letter of contact's username */}
                <div className="chat-info">
                  <div className="chat-username">{selectedChat.username}</div>
                  {/* <div className={`chat-status ${selectedChat?.isOnline ? "online" : "offline"}`}>
  {selectedChat?.isOnline ? "Online" : "Offline"}
</div> */}

                </div>
              </div>
            </div>

            <div className="chat-messages">
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`message ${chat.sender === username ? "sent-message" : "received-message"}`}
                >
                  <span className="message-text">{chat.text}</span>
                  {/* <span className="message-timestamp">{chat.timestamp}</span> */}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <input
                type="text"
                placeholder="Type a message..."
                className="message-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)} // Update message state
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(message)} // Send message on Enter key
              />
              <button className="send-btn" onClick={() => handleSendMessage(message)}>
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">Select a chat to start messaging</div> // Message when no chat is selected
        )}
      </div>
    </div>
  );
};

export default HomePage;

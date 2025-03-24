import React from 'react';
import { Search } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ contacts, selectedChat, setSelectedChat, searchTerm, setSearchTerm }) => {
    return (
        <div className='sidebar'>
            <div className='search-container'>
                <Search className='search-icon' />
                <input
                    type='text'
                    placeholder='Search or start new chat'
                    className='search-bar'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className='chat-list'>
                {contacts.map((contact) => (
                    <div
                        key={contact.username}
                        className={`chat-item ${selectedChat?.username === contact.username ? 'active' : ''}`}
                        onClick={() => setSelectedChat(contact)}
                    >
                        <div className='avatar'>{contact.username.charAt(0).toUpperCase()}</div>
                        <div className='contact-info'>
                            <span className='contact-name'>{contact.username}</span>
                            <span className={`status-dot ${contact.isOnline ? 'online' : 'offline'}`}></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;

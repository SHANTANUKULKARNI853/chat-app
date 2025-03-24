import React from 'react';
import { Phone, Video, MoreVertical } from 'lucide-react';
import './Header.css';

const Header = ({ title, isOnline }) => {
    return (
        <div className='chat-header'>
            <div className='avatar'>
                {title.charAt(0).toUpperCase()}
            </div>
            <div className='chat-info'>
                <h2 className='chat-title'>{title}</h2>
                <span className={`chat-status ${isOnline ? 'online' : 'offline'}`}>
                    {isOnline ? 'online' : 'offline'}
                </span>
            </div>
            <div className='header-icons'>
                <Phone className='icon' />
                <Video className='icon' />
                <MoreVertical className='icon' />
            </div>
        </div>
    );
};

export default Header;

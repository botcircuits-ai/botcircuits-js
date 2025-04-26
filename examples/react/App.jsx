import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BotCircuitsProvider, useBotCircuits } from '../../src/react';
import './App.css';

// Chat component that uses the BotCircuits hook
const Chat = () => {
  const { messages, sendMessage, connectionStatus } = useBotCircuits();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await sendMessage({
        textMessage: inputText,
        requestAttributes: { phone_number: "94713132456" } // Example attribute
      });
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Render different message types
  const renderMessage = (message) => {
    switch (message.type) {
      case 'TEXT':
        return <p>{message.content}</p>;
      
      case 'BUTTONS':
        return (
          <div className="buttons-message">
            <p>{message.content.displayText}</p>
            {message.content.optionsTitle && (
              <p className="options-title">{message.content.optionsTitle}</p>
            )}
            <div className="buttons-container">
              {message.content.buttons.map((button, index) => (
                <button
                  key={index}
                  className="button-option"
                  onClick={() => {
                    sendMessage({
                      textMessage: button.payload,
                      requestAttributes: { selected_button: button.payload }
                    });
                  }}
                >
                  {button.title}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'IMAGE':
        return (
          <div className="image-message">
            <img src={message.content.url} alt={message.content.caption || 'Bot image'} />
            {message.content.caption && <p>{message.content.caption}</p>}
          </div>
        );
      
      default:
        return <p>Unsupported message type: {message.type}</p>;
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>BotCircuits Chat</h2>
        <div className={`connection-status status-${connectionStatus.toLowerCase()}`}>
          {connectionStatus}
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="message bot-message">
            {renderMessage(msg)}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          disabled={connectionStatus !== 'CONNECTED'}
        />
        <button 
          type="submit" 
          disabled={!inputText.trim() || connectionStatus !== 'CONNECTED'}
        >
          Send
        </button>
      </form>
    </div>
  );
};

// Main App component that sets up the BotCircuits provider
const App = () => {
  // In a real app, these would come from environment variables
  const options = {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_API_KEY',
    host: 'pubsub.botcircuits.com'
  };
  
  // Generate a unique session ID
  const sessionId = uuidv4();

  return (
    <div className="app">
      <BotCircuitsProvider options={options} sessionId={sessionId}>
        <Chat />
      </BotCircuitsProvider>
    </div>
  );
};

export default App;

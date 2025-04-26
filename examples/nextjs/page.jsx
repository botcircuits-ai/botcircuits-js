import React from 'react';
import BotCircuitsChat from './BotCircuitsChat';

export default function Home() {
  // In a real app, these would come from environment variables
  const appId = process.env.NEXT_PUBLIC_BOTCIRCUITS_APP_ID;
  const apiKey = process.env.NEXT_PUBLIC_BOTCIRCUITS_API_KEY;
  
  return (
    <div className="container">
      <header>
        <h1>BotCircuits Next.js Example</h1>
        <p>This example demonstrates how to integrate BotCircuits with Next.js</p>
      </header>
      
      <main>
        <BotCircuitsChat 
          appId={appId} 
          apiKey={apiKey} 
        />
      </main>
      
      <footer>
        <p>Powered by BotCircuits</p>
      </footer>
      
      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        * {
          box-sizing: border-box;
        }
        
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
        }
        
        header, footer {
          width: 100%;
          padding: 1.5rem 0;
          text-align: center;
        }
        
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        
        .chat-container {
          width: 100%;
          height: 600px;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #ddd;
        }
        
        .chat-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }
        
        .connection-status {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.8rem;
          text-transform: capitalize;
        }
        
        .status-connected {
          background-color: #4CAF50;
          color: white;
        }
        
        .status-connecting {
          background-color: #FFC107;
          color: black;
        }
        
        .status-disconnected, .status-error {
          background-color: #F44336;
          color: white;
        }
        
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          background-color: #f5f5f5;
          display: flex;
          flex-direction: column;
          height: calc(100% - 130px);
        }
        
        .message {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 8px;
          max-width: 70%;
        }
        
        .user-message {
          background-color: #dcf8c6;
          align-self: flex-end;
          margin-left: auto;
        }
        
        .bot-message {
          background-color: #fff;
          align-self: flex-start;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .chat-input-form {
          display: flex;
          padding: 10px;
          background-color: #fff;
          border-top: 1px solid #ccc;
        }
        
        .chat-input-form input {
          flex: 1;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          margin-right: 10px;
          font-size: 1rem;
        }
        
        .chat-input-form button {
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .buttons-message {
          display: flex;
          flex-direction: column;
        }
        
        .options-title {
          font-weight: bold;
          margin-top: 8px;
          margin-bottom: 8px;
        }
        
        .buttons-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        
        .button-option {
          padding: 8px 12px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .image-message img {
          max-width: 100%;
          border-radius: 4px;
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
}

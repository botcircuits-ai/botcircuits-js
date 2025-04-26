// Import would be used in a bundled environment
// import { BotCircuits, Options, Request, Message } from 'botcircuits-client';

// For this example, we'll assume the BotCircuits class is available globally
// This would be provided by the bundled library in a real implementation

/**
 * BotCircuits JavaScript client
 * Handles WebSocket connections and message passing with BotCircuits
 */
class BotCircuits {
  constructor(options, sessionId) {
    this.options = options;
    this.sessionId = sessionId;
    this.host = options.host || 'pubsub.botcircuits.com';
    this.graphqlHttpApi = `https://${this.host}/graphql`;
    this.websocketApi = `wss://${this.host}/graphql/realtime`;
    this.onMessageCallback = null;
    this.connectionStatus = 'disconnected';
    this.wsClient = null;
    this.unsubscribe = null;
  }

  async startSubscription(onMessage) {
    if (this.unsubscribe) {
      // Already subscribed
      return;
    }

    this.onMessageCallback = onMessage;
    this.connectionStatus = 'connecting';

    try {
      // Prepare headers for connection
      const headerDict = {
        Authorization: this.options.apiKey,
        host: this.host
      };
      const headersBytes = btoa(JSON.stringify(headerDict));

      // Create WebSocket connection
      const socket = new WebSocket(`${this.websocketApi}?header=${headersBytes}&payload=e30=`, 'graphql-ws');
      
      socket.onopen = () => {
        // Send connection init message
        socket.send(JSON.stringify({ type: 'connection_init' }));
        
        // Send GraphQL subscription
        const query = `
          subscription Subscribe($appId: String!, $sessionId: String!) {
            subscribeBotMessage(appId: $appId, sessionId: $sessionId) {
              data
              appId
              sessionId
            }
          }
        `;
        
        const payload = {
          id: this.sessionId,
          payload: {
            data: JSON.stringify({
              query: query,
              variables: {
                appId: this.options.appId,
                sessionId: this.sessionId
              }
            }),
            extensions: {
              authorization: {
                Authorization: this.options.apiKey,
                host: this.host,
                'x-amz-user-agent': 'aws-amplify/4.7.14 js'
              }
            },
          },
          type: 'start'
        };
        
        socket.send(JSON.stringify(payload));
        this.connectionStatus = 'connected';
      };
      
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const msgType = message.type;
        
        if (msgType === 'data') {
          const payload = message.payload || {};
          const dataObj = payload.data || {};
          const subscribeData = dataObj.subscribeBotMessage;
          
          if (subscribeData) {
            const originalDataStr = subscribeData.data;
            if (originalDataStr) {
              try {
                const originalMessage = JSON.parse(originalDataStr);
                // Expecting structure: {"message": {"type": "...", "content": ...}}
                const botMsg = originalMessage.message;
                if (botMsg && this.onMessageCallback) {
                  this.onMessageCallback(botMsg);
                }
              } catch (e) {
                console.error('[Parse Error]', e);
              }
            }
          }
        } else if (msgType === 'connection_error') {
          const errors = message.payload?.errors || [];
          console.error('[Subscription Error]', errors);
          this.connectionStatus = 'error';
        }
      };
      
      socket.onerror = (error) => {
        console.error('[WebSocket Error]', error);
        this.connectionStatus = 'error';
      };
      
      socket.onclose = () => {
        this.connectionStatus = 'disconnected';
      };
      
      this.wsClient = socket;
      this.unsubscribe = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    } catch (error) {
      console.error('[Connection Error]', error);
      this.connectionStatus = 'error';
      throw error;
    }
  }

  stopSubscription() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      this.connectionStatus = 'disconnected';
    }
  }

  async sendMessage(request) {
    const mutation = `
      mutation Publish($data: AWSJSON!, $appId: String!, $sessionId: String!) {
        sendUserMessage(data: $data, appId: $appId, sessionId: $sessionId) {
          data
          appId
          sessionId
        }
      }
    `;

    const requestData = JSON.stringify({
      action: 'executor',
      appId: this.options.appId,
      sessionId: this.sessionId,
      inputText: request.textMessage,
      requestAttributes: request.requestAttributes
    });

    const variables = {
      appId: this.options.appId,
      sessionId: this.sessionId,
      data: requestData,
    };

    const payload = {
      query: mutation,
      variables
    };

    try {
      const response = await fetch(this.graphqlHttpApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.options.apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status} - ${text}`);
      }

      console.log('[Thinking...]');
    } catch (error) {
      console.error('[Send Message Error]', error);
      throw error;
    }
  }

  close() {
    console.log('[Connection Closed]');
    this.stopSubscription();
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }
}

// Main application code
document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const chatMessages = document.getElementById('chat-messages');
  const statusElement = document.getElementById('status');
  
  // Configuration (would be loaded from environment in a real app)
  const options = {
    appId: 'YOUR_APP_ID', // Replace with your actual app ID
    apiKey: 'YOUR_API_KEY', // Replace with your actual API key
    host: 'pubsub.botcircuits.com'
  };
  
  // Generate a unique session ID
  const sessionId = uuid.v4();
  
  // Create BotCircuits client
  const botCircuits = new BotCircuits(options, sessionId);
  
  // Track user messages for display
  const userMessages = [];
  
  // Update status display
  function updateStatus() {
    const status = botCircuits.getConnectionStatus();
    statusElement.textContent = `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    
    // Add appropriate status class
    statusElement.className = 'status';
    statusElement.classList.add(`status-${status}`);
  }
  
  // Add a message to the chat display
  function addMessageToChat(message, isUser = false) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    if (isUser) {
      messageElement.textContent = message;
    } else {
      // Handle different message types
      if (message.type === 'TEXT') {
        messageElement.textContent = message.content;
      } else if (message.type === 'BUTTONS') {
        const content = message.content;
        
        // Add display text
        const textElement = document.createElement('div');
        textElement.textContent = content.displayText;
        messageElement.appendChild(textElement);
        
        // Add options title if present
        if (content.optionsTitle) {
          const titleElement = document.createElement('div');
          titleElement.textContent = content.optionsTitle;
          titleElement.style.fontWeight = 'bold';
          titleElement.style.marginTop = '8px';
          messageElement.appendChild(titleElement);
        }
        
        // Add buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons-container';
        
        content.buttons.forEach(button => {
          const buttonElement = document.createElement('button');
          buttonElement.className = 'button-option';
          buttonElement.textContent = button.title;
          buttonElement.addEventListener('click', () => {
            // Handle button click
            const buttonMessage = button.payload;
            addMessageToChat(buttonMessage, true);
            userMessages.push(buttonMessage);
            
            // Send the message to the bot
            botCircuits.sendMessage({
              textMessage: buttonMessage,
              requestAttributes: { selected_button: button.payload }
            });
          });
          
          buttonsContainer.appendChild(buttonElement);
        });
        
        messageElement.appendChild(buttonsContainer);
      } else if (message.type === 'IMAGE') {
        const content = message.content;
        messageElement.className += ' image-message';
        
        // Create image element
        const imgElement = document.createElement('img');
        imgElement.src = content.url;
        imgElement.alt = content.caption || 'Bot image';
        messageElement.appendChild(imgElement);
        
        // Add caption if present
        if (content.caption) {
          const captionElement = document.createElement('div');
          captionElement.textContent = content.caption;
          captionElement.style.marginTop = '5px';
          messageElement.appendChild(captionElement);
        }
      } else {
        // Unknown message type
        messageElement.textContent = `Unsupported message type: ${message.type}`;
      }
    }
    
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Handle sending messages
  function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add to chat
    addMessageToChat(message, true);
    userMessages.push(message);
    
    // Clear input
    messageInput.value = '';
    
    // Send to bot
    botCircuits.sendMessage({
      textMessage: message,
      requestAttributes: { phone_number: "94713132456" } // Example attribute
    });
  }
  
  // Event listeners
  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Start subscription
  botCircuits.startSubscription((message) => {
    addMessageToChat(message);
  });
  
  // Update status periodically
  setInterval(updateStatus, 1000);
  
  // Welcome message
  addMessageToChat({
    type: 'TEXT',
    content: 'Welcome to BotCircuits! Type a message to get started.'
  });
});

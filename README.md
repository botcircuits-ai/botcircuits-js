# BotCircuits JavaScript Client

A modern JavaScript client library for BotCircuits that supports various JavaScript frameworks including:

- Vanilla JavaScript
- React
- Next.js
- Vue.js
- Angular

## Installation

```bash
npm install botcircuits-client
```

Or with yarn:

```bash
yarn add botcircuits-client
```

## Configuration

Before using the BotCircuits client, you need to set up your credentials:

```javascript
const options = {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  host: 'pubsub.botcircuits.com' // Optional, defaults to this value
};

// Generate a unique session ID for the user
const sessionId = 'unique-user-session-id';
```

## Usage

### Vanilla JavaScript

```javascript
import { BotCircuits } from 'botcircuits-client';

// Create a new BotCircuits client
const botCircuits = new BotCircuits(options, sessionId);

// Start subscription to receive messages
botCircuits.startSubscription((message) => {
  console.log('Received message:', message);
  // Handle different message types (TEXT, BUTTONS, IMAGE)
});

// Send a message to the bot
botCircuits.sendMessage({
  textMessage: 'Hello, bot!',
  requestAttributes: { phone_number: '94713132456' }
});

// Close the connection when done
botCircuits.close();
```

### React

```jsx
import React from 'react';
import { BotCircuitsProvider, useBotCircuits } from 'botcircuits-client';

// Chat component that uses the BotCircuits hook
const Chat = () => {
  const { messages, sendMessage, connectionStatus } = useBotCircuits();
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    sendMessage({
      textMessage: inputText,
      requestAttributes: { phone_number: '94713132456' }
    });
    setInputText('');
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            {/* Render message based on type */}
            {msg.type === 'TEXT' && <p>{msg.content}</p>}
            {/* Handle other message types */}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

// Wrap your app with the BotCircuits provider
const App = () => (
  <BotCircuitsProvider options={options} sessionId={sessionId}>
    <Chat />
  </BotCircuitsProvider>
);
```

### Next.js

```jsx
// components/BotCircuitsChat.jsx
import { BotCircuitsProvider, useBotCircuits } from 'botcircuits-client';

// Similar to React example
// ...

// pages/index.js
import BotCircuitsChat from '../components/BotCircuitsChat';

export default function Home() {
  return (
    <div>
      <h1>BotCircuits Next.js Example</h1>
      <BotCircuitsChat 
        appId={process.env.NEXT_PUBLIC_BOTCIRCUITS_APP_ID}
        apiKey={process.env.NEXT_PUBLIC_BOTCIRCUITS_API_KEY}
      />
    </div>
  );
}
```

### Vue.js

```javascript
// In your Vue component
<script>
import { useVueBotCircuits } from 'botcircuits-client';
import { ref } from 'vue';

export default {
  setup() {
    const inputText = ref('');
    
    const {
      messages,
      connectionStatus,
      sendMessage
    } = useVueBotCircuits(options, sessionId);
    
    const sendUserMessage = () => {
      if (!inputText.value.trim()) return;
      
      sendMessage({
        textMessage: inputText.value,
        requestAttributes: { phone_number: '94713132456' }
      });
      inputText.value = '';
    };
    
    return {
      inputText,
      messages,
      connectionStatus,
      sendUserMessage
    };
  }
};
</script>
```

Alternatively, you can use the Vue plugin:

```javascript
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import { BotCircuitsPlugin } from 'botcircuits-client';

const app = createApp(App);

app.use(BotCircuitsPlugin, {
  botCircuitsOptions: options,
  sessionId: sessionId
});

app.mount('#app');
```

### Angular

```typescript
// In your component
import { Component, OnInit } from '@angular/core';
import { BotCircuitsService } from 'botcircuits-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit {
  inputText = '';
  
  constructor(private botCircuitsService: BotCircuitsService) {}
  
  ngOnInit() {
    this.botCircuitsService.initialize(options, sessionId);
  }
  
  sendMessage() {
    if (!this.inputText.trim()) return;
    
    this.botCircuitsService.sendMessage({
      textMessage: this.inputText,
      requestAttributes: { phone_number: '94713132456' }
    });
    this.inputText = '';
  }
  
  ngOnDestroy() {
    this.botCircuitsService.cleanup();
  }
}
```

## Message Types

BotCircuits supports different message types:

### TEXT

Simple text messages:

```json
{
  "type": "TEXT",
  "content": "Hello !!!"
}
```

### BUTTONS

Interactive button options:

```json
{
  "type": "BUTTONS",
  "content": {
    "displayText": "Select your card type to proceed payment",
    "optionsTitle": "Please select card type",
    "buttons": [
      {
        "actionType": "set_value",
        "slot": "cardType",
        "title": "Visa",
        "payload": "visa"
      },
      {
        "actionType": "set_value",
        "slot": "cardType",
        "title": "Master",
        "payload": "master"
      }
    ]
  }
}
```

### IMAGE

Image messages with optional captions:

```json
{
  "type": "IMAGE",
  "content": {
    "url": "<image url>",
    "caption": "Image caption"
  }
}
```

## Utility Functions

The library includes several utility functions:

```javascript
import { 
  generateSessionId,
  isTextMessage,
  isButtonsMessage,
  isImageMessage,
  getButtonsContent,
  getImageContent,
  formatMessageForDisplay
} from 'botcircuits-client';

// Generate a new UUID for session ID
const sessionId = generateSessionId();

// Check message types
if (isTextMessage(message)) {
  // Handle text message
}

// Get typed content
const buttonsContent = getButtonsContent(message);
if (buttonsContent) {
  // Access buttons content with proper typing
}

// Format message for display
const displayText = formatMessageForDisplay(message);
```

## License

MIT

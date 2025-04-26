<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>BotCircuits Chat</h2>
      <div :class="['connection-status', `status-${connectionStatus.toLowerCase()}`]">
        {{ connectionStatus }}
      </div>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" class="message bot-message">
        <!-- Text message -->
        <div v-if="message.type === 'TEXT'">
          {{ message.content }}
        </div>
        
        <!-- Buttons message -->
        <div v-else-if="message.type === 'BUTTONS'" class="buttons-message">
          <p>{{ message.content.displayText }}</p>
          <p v-if="message.content.optionsTitle" class="options-title">
            {{ message.content.optionsTitle }}
          </p>
          <div class="buttons-container">
            <button
              v-for="(button, btnIndex) in message.content.buttons"
              :key="btnIndex"
              class="button-option"
              @click="handleButtonClick(button)"
            >
              {{ button.title }}
            </button>
          </div>
        </div>
        
        <!-- Image message -->
        <div v-else-if="message.type === 'IMAGE'" class="image-message">
          <img :src="message.content.url" :alt="message.content.caption || 'Bot image'" />
          <p v-if="message.content.caption">{{ message.content.caption }}</p>
        </div>
        
        <!-- Unsupported message type -->
        <div v-else>
          Unsupported message type: {{ message.type }}
        </div>
      </div>
    </div>
    
    <form class="chat-input-form" @submit.prevent="sendUserMessage">
      <input
        v-model="inputText"
        type="text"
        placeholder="Type a message..."
        :disabled="connectionStatus !== 'CONNECTED'"
      />
      <button 
        type="submit" 
        :disabled="!inputText.trim() || connectionStatus !== 'CONNECTED'"
      >
        Send
      </button>
    </form>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useVueBotCircuits } from 'botcircuits-client';

export default {
  name: 'BotCircuitsChat',
  
  props: {
    appId: {
      type: String,
      required: true
    },
    apiKey: {
      type: String,
      required: true
    },
    host: {
      type: String,
      default: 'pubsub.botcircuits.com'
    },
    sessionId: {
      type: String,
      default: () => uuidv4()
    }
  },
  
  setup(props) {
    const inputText = ref('');
    const messagesContainer = ref(null);
    
    // Initialize BotCircuits client
    const options = {
      appId: props.appId,
      apiKey: props.apiKey,
      host: props.host
    };
    
    const {
      messages,
      connectionStatus,
      isInitialized,
      sendMessage,
      clearMessages
    } = useVueBotCircuits(options, props.sessionId);
    
    // Scroll to bottom when messages change
    watch(messages, () => {
      setTimeout(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      }, 100);
    });
    
    // Send user message
    const sendUserMessage = async () => {
      if (!inputText.value.trim()) return;
      
      try {
        await sendMessage({
          textMessage: inputText.value,
          requestAttributes: { phone_number: "94713132456" } // Example attribute
        });
        inputText.value = '';
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };
    
    // Handle button click
    const handleButtonClick = async (button) => {
      try {
        await sendMessage({
          textMessage: button.payload,
          requestAttributes: { selected_button: button.payload }
        });
      } catch (error) {
        console.error('Error sending button message:', error);
      }
    };
    
    return {
      inputText,
      messages,
      connectionStatus,
      isInitialized,
      messagesContainer,
      sendUserMessage,
      handleButtonClick
    };
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
}

.message {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
  max-width: 70%;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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
  transition: background-color 0.2s;
}

.chat-input-form button:hover:not(:disabled) {
  background-color: #45a049;
}

.chat-input-form button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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
  transition: background-color 0.2s;
}

.button-option:hover {
  background-color: #45a049;
}

.image-message img {
  max-width: 100%;
  border-radius: 4px;
  margin-bottom: 5px;
}
</style>

import { ref, onMounted, onUnmounted, Ref } from 'vue';
import { BotCircuits } from './client';
import { Options, Request, Message, ConnectionStatus } from './types';

/**
 * Vue 3 Composition API hook for BotCircuits
 * @param options Configuration options for BotCircuits
 * @param sessionId Unique session identifier
 * @returns Object with BotCircuits state and methods
 */
export function useBotCircuits(options: Options, sessionId: string) {
  const messages: Ref<Message[]> = ref([]);
  const connectionStatus: Ref<ConnectionStatus> = ref(ConnectionStatus.DISCONNECTED);
  const botCircuits = ref<BotCircuits | null>(null);
  const isInitialized = ref(false);

  // Initialize BotCircuits client
  onMounted(() => {
    const client = new BotCircuits(options, sessionId);
    botCircuits.value = client;

    // Start subscription
    client.startSubscription((message: Message) => {
      messages.value = [...messages.value, message];
    }).then(() => {
      isInitialized.value = true;
    }).catch(error => {
      console.error('Failed to start subscription:', error);
    });

    // Update connection status
    const statusInterval = setInterval(() => {
      if (botCircuits.value) {
        connectionStatus.value = botCircuits.value.getConnectionStatus();
      }
    }, 1000);

    // Cleanup on component unmount
    onUnmounted(() => {
      clearInterval(statusInterval);
      if (botCircuits.value) {
        botCircuits.value.close();
        botCircuits.value = null;
      }
    });
  });

  /**
   * Send a message to the bot
   * @param request Request object containing the message and optional attributes
   * @returns Promise that resolves when the message is sent
   */
  const sendMessage = async (request: Request): Promise<void> => {
    if (!botCircuits.value) {
      throw new Error('BotCircuits client not initialized');
    }
    await botCircuits.value.sendMessage(request);
  };

  /**
   * Clear all messages
   */
  const clearMessages = () => {
    messages.value = [];
  };

  return {
    messages,
    connectionStatus,
    isInitialized,
    sendMessage,
    clearMessages
  };
}

/**
 * Vue 3 Plugin for BotCircuits
 */
export const BotCircuitsPlugin = {
  install: (app: any, options: { botCircuitsOptions: Options; sessionId: string }) => {
    const client = new BotCircuits(options.botCircuitsOptions, options.sessionId);
    
    // Provide the client instance to all components
    app.provide('botCircuits', client);
    
    // Add global properties
    app.config.globalProperties.$botCircuits = client;
  }
};

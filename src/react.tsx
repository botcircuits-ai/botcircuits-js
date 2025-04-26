import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BotCircuits } from './client';
import { Options, Request, Message, ConnectionStatus } from './types';

/**
 * Props for the BotCircuitsProvider component
 */
interface BotCircuitsProviderProps {
  /** Configuration options for BotCircuits */
  options: Options;
  /** Session ID for the current user */
  sessionId: string;
  /** Children components */
  children: React.ReactNode;
}

/**
 * Context for BotCircuits data and methods
 */
interface BotCircuitsContextType {
  /** Send a message to the bot */
  sendMessage: (request: Request) => Promise<void>;
  /** List of messages received from the bot */
  messages: Message[];
  /** Current connection status */
  connectionStatus: ConnectionStatus;
  /** Clear all messages */
  clearMessages: () => void;
}

// Create React context
const BotCircuitsContext = React.createContext<BotCircuitsContextType | undefined>(undefined);

/**
 * Provider component that wraps the application and provides BotCircuits functionality
 */
export const BotCircuitsProvider: React.FC<BotCircuitsProviderProps> = ({
  options,
  sessionId,
  children
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const botCircuitsRef = useRef<BotCircuits | null>(null);

  // Initialize BotCircuits client
  useEffect(() => {
    const botCircuits = new BotCircuits(options, sessionId);
    botCircuitsRef.current = botCircuits;

    // Start subscription
    botCircuits.startSubscription((message: Message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    }).catch(error => {
      console.error('Failed to start subscription:', error);
    });

    // Update connection status
    const statusInterval = setInterval(() => {
      if (botCircuitsRef.current) {
        setConnectionStatus(botCircuitsRef.current.getConnectionStatus());
      }
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(statusInterval);
      if (botCircuitsRef.current) {
        botCircuitsRef.current.close();
        botCircuitsRef.current = null;
      }
    };
  }, [options, sessionId]);

  // Send message handler
  const sendMessage = useCallback(async (request: Request) => {
    if (botCircuitsRef.current) {
      await botCircuitsRef.current.sendMessage(request);
    } else {
      throw new Error('BotCircuits client not initialized');
    }
  }, []);

  // Clear messages handler
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Context value
  const contextValue: BotCircuitsContextType = {
    sendMessage,
    messages,
    connectionStatus,
    clearMessages
  };

  return (
    <BotCircuitsContext.Provider value={contextValue}>
      {children}
    </BotCircuitsContext.Provider>
  );
};

/**
 * Hook to use BotCircuits functionality in React components
 * @returns BotCircuits context with messages and methods
 */
export const useBotCircuits = (): BotCircuitsContextType => {
  const context = React.useContext(BotCircuitsContext);
  if (context === undefined) {
    throw new Error('useBotCircuits must be used within a BotCircuitsProvider');
  }
  return context;
};

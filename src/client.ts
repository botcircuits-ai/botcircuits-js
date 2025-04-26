import { createClient } from 'graphql-ws';
import WebSocket from 'isomorphic-ws';
import {
  Options,
  Request,
  Message,
  MessageCallback,
  ConnectionStatus
} from './types';

/**
 * BotCircuits JavaScript client
 * Handles WebSocket connections and message passing with BotCircuits
 */
export class BotCircuits {
  private options: Options;
  private sessionId: string;
  private host: string;
  private graphqlHttpApi: string;
  private websocketApi: string;
  private wsClient: any;
  private onMessageCallback?: MessageCallback;
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private unsubscribe?: () => void;

  /**
   * Create a new BotCircuits client instance
   * @param options Configuration options
   * @param sessionId Unique session identifier
   */
  constructor(options: Options, sessionId: string) {
    this.options = options;
    this.sessionId = sessionId;
    this.host = options.host || 'pubsub.botcircuits.com';
    this.graphqlHttpApi = `https://${this.host}/graphql`;
    this.websocketApi = `wss://${this.host}/graphql/realtime`;
  }

  /**
   * Start the subscription to receive messages
   * @param onMessage Callback function that will be called when messages are received
   * @returns Promise that resolves when the subscription is established
   */
  async startSubscription(onMessage: MessageCallback): Promise<void> {
    if (this.unsubscribe) {
      // Already subscribed
      return;
    }

    this.onMessageCallback = onMessage;
    this.connectionStatus = ConnectionStatus.CONNECTING;

    try {
      // Prepare headers for connection
      const headerDict = {
        Authorization: this.options.apiKey,
        host: this.host
      };
      const headersBytes = btoa(JSON.stringify(headerDict));

      // Create the WebSocket client
      this.wsClient = createClient({
        url: `${this.websocketApi}?header=${headersBytes}&payload=e30=`,
        webSocketImpl: WebSocket,
        connectionParams: {
          Authorization: this.options.apiKey
        },
        on: {
          connected: () => {
            this.connectionStatus = ConnectionStatus.CONNECTED;
          },
          error: (error) => {
            console.error('[Subscription Error]', error);
            this.connectionStatus = ConnectionStatus.ERROR;
          }
        }
      });

      // Set up the subscription
      const query = `
        subscription Subscribe($appId: String!, $sessionId: String!) {
          subscribeBotMessage(appId: $appId, sessionId: $sessionId) {
            data
            appId
            sessionId
          }
        }
      `;

      // Subscribe to messages
      this.unsubscribe = this.wsClient.subscribe(
        {
          query,
          variables: {
            appId: this.options.appId,
            sessionId: this.sessionId
          }
        },
        {
          next: (response: any) => {
            if (response?.data?.subscribeBotMessage) {
              const subscribeData = response.data.subscribeBotMessage;
              if (subscribeData.data) {
                try {
                  const originalMessage = JSON.parse(subscribeData.data);
                  // Expecting structure: {"message": {"type": "...", "content": ...}}
                  const botMsg = originalMessage.message;
                  if (botMsg && this.onMessageCallback) {
                    this.onMessageCallback(botMsg as Message);
                  }
                } catch (e) {
                  console.error('[Parse Error]', e);
                }
              }
            }
          },
          error: (error: any) => {
            console.error('[Subscription Error]', error);
            this.connectionStatus = ConnectionStatus.ERROR;
          },
          complete: () => {
            this.connectionStatus = ConnectionStatus.DISCONNECTED;
          }
        }
      );
    } catch (error) {
      console.error('[Connection Error]', error);
      this.connectionStatus = ConnectionStatus.ERROR;
      throw error;
    }
  }

  /**
   * Stop the subscription and disconnect
   */
  stopSubscription(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
      this.connectionStatus = ConnectionStatus.DISCONNECTED;
    }
  }

  /**
   * Send a message to the bot
   * @param request Request object containing the message and optional attributes
   * @returns Promise that resolves when the message is sent
   */
  async sendMessage(request: Request): Promise<void> {
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

  /**
   * Close the connection and clean up resources
   */
  close(): void {
    console.log('[Connection Closed]');
    this.stopSubscription();
  }

  /**
   * Get the current connection status
   * @returns The current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }
}

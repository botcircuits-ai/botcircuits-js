import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BotCircuits } from './client';
import { Options, Request, Message, ConnectionStatus } from './types';

/**
 * Angular service for BotCircuits
 */
@Injectable({
  providedIn: 'root'
})
export class BotCircuitsService {
  private botCircuits: BotCircuits | null = null;
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  private statusInterval: any;

  /** Observable of messages received from the bot */
  public messages$ = this.messagesSubject.asObservable();
  /** Observable of the current connection status */
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor(private zone: NgZone) {}

  /**
   * Initialize the BotCircuits client
   * @param options Configuration options for BotCircuits
   * @param sessionId Unique session identifier
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(options: Options, sessionId: string): Promise<void> {
    // Clean up any existing client
    this.cleanup();

    // Create new client
    this.botCircuits = new BotCircuits(options, sessionId);

    // Start subscription
    await this.botCircuits.startSubscription((message: Message) => {
      // Use NgZone to ensure Angular change detection is triggered
      this.zone.run(() => {
        const currentMessages = this.messagesSubject.getValue();
        this.messagesSubject.next([...currentMessages, message]);
      });
    });

    // Update connection status periodically
    this.statusInterval = setInterval(() => {
      if (this.botCircuits) {
        const status = this.botCircuits.getConnectionStatus();
        this.zone.run(() => {
          this.connectionStatusSubject.next(status);
        });
      }
    }, 1000);
  }

  /**
   * Send a message to the bot
   * @param request Request object containing the message and optional attributes
   * @returns Promise that resolves when the message is sent
   */
  async sendMessage(request: Request): Promise<void> {
    if (!this.botCircuits) {
      throw new Error('BotCircuits client not initialized. Call initialize() first.');
    }
    await this.botCircuits.sendMessage(request);
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  /**
   * Clean up resources and close connections
   */
  cleanup(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }

    if (this.botCircuits) {
      this.botCircuits.close();
      this.botCircuits = null;
    }
  }

  /**
   * Get the current list of messages
   * @returns Array of messages
   */
  getMessages(): Message[] {
    return this.messagesSubject.getValue();
  }

  /**
   * Get the current connection status
   * @returns Current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatusSubject.getValue();
  }
}

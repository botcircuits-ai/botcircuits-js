import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { BotCircuitsService, Options, Message, Request, ConnectionStatus } from 'botcircuits-client';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bot-circuits-chat',
  templateUrl: './bot-circuits-chat.component.html',
  styleUrls: ['./bot-circuits-chat.component.scss']
})
export class BotCircuitsChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() appId!: string;
  @Input() apiKey!: string;
  @Input() host: string = 'pubsub.botcircuits.com';
  @Input() sessionId: string = uuidv4();
  
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  inputText: string = '';
  messages: Message[] = [];
  connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  
  private messagesSubscription?: Subscription;
  private statusSubscription?: Subscription;
  private shouldScrollToBottom = false;
  
  constructor(private botCircuitsService: BotCircuitsService) {}
  
  ngOnInit(): void {
    // Initialize BotCircuits client
    const options: Options = {
      appId: this.appId,
      apiKey: this.apiKey,
      host: this.host
    };
    
    this.botCircuitsService.initialize(options, this.sessionId)
      .then(() => {
        console.log('BotCircuits client initialized');
      })
      .catch(error => {
        console.error('Failed to initialize BotCircuits client:', error);
      });
    
    // Subscribe to messages
    this.messagesSubscription = this.botCircuitsService.messages$.subscribe(messages => {
      this.messages = messages;
      this.shouldScrollToBottom = true;
    });
    
    // Subscribe to connection status
    this.statusSubscription = this.botCircuitsService.connectionStatus$.subscribe(status => {
      this.connectionStatus = status;
    });
  }
  
  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.messagesSubscription?.unsubscribe();
    this.statusSubscription?.unsubscribe();
    
    // Clean up BotCircuits client
    this.botCircuitsService.cleanup();
  }
  
  /**
   * Send a message to the bot
   */
  sendMessage(): void {
    if (!this.inputText.trim()) return;
    
    const request: Request = {
      textMessage: this.inputText,
      requestAttributes: { phone_number: "94713132456" } // Example attribute
    };
    
    this.botCircuitsService.sendMessage(request)
      .then(() => {
        this.inputText = '';
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  }
  
  /**
   * Handle button click
   */
  handleButtonClick(button: any): void {
    const request: Request = {
      textMessage: button.payload,
      requestAttributes: { selected_button: button.payload }
    };
    
    this.botCircuitsService.sendMessage(request)
      .catch(error => {
        console.error('Error sending button message:', error);
      });
  }
  
  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.botCircuitsService.clearMessages();
  }
  
  /**
   * Scroll to the bottom of the messages container
   */
  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
  
  /**
   * Check if the connection is active
   */
  isConnected(): boolean {
    return this.connectionStatus === ConnectionStatus.CONNECTED;
  }
}

/**
 * Options for configuring the BotCircuits client
 */
export interface Options {
  /** The application ID from BotCircuits */
  appId: string;
  /** The API key for authentication */
  apiKey: string;
  /** Optional host override, defaults to pubsub.botcircuits.com */
  host?: string;
}

/**
 * Request object for sending messages
 */
export interface Request {
  /** The text message to send */
  textMessage?: string;
  /** Optional attributes to include with the request */
  requestAttributes?: Record<string, any>;
}

/**
 * Message content types
 */
export type MessageContent = string | Record<string, any>;

/**
 * Message received from the bot
 */
export interface Message {
  /** The type of message (TEXT, BUTTONS, IMAGE, etc.) */
  type: string;
  /** The content of the message, which varies based on type */
  content: MessageContent;
}

/**
 * Button action for BUTTONS message type
 */
export interface Button {
  /** The type of action this button performs */
  actionType: string;
  /** The slot to set (for set_value actions) */
  slot?: string;
  /** The display title of the button */
  title: string;
  /** The payload value to send when clicked */
  payload: string;
}

/**
 * Content structure for BUTTONS message type
 */
export interface ButtonsContent {
  /** The main text to display */
  displayText: string;
  /** Title for the options/buttons section */
  optionsTitle?: string;
  /** Array of button options */
  buttons: Button[];
}

/**
 * Content structure for IMAGE message type
 */
export interface ImageContent {
  /** URL of the image */
  url: string;
  /** Optional caption for the image */
  caption?: string;
}

/**
 * Callback function type for handling messages
 */
export type MessageCallback = (message: Message) => void | Promise<void>;

/**
 * Connection status for the WebSocket connection
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

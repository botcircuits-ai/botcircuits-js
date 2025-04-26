import { v4 as uuidv4 } from 'uuid';
import { Message, ButtonsContent, ImageContent } from './types';

/**
 * Generate a new UUID for use as a session ID
 * @returns A new UUID string
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Check if a message is of type TEXT
 * @param message The message to check
 * @returns True if the message is a text message
 */
export function isTextMessage(message: Message): boolean {
  return message.type === 'TEXT';
}

/**
 * Check if a message is of type BUTTONS
 * @param message The message to check
 * @returns True if the message is a buttons message
 */
export function isButtonsMessage(message: Message): boolean {
  return message.type === 'BUTTONS';
}

/**
 * Check if a message is of type IMAGE
 * @param message The message to check
 * @returns True if the message is an image message
 */
export function isImageMessage(message: Message): boolean {
  return message.type === 'IMAGE';
}

/**
 * Get the content of a BUTTONS message as a properly typed object
 * @param message The message to get content from
 * @returns The buttons content object
 */
export function getButtonsContent(message: Message): ButtonsContent | null {
  if (!isButtonsMessage(message)) {
    return null;
  }
  return message.content as ButtonsContent;
}

/**
 * Get the content of an IMAGE message as a properly typed object
 * @param message The message to get content from
 * @returns The image content object
 */
export function getImageContent(message: Message): ImageContent | null {
  if (!isImageMessage(message)) {
    return null;
  }
  return message.content as ImageContent;
}

/**
 * Format a message for display based on its type
 * @param message The message to format
 * @returns A string representation of the message
 */
export function formatMessageForDisplay(message: Message): string {
  if (isTextMessage(message)) {
    return message.content as string;
  } else if (isButtonsMessage(message)) {
    const content = getButtonsContent(message);
    if (!content) return 'Invalid button message';
    
    const buttonLabels = content.buttons.map(btn => btn.title).join(', ');
    return `${content.displayText}\nOptions: ${buttonLabels}`;
  } else if (isImageMessage(message)) {
    const content = getImageContent(message);
    if (!content) return 'Invalid image message';
    
    return content.caption ? `Image: ${content.caption}` : 'Image';
  }
  
  return `Unknown message type: ${message.type}`;
}

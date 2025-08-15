
export interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  text: string;
  imageUrl?: string;
}

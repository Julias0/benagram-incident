export interface Message {
  content: string;
  sender: 'user' | 'bot';
  createdAt: Date;
}
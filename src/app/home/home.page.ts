import { Component, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { send } from 'ionicons/icons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonFooter, 
    IonButton, 
    IonIcon, 
    IonInput,
    FormsModule,
    CommonModule
  ],
  standalone: true
})
export class HomePage {
  @ViewChild(IonContent) content!: IonContent;

  newMessage: string = '';
  messages: {
    content: string;
    sender: 'user' | 'bot';
    createdAt: Date;
  }[] = [
    {
      content: 'Hello! How are you?',
      sender: 'bot',
      createdAt: new Date()
    },
    {
      content: 'I\'m doing great! Thanks for asking 😊',
      sender: 'user',
      createdAt: new Date()
    },
    {
      content: 'What\'s your name?',
      sender: 'bot',
      createdAt: new Date()
    },
    {
      content: 'I\'m a chatbot. How can I help you today?',
      sender: 'bot',
      createdAt: new Date()
    },
    {
      content: 'I\'m a chatbot. How can I help you today?',
      sender: 'bot',
      createdAt: new Date()
    }
  ];

  constructor() {
    addIcons({ send });
  }

  async sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        content: this.newMessage,
        sender: 'user',
        createdAt: new Date()
      });
      this.messages.push({
        content: 'Hello! How are you?',
        sender: 'bot',
        createdAt: new Date()
      });
      this.newMessage = '';
    }
    await this.scrollToBottom();
  }

  private async scrollToBottom() {
    try {
      await this.content.scrollToBottom(300);
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}

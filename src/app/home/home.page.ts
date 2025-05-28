import { Component, inject, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { send } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import nlp from 'compromise';
import { Message } from '../models/message.model';
import { MessageService } from '../services/message.service';
import { GameState } from '../models/game-state.model';
import { StateService } from '../services/state.service';
import { RoomService } from '../services/room.service';
import { Observable } from 'rxjs';
import posthog from 'posthog-js';

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
  messages: Message[] = [];
  messageService = inject(MessageService);
  stateService = inject(StateService);
  roomService = inject(RoomService);
  currentState$: Observable<GameState> = this.stateService.currentState.asObservable();

  constructor() {
    addIcons({ send });
    const room = this.roomService.getRoom(this.stateService.getCurrentStateValue().currentRoom);
    if (room) {
      this.addMessages({
        content: room.verbHandler('look', this.stateService.getCurrentStateValue(), []).message,
        sender: 'bot',
        createdAt: new Date()
      });
    }
  }

  async sendMessage() {
    if (this.newMessage.trim()) {
      this.addMessages({
        content: this.newMessage,
        sender: 'user',
        createdAt: new Date()
      });

      const preProcessedMessage = this.messageService.preProcessSentence(this.newMessage);
      const terms = this.messageService.preProcessTerms(nlp(preProcessedMessage).termList());
      console.log(terms);

      const validationMessages = this.messageService.validateSentence(terms);
      if (validationMessages) {
        this.addMessages(validationMessages);
      } else {
        const handledSentence = this.messageService.handleSentence(terms, this.stateService.getCurrentStateValue());
        this.stateService.setCurrentState(handledSentence.newState);
        this.addMessages(handledSentence.message);
      }
    }
    this.newMessage = '';
    await this.scrollToBottom();
  }

  addMessages(messages: Message) {
    posthog.capture('message_sent', {
      message: messages.content,
      sender: messages.sender,
      createdAt: messages.createdAt
    });
    this.messages.push(messages);
  }

  private async scrollToBottom() {
    try {
      await this.content.scrollToBottom(300);
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}

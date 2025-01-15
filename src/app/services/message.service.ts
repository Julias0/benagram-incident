import { Injectable } from '@angular/core';
import { Message } from '../models/message.model';
import { Term } from 'compromise/types/misc';
import { GameState } from '../models/game-state.model';
import { RoomService } from './room.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private roomService: RoomService
  ) { }

  shortHand: { [key: string]: string } = {
    'l': 'look',
    'i': 'inventory',
    'n': 'north',
    's': 'south',
    'w': 'west',
    'e': 'east'
  }

  preProcessSentence(sentence: string): string {
    return sentence.toLowerCase().trim().split(' ').map(word => {
      if (this.shortHand[word]) {
        return this.shortHand[word];
      }
      return word;
    }).join(' ');
  }

  validateSentence(terms: any[]): Message | null {
    const messages: string[] = [];
    const verbs = terms.filter(term => term.chunk === 'Verb' && term.tags?.has('Verb'));
    const isFirstWordAVerb = terms[0].chunk === 'Verb' && terms[0].tags?.has('Verb');

    if (verbs.length > 1) {
      messages.push('You can use sentences with only one verb');
    }

    if (!isFirstWordAVerb) {
      messages.push('First word must be a verb');
    }

    if (messages.length > 0) {
      return {
        content: messages.join(' and '),
        sender: 'bot',
        createdAt: new Date()
      };
    }

    return null;
  }

  getInventoryString(inventory: string[]): string {
    if (inventory.length === 0) {
      return 'You are not carrying anything.';
    }
    return 'You are carrying' + inventory.join('\n ');
  }

  handleSentence(terms: Term[], currentState: GameState): {
    newState: GameState;
    message: Message;
  } {
    console.log(terms);
    const verb = terms[0];

    let noun = terms.find(term => term.chunk === 'Noun' && term.tags?.has('Noun'));

    const room = this.roomService.getRoom(currentState.currentRoom);

    if (!room) {
      return {
        newState: currentState,
        message: {
          content: 'You are not in a valid room',
          sender: 'bot',
          createdAt: new Date()
        }
      };
    }

    // match noun to objects inside the game world
    const currentObject = room.objects.find(object => object.name === noun?.text);

    if (!currentObject) {
      if (verb.text === 'inventory') {
        return {
          newState: currentState,
          message: {
            content: this.getInventoryString(currentState.inventory),
            sender: 'bot',
            createdAt: new Date()
          }
        };
      }

      const result = room.verbHandler(verb.text, currentState, terms);
      return {
        newState: result.newState,
        message: {
          content: result.message,
          sender: 'bot',
          createdAt: new Date()
        }
      };
    } else {
      const result = currentObject.verbHandler(verb.text, currentState, terms);
      if (result.message) {
        return {
          newState: result.newState,
          message: {
            content: result.message,
            sender: 'bot',
            createdAt: new Date()
          }
        };
      } else {
        return {
          newState: currentState,
          message: {
            content: 'Didnt understand that. Try looking around or going somewhere.',
            sender: 'bot',
            createdAt: new Date()
          }
        };
      }
    }
  }

  preProcessTerms(terms: Term[]): Term[] {
    return terms.map(term => {
      if (term.text === 'train') {
        return {
          ...term,
          text: 'train',
          tags: new Set(['Noun']),
          chunk: 'Noun'
        };
      }

      if (term.text === 'open') {
        return {
          ...term,
          text: 'open',
          tags: new Set(['Verb']),
          chunk: 'Verb'
        };
      }

      if (term.text === 'walk') {
        return {
          ...term,
          text: 'walk',
          tags: new Set(['Verb']),
          chunk: 'Verb'
        };
      }

      if (term.text === 'slap') {
        return {
          ...term,
          text: 'slap',
          tags: new Set(['Verb']),
          chunk: 'Verb'
        };
      }

      return {
        ...term,
        text: term.text.toLowerCase()
      };
    });
  }
}

import { Injectable } from '@angular/core';
import { GameState } from '../models/game-state.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  currentState: BehaviorSubject<GameState> = new BehaviorSubject<GameState>({
    currentRoom: 'Train Station',
    inventory: [
      'sunglasses',
      '100 Rupee Note',
      '20 Rupee Note',
      'letter'
    ],
    health: 100
  });

  isDead: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() { }

  getCurrentState() {
    return this.currentState.asObservable();
  }

  getCurrentStateValue() {
    return this.currentState.getValue();
  }

  setCurrentState(state: GameState) {
    this.currentState.next(state);
    
    // Check if player is dead
    if (state.health <= 0) {
      this.isDead.next(true);
    }
    
    // Auto-save game state (except when dead)
    if (state.health > 0) {
      this.saveGame(state);
    }
  }

  getIsDeadObservable() {
    return this.isDead.asObservable();
  }

  resetGame() {
    const initialState: GameState = {
      currentRoom: 'Train Station',
      inventory: [
        'sunglasses',
        '100 Rupee Note',
        '20 Rupee Note',
        'letter'
      ],
      health: 100
    };
    
    this.currentState.next(initialState);
    this.isDead.next(false);
    localStorage.removeItem('benagram-save');
  }

  private saveGame(state: GameState) {
    try {
      localStorage.setItem('benagram-save', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }
}
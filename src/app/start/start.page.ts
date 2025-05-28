import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-start',
  templateUrl: 'start.page.html',
  styleUrls: ['start.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    CommonModule
  ],
  standalone: true
})
export class StartPage {
  private router = inject(Router);
  private stateService = inject(StateService);
  
  hasSavedGame = false;

  constructor() {
    // Check if there's a saved game in localStorage
    const savedState = localStorage.getItem('benagram-save');
    this.hasSavedGame = !!savedState;
  }

  startNewGame() {
    // Reset to initial game state
    this.stateService.setCurrentState({
      currentRoom: 'Train Station',
      inventory: [
        'sunglasses',
        '100 Rupee Note',
        '20 Rupee Note',
        'letter'
      ],
      health: 100
    });
    
    // Clear any saved game
    localStorage.removeItem('benagram-save');
    
    // Navigate to game
    this.router.navigate(['/home']);
  }

  continueGame() {
    const savedState = localStorage.getItem('benagram-save');
    if (savedState) {
      try {
        const gameState = JSON.parse(savedState);
        this.stateService.setCurrentState(gameState);
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Failed to load saved game:', error);
        this.startNewGame();
      }
    } else {
      this.startNewGame();
    }
  }
}
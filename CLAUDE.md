# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a text-based adventure game called "Benagram Incident" built with Ionic/Angular. It's a standalone Angular application with a chat-style interface where users type commands to interact with a game world.

## Core Architecture

The game follows a service-based architecture with these key components:

- **StateService**: Manages the global game state using RxJS BehaviorSubject
- **MessageService**: Processes user input using NLP (compromise.js), validates commands, and handles verb/noun parsing
- **RoomService**: Manages rooms and their objects, each with their own verb handlers
- **HomePage**: Main game interface with chat-style message flow

### Game Flow
1. User types a command in natural language
2. MessageService preprocesses and validates the input (first word must be a verb)
3. NLP parses the sentence into verbs/nouns
4. Commands are routed to either room handlers or object handlers
5. State is updated and response message is displayed

### Key Models
- **GameState**: Tracks currentRoom, inventory array, and health
- **Room**: Contains objects and a verbHandler function
- **Message**: Chat messages with content, sender, and timestamp

## Development Commands

- **Start development server**: `npm run dev` or `npm start`
- **Build for production**: `npm run build`
- **Run tests**: `npm test`
- **Lint code**: `npm run lint`
- **Watch mode**: `npm run watch`

## Technology Stack

- **Framework**: Angular 19 with Ionic 8
- **Mobile**: Capacitor for native app capabilities
- **NLP**: compromise.js for natural language processing
- **Analytics**: PostHog for event tracking
- **Testing**: Jasmine/Karma
- **Styling**: SCSS with Ionic components

## Project Structure

- `src/app/models/`: TypeScript interfaces for game entities
- `src/app/services/`: Core game logic and state management
- `src/app/home/`: Main game page component
- Uses hash-based routing strategy for mobile compatibility
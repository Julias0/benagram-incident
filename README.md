# Benagram Incident

A text-based adventure game built with Ionic/Angular featuring natural language processing and immersive chat-style gameplay.

## 🎮 Game Overview

Benagram Incident is a modern text adventure game that combines classic interactive fiction with contemporary web technologies. Players navigate through an engaging story using natural language commands in a chat-style interface.

### Key Features

- **Natural Language Processing**: Type commands in plain English using compromise.js
- **Chat-Style Interface**: Modern conversational UI similar to messaging apps
- **Cross-Platform**: Runs on web, iOS, and Android via Capacitor
- **Real-time State Management**: Reactive game state using RxJS
- **Analytics Integration**: Player behavior tracking with PostHog

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- Angular CLI (for development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd benagram-incident

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:8100`

## 🏗️ Architecture

### Core Services

- **StateService**: Manages global game state using RxJS BehaviorSubject
- **MessageService**: Handles NLP processing, command validation, and verb/noun parsing
- **RoomService**: Manages game rooms and interactive objects

### Game Flow

1. Player types natural language command
2. MessageService validates input (first word must be a verb)
3. NLP engine parses sentence structure
4. Commands route to room or object handlers
5. Game state updates and response displays

### Data Models

```typescript
interface GameState {
  currentRoom: string;
  inventory: string[];
  health: number;
}

interface Room {
  id: string;
  objects: Object[];
  verbHandler: (verb: string, noun: string) => string;
}

interface Message {
  content: string;
  sender: 'user' | 'game';
  timestamp: Date;
}
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run unit tests
npm run lint         # Lint TypeScript/SCSS
npm run watch        # Watch mode for development
```

### Technology Stack

- **Frontend**: Angular 19 + Ionic 8
- **Mobile**: Capacitor for native capabilities
- **NLP**: compromise.js for natural language processing
- **State Management**: RxJS BehaviorSubject
- **Testing**: Jasmine + Karma
- **Analytics**: PostHog
- **Styling**: SCSS with Ionic components

### Project Structure

```
src/
├── app/
│   ├── models/           # TypeScript interfaces
│   │   ├── game-state.model.ts
│   │   ├── message.model.ts
│   │   ├── room.model.ts
│   │   └── verb.model.ts
│   ├── services/         # Core game logic
│   │   ├── message.service.ts
│   │   ├── room.service.ts
│   │   └── state.service.ts
│   ├── home/            # Main game interface
│   └── start/           # Start page
├── assets/              # Static assets
└── environments/        # Environment configs
```

## 🎯 Game Commands

The game accepts natural language commands. Examples:

- `go north` or `walk to the door`
- `take the key` or `pick up sword`
- `look around` or `examine room`
- `use key on door` or `open chest with key`
- `inventory` or `check items`

## 📱 Mobile Development

### iOS

```bash
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

### Android

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

## 🧪 Testing

Run the test suite:

```bash
npm test                 # Run tests once
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

## 🚀 Deployment

### Web Deployment

```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Mobile App Stores

1. Build the project: `npm run build`
2. Sync with Capacitor: `npx cap sync`
3. Open in Xcode/Android Studio
4. Build and deploy following platform guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

[Add your license information here]

## 📞 Support

[Add support contact information or links to issues/discussions]

---

Built with ❤️ using Angular, Ionic, and modern web technologies.
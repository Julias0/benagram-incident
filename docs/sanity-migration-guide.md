# Migrating Benagram Incident Room Content to Sanity CMS

## Overview

This document provides a comprehensive guide for extracting the hardcoded room content from the Angular `RoomService` and migrating it to Sanity CMS for dynamic content management. This migration will enable non-technical users to modify game content, support multiple languages, and allow for easier content updates without code deployments.

## Current Architecture Analysis

### Existing Room Structure

The current `RoomService` contains:
- **18 rooms** with complex narrative content
- **Room objects** (interactive elements within rooms)
- **Verb handlers** (game logic for user interactions)
- **State management** (inventory, health, room transitions)

### Key Components to Extract

1. **Room Metadata**
   - Room names and descriptions
   - Available directions (north, south, east, west)
   - Connection mappings between rooms

2. **Interactive Objects**
   - Object names and descriptions
   - Object-specific messages and responses
   - Conditional logic based on game state

3. **Narrative Content**
   - Room descriptions
   - Character dialogue
   - Action responses
   - Story progression text

4. **Game Logic Rules**
   - Inventory requirements for actions
   - Health modifications
   - Room transition conditions
   - Win/loss scenarios

## Sanity Schema Design

### 1. Room Document Schema

```javascript
// schemas/room.js
export default {
  name: 'room',
  title: 'Game Room',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Room Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Room Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      }
    },
    {
      name: 'description',
      title: 'Room Description',
      type: 'text',
      description: 'The main description shown when player looks around'
    },
    {
      name: 'connections',
      title: 'Room Connections',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'direction',
              title: 'Direction',
              type: 'string',
              options: {
                list: [
                  { title: 'North', value: 'north' },
                  { title: 'South', value: 'south' },
                  { title: 'East', value: 'east' },
                  { title: 'West', value: 'west' },
                  { title: 'Up', value: 'up' },
                  { title: 'Down', value: 'down' }
                ]
              }
            },
            {
              name: 'targetRoom',
              title: 'Target Room',
              type: 'reference',
              to: [{ type: 'room' }]
            },
            {
              name: 'transitionMessage',
              title: 'Transition Message',
              type: 'string'
            },
            {
              name: 'requirements',
              title: 'Requirements',
              type: 'array',
              of: [{ type: 'reference', to: [{ type: 'gameItem' }] }]
            }
          ]
        }
      ]
    },
    {
      name: 'objects',
      title: 'Interactive Objects',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'gameObject' }] }]
    },
    {
      name: 'defaultActions',
      title: 'Default Room Actions',
      type: 'array',
      of: [{ type: 'gameAction' }]
    }
  ]
}
```

### 2. Game Object Schema

```javascript
// schemas/gameObject.js
export default {
  name: 'gameObject',
  title: 'Game Object',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Object Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'aliases',
      title: 'Alternative Names',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Other names players might use to refer to this object'
    },
    {
      name: 'description',
      title: 'Object Description',
      type: 'text'
    },
    {
      name: 'actions',
      title: 'Available Actions',
      type: 'array',
      of: [{ type: 'gameAction' }]
    },
    {
      name: 'isCollectible',
      title: 'Can be collected',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'collectMessage',
      title: 'Collection Message',
      type: 'string',
      hidden: ({ parent }) => !parent?.isCollectible
    }
  ]
}
```

### 3. Game Action Schema

```javascript
// schemas/gameAction.js
export default {
  name: 'gameAction',
  title: 'Game Action',
  type: 'object',
  fields: [
    {
      name: 'verbs',
      title: 'Trigger Verbs',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Verbs that trigger this action (e.g., "look", "take", "use")'
    },
    {
      name: 'message',
      title: 'Response Message',
      type: 'text'
    },
    {
      name: 'conditions',
      title: 'Conditions',
      type: 'array',
      of: [{ type: 'gameCondition' }]
    },
    {
      name: 'effects',
      title: 'Effects',
      type: 'array',
      of: [{ type: 'gameEffect' }]
    }
  ]
}
```

### 4. Game Condition Schema

```javascript
// schemas/gameCondition.js
export default {
  name: 'gameCondition',
  title: 'Game Condition',
  type: 'object',
  fields: [
    {
      name: 'type',
      title: 'Condition Type',
      type: 'string',
      options: {
        list: [
          { title: 'Has Item in Inventory', value: 'hasItem' },
          { title: 'Doesn\'t Have Item', value: 'lacksItem' },
          { title: 'Health Above', value: 'healthAbove' },
          { title: 'Health Below', value: 'healthBelow' },
          { title: 'Custom Flag', value: 'customFlag' }
        ]
      }
    },
    {
      name: 'itemRequired',
      title: 'Required Item',
      type: 'reference',
      to: [{ type: 'gameItem' }],
      hidden: ({ parent }) => !['hasItem', 'lacksItem'].includes(parent?.type)
    },
    {
      name: 'healthValue',
      title: 'Health Value',
      type: 'number',
      hidden: ({ parent }) => !['healthAbove', 'healthBelow'].includes(parent?.type)
    },
    {
      name: 'flagName',
      title: 'Flag Name',
      type: 'string',
      hidden: ({ parent }) => parent?.type !== 'customFlag'
    },
    {
      name: 'flagValue',
      title: 'Flag Value',
      type: 'boolean',
      hidden: ({ parent }) => parent?.type !== 'customFlag'
    }
  ]
}
```

### 5. Game Effect Schema

```javascript
// schemas/gameEffect.js
export default {
  name: 'gameEffect',
  title: 'Game Effect',
  type: 'object',
  fields: [
    {
      name: 'type',
      title: 'Effect Type',
      type: 'string',
      options: {
        list: [
          { title: 'Add Item to Inventory', value: 'addItem' },
          { title: 'Remove Item from Inventory', value: 'removeItem' },
          { title: 'Change Health', value: 'changeHealth' },
          { title: 'Change Room', value: 'changeRoom' },
          { title: 'Set Custom Flag', value: 'setFlag' }
        ]
      }
    },
    {
      name: 'item',
      title: 'Item',
      type: 'reference',
      to: [{ type: 'gameItem' }],
      hidden: ({ parent }) => !['addItem', 'removeItem'].includes(parent?.type)
    },
    {
      name: 'healthChange',
      title: 'Health Change',
      type: 'number',
      description: 'Positive for healing, negative for damage',
      hidden: ({ parent }) => parent?.type !== 'changeHealth'
    },
    {
      name: 'targetRoom',
      title: 'Target Room',
      type: 'reference',
      to: [{ type: 'room' }],
      hidden: ({ parent }) => parent?.type !== 'changeRoom'
    },
    {
      name: 'flagName',
      title: 'Flag Name',
      type: 'string',
      hidden: ({ parent }) => parent?.type !== 'setFlag'
    },
    {
      name: 'flagValue',
      title: 'Flag Value',
      type: 'boolean',
      hidden: ({ parent }) => parent?.type !== 'setFlag'
    }
  ]
}
```

### 6. Game Item Schema

```javascript
// schemas/gameItem.js
export default {
  name: 'gameItem',
  title: 'Game Item',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Item Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Item Description',
      type: 'text'
    },
    {
      name: 'isKeyItem',
      title: 'Is Key Item',
      type: 'boolean',
      description: 'Important items for story progression'
    }
  ]
}
```

## Data Extraction Process

### Step 1: Extract Room Data

Create a data extraction script to parse the current `RoomService`:

```typescript
// scripts/extract-room-data.ts
import { RoomService } from '../src/app/services/room.service';

interface ExtractedRoom {
  name: string;
  slug: string;
  description: string;
  connections: Array<{
    direction: string;
    targetRoom: string;
    transitionMessage: string;
    requirements: string[];
  }>;
  objects: Array<{
    name: string;
    aliases: string[];
    actions: Array<{
      verbs: string[];
      message: string;
      conditions: any[];
      effects: any[];
    }>;
  }>;
}

export function extractRoomData(): ExtractedRoom[] {
  const roomService = new RoomService();
  const extractedRooms: ExtractedRoom[] = [];

  // Extract each room's data
  roomService.rooms.forEach(room => {
    const extracted: ExtractedRoom = {
      name: room.name,
      slug: room.name.toLowerCase().replace(/\s+/g, '-'),
      description: extractRoomDescription(room),
      connections: extractConnections(room),
      objects: extractObjects(room.objects)
    };

    extractedRooms.push(extracted);
  });

  return extractedRooms;
}

function extractRoomDescription(room: any): string {
  // Parse the 'look' action from room verbHandler
  // This requires analyzing the verbHandler function
  return 'Extracted room description';
}

function extractConnections(room: any): any[] {
  // Parse movement commands from verbHandler
  return [];
}

function extractObjects(objects: any[]): any[] {
  // Extract object data and parse their verbHandlers
  return [];
}
```

### Step 2: Create Import Scripts

```typescript
// scripts/import-to-sanity.ts
import { createClient } from '@sanity/client';
import { extractRoomData } from './extract-room-data';

const client = createClient({
  projectId: 'your-project-id',
  dataset: 'production',
  useCdn: false,
  token: 'your-write-token'
});

export async function importRoomsToSanity() {
  const rooms = extractRoomData();

  for (const room of rooms) {
    // Create room document
    const roomDoc = {
      _type: 'room',
      name: room.name,
      slug: { current: room.slug },
      description: room.description
    };

    const createdRoom = await client.create(roomDoc);
    console.log('Created room:', createdRoom._id);

    // Create associated objects and actions
    await createRoomObjects(createdRoom._id, room.objects);
  }
}

async function createRoomObjects(roomId: string, objects: any[]) {
  // Implementation for creating game objects and linking them to rooms
}
```

## Angular Service Refactoring

### Step 1: Create Sanity Service

```typescript
// src/app/services/sanity.service.ts
import { Injectable } from '@angular/core';
import { createClient, SanityClient } from '@sanity/client';
import { Observable, from } from 'rxjs';

export interface SanityRoom {
  _id: string;
  name: string;
  slug: { current: string };
  description: string;
  connections: Array<{
    direction: string;
    targetRoom: { name: string };
    transitionMessage: string;
    requirements: Array<{ name: string }>;
  }>;
  objects: Array<{
    name: string;
    aliases: string[];
    actions: Array<{
      verbs: string[];
      message: string;
      conditions: any[];
      effects: any[];
    }>;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class SanityService {
  private client: SanityClient;

  constructor() {
    this.client = createClient({
      projectId: 'your-project-id',
      dataset: 'production',
      useCdn: true,
      apiVersion: '2023-05-03'
    });
  }

  getRooms(): Observable<SanityRoom[]> {
    const query = `
      *[_type == "room"] {
        _id,
        name,
        slug,
        description,
        connections[] {
          direction,
          targetRoom-> { name },
          transitionMessage,
          requirements[]-> { name }
        },
        objects[]-> {
          name,
          aliases,
          actions[] {
            verbs,
            message,
            conditions[] {
              type,
              itemRequired-> { name },
              healthValue,
              flagName,
              flagValue
            },
            effects[] {
              type,
              item-> { name },
              healthChange,
              targetRoom-> { name },
              flagName,
              flagValue
            }
          }
        }
      }
    `;

    return from(this.client.fetch<SanityRoom[]>(query));
  }

  getRoom(slug: string): Observable<SanityRoom> {
    const query = `
      *[_type == "room" && slug.current == $slug][0] {
        _id,
        name,
        slug,
        description,
        connections[] {
          direction,
          targetRoom-> { name },
          transitionMessage,
          requirements[]-> { name }
        },
        objects[]-> {
          name,
          aliases,
          actions[] {
            verbs,
            message,
            conditions[],
            effects[]
          }
        }
      }
    `;

    return from(this.client.fetch<SanityRoom>(query, { slug }));
  }
}
```

### Step 2: Refactor Room Service

```typescript
// src/app/services/room.service.ts (refactored)
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { GameState } from '../models/game-state.model';
import { Room } from '../models/room.model';
import { SanityService, SanityRoom } from './sanity.service';
import { Term } from 'compromise/types/misc';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private roomsCache: Map<string, Room> = new Map();

  constructor(private sanityService: SanityService) {}

  getRoom(roomName: string): Observable<Room> {
    // Check cache first
    if (this.roomsCache.has(roomName)) {
      return of(this.roomsCache.get(roomName)!);
    }

    // Fetch from Sanity
    const slug = roomName.toLowerCase().replace(/\s+/g, '-');
    return this.sanityService.getRoom(slug).pipe(
      map(sanityRoom => this.convertSanityRoomToRoom(sanityRoom))
    );
  }

  private convertSanityRoomToRoom(sanityRoom: SanityRoom): Room {
    const room: Room = {
      name: sanityRoom.name,
      objects: sanityRoom.objects.map(obj => ({
        name: obj.name,
        verbHandler: this.createVerbHandler(obj.actions)
      })),
      verbHandler: this.createRoomVerbHandler(sanityRoom)
    };

    // Cache the converted room
    this.roomsCache.set(room.name, room);
    return room;
  }

  private createVerbHandler(actions: any[]) {
    return (verb: string, currentState: GameState, params: Term[]) => {
      // Find matching action based on verb
      const action = actions.find(a => a.verbs.includes(verb));
      
      if (!action) {
        return {
          message: 'You cannot do that.',
          newState: currentState
        };
      }

      // Check conditions
      if (!this.checkConditions(action.conditions, currentState)) {
        return {
          message: action.failMessage || 'You cannot do that right now.',
          newState: currentState
        };
      }

      // Apply effects
      const newState = this.applyEffects(action.effects, currentState);

      return {
        message: action.message,
        newState
      };
    };
  }

  private createRoomVerbHandler(sanityRoom: SanityRoom) {
    return (verb: string, currentState: GameState, params: Term[]) => {
      if (verb === 'look') {
        return {
          message: sanityRoom.description,
          newState: currentState
        };
      }

      if (verb === 'go') {
        return this.handleMovement(sanityRoom, params, currentState);
      }

      return {
        message: 'You cannot do that here.',
        newState: currentState
      };
    };
  }

  private handleMovement(room: SanityRoom, params: Term[], currentState: GameState) {
    const direction = params.find(p => 
      ['north', 'south', 'east', 'west', 'up', 'down'].includes(p.text.toLowerCase())
    )?.text.toLowerCase();

    if (!direction) {
      return {
        message: 'Which direction do you want to go?',
        newState: currentState
      };
    }

    const connection = room.connections.find(c => c.direction === direction);
    
    if (!connection) {
      return {
        message: 'You cannot go that way.',
        newState: currentState
      };
    }

    // Check requirements
    if (connection.requirements.length > 0) {
      const hasAllItems = connection.requirements.every(req => 
        currentState.inventory.includes(req.name)
      );

      if (!hasAllItems) {
        return {
          message: 'You need certain items to go that way.',
          newState: currentState
        };
      }
    }

    return {
      message: connection.transitionMessage,
      newState: {
        ...currentState,
        currentRoom: connection.targetRoom.name
      }
    };
  }

  private checkConditions(conditions: any[], gameState: GameState): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'hasItem':
          return gameState.inventory.includes(condition.itemRequired.name);
        case 'lacksItem':
          return !gameState.inventory.includes(condition.itemRequired.name);
        case 'healthAbove':
          return gameState.health > condition.healthValue;
        case 'healthBelow':
          return gameState.health < condition.healthValue;
        default:
          return true;
      }
    });
  }

  private applyEffects(effects: any[], gameState: GameState): GameState {
    let newState = { ...gameState };

    effects.forEach(effect => {
      switch (effect.type) {
        case 'addItem':
          if (!newState.inventory.includes(effect.item.name)) {
            newState.inventory = [...newState.inventory, effect.item.name];
          }
          break;
        case 'removeItem':
          newState.inventory = newState.inventory.filter(item => item !== effect.item.name);
          break;
        case 'changeHealth':
          newState.health += effect.healthChange;
          break;
        case 'changeRoom':
          newState.currentRoom = effect.targetRoom.name;
          break;
      }
    });

    return newState;
  }
}
```

## Migration Strategy

### Phase 1: Setup and Preparation (Week 1)
1. Set up Sanity Studio project
2. Define and implement schemas
3. Create data extraction scripts
4. Set up development environment

### Phase 2: Data Migration (Week 2)
1. Run extraction scripts on current room data
2. Manually review and clean extracted data
3. Import data to Sanity
4. Verify data integrity

### Phase 3: Service Refactoring (Week 3)
1. Implement SanityService
2. Refactor RoomService to use Sanity data
3. Update type definitions
4. Implement caching strategy

### Phase 4: Testing and Optimization (Week 4)
1. Comprehensive testing of migrated functionality
2. Performance optimization
3. Error handling implementation
4. Documentation updates

### Phase 5: Content Management Training (Week 5)
1. Create content management guidelines
2. Train content editors on Sanity Studio
3. Implement content approval workflows
4. Set up staging/production environments

## Benefits of Migration

### For Developers
- **Separation of Concerns**: Game logic separated from content
- **Easier Maintenance**: Content changes don't require code deployments
- **Version Control**: Built-in content versioning in Sanity
- **API-First**: RESTful and GraphQL APIs available

### For Content Creators
- **User-Friendly Interface**: Sanity Studio provides intuitive editing
- **Rich Text Support**: Advanced text editing capabilities
- **Media Management**: Built-in asset management
- **Collaboration**: Multiple editors can work simultaneously

### For the Game
- **Dynamic Content**: Real-time content updates
- **Localization Ready**: Multi-language support
- **A/B Testing**: Easy content variations
- **Analytics Integration**: Track content performance

## Considerations and Challenges

### Technical Challenges
1. **Complex Logic Migration**: Some verb handlers contain complex game logic that may need custom solutions
2. **Performance**: Network requests for room data vs. local data
3. **Offline Support**: Handling situations when Sanity is unavailable
4. **Type Safety**: Ensuring proper TypeScript types for dynamic content

### Content Management Challenges
1. **Learning Curve**: Content editors need to learn Sanity Studio
2. **Validation**: Ensuring content quality and consistency
3. **Workflow**: Establishing content review and approval processes
4. **Backup**: Implementing content backup strategies

### Solutions
1. **Hybrid Approach**: Keep critical game logic in code, move only content to Sanity
2. **Caching Strategy**: Implement robust caching with fallbacks
3. **Content Validation**: Use Sanity's validation features and custom rules
4. **Training**: Comprehensive training materials and documentation

## Next Steps

1. **Proof of Concept**: Start with migrating 2-3 simple rooms
2. **Team Review**: Get feedback from development and content teams
3. **Full Migration Plan**: Create detailed timeline and resource allocation
4. **Testing Strategy**: Develop comprehensive testing approach
5. **Rollback Plan**: Ensure ability to revert if issues arise

This migration will significantly improve the maintainability and scalability of the Benagram Incident game while enabling richer content management capabilities.
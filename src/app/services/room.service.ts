import { Injectable } from '@angular/core';
import { GameState } from '../models/game-state.model';
import { Room } from '../models/room.model';
import { Term } from 'compromise/types/misc';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  autoHandler = (verb: string, currentState: GameState, params: Term[]) => {
    if (verb === 'look') {
      return {
        message: 'The auto is parked in the street. It is old and dirty. The driver looks at you scarily.',
        newState: currentState
      };
    }

    const autoActions = ['go','speak', 'talk', 'approach', 'ask', 'shout'];
    if (autoActions.includes(verb)) {
      return {
        message: 'The driver looks at you angrily and says "100 Rupees to go to benagram village. Take it or leave it. But I warn you, no one goes there after sunset."',
        newState: currentState
      };
    }

    const boardActions = ['board', 'get on', 'get off'];
    if (boardActions.includes(verb)) {
      return {
        message: 'The auto driver pushes you out of the auto and says "Pay up the 100 Rupees! You board after you pay."',
        newState: currentState
      };
    }

    const paymentActions = ['give', 'pay', 'take'];
    if (paymentActions.includes(verb) && currentState.inventory.includes('100 Rupee Note')) {
      currentState.inventory = currentState.inventory.filter(item => item !== '100 Rupee Note');
      return {
        message: 'You board the auto and pay the driver 100 Rupees. The driver mutters something under his breath as he starts driving. The sun is setting...',
        newState: {
          ...currentState,
          currentRoom: 'On the way to Benagram'
        }
      };
    } else if (paymentActions.includes(verb) && !currentState.inventory.includes('100 Rupee Note')) {
      return {
        message: 'You don\'t have any 100 Rupee Notes. You might want to look around for other transportation options or try to find some money.',
        newState: currentState
      };
    }

    const bargainActions = ['bargain', 'negotiate', 'argue', 'reduce', 'lower', 'decrease'];
    if (bargainActions.includes(verb)) {
      currentState.health -= 20;
      return {
        message: 'The auto driver curses you and stomps on the gas pedal. The auto speeds up and you are knocked away. You hobble towards the bus stand.',
        newState: {
          ...currentState,
          currentRoom: 'Bus Stand'
        }
      };
    }

    return {
      message: 'The auto driver seems uninterested in that. Try talking to him, looking at the auto, or paying the fare if you have enough money.',
      newState: currentState
    };
  };

  rooms: Room[] = [
    {
      name: 'Train Station',
      objects: [{
        name: 'train',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          if (verb === 'look') {
            return {
              message: 'The train is a standard commuter train. Dirty and old.',
              newState: currentState
            };
          }

          const doorActions = ['open', 'close', 'lock', 'unlock', 'enter', 'exit'];
          if (doorActions.includes(verb)) {
            return {
              message: 'You try to open the train door, but it is locked. Maybe you should try heading west towards the exit.',
              newState: currentState
            };
          }

          return {
            message: 'The train is locked and immobile. You can look at it or try going west towards the exit.',
            newState: currentState
          };
        }
      }],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'You can see a train parked at the platform. The doors are closed. The exit is to the west.',
            newState: currentState
          };
        }

        if (verb === 'go') {
          if (params.map(term => term.text.toLowerCase()).includes('west')) {
            return {
              message: 'You exit the train station and find yourself on the street. There is an auto in front of you and a bus stand a little further down the road.',
              newState: {
                ...currentState,
                currentRoom: 'Street'
              }
            }
          }
          return {
            message: 'The only way out is west. Try "go west" to leave the station.',
            newState: currentState
          };
        }

        return {
          message: 'You can try looking around ("look") or going west ("go west") to exit the station.',
          newState: currentState
        };
      }
    },
    {
      name: 'Street',
      objects: [{
        name: 'auto',
        verbHandler: this.autoHandler.bind(this),
      },
      {
        name: 'driver',
        verbHandler: this.autoHandler.bind(this),
      }],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'You can see a bus parked at the bus stand. There is an auto in front of you. The sun is getting low in the sky.',
            newState: currentState
          };
        }

        if (verb === 'go') {
          if (params.map(term => term.text.toLowerCase()).includes('bus')) {
            return {
              message: 'You walk towards the bus stand.',
              newState: {
                ...currentState,
                currentRoom: 'Bus Stand'
              }
            }
          }
          return {
            message: 'You can go to the bus stand ("go bus") or interact with the auto and its driver.',
            newState: currentState
          };
        }

        return {
          message: 'You can look around ("look"), go to the bus stand ("go bus"), or interact with the auto and its driver (try "talk driver" or "look auto").',
          newState: currentState
        };
      }
    },
    {
      name: 'Bus Stand',
      objects: [{
        name: 'bus',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          const busActions = ['board', 'get on', 'get off'];
          if (busActions.includes(verb)) {
            return {
              message: 'The conductor looks at you and says "Last bus left an hour ago. Next bus to Benagram is tomorrow morning. Strange place, that village..." Maybe you should try the auto instead.',
              newState: currentState
            };
          }

          return {
            message: 'The bus isn\'t going anywhere today. You could try looking around ("look") or checking if the auto is still available.',
            newState: currentState
          };
        }
      }],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'The bus stand is nearly empty. A single bus is parked here. You can go back to the street.',
            newState: currentState
          };
        }

        return {
          message: 'You can look around ("look"), check the bus ("look bus"), or try to board it ("board bus"). You might also want to go back to check the auto.',
          newState: currentState
        };
      }
    },
    {
      name: 'On the way to Benagram',
      objects: [],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'The auto rattles along the dark road. The sun has set completely. Through the trees, you catch glimpses of distant fires in the village. The driver is unusually quiet.',
            newState: currentState
          };
        }

        const talkActions = ['talk', 'speak', 'ask', 'chat'];
        if (talkActions.includes(verb)) {
          return {
            message: 'The driver ignores you completely, his knuckles white on the steering wheel. He drops you near the outskirts of Benagram village.',
            newState: {
              ...currentState,
              currentRoom: 'Benagram Outskirts'
            }
          };
        }

        const waitActions = ['wait', 'end'];
        if (waitActions.includes(verb)) {
          return {
            message: 'The journey continues in silence.... You arrive at the outskirts of Benagram village.',
            newState: {
              ...currentState,
              currentRoom: 'Benagram Outskirts'
            }
          };
        }

        return {
          message: 'During the journey, you can look around ("look"), try to talk to the driver ("talk"), or simply wait ("wait") until you arrive.',
          newState: currentState
        };
      }
    },
    {
      name: 'Benagram Outskirts',
      objects: [{
        name: 'fires',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          if (verb === 'look') {
            return {
              message: 'Multiple bonfires burn in the distance. You can hear faint chanting carried by the wind.',
              newState: currentState
            };
          }
          return {
            message: 'The fires are too far to interact with directly. You can look at them ("look fires") or try going deeper into the village ("go").',
            newState: currentState
          };
        }
      }],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'The auto driver has dropped you at the village entrance and quickly driven away. Multiple fires burn in the distance. The village seems deserted, but you can hear chanting from somewhere deeper in the village. A narrow path leads towards the center.',
            newState: currentState
          };
        }

        if (verb === 'go') {
          return {
            message: 'You cautiously walk down the path towards the village center...',
            newState: {
              ...currentState,
              currentRoom: 'Village Center'
            }
          };
        }

        return {
          message: 'You can look around ("look"), examine the fires ("look fires"), or proceed into the village ("go").',
          newState: currentState
        };
      }
    },
    {
      name: 'Village Center',
      objects: [{
        name: 'ritual',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          if (verb === 'look') {
            return {
              message: 'Villagers in dark robes are performing some kind of ritual around a large bonfire. They seem to be chanting in an unknown language. In the center, there\'s a strange symbol drawn on the ground.',
              newState: currentState
            };
          }
          return {
            message: 'You can observe the ritual from a distance ("look ritual"), but getting closer might be dangerous. Consider hiding ("hide") or trying to leave ("leave").',
            newState: currentState
          };
        }
      },
      {
        name: 'villagers',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          const approachActions = ['approach', 'talk', 'speak', 'join'];
          if (approachActions.includes(verb)) {
            currentState.health -= 100;
            return {
              message: 'The villagers spot you and stop chanting. Their eyes glow with an unnatural light. They surround you before you can escape...',
              newState: currentState
            };
          }
          return {
            message: 'The villagers seem dangerous. You might want to hide ("hide") or observe from a safe distance ("look ritual").',
            newState: currentState
          };
        }
      }],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'You\'ve reached the village center. A large group of villagers in dark robes are gathered around a massive bonfire. They\'re performing some kind of ritual, chanting in an unknown language. The air feels heavy with an unnatural energy. You can hide behind some bushes or try to leave the village.',
            newState: currentState
          };
        }

        if (verb === 'hide') {
          return {
            message: 'You hide behind the bushes and observe the ritual from a safe distance. The chanting grows louder, and the fire seems to change color...',
            newState: currentState
          };
        }

        if (verb === 'leave') {
          return {
            message: 'You try to quietly leave, but some villagers spot you. Their eyes glow with an unnatural light...',
            newState: {
              ...currentState,
              health: 0
            }
          };
        }

        return {
          message: 'You can look around ("look"), examine the ritual ("look ritual"), hide in the bushes ("hide"), or attempt to leave ("leave"). Be careful with your choices!',
          newState: currentState
        };
      }
    }
  ];

  constructor() { }

  getRoom(roomName: string) {
    return this.rooms.find(room => room.name === roomName);
  }
}
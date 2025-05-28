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
        message: 'The driver looks at you angrily and says "100 Rupees to go to benagram village. Take it or leave it. But I warn you, no one goes there after sunset. Not since the incident with the old temple."',
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
        message: 'You board the auto and pay the driver 100 Rupees. The driver mutters "Your funeral..." under his breath as he starts driving. The sun is setting, casting long shadows across the road...',
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
            message: 'You can see a bus parked at the bus stand. There is an auto in front of you. The sun is getting low in the sky, casting an eerie red glow over everything.',
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
              message: 'The conductor looks at you nervously and says "Last bus left an hour ago. Next bus to Benagram is tomorrow morning. Strange place, that village... Not since they found those markings in the old temple. Best stay away, if you ask me."',
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
            message: 'The bus stand is nearly empty. A single bus is parked here. You can go back to the street. An old woman in the corner is muttering something about "the ritual" and "the temple".',
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
            message: 'The auto rattles along the dark road. The sun has set completely. Through the dense trees, you catch glimpses of distant fires in the village. Strange symbols seem to glow faintly on some of the trees. The driver is unusually quiet, his hands trembling slightly on the steering wheel.',
            newState: currentState
          };
        }

        const talkActions = ['talk', 'speak', 'ask', 'chat'];
        if (talkActions.includes(verb)) {
          return {
            message: 'The driver ignores you completely, his knuckles white on the steering wheel. You notice he\'s wearing some kind of protective amulet. He suddenly stops the auto near the outskirts of Benagram village, practically pushing you out. "This is as far as I go. The old temple... it\'s not safe after dark."',
            newState: {
              ...currentState,
              currentRoom: 'Benagram Outskirts'
            }
          };
        }

        const waitActions = ['wait', 'end'];
        if (waitActions.includes(verb)) {
          return {
            message: 'The journey continues in silence.... Strange whispers seem to come from the forest. You arrive at the outskirts of Benagram village, the auto driver refusing to go any further.',
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
              message: 'Multiple bonfires burn in the distance, forming a strange pattern when viewed together. You can hear faint chanting carried by the wind, mixed with other, less natural sounds.',
              newState: currentState
            };
          }
          return {
            message: 'The fires are too far to interact with directly. You can look at them ("look fires") or try going deeper into the village ("go"). To the east, you notice the crumbling spire of what must be the old temple.',
            newState: currentState
          };
        }
      }],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'The auto driver has fled, leaving you at the village entrance. Multiple fires burn in the distance, forming an unsettling pattern. The village seems deserted, but you can hear chanting from somewhere deeper in. A narrow path leads towards the center, while an overgrown trail branches east towards what appears to be an ancient temple.',
            newState: currentState
          };
        }

        if (verb === 'go') {
          if (params.map(term => term.text.toLowerCase()).includes('east')) {
            return {
              message: 'You follow the overgrown path east towards the temple...',
              newState: {
                ...currentState,
                currentRoom: 'Temple Entrance'
              }
            };
          }
          return {
            message: 'You cautiously walk down the path towards the village center...',
            newState: {
              ...currentState,
              currentRoom: 'Village Center'
            }
          };
        }

        return {
          message: 'You can look around ("look"), examine the fires ("look fires"), go to the village center ("go") or head east to the temple ("go east").',
          newState: currentState
        };
      }
    },
    {
      name: 'Temple Entrance',
      objects: [{
        name: 'temple',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          if (verb === 'look') {
            return {
              message: 'The temple is ancient, its stone walls covered in strange symbols that seem to shift when you\'re not looking directly at them. The entrance is partially blocked by fallen debris, but there\'s enough space to squeeze through.',
              newState: currentState
            };
          }
          return {
            message: 'The temple radiates an unnatural energy. You can enter ("enter temple") if you dare, or examine it more closely ("look temple").',
            newState: currentState
          };
        }
      }],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'You stand before an ancient temple, its architecture unlike anything you\'ve seen before. Strange symbols cover its walls, and the air feels thick with an otherworldly presence. The entrance is partially blocked but passable. You can hear the village chanting in the distance.',
            newState: currentState
          };
        }

        if (verb === 'enter') {
          return {
            message: 'Gathering your courage, you squeeze through the temple entrance...',
            newState: {
              ...currentState,
              currentRoom: 'Temple Interior'
            }
          };
        }

        return {
          message: 'You can look around ("look"), examine the temple ("look temple"), enter it ("enter"), or return to the village outskirts.',
          newState: currentState
        };
      }
    },
    {
      name: 'Temple Interior',
      objects: [{
        name: 'altar',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          if (verb === 'look') {
            return {
              message: 'The altar is made of black stone, covered in intricate carvings that seem to move in your peripheral vision. A strange artifact rests upon it, pulsing with an inner light.',
              newState: currentState
            };
          }
          return {
            message: 'The altar emanates a powerful energy. You can examine it ("look altar") or try to take the artifact, though that might be dangerous.',
            newState: currentState
          };
        }
      }],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'The temple interior is dimly lit by an otherworldly glow. Ancient symbols cover the walls, and at the center stands a black stone altar. The air thrums with energy, and you can hear whispers that seem to come from nowhere and everywhere.',
            newState: currentState
          };
        }

        return {
          message: 'You can look around ("look"), examine the altar ("look altar"), or try to leave before it\'s too late.',
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
              message: 'Villagers in dark robes are performing some kind of ritual around a large bonfire. They seem to be chanting in an ancient language, their voices creating patterns in the air. In the center, there\'s a complex symbol drawn on the ground that pulses with the same energy you felt in the temple.',
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
              message: 'The villagers spot you and stop chanting. Their eyes glow with an unnatural light, and you realize they\'re no longer entirely human. They surround you before you can escape...',
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
            message: 'You\'ve reached the village center. A large group of villagers in dark robes are gathered around a massive bonfire, performing a ritual that makes the air itself feel wrong. They\'re chanting in an unknown language that hurts your ears. The air feels heavy with an unnatural energy that seems connected to the temple. You can hide behind some bushes or try to leave.',
            newState: currentState
          };
        }

        if (verb === 'hide') {
          return {
            message: 'You hide behind the bushes and observe the ritual from a safe distance. The chanting grows louder, and the fire changes color, casting shadows that move in impossible ways...',
            newState: currentState
          };
        }

        if (verb === 'leave') {
          return {
            message: 'You try to quietly leave, but some villagers spot you. Their eyes glow with an unnatural light, and you realize with horror that the ritual has already changed them into something else...',
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
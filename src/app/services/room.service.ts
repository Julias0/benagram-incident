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
        message: 'The driver looks at you angrily and says "100 Rupees to go to benagram village. Take it or leave it."',
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
        message: 'You board the auto and pay the driver 100 Rupees. The driver drives off.',
        newState: {
          ...currentState,
          currentRoom: 'On the way to Benagram'
        }
      };
    } else if (paymentActions.includes(verb) && !currentState.inventory.includes('100 Rupee Note')) {
      return {
        message: 'You don\'t have any 100 Rupee Notes.',
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

    const violenceActions = ['abuse', 'fight', 'slap', 'hit', 'attack', 'punch', 'kick'];
    if (violenceActions.includes(verb)) {
      currentState.health -= 50;
      currentState.currentRoom = 'Bus Stand';
      return {
        message: 'The auto driver punches you in the face. You fall to the ground and the auto drives away. You hobble towards the bus stand.',
        newState: currentState
      };
    }

    return {
      message: 'You can\'t do that.',
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
              message: 'You try to open the train door, but it is locked.',
              newState: currentState
            };
          }

          return {
            message: 'You can\'t do that.',
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
              message: 'You exit the train station and find yourself on the street.',
              newState: {
                ...currentState,
                currentRoom: 'Street'
              }
            }
          }
        }


        return {
          message: 'You can\'t do that.',
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
      }
      ],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'You can see a bus parked at the bus stand. There is a auto in front of you.',
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
        }

        return {
          message: 'You can\'t do that.',
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
              message: 'The conductor looks at you and says "20 Rupees to go to benagram village. It will take 2 hours."',
              newState: currentState
            };
          }

          return {
            message: 'You can\'t do that.',
            newState: currentState
          };
        }
      }],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'You can see a bus parked at the bus stand.',
            newState: currentState
          };
        }

        return {
          message: 'You can\'t do that.',
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

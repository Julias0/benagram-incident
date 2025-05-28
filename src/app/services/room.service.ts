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
        message: 'The auto is parked in the street. It is old and dirty. The driver looks at you warily, his weathered hands gripping a mysterious amulet.',
        newState: currentState
      };
    }

    const autoActions = ['go','speak', 'talk', 'approach', 'ask', 'shout'];
    if (autoActions.includes(verb)) {
      if (currentState.inventory.includes('Talked to Driver')) {
        return {
          message: 'The driver nods and says "I already told you - 100 Rupees to Benagram. You ready to pay and go, or you need to think about it more? Strange things happening there lately, so I won\'t wait all day."',
          newState: currentState
        };
      } else {
        return {
          message: 'The driver studies you carefully and says "100 Rupees to Benagram village. You look like you might be heading there on business. Fair warning though - strange things been happening in that area lately. People going missing, weird sounds at night. Still want to go?"',
          newState: {
            ...currentState,
            inventory: [...currentState.inventory, 'Talked to Driver']
          }
        };
      }
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
        message: 'You pay the driver 100 Rupees. He examines the note carefully, then looks at you. "You seem different from the others. Here, take this." He hands you an old brass key. "My grandfather gave this to me. Said it opens something important in the temple. You might need it more than I do." He starts the engine, muttering protective chants.',
        newState: {
          ...currentState,
          currentRoom: 'On the way to Benagram',
          inventory: [...currentState.inventory, 'Ancient Brass Key']
        }
      };
    } else if (paymentActions.includes(verb) && !currentState.inventory.includes('100 Rupee Note')) {
      return {
        message: 'You don\'t have any 100 Rupee Notes. The driver points to a small poster on his dashboard: "Missing: Dr. Sarah Chen, Lead Archaeologist. Last seen near Benagram Temple. Reward: 500 Rupees." Maybe there are other ways to afford this trip.',
        newState: currentState
      };
    }

    const askAboutActions = ['ask about', 'inquire', 'question'];
    if (askAboutActions.includes(verb) || params.some(p => ['missing', 'people', 'strange', 'sounds', 'benagram', 'temple'].includes(p.text.toLowerCase()))) {
      if (currentState.inventory.includes('Talked to Driver')) {
        return {
          message: 'The driver leans closer and whispers "Been driving this route for 20 years. Never seen anything like what\'s happening now. Started about three months ago when those archaeologists arrived. First the animals went quiet, then people started having the same nightmares. Dr. Chen - she was the lead researcher - she found something down there that changed her. Haven\'t seen her in weeks."',
          newState: currentState
        };
      } else {
        return {
          message: 'The driver says "Talk to me first if you want information. I don\'t share stories with strangers."',
          newState: currentState
        };
      }
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

    const thankActions = ['thank', 'thanks'];
    if (thankActions.includes(verb) && currentState.inventory.includes('Talked to Driver')) {
      return {
        message: 'The driver nods grimly. "Just be careful out there. And if you find Dr. Chen... well, I hope she\'s still herself."',
        newState: currentState
      };
    }

    return {
      message: 'The auto driver seems uninterested in that. Try talking to him first ("talk to driver"), asking about the strange happenings ("ask about missing people"), looking at the auto, or paying the fare if you have enough money.',
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
        name: 'poster',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          if (verb === 'look') {
            return {
              message: 'MISSING: Dr. Sarah Chen, 34, Lead Archaeologist. Last seen: Benagram Village, near the ancient temple site. Distinguishing features: Always carries a leather journal, wears a distinctive silver pendant. Contact: Archaeological Survey of India. REWARD: 500 Rupees. Note: If you have any information about the ongoing excavation or strange occurrences in the area, please report immediately.',
              newState: currentState
            };
          }
          return {
            message: 'The missing person poster gives you valuable information about Dr. Chen and the archaeological dig.',
            newState: currentState
          };
        }
      },
      {
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
            message: 'You can see a bus parked at the bus stand. There is an auto in front of you. The sun is getting low in the sky, casting an eerie red glow over everything. A small poster flutters on a nearby wall - it appears to be a missing person notice.',
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
          message: 'You can look around ("look"), examine the missing person poster ("look poster"), go to the bus stand ("go bus"), or interact with the auto and its driver. Try "talk to driver" to start a conversation, "ask about missing people" for more details, or "look auto" to examine the vehicle.',
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
              message: 'The conductor looks at you nervously and says "Last bus left an hour ago. Next bus to Benagram is tomorrow morning. You asking about that missing lady doctor? Heard she was real smart, studying them old symbols. But something down there got to her mind, I reckon. Started talking about \'awakening\' something ancient. You sure you want to go there?"',
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
            message: 'The bus stand is nearly empty. A single bus is parked here. You can go back to the street. An old woman in the corner clutches a faded photograph and mutters about "the chosen one" and "the awakening beneath". Her eyes seem to track movement that isn\'t there.',
            newState: currentState
          };
        }

        const talkActions = ['talk', 'speak', 'ask'];
        if (talkActions.includes(verb)) {
          return {
            message: 'You approach the old woman. She looks up with cloudy eyes and whispers: "The archaeologist lady... she understood. The symbols weren\'t just decorations - they were warnings. Seals. But greed makes people deaf to wisdom. Now the boundary grows thin, and the Sleeper stirs. Are you here to stop it, or are you just another fool seeking treasure?" She presses something into your hand - an old brass coin with strange markings.',
            newState: {
              ...currentState,
              inventory: [...currentState.inventory, 'Ancient Coin']
            }
          };
        }

        return {
          message: 'You can look around ("look"), check the bus ("look bus"), try to board it ("board bus"), talk to the old woman ("talk"), or go back to check the auto.',
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
            message: 'The driver finally speaks: "Three months ago, that research team arrived. Archaeologists, they said. Started digging around the temple, disturbing things that should stay buried. First, the animals started acting strange. Then people began having the dreams - visions of ancient rituals, voices calling from beneath the earth. Dr. Chen, their leader, she found something down there. Something that changed her. Last anyone saw her, she was walking into the temple at midnight, speaking in a language nobody recognized." He stops the auto abruptly. "This is as far as I go."',
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
        name: 'sign',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          if (verb === 'look') {
            return {
              message: 'DANGER - ARCHAEOLOGICAL EXCAVATION IN PROGRESS - AUTHORIZED PERSONNEL ONLY. By order of Archaeological Survey of India. Site Director: Dr. Sarah Chen. Emergency Contact: Dr. Raj Patel - Deputy Director. WARNING: Unauthorized entry may result in prosecution. NOTE: All personnel must carry protective amulets at all times. Report any unusual phenomena immediately.',
              newState: currentState
            };
          }
          return {
            message: 'The official sign warns of ongoing excavation work and mentions Dr. Chen.',
            newState: currentState
          };
        }
      },
      {
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
            message: 'The auto driver has fled, leaving you at the village entrance. Multiple fires burn in strategic positions, forming what looks like a protective barrier around the village. To the north, you can see the lights of what appears to be a research camp. East leads to an ancient temple, while south reveals the main village where chanting echoes. A wooden sign reads: "DANGER - ARCHAEOLOGICAL EXCAVATION IN PROGRESS - AUTHORIZED PERSONNEL ONLY".',
            newState: currentState
          };
        }

        if (verb === 'go') {
          if (params.map(term => term.text.toLowerCase()).includes('north')) {
            return {
              message: 'You head north towards the research camp, following fresh tire tracks in the mud...',
              newState: {
                ...currentState,
                currentRoom: 'Research Camp'
              }
            };
          }
          if (params.map(term => term.text.toLowerCase()).includes('east')) {
            return {
              message: 'You follow the overgrown path east towards the temple...',
              newState: {
                ...currentState,
                currentRoom: 'Temple Entrance'
              }
            };
          }
          if (params.map(term => term.text.toLowerCase()).includes('south')) {
            return {
              message: 'You cautiously walk down the path towards the village center...',
              newState: {
                ...currentState,
                currentRoom: 'Village Center'
              }
            };
          }
          return {
            message: 'You can go north to the research camp ("go north"), east to the temple ("go east"), or south to the village ("go south").',
            newState: currentState
          };
        }

        return {
          message: 'You can look around ("look"), examine the fires ("look fires"), examine the sign ("look sign"), go north to the research camp ("go north"), east to the temple ("go east"), or south to the village ("go south").',
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

        if (verb === 'go') {
          if (params.map(term => term.text.toLowerCase()).includes('west')) {
            return {
              message: 'You return to the village outskirts...',
              newState: {
                ...currentState,
                currentRoom: 'Benagram Outskirts'
              }
            };
          }
        }

        return {
          message: 'You can look around ("look"), examine the temple ("look temple"), enter it ("enter"), or go west to return to the village outskirts ("go west").',
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

        if (verb === 'go') {
          if (params.map(term => term.text.toLowerCase()).includes('down') || params.map(term => term.text.toLowerCase()).includes('secret')) {
            if (currentState.inventory.includes('Research Journal')) {
              return {
                message: 'Using the information from Dr. Chen\'s research journal, you locate a hidden passage behind the altar leading to her secret laboratory...',
                newState: {
                  ...currentState,
                  currentRoom: 'Dr. Chen\'s Laboratory'
                }
              };
            } else {
              return {
                message: 'You sense there might be hidden passages here, but you need more information to find them.',
                newState: currentState
              };
            }
          }
          if (params.map(term => term.text.toLowerCase()).includes('out') || params.map(term => term.text.toLowerCase()).includes('exit')) {
            return {
              message: 'You quickly exit the temple, feeling the oppressive energy fade as you step outside.',
              newState: {
                ...currentState,
                currentRoom: 'Temple Entrance'
              }
            };
          }
        }

        return {
          message: 'You can look around ("look"), examine the altar ("look altar"), exit the temple ("go out"), or if you have Dr. Chen\'s research journal, search for hidden passages ("go down").',
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
    },
    {
      name: 'Research Camp',
      objects: [{
        name: 'tent',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          if (verb === 'look') {
            return {
              message: 'The main research tent is partially collapsed, equipment scattered around. Charts and maps are pinned to makeshift boards, showing the temple layout and underground tunnels. Dr. Chen\'s personal tent stands nearby, still sealed.',
              newState: currentState
            };
          }
          const enterActions = ['enter', 'open', 'search'];
          if (enterActions.includes(verb)) {
            return {
              message: 'You enter the main research tent. Inside, you find excavation reports, photographs of strange symbols, and a disturbing journal entry: "Day 23: The symbols are not decorative. They\'re a containment system. We may have made a terrible mistake." You also find a digital camera with the last photos taken at the dig site.',
              newState: {
                ...currentState,
                inventory: [...currentState.inventory, 'Research Journal', 'Digital Camera']
              }
            };
          }
          return {
            message: 'You can examine the tent ("look tent") or enter it ("enter tent") to search for clues.',
            newState: currentState
          };
        }
      },
      {
        name: 'equipment',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          if (verb === 'look') {
            return {
              message: 'Sophisticated archaeological equipment lies abandoned: ground-penetrating radar, carbon dating samples, and something unexpected - electromagnetic field detectors showing highly unusual readings. A handheld device beeps frantically when pointed toward the temple.',
              newState: currentState
            };
          }
          const takeActions = ['take', 'grab', 'pick'];
          if (takeActions.includes(verb)) {
            return {
              message: 'You take the EMF detector. It might help you detect paranormal activity or energy sources.',
              newState: {
                ...currentState,
                inventory: [...currentState.inventory, 'EMF Detector']
              }
            };
          }
          return {
            message: 'The equipment could be useful. Try taking ("take equipment") or examining it ("look equipment").',
            newState: currentState
          };
        }
      }],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'The research camp appears hastily abandoned. Several tents remain standing, with expensive equipment scattered about. You can see Dr. Chen\'s personal tent, the main research tent, and various archaeological equipment. Fresh tire tracks suggest some people left recently, but others... didn\'t.',
            newState: currentState
          };
        }

        if (verb === 'go') {
          if (params.map(term => term.text.toLowerCase()).includes('south')) {
            return {
              message: 'You head back south toward the village outskirts...',
              newState: {
                ...currentState,
                currentRoom: 'Benagram Outskirts'
              }
            };
          }
          if (params.map(term => term.text.toLowerCase()).includes('underground') || params.map(term => term.text.toLowerCase()).includes('tunnels')) {
            return {
              message: 'Following the research notes, you locate the hidden entrance to the underground excavation site...',
              newState: {
                ...currentState,
                currentRoom: 'Underground Excavation'
              }
            };
          }
        }

        return {
          message: 'You can look around ("look"), examine the tents ("look tent"), check the equipment ("look equipment"), go back south ("go south"), or if you found the research notes, explore the underground tunnels ("go underground").',
          newState: currentState
        };
      }
    },
    {
      name: 'Underground Excavation',
      objects: [{
        name: 'chamber',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          if (verb === 'look') {
            return {
              message: 'The excavated chamber reveals an ancient underground complex far older than the temple above. The walls are covered in three distinct layers of symbols - the oldest appear to be warnings, the middle layer describes some kind of binding ritual, and the newest layer... seems to have been carved recently, in what looks disturbingly like blood.',
              newState: currentState
            };
          }
          return {
            message: 'The chamber holds many secrets. You can examine it further or explore deeper.',
            newState: currentState
          };
        }
      },
      {
        name: 'artifact',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          if (verb === 'look') {
            return {
              message: 'At the center of the chamber sits an obsidian pedestal with a crystalline artifact that pulses with an inner light. This is clearly what Dr. Chen\'s team discovered. Ancient texts scattered nearby seem to call it the "Heart of the Sleeper" - a key to something that was meant to stay locked.',
              newState: currentState
            };
          }
          const takeActions = ['take', 'grab', 'touch'];
          if (takeActions.includes(verb)) {
            if (currentState.inventory.includes('Ancient Brass Key') && currentState.inventory.includes('Ancient Coin')) {
              return {
                message: 'The brass key and ancient coin react to the artifact, creating a protective barrier. You safely extract the crystal. As you do, the chamber begins to collapse, but you feel a strange sense of completion - as if you\'ve broken an ancient cycle.',
                newState: {
                  ...currentState,
                  inventory: [...currentState.inventory, 'Heart of the Sleeper'],
                  currentRoom: 'Temple Entrance'
                }
              };
            } else {
              currentState.health -= 50;
              return {
                message: 'As you touch the artifact, visions flood your mind - ancient civilizations, cosmic entities, and the terrible price of awakening what sleeps beneath. You stagger back, weakened but alive. You need protective items before attempting this again.',
                newState: currentState
              };
            }
          }
          return {
            message: 'The artifact radiates immense power. You might need protective items before attempting to take it.',
            newState: currentState
          };
        }
      }],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'You\'ve descended into Dr. Chen\'s excavation site. This underground chamber predates the temple by millennia. Ancient symbols cover every surface, and at the center sits an obsidian pedestal holding what appears to be the source of all the supernatural activity. The air thrums with otherworldly energy.',
            newState: currentState
          };
        }

        return {
          message: 'You can examine the chamber ("look chamber"), study the artifact ("look artifact"), attempt to take it ("take artifact"), or try to leave ("leave").',
          newState: currentState
        };
      }
    },
    {
      name: 'Dr. Chen\'s Laboratory',
      objects: [{
        name: 'journal',
        verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
          if (verb === 'look') {
            return {
              message: 'Dr. Chen\'s personal journal details her transformation from skeptical scientist to believer. Final entry: "I understand now. The entity isn\'t evil - it\'s been imprisoned here for eons, and the villagers are its unwilling jailers. The ritual maintains the prison, but the cost... my team thinks I\'ve lost my mind, but I see the truth. Someone must end this cycle. The heart of the sleeper is the key to either permanent binding or merciful release."',
              newState: currentState
            };
          }
          return {
            message: 'Dr. Chen\'s journal reveals the true nature of the situation in Benagram.',
            newState: currentState
          };
        }
      }],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'look') {
          return {
            message: 'Dr. Chen\'s private workspace, hidden beneath the research camp. Her journal lies open, revealing the true scope of the Benagram incident. This isn\'t just about an archaeological discovery - it\'s about an ancient entity, a prison that\'s been maintained for centuries, and a terrible choice that must be made.',
            newState: currentState
          };
        }

        if (verb === 'decide' || verb === 'choose') {
          if (currentState.inventory.includes('Heart of the Sleeper')) {
            return {
              message: 'With the Heart of the Sleeper in your possession, you face the ultimate choice: Use it to strengthen the prison and condemn future generations to maintain this terrible cycle, or release the entity and trust in Dr. Chen\'s belief that it can be freed without catastrophe. The decision will determine the fate of Benagram and perhaps the world.',
              newState: {
                ...currentState,
                currentRoom: 'Final Choice'
              }
            };
          }
          return {
            message: 'You cannot make the final decision without the Heart of the Sleeper.',
            newState: currentState
          };
        }

        return {
          message: 'You can examine Dr. Chen\'s journal ("look journal") or, if you have the Heart of the Sleeper, make the final decision ("decide").',
          newState: currentState
        };
      }
    },
    {
      name: 'Final Choice',
      objects: [],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        if (verb === 'bind' || verb === 'imprison' || verb === 'seal') {
          return {
            message: 'You choose to strengthen the ancient prison. The Heart of the Sleeper flares with binding energy, renewing the seals for another millennium. The villagers are freed from their curse, but somewhere else, someone will have to take up the burden of guardianship. You\'ve solved the immediate crisis but perpetuated an endless cycle. As you leave Benagram, you wonder if there might have been another way.',
            newState: {
              ...currentState,
              currentRoom: 'Ending - Bound'
            }
          };
        }

        if (verb === 'release' || verb === 'free' || verb === 'liberate') {
          return {
            message: 'You choose to trust Dr. Chen\'s research and release the ancient entity. The Heart of the Sleeper dissolves in your hands as eons-old bindings shatter. For a terrifying moment, cosmic energies swirl around you, but then... peace. The entity, finally free, dissipates into the cosmos with what might have been gratitude. The village\'s supernatural curse ends forever, and you realize Dr. Chen was right - sometimes the bravest choice is to trust in the possibility of redemption.',
            newState: {
              ...currentState,
              currentRoom: 'Ending - Released'
            }
          };
        }

        return {
          message: 'The moment of truth has arrived. You can "bind" the entity to strengthen its prison, or "release" it and trust in Dr. Chen\'s belief that freedom is the answer. Choose wisely.',
          newState: currentState
        };
      }
    },
    {
      name: 'Ending - Bound',
      objects: [],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        return {
          message: 'The Benagram Incident is resolved, but the cycle continues. Somewhere, new guardians will take up the burden. You\'ve chosen security over trust, continuation over resolution. History will remember you as the one who maintained the ancient order, for better or worse.',
          newState: currentState
        };
      }
    },
    {
      name: 'Ending - Released',
      objects: [],
      verbHandler: (verb: string, currentState: GameState, params: Term[]) => {
        return {
          message: 'The Benagram Incident is truly resolved. The ancient cycle is broken, the village is free, and you\'ve proven that sometimes the greatest courage lies in choosing trust over fear. Dr. Chen\'s sacrifice was not in vain - her research and faith in redemption have freed an entity that was never truly evil, just misunderstood and imprisoned.',
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
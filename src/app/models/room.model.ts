import { Term } from "compromise/types/misc";
import { GameState } from "./game-state.model";

export interface Room {
  name: string;
  objects: {
    name: string;
    verbHandler: (verb: string, currentState: GameState, params: Term[]) => ({ message: string; newState: GameState });
  }[];
  verbHandler: (verb: string, currentState: GameState, params: Term[]) => ({ message: string; newState: GameState });
}
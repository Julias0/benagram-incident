import { GameState } from "./game-state.model";
import { Term } from "compromise/types/misc";

export interface Verb {
  execute: (currentState: GameState, params: Term[]) => { message: string; newState: GameState };
}
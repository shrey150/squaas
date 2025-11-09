export interface Player {
  lat: number;
  lon: number;
  heading: number;
}

export interface POI {
  lat: number;
  lon: number;
  label: string;
}

export interface Message {
  text: string;
  visible: boolean;
  timeoutMs: number;
}

export interface GameState {
  player: Player;
  pois: POI[];
  objective: string;
  message: Message;
  danger_level: string;  // "none", "low", "high"
  boss_fight_active: boolean;
  boss_name: string | null;
  environment: string;
}


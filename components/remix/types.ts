export type MusicType = "vocal" | "bgm";
export type Gender = "Female" | "Male" | null;

export interface ProportionalValue {
  name: string;
  value: number;
}

export interface MusicParams {
  type: MusicType;
  lyrics: string;
  gender: Gender;
  duration: number;
  genreProportions: ProportionalValue[];
  moodProportions: ProportionalValue[];
  timbreProportions: ProportionalValue[];
}

export interface Song {
  id: string;
  title: string;
  params_used: string;
}

// Constants for genre, mood, and timbre options
export const GENRES = [
  "Pop", "Rock", "Hip Hop", "R&B", "Electronic", 
  "Jazz", "Classical", "Country", "Folk", "Reggae"
];

export const MOODS = [
  "Happy", "Sad", "Energetic", "Calm", "Romantic", 
  "Angry", "Peaceful", "Nostalgic", "Dreamy", "Intense"
];

export const TIMBRES = [
  "Bright", "Dark", "Warm", "Cold", "Smooth", 
  "Rough", "Airy", "Dense", "Clear", "Muffled"
];

export interface Game {
  id: number;
  title: string;
  description?: string;
  version?: string;
  genre?: string;
  developerName?: string;
  coverImageUrl?: string;
  downloadUrl?: string;
  createdAt?: string;
}

export interface CreateGame {
  title: string;
  description?: string;
  version?: string;
  genre?: string;
  developerName?: string;
  coverImageUrl?: string;
  downloadUrl?: string;
}
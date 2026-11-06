import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GameDTO {
  id: number;
  title: string;
  description: string | null;
  version: string | null;
  genre: string | null;
  developerName: string | null;
  coverImageUrl: string | null;
  downloadUrl: string | null;
  createdAt: string;
  gameToken?: string;
  leaderboardLinked?: boolean;
}

export interface CreateGameDTO {
  title: string;
  description?: string | null;
  version?: string | null;
  genre?: string | null;
  developerName?: string | null;
  coverImageUrl?: string | null;
  downloadUrl?: string | null;
  linkLeaderboard?: boolean;
}

export type UpdateGameDTO = CreateGameDTO;

export interface AdminGameDTO {
  id: number;
  title: string;
  description: string | null;
  version: string | null;
  genre: string | null;
  developerName: string | null;
  coverImageUrl: string | null;
  downloadUrl: string | null;
  active: boolean;
  ownerUsername: string | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:8080/api/v1/games';
  private myGamesApiUrl = 'http://localhost:8080/api/v1/my-games';
  private adminApiUrl = 'http://localhost:8080/api/v1/admin/games';

  constructor(private http: HttpClient) {}

  getGames(): Observable<GameDTO[]> {
    return this.http.get<GameDTO[]>(this.apiUrl);
  }

  getGameById(id: number): Observable<GameDTO> {
    return this.http.get<GameDTO>(`${this.apiUrl}/${id}`);
  }

  createGame(dto: CreateGameDTO): Observable<GameDTO> {
    return this.http.post<GameDTO>(this.apiUrl, dto);
  }

  getMyGames(): Observable<GameDTO[]> {
    return this.http.get<GameDTO[]>(this.myGamesApiUrl);
  }

  getMyGameById(id: number): Observable<GameDTO> {
    return this.http.get<GameDTO>(`${this.myGamesApiUrl}/${id}`);
  }

  updateMyGame(id: number, dto: UpdateGameDTO): Observable<GameDTO> {
    return this.http.put<GameDTO>(`${this.myGamesApiUrl}/${id}`, dto);
  }

  disableMyGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.myGamesApiUrl}/${id}`);
  }

  updateGameStatus(id: number, active: boolean): Observable<string> {
    return this.http.patch(`${this.adminApiUrl}/${id}/status`, { active }, { responseType: 'text' });
  }

  getAllGamesForAdmin(): Observable<AdminGameDTO[]> {
    return this.http.get<AdminGameDTO[]>(this.adminApiUrl);
  }

  hardDeleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/${id}`);
  }
}

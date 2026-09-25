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
}

export interface CreateGameDTO {
  title: string;
  description?: string | null;
  version?: string | null;
  genre?: string | null;
  developerName?: string | null;
  coverImageUrl?: string | null;
  downloadUrl?: string | null;
}

export type UpdateGameDTO = CreateGameDTO;

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:8080/api/v1/games';

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

  updateGame(id: number, dto: UpdateGameDTO): Observable<GameDTO> {
    return this.http.put<GameDTO>(`${this.apiUrl}/${id}`, dto);
  }

  deleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

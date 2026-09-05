import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeaderboardDTO {
  nickname: string;
  gameId?: number;
  gameTitle?: string;
  scoreValue: number;
}

export interface LeaderboardResponseDTO {
  id: number;
  nickname: string;
  gameTitle: string;
  scoreValue: number;
  achievedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = 'http://localhost:8080/api/v1/leaderboard';

  constructor(private http: HttpClient) {}

  getScoresByGame(gameId: number): Observable<LeaderboardResponseDTO[]> {
    return this.http.get<LeaderboardResponseDTO[]>(`${this.apiUrl}/game/${gameId}`);
  }

  saveScore(dto: LeaderboardDTO): Observable<LeaderboardResponseDTO> {
    return this.http.post<LeaderboardResponseDTO>(this.apiUrl, dto);
  }
}
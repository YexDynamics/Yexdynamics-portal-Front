import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api';

export interface ExternalGameResponseDTO {
  id: number;
  title: string;
  releaseDate: string | null;
  coverImageUrl: string | null;
  rating: number | null;
  genres: string[];
  platforms: string[];
}

export interface ExternalGameDetailDTO extends ExternalGameResponseDTO {
  description: string | null;
  website: string | null;
  esrbRating: string | null;
  storeUrls: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ExternalGameService {
  private apiUrl = `${API_BASE_URL}/api/v1/external-games`;

  constructor(private http: HttpClient) {}

  getPopularIndieGames(limit = 20): Observable<ExternalGameResponseDTO[]> {
    return this.http.get<ExternalGameResponseDTO[]>(this.apiUrl, { params: { limit } });
  }

  getExternalGameById(id: number): Observable<ExternalGameDetailDTO> {
    return this.http.get<ExternalGameDetailDTO>(`${this.apiUrl}/${id}`);
  }
}

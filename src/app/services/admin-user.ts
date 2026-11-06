import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRole } from './auth';
import { API_BASE_URL } from '../config/api';

export interface AdminUserDTO {
  id: number;
  username: string;
  nickname: string | null;
  email: string;
  role: UserRole;
  enabled: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private apiUrl = `${API_BASE_URL}/api/v1/admin/users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<AdminUserDTO[]> {
    return this.http.get<AdminUserDTO[]>(this.apiUrl);
  }

  updateUserStatus(id: number, enabled: boolean): Observable<AdminUserDTO> {
    return this.http.patch<AdminUserDTO>(`${this.apiUrl}/${id}/status`, { enabled });
  }

  updateUserRole(id: number, role: UserRole): Observable<AdminUserDTO> {
    return this.http.patch<AdminUserDTO>(`${this.apiUrl}/${id}/role`, { role });
  }
}

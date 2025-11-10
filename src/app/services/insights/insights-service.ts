import { Injectable } from '@angular/core';
import {
  InsightsRequestDTO,
  InsightsResponseDTO,
} from '../../models/insights.mode';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InsightsService {
  constructor(private http: HttpClient) {}
  private apiUrl =
    'https://sheet-vision-api-production.up.railway.app/api/insights';

  getInsights(request: InsightsRequestDTO): Observable<InsightsResponseDTO> {
    console.log('Sending request to backend:', request);
    return this.http.post<InsightsResponseDTO>(this.apiUrl, request);
  }
}

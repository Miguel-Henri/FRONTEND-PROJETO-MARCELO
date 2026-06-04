import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TransferenciaPayload {
  contaDestino: string;
  valor: number;
  descricao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransferenciaService {

  private readonly apiUrl = 'http://localhost:8080/api/transferencias';

  constructor(private http: HttpClient) {}

  realizar(payload: TransferenciaPayload): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CONTA_ATIVA } from '../conta-ativa';

@Injectable({
  providedIn: 'root'
})
export class DepositoService {

  private readonly apiUrl = 'http://localhost:8080/api/contas/deposito';

  constructor(private http: HttpClient) {}

  realizar(valor: number): Observable<string> {
    return this.http.post(this.apiUrl, {
      numeroConta: CONTA_ATIVA.numeroConta,
      agencia: CONTA_ATIVA.agencia,
      valor
    }, { responseType: 'text' });
  }
}

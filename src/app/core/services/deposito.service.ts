import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DepositoService {

  private readonly apiUrl = 'http://localhost:8080/api/contas/deposito';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  realizar(valor: number): Observable<string> {
    const conta = this.auth.contaAtiva;
    return this.http.post(this.apiUrl, {
      numeroConta: conta!.numeroConta,
      agencia: conta!.agencia,
      valor
    }, { responseType: 'text' });
  }
}

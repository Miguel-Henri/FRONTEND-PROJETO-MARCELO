import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = 'http://localhost:8080/api/usuarios/novo';

  constructor(private http: HttpClient) { }

  cadastrar(formData: FormData): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, formData);
  }

  /*
  listar(): Observable<Usuario[]> {
      return this.http.get<Usuario[]>(this.apiUrl);
  }
  buscarPorId(id: number): Observable<Usuario> {
      return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }
  */
}
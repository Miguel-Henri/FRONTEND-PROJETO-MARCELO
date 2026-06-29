import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly apiUrl = 'http://localhost:8080/api/usuarios';
  private readonly uploadUrl = 'http://localhost:8080/upload';

  constructor(private http: HttpClient) {}

  uploadFoto(formData: FormData): Observable<string> {
    return this.http.post(this.uploadUrl, formData, { responseType: 'text' });
  }

  cadastrar(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/novo`, usuario);
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  atualizar(id: number, dados: Partial<Pick<Usuario, 'email' | 'telefone' | 'endereco'>>): Observable<{ usuario: Usuario; token: string }> {
    return this.http.patch<{ usuario: Usuario; token: string }>(`${this.apiUrl}/${id}`, dados);
  }
}
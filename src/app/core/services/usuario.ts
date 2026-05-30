import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly apiUrl = 'http://localhost:8080/api/usuarios/novo'; 
  private readonly uploadUrl = 'http://localhost:8080/upload';

  constructor(private http: HttpClient) { } // ← faltava

  uploadFoto(formData: FormData): Observable<string> {
    return this.http.post(this.uploadUrl, formData, { responseType: 'text' });
  }

  cadastrar(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
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
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, UsuarioCadastro } from '../models/usuario';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private readonly apiUrl = 'http://localhost:8080/api/usuario/cadastro';

    constructor(private http: HttpClient) { }

    cadastrar(usuario: UsuarioCadastro): Observable<Usuario> {
        return this.http.post<Usuario>(this.apiUrl, usuario);
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
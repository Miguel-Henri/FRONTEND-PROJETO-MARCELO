export type PerfilUsuario = 'GERENTE' | 'CLIENTE';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  endereco: string;
  fotoPerfil: string;
  dataCriacao: string;
  dataAtualizacao: string;
  perfil: PerfilUsuario; // ← novo campo vindo do back
}

export interface UsuarioCadastro {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  endereco: string;
  fotoPerfil: string;
}
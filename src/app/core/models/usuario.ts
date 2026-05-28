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
}

export interface UsuarioCadastro {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    endereco: string;
    fotoPerfil: string;
}
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilComponent implements OnInit {
  form: FormGroup;
  carregando = signal(false);
  carregandoDados = signal(true);
  sucesso = signal(false);
  erro = signal<string | null>(null);
  previewFoto = signal<string | null>(null);
  arquivoFoto = signal<File | null>(null);

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      telefone: ['', [Validators.pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/)]],
      email: ['', [Validators.required, Validators.email]],
      endereco: ['', [Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.carregandoDados.set(true);
    // Usa o ID real do usuário logado via AuthService
    const idUsuario = this.auth.usuarioId;
    if (!idUsuario) {
      this.erro.set('Usuário não autenticado.');
      this.carregandoDados.set(false);
      return;
    }
    this.usuarioService.buscarPorId(idUsuario).subscribe({
      next: (usuario) => {
        this.form.patchValue({
          telefone: usuario.telefone ?? '',
          email: usuario.email ?? '',
          endereco: usuario.endereco ?? ''
        });
        this.carregandoDados.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os dados do perfil.');
        this.carregandoDados.set(false);
      }
    });
  }
  

  onFotoPerfilChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (arquivo) {
      this.arquivoFoto.set(arquivo);
      const reader = new FileReader();
      reader.onload = () => this.previewFoto.set(reader.result as string);
      reader.readAsDataURL(arquivo);
    }
  }

  
  get camposFormulario() {
    return this.form.controls;
  }

  campoInvalido(campo: string): boolean {
    const controle = this.form.get(campo);
    return !!(controle && controle.invalid && (controle.dirty || controle.touched));
  }

  onSubmit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.carregando.set(true);
  this.erro.set(null);
  this.sucesso.set(false);

  const idUsuario = this.auth.usuarioId!;

  const salvarDados = (fotoPerfil?: string) => {
    const payload = {
      telefone: this.form.value.telefone || undefined,
      email: this.form.value.email,
      endereco: this.form.value.endereco || undefined,
      fotoPerfil: fotoPerfil  // <-- inclui o nome da foto se houver
    };

    this.usuarioService.atualizar(idUsuario, payload).subscribe({
  next: () => {
    this.carregando.set(false);
    this.sucesso.set(true);
    setTimeout(() => this.sucesso.set(false), 4000);

    // Atualiza a sessão local com os novos dados
    this.auth.atualizarPerfil({
      email: this.form.value.email,
      telefone: this.form.value.telefone || undefined,
      endereco: this.form.value.endereco || undefined,
      fotoPerfil: payload.fotoPerfil  // já está no payload se veio do upload
    });
  },
  error: (err: { status: number }) => {
    this.carregando.set(false);
    if (err.status === 409) {
      this.erro.set('Este e-mail já está em uso por outro usuário.');
    } else if (err.status === 0) {
      this.erro.set('Não foi possível conectar ao servidor.');
    } else {
      this.erro.set('Erro ao salvar as alterações. Tente novamente.');
    }
  }
});
  };

  // Se tem foto, faz upload PRIMEIRO, depois salva com o nome retornado
  if (this.arquivoFoto()) {
    const formData = new FormData();
    formData.append('file', this.arquivoFoto()!);

    this.usuarioService.uploadFoto(formData).subscribe({
      next: (nomeArquivo: string) => {
        salvarDados(nomeArquivo);  // <-- agora usa o nome no payload
      },
      error: () => {
        this.carregando.set(false);
        this.erro.set('Erro ao enviar a foto.');
      }
    });
  } else {
    salvarDados();  // sem foto, salva só os outros dados
  }
}
  }


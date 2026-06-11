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
    const payload = {
      telefone: this.form.value.telefone || undefined,
      email: this.form.value.email,
      endereco: this.form.value.endereco || undefined
    };

    this.usuarioService.atualizar(idUsuario, payload).subscribe({
      next: () => {
        this.carregando.set(false);
        this.sucesso.set(true);
        setTimeout(() => this.sucesso.set(false), 4000);
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
  }
}

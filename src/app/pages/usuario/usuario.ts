import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario';
import { UsuarioCadastro } from '../../core/models/usuario';

@Component({
  selector: 'app-cadastro-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usuario.html',
  styleUrl: './usuario.css'
})
export class CadastroUsuarioComponent {
  form: FormGroup;
  carregando = signal(false);
  sucesso = signal(false);
  erro = signal<string | null>(null);
  mostrarSenha = signal(false);
  previewFoto = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    this.form = this.fb.group(
      {
        nome: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        senha: ['', [Validators.required, Validators.minLength(8)]],
        confirmarSenha: ['', Validators.required],
        telefone: ['', [Validators.pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/)]],
        endereco: ['', [Validators.maxLength(50)]],
        fotoPerfil: ['', [Validators.maxLength(500)]]
      },
      { validators: this.senhasIguaisValidator }
    );
  }

  private senhasIguaisValidator(group: AbstractControl): ValidationErrors | null {
    const senha = group.get('senha')?.value;
    const confirmar = group.get('confirmarSenha')?.value;
    if (senha && confirmar && senha !== confirmar) {
      group.get('confirmarSenha')?.setErrors({ senhasDiferentes: true });
      return { senhasDiferentes: true };
    }
    return null;
  }

  toggleMostrarSenha(): void {
    this.mostrarSenha.update(v => !v);
  }
  
  onFotoPerfilChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const url = input.value.trim();
    this.form.patchValue({ fotoPerfil: url });
    this.previewFoto.set(url || null);
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

    const { confirmarSenha, ...dadosCadastro } = this.form.value;
    const payload: UsuarioCadastro = {
      nome: dadosCadastro.nome,
      email: dadosCadastro.email,
      senha: dadosCadastro.senha,
      telefone: dadosCadastro.telefone || undefined,
      endereco: dadosCadastro.endereco || undefined,
      fotoPerfil: dadosCadastro.fotoPerfil || undefined
    };

    this.usuarioService.cadastrar(payload).subscribe({
      next: () => {
        this.carregando.set(false);
        this.sucesso.set(true);
        this.form.reset();
        this.previewFoto.set(null);
        setTimeout(() => this.router.navigate(['/usuarios']), 2000);
      },
      error: (err: { status: number; }) => {
        this.carregando.set(false);
        if (err.status === 409) {
          this.erro.set('Este e-mail já está cadastrado no sistema.');
        } else if (err.status === 0) {
          this.erro.set('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
          this.erro.set('Ocorreu um erro ao cadastrar. Tente novamente.');
        }
      }
    });
  }

  limparFormulario(): void {
    this.form.reset();
    this.erro.set(null);
    this.sucesso.set(false);
    this.previewFoto.set(null);
  }
}
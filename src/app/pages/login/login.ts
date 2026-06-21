import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  form: FormGroup;
  carregando = signal(false);
  erro = signal<string | null>(null);
  mostrarSenha = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]]
    });
  }

  get camposFormulario() {
    return this.form.controls;
  }

  campoInvalido(campo: string): boolean {
    const controle = this.form.get(campo);
    return !!(controle && controle.invalid && (controle.dirty || controle.touched));
  }

  toggleMostrarSenha(): void {
    this.mostrarSenha.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.erro.set(null);

    const { email, senha } = this.form.value;

    this.auth.login(email, senha).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: { status: number }) => {
        this.carregando.set(false);
        if (err.status === 401) {
          this.erro.set('E-mail ou senha inválidos.');
        } else if (err.status === 0) {
          this.erro.set('Não foi possível conectar ao servidor.');
        } else {
          this.erro.set('Erro ao entrar. Tente novamente.');
        }
      }
    });
  }
}

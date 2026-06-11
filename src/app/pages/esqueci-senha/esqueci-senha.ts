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
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

type Etapa = 'email' | 'token' | 'nova-senha' | 'sucesso';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './esqueci-senha.html',
  styleUrl: './esqueci-senha.css'
})
export class EsqueciSenhaComponent {

  private readonly apiUrl = 'http://localhost:8080/auth/password';

  etapa = signal<Etapa>('email');
  carregando = signal(false);
  erro = signal<string | null>(null);

  emailSalvo = signal('');

  formEmail: FormGroup;
  formToken: FormGroup;
  formNovaSenha: FormGroup;

  mostrarSenha = signal(false);
  mostrarConfirmar = signal(false);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.formEmail = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.formToken = this.fb.group({
      token: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.formNovaSenha = this.fb.group(
      {
        novaSenha: ['', [Validators.required, Validators.minLength(8)]],
        confirmarSenha: ['', Validators.required]
      },
      { validators: this.senhasIguaisValidator }
    );
  }

  private senhasIguaisValidator(group: AbstractControl): ValidationErrors | null {
    const nova = group.get('novaSenha')?.value;
    const confirmar = group.get('confirmarSenha')?.value;
    return nova && confirmar && nova !== confirmar ? { senhasDiferentes: true } : null;
  }

  campoInvalidoEmail(campo: string): boolean {
    const c = this.formEmail.get(campo);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  campoInvalidoToken(campo: string): boolean {
    const c = this.formToken.get(campo);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  campoInvalidoSenha(campo: string): boolean {
    const c = this.formNovaSenha.get(campo);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  enviarEmail(): void {
    if (this.formEmail.invalid) {
      this.formEmail.markAllAsTouched();
      return;
    }
    this.carregando.set(true);
    this.erro.set(null);
    const email = this.formEmail.value.email;

    this.http.post(`${this.apiUrl}/forgot`, null, { params: { email }, responseType: 'text' })
      .subscribe({
        next: () => {
          this.emailSalvo.set(email);
          this.etapa.set('token');
          this.carregando.set(false);
        },
        error: (err) => {
          this.erro.set(err.error || 'Erro ao enviar e-mail. Tente novamente.');
          this.carregando.set(false);
        }
      });
  }

  confirmarToken(): void {
    if (this.formToken.invalid) {
      this.formToken.markAllAsTouched();
      return;
    }
    this.erro.set(null);
    this.etapa.set('nova-senha');
  }

  redefinirSenha(): void {
    if (this.formNovaSenha.invalid) {
      this.formNovaSenha.markAllAsTouched();
      return;
    }
    this.carregando.set(true);
    this.erro.set(null);

    const token = this.formToken.value.token;
    const newPassword = this.formNovaSenha.value.novaSenha;

    this.http.post(`${this.apiUrl}/reset`, null, { params: { token, newPassword }, responseType: 'text' })
      .subscribe({
        next: () => {
          this.etapa.set('sucesso');
          this.carregando.set(false);
        },
        error: (err) => {
          const msg = err.error || '';
          if (msg.includes('expirado') || msg.toLowerCase().includes('expired')) {
            this.erro.set('O código expirou. Solicite um novo e-mail de recuperação.');
            this.etapa.set('email');
          } else if (msg.includes('inválido') || msg.toLowerCase().includes('invalid')) {
            this.erro.set('Código inválido. Verifique e tente novamente.');
            this.etapa.set('token');
          } else {
            this.erro.set('Erro ao redefinir senha. Tente novamente.');
          }
          this.carregando.set(false);
        }
      });
  }

  voltarParaEmail(): void {
    this.erro.set(null);
    this.formToken.reset();
    this.formNovaSenha.reset();
    this.etapa.set('email');
  }

  irParaLogin(): void {
    this.router.navigate(['/']);
  }
}
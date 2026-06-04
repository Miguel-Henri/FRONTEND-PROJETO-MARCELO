import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DepositoService } from '../../core/services/deposito.service';

@Component({
  selector: 'app-deposito',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './deposito.html',
  styleUrl: './deposito.css'
})
export class DepositoComponent {
  form: FormGroup;
  carregando = signal(false);
  sucesso = signal(false);
  erro = signal<string | null>(null);

  constructor(private fb: FormBuilder, private depositoService: DepositoService) {
    this.form = this.fb.group({
      valor: [null, [Validators.required, Validators.min(0.01), Validators.max(50000)]]
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

    this.depositoService.realizar(this.form.value.valor).subscribe({
      next: () => {
        this.carregando.set(false);
        this.sucesso.set(true);
        this.form.reset();
      },
      error: (err: { status: number }) => {
        this.carregando.set(false);
        if (err.status === 404) {
          this.erro.set('Conta não encontrada.');
        } else if (err.status === 0) {
          this.erro.set('Não foi possível conectar ao servidor.');
        } else {
          this.erro.set('Erro ao realizar o depósito. Tente novamente.');
        }
      }
    });
  }

  novo(): void {
    this.form.reset();
    this.sucesso.set(false);
    this.erro.set(null);
  }
}

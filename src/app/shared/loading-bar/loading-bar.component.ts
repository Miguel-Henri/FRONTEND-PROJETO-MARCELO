import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading.ativo()) {
      <div class="loading-bar" role="progressbar" aria-label="Carregando...">
        <div class="loading-bar__progresso"></div>
      </div>
    }
  `,
  styles: [`
    .loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 9999;
      background: transparent;
    }
    .loading-bar__progresso {
      height: 100%;
      background: var(--cor-primaria, #2563eb);
      animation: loading-slide 1.4s ease-in-out infinite;
      transform-origin: left;
    }
    @keyframes loading-slide {
      0%   { transform: scaleX(0);    margin-left: 0;    }
      50%  { transform: scaleX(0.6);  margin-left: 0;    }
      100% { transform: scaleX(0.1);  margin-left: 100%; }
    }
  `]
})
export class LoadingBarComponent {
  loading = inject(LoadingService);
}

import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PerfilUsuario } from '../../core/models/usuario';

@Directive({
  selector: '[appSePerfil]',
  standalone: true
})
export class SePerfilDirective implements OnInit {

  @Input('appSePerfil') perfisPermitidos: PerfilUsuario | PerfilUsuario[] = [];

  private auth = inject(AuthService);
  private template = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  ngOnInit(): void {
    const perfis = Array.isArray(this.perfisPermitidos)
      ? this.perfisPermitidos
      : [this.perfisPermitidos];

    const perfilAtual = this.auth.perfil;

    if (perfilAtual && perfis.includes(perfilAtual)) {
      this.viewContainer.createEmbeddedView(this.template);
    } else {
      this.viewContainer.clear();
    }
  }
}
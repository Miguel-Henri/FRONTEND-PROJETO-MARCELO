import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SePerfilDirective } from '../directives/se-perfil.directive';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, SePerfilDirective],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {}
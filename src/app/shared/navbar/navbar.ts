import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  usuario = {
    nome: 'Marcelo',
    foto: 'https://i.pravatar.cc/150'
  };
}
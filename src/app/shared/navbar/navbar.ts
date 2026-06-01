import { Component } from '@angular/core';

export const NavbarComponent = Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})(class NavbarComponent {

  usuario = {
    nome: 'Marcelo',
    foto: 'https://i.pravatar.cc/150'
  };

}); 
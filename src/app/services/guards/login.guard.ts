import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Router } from '@angular/router';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable({
  providedIn: 'root'
})

export class LoginGuard implements CanActivate {

  constructor(private userService: UsuariosService, private router: Router) {}

  canActivate(): boolean {

    return this.userService.estaLogueado();

  }


}

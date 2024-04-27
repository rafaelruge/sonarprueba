import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicService } from '@app/services/public.service';
import { SharedService } from '@app/services/shared.service';
import { UsuariosService } from '@app/services/usuarios/usuarios.service';
import { AppConfig } from '../../../services/config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {

  listaSedes: any;
  login: FormGroup;
  submit: boolean;
  mostrarLogin = true;
  claveIncorrecta: boolean = false;
  usuarioNoExiste: boolean = false;
  noSede: boolean = false;
  caducado: boolean = false;
  inactivo: boolean = false;

  constructor(

    private router: Router,
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private userService: UsuariosService,
    private publicService: PublicService
  ) {


  }

  public config: {version: string};

  ngOnInit(): void {

    this.config = require("../../../../assets/config.json");

    if (this.userService.estaLogueado()) {
      this.router.navigate(['panel/inicio']);
    }
    this.sharedService.showLoader(true);
    this.crearFormularioLogin();
    this.cargarSedes();
  }

  crearFormularioLogin() {
    this.login = this.formBuilder.group({
      username: ['', [Validators.required]],
      pass: ['', [Validators.required]],
      sede: ['', [Validators.required]],
    });
  }
  async cargarSedes() {
    this.listaSedes = await this.publicService.obtenerSedes();
  }

  ingresar() {
    this.submit = true;
    this.sharedService.showLoader(true);
    if (this.login.invalid) {
      this.sharedService.showLoader(false);
      return;
    } else {
      this.userService.autenticacionUsuario(this.login.controls).then((data: any) => {        
        sessionStorage.setItem('sede', data.sede);
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('id', data.id);
        sessionStorage.setItem('interno', AppConfig.settings.controlinterno);
        sessionStorage.setItem('externo', AppConfig.settings.controlexterno);
        this.userService.detalleAsistente(data.id).then(detalle => {
          sessionStorage.setItem('userid', detalle.userid);
          sessionStorage.setItem('rolid', detalle.rolid);
          sessionStorage.setItem('asistente', detalle.name + ' ' + detalle.lastname);
          sessionStorage.setItem('nombres', detalle.name);
          sessionStorage.setItem('apellidos', detalle.lastname);
          sessionStorage.setItem('telefonocontacto', detalle.phone);
          sessionStorage.setItem('email', detalle.email);
          sessionStorage.setItem('imagenuser', detalle.imagenuser);
          sessionStorage.setItem('sede', data.sede);
          this.login.reset();
          this.submit = false;
          this.sharedService.showLoader(false);
          this.router.navigate(['panel/inicio']);
        });
      },
        (err: HttpErrorResponse) => {

          this.sharedService.showLoader(false);

          this.claveIncorrecta = false;
          this.usuarioNoExiste = false;
          this.noSede = false;
          this.caducado = false;
          this.inactivo = false;

          let error: string = err.error.message;

          // si está caducado
          if (error.toLowerCase().indexOf('caducado') != -1) {

            this.caducado = true;

            // si no existe
          } else if (error.toLowerCase().indexOf('existe') != -1) {

            this.usuarioNoExiste = true;

            // clave incorrecta
          } else if (error.toLowerCase().indexOf('incorrecta') != -1) {

            this.claveIncorrecta = true;

            // si está inactivo
          } else if (error.toLowerCase().indexOf('inactivo') != -1) {

            this.inactivo = true;

            // no tiene sede
          } else {

            this.noSede = true;

          }

        });
    }
  }

}

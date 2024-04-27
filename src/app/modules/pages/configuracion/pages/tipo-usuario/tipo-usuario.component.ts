import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Usuarios } from 'app/Models/Usuarios';
import { UserHeadQuarter } from 'app/Models/Userheadquarter';
import { UsuariosService } from 'app/services/usuarios/usuarios.service';
import { ToastrService } from 'ngx-toastr';
import { PublicService } from '@app/services/public.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-tipo-usuario',
  templateUrl: './tipo-usuario.component.html',
  styleUrls: ['./tipo-usuario.component.css'],
  providers: [DatePipe],
})
export class TipoUsuarioComponent implements OnInit {

  formaRegistroParametro: FormGroup;
  listaSedes: any;
  listaRoles: any;
  listaDocs: any;
  usuario: Usuarios;
  Userheadquarter: UserHeadQuarter;
  submit: boolean;
  token: string;

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private usuarioService: UsuariosService,
    private toastr: ToastrService,
    private publicService: PublicService,
    private router: Router) { }

  ngOnInit() {

    this.crearFormularioRegistroUsuario();
    this.cargarRoles();
    this.cargarSedes();
    this.cargarTiposDoc();
    this.validaterol();

  }


  get nombreNoValido() {
    return this.formaRegistroParametro.get('nombres');
  }
  get apellidoNoValido() {
    return this.formaRegistroParametro.get('apellidos').invalid && this.formaRegistroParametro.get('apellidos').touched;
  }
  get usuarioIdNoValido() {
    return this.formaRegistroParametro.get('usuarioId').invalid && this.formaRegistroParametro.get('usuarioId').touched;
  }
  get nombreUsuarioNoValido() {
    return this.formaRegistroParametro.get('nombreUsuario').invalid && this.formaRegistroParametro.get('nombreUsuario').touched;
  }
  get passwordUsuarioNoValido() {
    return this.formaRegistroParametro.get('pass').invalid && this.formaRegistroParametro.get('pass').touched;
  }
  get tipoDocumentoNoValido() {
    return this.formaRegistroParametro.get('tipoDocumento').invalid && this.formaRegistroParametro.get('tipoDocumento').touched;
  }
  get numeroDocumentoNoValido() {
    return this.formaRegistroParametro.get('numeroDocumento').invalid && this.formaRegistroParametro.get('numeroDocumento').touched;
  }
  get celularNoValido() {
    return this.formaRegistroParametro.get('celular').invalid && this.formaRegistroParametro.get('celular').touched;
  }
  get fechaNacimientoNoValido() {
    return this.formaRegistroParametro.get('fechaNacimiento').invalid && this.formaRegistroParametro.get('fechaNacimiento').touched;
  }
  get tarjetaProfesionalNoValido() {
    return this.formaRegistroParametro.get('tarjetaProfesional').invalid && this.formaRegistroParametro.get('tarjetaProfesional').touched;
  }
  get correoElectronicoNoValido() {
    return this.formaRegistroParametro.get('correoElectronico').invalid && this.formaRegistroParametro.get('correoElectronico').touched;
  }

  get rolNoValido() {
    return this.formaRegistroParametro.get('rol').invalid && this.formaRegistroParametro.get('rol').touched;
  }
  get estadoNoValido() {
    return this.formaRegistroParametro.get('estado').invalid && this.formaRegistroParametro.get('estado').touched;
  }
  get fechaExpiracionNoValido() {
    return this.formaRegistroParametro.get('fechaExpiracion').invalid && this.formaRegistroParametro.get('fechaExpiracion').touched;
  }


  crearFormularioRegistroUsuario() {
    this.formaRegistroParametro = this.fb.group({
      typeid: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['Penagos Gutierrez', Validators.required],
      nombreUsuario: ['', Validators.required],
      pass: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      celular: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      tarjetaProfesional: ['', Validators.required],
      correoElectronico: ['', Validators.required],
      usuarioId: ['', Validators.required],
      rol: ['', Validators.required],
      estado: [false, Validators.required],
      sede: ['', Validators.required],
      fechaCreacion: [this.datePipe.transform(new Date(), "yyyy-MM-dd")],
      fechaExpiracion: ['', Validators.required]
    });
  }

  async cargarSedes() {
    this.listaSedes = await this.publicService.obtenerSedes();
  }

  async cargarRoles() {
    this.listaRoles = await this.publicService.obtenerRoles();
  }

  async cargarTiposDoc() {
    this.listaDocs = await this.publicService.obtenerTiposDoc();
  }

  validaterol() {
    this.usuarioService.validarRol();
  }

  creaUsuario() {
    const usuario: Usuarios = {
      rolid: this.formaRegistroParametro.get('rol').value,
      typeid: this.formaRegistroParametro.get('typeid').value,
      name: this.formaRegistroParametro.get('nombres').value,
      lastname: this.formaRegistroParametro.get('apellidos').value,
      nrodoc: this.formaRegistroParametro.get('numeroDocumento').value,
      idparametro: this.formaRegistroParametro.get('tipoDocumento').value,
      tarprof: this.formaRegistroParametro.get('tarjetaProfesional').value,
      birthdate: this.formaRegistroParametro.get('fechaNacimiento').value,
      phone: this.formaRegistroParametro.get('celular').value,
      username: this.formaRegistroParametro.get('nombreUsuario').value,
      pass: this.formaRegistroParametro.get('pass').value,
      email: this.formaRegistroParametro.get('correoElectronico').value,
      datecreate: this.formaRegistroParametro.get('fechaCreacion').value,
      dateexp: this.formaRegistroParametro.get('fechaExpiracion').value,
      ativeexp: this.formaRegistroParametro.get('estado').value,
      active: this.formaRegistroParametro.get('estado').value,
      superusersede: this.formaRegistroParametro.get('sede').value
    }



    this.usuarioService.createAsync(usuario).then((data: any) => {


      this.router.navigate(['panel/inicio']);
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.MENSAJE_REGISTRO_USUARIO'));
      this.formaRegistroParametro.reset();

    })

  }
}

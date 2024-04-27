import { Component, OnInit, ViewChild } from "@angular/core";
import { UsuariosService } from "@app/services/usuarios/usuarios.service";
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { DatePipe, NgStyle } from '@angular/common';
import { PublicService } from "../../../../../services/public.service";
import { TranslateService } from '@ngx-translate/core';
import { Rol } from "@app/interfaces/get-rol.interface";
import { ModuleAccesses } from "../../../../../interfaces/module-access";
import { ConfiguracionObjetivosAnalitoService } from '@app/services/configuracion/configuracion-objetivos-analito.service';
import { PermisosEspecialesService } from "@app/services/configuracion/permisos-especiales.service";
import {
  CreateAccessPermission,
} from "../../../../../interfaces/permisos.interface";
import { User } from "@app/interfaces/user.interface";
import { Observable } from 'rxjs';
import { RolService } from '@app/services/configuracion/rol.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: "app-permisos-especiales",
  templateUrl: "./permisos-especiales.component.html",
  styleUrls: ["./permisos-especiales.component.css"],
})
export class PermisosEspecialesComponent implements OnInit {
  roles: Rol[] = [];
  form: FormGroup;
  cardVisible:boolean = false;
  usuarios: User[] = [];
  moduleAccesses: Observable<ModuleAccesses[]>;
  rolid:any;
  namerol:any;

  constructor(
    private datePipe: DatePipe,
    private readonly rolService: PublicService,
    private readonly fb: FormBuilder,
    private readonly usuariosService: UsuariosService,
    private readonly permisosEspecialesService: PermisosEspecialesService,
    private translate: TranslateService,
    private configuracionObjetivosAnalitoService: ConfiguracionObjetivosAnalitoService,
    private RolService: RolService,
    private toastr: ToastrService
  ) {}

  async ngOnInit(): Promise<void> {
    this.getRolUser();
    this.form = this.fb.group({
      Modulo: ["", Validators.required],
      Rol: ["", Validators.required],
      Usuario: [""],
      Crear: [,],
      Eliminar: [,],
      Editar: [,],
    });
    await Promise.all([
      this.cargarModulos(),
      this.cargarRoles(),
      this.cargarUsuarios(),
      this.moduleAccesses = this.permisosEspecialesService
        .getAllModulos()
    ]);
    this.permisosEspecialesService.resfreh$.next();
  }

  getRolUser(){
    this.rolid = JSON.parse(sessionStorage.getItem('rolid'));
    this.RolService.getByIdAsync(this.rolid).then((datarol:any)=>{
      this.namerol = datarol.namerol;
    })
    
  }

  showCard(): void {
    this.cardVisible = !this.cardVisible;
  }

  get modulo(): AbstractControl {
    return this.form.get("Modulo");
  }

  get rol(): AbstractControl {
    return this.form.get("Rol");
  }

  get usuario(): AbstractControl {
    return this.form.get("Usuario");
  }

  async cargarModulos(): Promise<void> {
    // Code for loading modules goes here
  }

  async cargarRoles(): Promise<void> {
    this.roles = await this.rolService.obtenerRoles();
  }

  async cargarUsuarios(): Promise<void> {
    this.usuarios = await this.usuariosService.listarusuarios();
  }

  sendForm(): void {
    if (this.form.invalid) {
      return;
    }

    const { Modulo, Rol, Usuario, Crear, Editar, Eliminar } = this.form.value;

    const dto: CreateAccessPermission = {
      idmoduleaccess: Modulo.idmoduleaccess,
      userid: null,
      crear: Crear || false,
      editar: Editar || false,
      eliminar: Eliminar || false,
      rolid: Rol.rolid || false,
    };

    this.permisosEspecialesService.postNuevoPermiso(dto).subscribe(
    {
      next:(val:any)=>{

        //Todo: realizar una card para confirmación de cración de datos
        this.permisosEspecialesService.updatePermisosData();
        this.form.reset();
        this.cardVisible = false;
        
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Configuración',
          Submodulo: 'Usuarios',
          Item: 'Permisos especiales',
          Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
          Datos: ('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol + '|Crear: '+ val.crear + '|Editar: ' + val.editar + '|Eliminar: ' + val.eliminar ),
          Respuesta: JSON.stringify(val),
          TipoRespuesta: 200,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }

        this.configuracionObjetivosAnalitoService.createLogAsync(Loguser).then(respuesta => { });
      },
      error:(error) => {
        this.form.reset();
        this.cardVisible = false;
        this.toastr.info(this.translate.instant(error.error));
      }
    })
  }
}

import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuariosService } from '@app/services/usuarios/usuarios.service';
import { UserheadquartersService } from '@app/services/configuracion/userheadquarters.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SedesService } from '@app/services/configuracion/sedes.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-asignacion-sede-usuario',
  templateUrl: './asignacion-sede-usuario.component.html',
  styleUrls: ['./asignacion-sede-usuario.component.css'],
  providers: [DatePipe]
})
export class AsignacionSedeUsuarioComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();

  formaRegistroAsignacionSede: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  listaUsuarios: [];
  desactivar = false;
  listaUsuariosSede: any[];
  detalleSede = [];
  detalleUsuario = [];
  listaSedes: [];
  titulo: any;
  text: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  userant: any;
  lastnameant:any;
  sedeant: any;
  activeant:any;

  usernew:any;
  lasnamenew:any;
  sedenew:any;

  banderacreate :boolean;


  constructor(
    private translate: TranslateService,
    private usuariosService: UsuariosService,
    private sedesService: SedesService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private userheadquartersService: UserheadquartersService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
  ) { }
  displayedColumns: string[] = ['user', 'sede', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarSedesUsuarios();
    this.cargarUsuarios();
    this.cargarSedes();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  async cargarSedesUsuarios() {

    this.listaUsuariosSede = await this.usuariosService.DetalleUsuarioSede();
    this.dataSource = new MatTableDataSource(this.listaUsuariosSede);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }
  cargarUsuarios() {
    this.usuariosService.getAllAsync().then(respuesta => {
      this.listaUsuarios = respuesta.filter(datos => datos.Active == true);
    });
  }
  cargarSedes() {
    this.sedesService.getAllAsync().then(respuesta => {
      this.listaSedes = respuesta.filter(datos => datos.Active == true);
    });
  }
  openModalAsignacionSede(templateAsignacionSede: TemplateRef<any>, datos: any) {

    this.crearFormularioAsignacionSede(datos);

    if(datos.Iduserheadquarter != null){
      this.usuariosService.getByIdAsync(datos.Userid).then((datauserant: any) => {
        
        this.userant = datauserant.name;
        this.lastnameant = datauserant.lastname;
        
      }).catch(error => {});

      this.sedeant = datos.Desheadquarters
    }

    this.vantanaModal = this.modalService.show(templateAsignacionSede ,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.ASIGNACIONSEDE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.ASIGNACIONSEDE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }

  get userIdNoValido() {
    return this.formaRegistroAsignacionSede.get('userid');
  }
  get idheadquartersNoValido() {
    return this.formaRegistroAsignacionSede.get('idheadquarters');
  }
  crearFormularioAsignacionSede(datos: any) {

    this.formaRegistroAsignacionSede = this.fb.group({
      iduserheadquarter: [datos.Iduserheadquarter ? datos.Iduserheadquarter : ''],
      userid: [datos.Userid ? datos.Userid : '', [Validators.required]],
      idheadquarters: [datos.Idheadquarters ? datos.Idheadquarters : '', [Validators.required]]
    });

    
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    console.log(this.dataSource);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  eliminarAsignacionSede(id: any) {

    var desuser :any;
    var dessede:any;
    this.userheadquartersService.getByIdAsync(id).then((datasedeuser: any) => {

      let useridsede = datasedeuser.userid;
      let idsedeuser = datasedeuser.idheadquarters;
      
      this.usuariosService.getByIdAsync(useridsede).then((datausuario: any) => {
  
        desuser = datausuario.username;
      }).catch(error => {});

      this.sedesService.getByIdAsync(idsedeuser).then((datasedenew: any) => {
        dessede = datasedenew.desheadquarters;
      }).catch(error => {});

    }).catch(error => {});

    this.userheadquartersService.delete('Userheadquarters', id).subscribe(respuesta => {
      this.cargarSedesUsuarios();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Configuración',
        Submodulo: 'Usuarios',
        Item:'Asignación de Sede',
        Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: ('Nombre Usuario: '+ desuser + '| ' + ' Sede asignada: ' + dessede ),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.userheadquartersService.createLogAsync(Loguser).then(respuesta => {
      });


    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Configuración',
          Submodulo: 'Usuarios',
          Item:'Asignación de Sede',
          Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          Datos: ('Nombre Usuario: '+ desuser + '| ' + ' Sede asignada: ' + dessede ),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.userheadquartersService.createLogAsync(Loguser).then(respuesta => {
        });
      });

  }
  async crearEditarAsignacionSede() {

    //Obtener datos nuevos -Log
    var idsedenew = this.formaRegistroAsignacionSede.get('idheadquarters').value;
    var useridnew = this.formaRegistroAsignacionSede.get('userid').value;

    await this.sedesService.getinfosedeuser(useridnew,idsedenew).then(respuesta => {
      
      
      if(respuesta == null){
        this.banderacreate = true;
      }else{
        this.banderacreate = false;
      }

    },
    (err: HttpErrorResponse) => {
      this.banderacreate = false;
    });
  
    if(this.banderacreate == true){

      await this.usuariosService.getUser(useridnew).then((datausernew: any) => {
        this.usernew = datausernew.name;
        this.lasnamenew = datausernew.lastname;
      }).catch(error => {});

      await this.sedesService.getByIdAsync(idsedenew).then((datasedenew: any) => {
        this.sedenew = datasedenew.desheadquarters;
      }).catch(error => {});

      if (!this.formaRegistroAsignacionSede.invalid) {
        if (this.accion == 'Crear') {
         
          this.desactivar = true;
          this.userheadquartersService.create(this.formaRegistroAsignacionSede.value).subscribe(respuesta => {
  
            var idsedenew = this.formaRegistroAsignacionSede.get('idheadquarters').value;
            var useridnew = this.formaRegistroAsignacionSede.get('userid').value;
  
            this.usuariosService.getUser(useridnew).then((datausernew: any) => {
                this.usernew = datausernew.name;
                this.lasnamenew = datausernew.lastname;
            }).catch(error => {});
            this.sedesService.getByIdAsync(idsedenew).then((datasedenew: any) => {
              this.sedenew = datasedenew.desheadquarters;
            }).catch(error => {});
            this.closeVentana();
            this.cargarSedesUsuarios();
            this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
            this.desactivar = false;
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Configuración',
              Submodulo: 'Usuarios',
              Item:'Asignación de Sede',
              Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
              Datos: ('Nombre Usuario: '+ this.usernew + ' - ' + this.lasnamenew + '| ' + ' Sede asignada: ' + this.sedenew ),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
  
            this.userheadquartersService.createLogAsync(Loguser).then(respuesta => {
            });
          }, (error) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Configuración',
              Submodulo: 'Usuarios',
              Item:'Asignación de Sede',
              Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
              Datos: ('Nombre Usuario: '+ this.usernew + ' ' + this.lasnamenew  + 'Sede asignada: ' + this.sedenew ),
              respuesta: error.message,
              tipoRespuesta: error.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.userheadquartersService.createLogAsync(Loguser).then(respuesta => {
            });
          });
        } else {
  
          this.userheadquartersService.update(this.formaRegistroAsignacionSede.value, this.formaRegistroAsignacionSede.value.iduserheadquarter).subscribe(respuesta => {
            
            this.closeVentana();
            this.cargarSedesUsuarios();
            this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Configuración',
              Submodulo: 'Usuarios',
              Item:'Asignación de Sede',
              Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
              Datos: ('Nombre Usuario: '+ this.usernew + ' - ' + this.lasnamenew + '| ' + ' Sede asignada: ' + this.sedenew ),
              DatosAnteriores: ('Nombre Usuario: '+ this.userant + ' - ' + this.lastnameant + '| ' + ' Sede asignada: ' + this.sedeant ),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
  
            this.userheadquartersService.createLogAsync(Loguser).then(respuesta => {
            });
  
          }, (error) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Configuración',
              Submodulo: 'Usuarios',
              Item:'Asignación de Sede',
              Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
              Datos: ('Nombre Usuario: '+ this.usernew + ' - ' + this.lasnamenew + '| ' + ' Sede asignada: ' + this.sedenew ),
              DatosAnteriores: ('Nombre Usuario: '+ this.userant + ' - ' + this.lastnameant + '| ' + ' Sede asignada: ' + this.sedeant ),
              respuesta: error.message,
              tipoRespuesta: error.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.userheadquartersService.createLogAsync(Loguser).then(respuesta => {
            });
  
          });
        }
      }
    }else{
      this.closeVentana();
      this.toastr.info(this.translate.instant('La sede seleccionada ya esta asiganda al usuario seleccionado.'));
    }
  }

  titulosSwal() {
    this.translate.get('MODULES.SWALUSEDE.TITULO').subscribe(respuesta => this.titulo = respuesta);
    this.translate.get('MODULES.SWALUSEDE.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWALUSEDE.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWALUSEDE.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);

  }
  closeVentana(): void {
    this.vantanaModal.hide();
  }

}

import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SedesService } from '@app/services/configuracion/sedes.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { CiudadesService } from '@app/services/configuracion/ciudades.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-sedes',
  templateUrl: './sedes.component.html',
  styleUrls: ['./sedes.component.css'],
  providers: [DatePipe]
})
export class SedesComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();
  formaRegistroSede: FormGroup;
  accionEditar: any;
  desactivar = false;
  accion: any;

  tituloAccion: any;
  vantanaModal: BsModalRef;
  listaCiudades:any = [];
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  descityant:any;
  sedeant:any;
  direccionant:any;

  constructor(
    private ventanaService: VentanasModalesService,
    private translate: TranslateService,
    private sedesService: SedesService,
    private ciudadesService: CiudadesService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private datePipe: DatePipe,
    private toastr: ToastrService,

  ) { }
  displayedColumns: string[] = ['ciudad', 'sede', 'telefono', 'direccion', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarCiudades();
    this.titulosSwal();
    this.sharedService.customTextPaginator(this.paginator);
    this.cargarSedes();

  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  async cargarSedes() {
   await this.sedesService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  async cargarCiudades() {
   await  this.ciudadesService.getAllAsync().then(respuesta => {
      this.listaCiudades = respuesta.filter(datos => datos.active == true);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  openModalRegistroSedes(templateRegistroSede: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroSede(datos);

    this.vantanaModal = this.modalService.show(templateRegistroSede,  {backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.SEDES.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.SEDES.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
    this.vantanaModal.setClass('modal-md');
  }

  get idcityNoValido() {
    return this.formaRegistroSede.get('idcity');
  }
  get codheadquartersNoValido() {
    return this.formaRegistroSede.get('codheadquarters');
  }
  get desheadquartersNoValido() {
    return this.formaRegistroSede.get('desheadquarters');
  }
  get emailNoValido() {
    return this.formaRegistroSede.get('email');
  }
  get addressNoValido() {
    return this.formaRegistroSede.get('address');
  }
  get telefonoNoValido() {
    return this.formaRegistroSede.get('telephone');
  }
  get numerationNoValido() {
    return this.formaRegistroSede.get('numeration');
  }
  crearFormularioRegistroSede(datos: any) {
    this.formaRegistroSede = this.fb.group({
      idheadquarters: [datos.Idheadquarters ? datos.Idheadquarters : ''],
      idcity: [datos.Idcity ? datos.Idcity : '', [Validators.required]],
      codheadquarters: [datos.Codheadquarters ? datos.Codheadquarters : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      desheadquarters: [datos.Desheadquarters ? datos.Desheadquarters : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      email: [datos.Email ? datos.Email : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      address: [datos.Address ? datos.Address : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      telephone: [datos.Telephone ? datos.Telephone : '', [Validators.required]],
      numeration: [datos.Numeration ? datos.Numeration : ''],
      active: [datos.Active ? datos.Active : false]
    });
  }
  crearEditarSede() {
    if (!this.formaRegistroSede.invalid) {

      var idsedeant = this.formaRegistroSede.value.idheadquarters;

      this.sedesService.getByIdAsync(idsedeant).then((datasedeant: any) => {
        
        this.sedeant = datasedeant.desheadquarters;
        this.direccionant = datasedeant.address;
        
      }).catch(error => {});

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.sedesService.create(this.formaRegistroSede.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarSedes();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Sedes',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Sede: ' + this.formaRegistroSede.value.desheadquarters + '| ' + this.formaRegistroSede.value.address ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.sedesService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Sedes',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Sede: ' + this.formaRegistroSede.value.desheadquarters + '| ' + this.formaRegistroSede.value.address ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.sedesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      } else {
        this.sedesService.update(this.formaRegistroSede.value, this.formaRegistroSede.value.idheadquarters).subscribe(respuesta => {
          this.closeVentana();

          this.cargarSedes();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Sedes',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Sede: ' + this.formaRegistroSede.value.desheadquarters + '| ' + this.formaRegistroSede.value.address ),
            DatosAnteriores: ('Sede: ' + this.sedeant + '| ' + this.direccionant ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.sedesService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Sedes',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Sede: ' + this.formaRegistroSede.value.desheadquarters + '| ' + this.formaRegistroSede.value.address ),
            DatosAnteriores: ('Sede: ' + this.sedeant + '| ' + this.direccionant ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.sedesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }
  }


  eliminarSede(id: any) {
    this.sedesService.delete('Headquarters', id).subscribe(respuesta => {
      this.cargarSedes();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Configuración',
        Submodulo: 'Ubicaciones',
        Item:'Sedes',
        Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: ( id +'| ' + this.formaRegistroSede.value.desheadquarters),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.sedesService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Configuración',
          Submodulo: 'Ubicaciones',
          Item:'Sedes',
          Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          Datos: ( id +'| ' + this.formaRegistroSede.value.desheadquarters),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.sedesService.createLogAsync(Loguser).then(respuesta => {
        });
      });
  }

  actualizarEstadoSede(event, datosSede) {

    const estado = datosSede.Active ? false : true;
    const datos = { idheadquarters: datosSede.Idheadquarters, idcity: datosSede.Idcity, codheadquarters: datosSede.Codheadquarters, desheadquarters: datosSede.Desheadquarters, email: datosSede.Email, address: datosSede.Address, telephone: datosSede.Telephone, numeration: datosSede.Numeration, active: estado }

    this.sedesService.update(datos, datosSede.Idheadquarters).subscribe(respuesta => {
      this.cargarSedes();
      this.accion = 'Editar';
    });

  }
  titulosSwal() {
    this.translate.get('MODULES.SWAL.TITULO').subscribe(respuesta => this.titulo = respuesta);
    this.translate.get('MODULES.SWAL.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWAL.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWAL.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
    this.translate.get('MODULES.SWAL.TEXTERROR').subscribe(respuesta => this.textError = respuesta);
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }
  closeVentana(): void {
    this.vantanaModal.hide();
  }

}


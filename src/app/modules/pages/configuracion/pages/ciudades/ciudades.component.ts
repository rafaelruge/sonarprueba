import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { CiudadesService } from '@app/services/configuracion/ciudades.service';
import { DepartmentsService } from '@app/services/configuracion/departamentos.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-ciudades',
  templateUrl: './ciudades.component.html',
  styleUrls: ['./ciudades.component.css'],
  providers: [DatePipe]

})
export class CiudadesComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();

  formaRegistroCiudad: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  desactivar = false;
  vantanaModal: BsModalRef;
  listaCiudades: any;
  listaDepartamentos: [];
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  descityant:any;
  estadoant:any;


  constructor(
    private translate: TranslateService,
    private departmentsService: DepartmentsService,
    private ciudadesService: CiudadesService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
  ) { }

  displayedColumns: string[] = ['descity', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarCiudades();
    this.cargarDepartamentos();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  get DesCiudadNoValido() {
    return this.formaRegistroCiudad.get('DesCity');
  }
  get idDepartamentNoValido() {
    return this.formaRegistroCiudad.get('idDepartament');
  }

  crearFormularioRegistroCiudad(datos: any) {
    this.formaRegistroCiudad = this.fb.group({
      idCity: [datos.idcity ? datos.idcity : ''],
      DesCity: [datos.descity ? datos.descity : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      idDepartament: [datos.iddepartament ? datos.iddepartament : '', [Validators.required]],
      codDivipola: [datos.coddivipola ? datos.coddivipola : ''],
      Active: [datos.active ? datos.active : false],
    });
  }
  cargarCiudades() {
    this.ciudadesService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  cargarDepartamentos() {
    this.departmentsService.getAllAsync().then(respuesta => {
      this.listaDepartamentos = respuesta.filter(datos => datos.active == true);
    });

  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  crearEditarCiudad() {
    if (!this.formaRegistroCiudad.invalid) {

      var idcityant = this.formaRegistroCiudad.value.idCity;

      this.ciudadesService.getByIdAsync(idcityant).then((datacityant: any) => {
        this.descityant = datacityant.descity;
        this.estadoant = datacityant.active;
      }).catch(error => {});

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.ciudadesService.create(this.formaRegistroCiudad.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarCiudades();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Ciudades',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Ciudad: ' + this.formaRegistroCiudad.value.DesCity + '| ' +  this.formaRegistroCiudad.value.Active ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.ciudadesService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Ciudades',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Ciudad: ' + this.formaRegistroCiudad.value.DesCity + '| ' +  this.formaRegistroCiudad.value.Active ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.ciudadesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      } else {
        this.ciudadesService.update(this.formaRegistroCiudad.value, this.formaRegistroCiudad.value.idCity).subscribe(respuesta => {
          this.closeVentana();

          this.cargarCiudades();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Ciudades',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Ciudad: ' + this.formaRegistroCiudad.value.DesCity + '| ' +  this.formaRegistroCiudad.value.Active ),
            DatosAnteriores: ('Ciudad: ' + this.descityant + '| ' +  this.estadoant ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }


          this.ciudadesService.createLogAsync(Loguser).then(respuesta => {
          });
        }, (error) => {
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Ciudades',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Ciudad: ' + this.formaRegistroCiudad.value.DesCity + '| ' +  this.formaRegistroCiudad.value.Active ),
            DatosAnteriores: ('Ciudad: ' + this.descityant + '| ' +  this.estadoant ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.ciudadesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }
  }

  eliminarCiudad(id: any) {

    var idcity = id;
    var namecity = null;
    this.ciudadesService.getByIdAsync(idcity).then((datacity: any) => {

      namecity = datacity.descity;
    
    });

    this.ciudadesService.delete('Cities', id).subscribe(respuesta => {
      this.cargarCiudades();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Configuración',
        Submodulo: 'Ubicaciones',
        Item:'Ciudades',
        Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: (id +'| ' + namecity ),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.ciudadesService.createLogAsync(Loguser).then(respuesta => {
      });

    }, (err) => {

      this.toastr.error(this.messageError);

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Configuración',
        Submodulo: 'Ubicaciones',
        Item:'Ciudades',
        Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: (id +'| ' + namecity ),
        respuesta: err.message,
        tipoRespuesta: err.status,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.ciudadesService.createLogAsync(Loguser).then(respuesta => {
      });

    });

  }

  actualizarEstadoCiudad(event, datosCiudad) {

    const estado = datosCiudad.active ? false : true;
    const datos = { idcity: datosCiudad.idcity, iddepartament: datosCiudad.iddepartament, descity: datosCiudad.descity, coddivipola: datosCiudad.coddivipola, active: estado }

    this.ciudadesService.update(datos, datosCiudad.idcity).subscribe(respuesta => {
      this.accion = 'Editar';
      this.cargarCiudades();
    });
  }
  openModalRegistroCiudad(templateRegistroCiudad: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroCiudad(datos);

    this.vantanaModal = this.modalService.show(templateRegistroCiudad,  {backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.CIUDADES.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.CIUDADES.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

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

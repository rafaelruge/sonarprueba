import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-secciones',
  templateUrl: './secciones.component.html',
  styleUrls: ['./secciones.component.css'],
  providers: [DatePipe]
})
export class SeccionesComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = Date.now();
  ventanaModal: BsModalRef;
  formaRegistroSecciones: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  desactivar = false;
  accion: any;
  messageError: string;
  listaSections: [];
  desseccionant:any;
  desconstzant:any;
  estadoant:any;

  displayedColumns: string[] = ['namesection', 'constz', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private seccionesService: SeccionesService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.cargarSecciones();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  cargarSecciones() {
    this.seccionesService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  openModalRegistroSecciones(templateRegistroSecciones: TemplateRef<any>, datos: any) {
    this.crearFormularioRegistroSecciones(datos);
    this.ventanaModal = this.modalService.show(templateRegistroSecciones, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.SECCIONES.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.SECCIONES.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }
  crearFormularioRegistroSecciones(datos: any) {
    this.formaRegistroSecciones = this.fb.group({
      idsection: [datos.idsection ? datos.idsection : ''],
      constz: [datos.constz ? datos.constz : '', [Validators.required, Validators.max(3.5)]],
      namesection: [datos.namesection ? datos.namesection : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }
  get nameNoValido() {
    return this.formaRegistroSecciones.get('namesection');
  }
  get constzNoValido() {
    return this.formaRegistroSecciones.get('constz');
  }
  crearEditarSeccion() {
    if (!this.formaRegistroSecciones.invalid) {

      var idseccionant = this.formaRegistroSecciones.value.idsection;

      this.seccionesService.getByIdAsync(idseccionant).then((dataseccion: any) => {

        this.desseccionant = dataseccion.namesection;
        this.desconstzant = dataseccion.constz;
        this.estadoant = dataseccion.active;
      }).catch(error => {
  
      });
      if (this.tituloAccion === 'Crear') {

        this.desactivar = true;
        this.seccionesService.create(this.formaRegistroSecciones.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarSecciones();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Sección',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Sección: ' + this.formaRegistroSecciones.value.namesection + '| ' + 'constz: '+ this.formaRegistroSecciones.value.constz +'| ' + 'Estado: ' +  this.formaRegistroSecciones.value.active ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }


          this.seccionesService.createLogAsync(Loguser).then(respuesta => { });

        }, (error) => {

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Sección',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Sección: ' + this.formaRegistroSecciones.value.namesection + '| ' + 'constz: '+ this.formaRegistroSecciones.value.constz +'| ' + 'Estado: ' +  this.formaRegistroSecciones.value.active ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.seccionesService.createLogAsync(Loguser).then(respuesta => { });

        });
      } else {
        this.seccionesService.update(this.formaRegistroSecciones.value, this.formaRegistroSecciones.value.idsection).subscribe(respuesta => {
          this.closeVentana();

          this.cargarSecciones();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Sección',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Sección: ' + this.formaRegistroSecciones.value.namesection + '| ' + 'constz: '+ this.formaRegistroSecciones.value.constz +'| ' + 'Estado: ' +  this.formaRegistroSecciones.value.active ),
            DatosAnteriores: ('Sección: ' + this.desseccionant + '| ' + 'constz: '+ this.desconstzant +'| ' + 'Estado: ' +  this.estadoant ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }


          this.seccionesService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Sección',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Sección: ' + this.formaRegistroSecciones.value.namesection + '| ' + 'constz: '+ this.formaRegistroSecciones.value.constz +'| ' + 'Estado: ' +  this.formaRegistroSecciones.value.active ),
            DatosAnteriores: ('Sección: ' + this.desseccionant + '| ' + 'constz: '+ this.desconstzant +'| ' + 'Estado: ' +  this.estadoant ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.seccionesService.createLogAsync(Loguser).then(respuesta => { });

        });
      }
    }
  }
  actualizarEstadoSeccion(datosSeccion) {
    const estado = datosSeccion.active ? false : true;

    const datos = { idsection: datosSeccion.idsection, namesection: datosSeccion.namesection, constz: datosSeccion.constz, active: estado };
    this.seccionesService.update(datos, datosSeccion.idsection).subscribe(respuesta => {
      this.tituloAccion = 'Editar';
      this.cargarSecciones();
      this.accion = '';
    });
  }

  eliminarSeccion(id: any) {
    var idseccioneliminar = id;
    var namesectioneliminar;
    this.seccionesService.getByIdAsync(idseccioneliminar).then((dataseccion: any) => {
      namesectioneliminar = dataseccion.namesection;
    }).catch(error => {});
    this.seccionesService.delete('sections', id).subscribe(respuesta => {
      this.cargarSecciones();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Configuración',
        Item:'Sección',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: ( id +'| '+'Sección: ' + namesectioneliminar),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.seccionesService.createLogAsync(Loguser).then(respuesta => {
      });

    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'control calidad interno',
          Submodulo: 'configuración',
          Item:'sección',
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'),
          Datos: ( id +'| '+'Sección: ' + namesectioneliminar ),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.seccionesService.createLogAsync(Loguser).then(respuesta => {
        });

      });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  closeVentana(): void {
    this.ventanaModal.hide();
  }
  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }
}

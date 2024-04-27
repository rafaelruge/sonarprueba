import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { AccionesCorrectivasService } from '@app/services/configuracion/asociaciones.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-gestion-acciones-correctivas',
  templateUrl: './gestion-acciones-correctivas.component.html',
  styleUrls: ['./gestion-acciones-correctivas.component.css'],
  providers: [DatePipe]
})
export class GestionAccionesCorrectivasComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaAccionesCorrectivas: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  desactivar = false;
  cancelar: any;
  confirmar: any;
  messageError: any;

  constructor(
    private translate: TranslateService,
    private accionesCorrectivasService: AccionesCorrectivasService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe
  ) { }
  displayedColumns: string[] = ['desCorrectiveActions', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarAccionesCorrectivas();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  get descorrectiveNoValido() {
    return this.formaAccionesCorrectivas.get('descorrectiveactions');
  }
  crearFormularioAccionesCorrectivas(datos: any) {
    this.formaAccionesCorrectivas = this.fb.group({
      idcorrectiveactions: [datos.idcorrectiveactions ? datos.idcorrectiveactions : ''],
      descorrectiveactions: [datos.descorrectiveactions ? datos.descorrectiveactions : '', [Validators.required, Validators.minLength(2), Validators.maxLength(400)]],
      active: [datos.active ? datos.active : false],
    });
  }
  cargarAccionesCorrectivas() {
    this.accionesCorrectivasService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      console.log(respuesta);
    });


  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  crearEditarAccionesCorrectivas() {
    if (!this.formaAccionesCorrectivas.invalid) {
      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.accionesCorrectivasService.create(this.formaAccionesCorrectivas.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarAccionesCorrectivas();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Acciones Correctivas',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: JSON.stringify(this.formaAccionesCorrectivas.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.accionesCorrectivasService.createLogAsync(Loguser).then(respuesta => {
            
          });
        }, (error) => {

          console.log(error);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Acciones Correctivas',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos: JSON.stringify(this.formaAccionesCorrectivas.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.accionesCorrectivasService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });

      } else {
        this.accionesCorrectivasService.update(this.formaAccionesCorrectivas.value, this.formaAccionesCorrectivas.value.idcorrectiveactions).subscribe(respuesta => {
          this.closeVentana();
          this.cargarAccionesCorrectivas();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Acciones Correctivas',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formaAccionesCorrectivas.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          console.log(Loguser);

          this.accionesCorrectivasService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        }, (error) => {

          console.log(error);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Acciones Correctivas',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formaAccionesCorrectivas.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.accionesCorrectivasService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });
      }
    }

  }
  actualizarEstadoAccionesCorrectivas(event, datosAccionesCorrectivas) {
    const estado = datosAccionesCorrectivas.active ? false : true;
    const datos = { idcorrectiveactions: datosAccionesCorrectivas.idcorrectiveactions, descorrectiveactions: datosAccionesCorrectivas.descorrectiveactions, active: estado }

    this.accionesCorrectivasService.update(datos, datosAccionesCorrectivas.idcorrectiveactions).subscribe(respuesta => {
      this.cargarAccionesCorrectivas();
      this.accion = 'Editar';
    });
  }
  openModalAccionesCorrectivas(templateAccionesCorrectivas: TemplateRef<any>, datos: any) {
    this.crearFormularioAccionesCorrectivas(datos);

    this.vantanaModal = this.modalService.show(templateAccionesCorrectivas, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.ACCIONESCORRECTIVAS.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.ACCIONESCORRECTIVAS.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }


  eliminarAccionCorrectiva(id: any) {
    this.accionesCorrectivasService.delete('CorrectiveActions', id).subscribe(respuesta => {

      this.cargarAccionesCorrectivas();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Configuración',
        Item:'Acciones Correctivas',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.accionesCorrectivasService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Acciones Correctivas',
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.accionesCorrectivasService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });
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

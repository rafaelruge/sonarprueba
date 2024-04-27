import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SeccionesQceService } from '@app/services/calidad-externo/seccionesQce.service';
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
export class SeccionesComponentQce implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroSeccionesQce: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  desactivar = false;
  accion: any;
  messageError: string;
  listaSections: [];
  displayedColumns: string[] = ['dessection', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private seccionesQceService: SeccionesQceService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.cargarSeccionesQce();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  cargarSeccionesQce() {
    this.seccionesQceService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.tituloAccion }
    this.ventanaService.openModal(data);
  }
  openModalRegistroSeccionesQce(templateRegistroSeccionesQce: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroSeccionesQce(datos);
    this.ventanaModal = this.modalService.show(templateRegistroSeccionesQce ,{backdrop: 'static', keyboard: false });
    this.accionEditar = !!datos;
    datos ? this.translate.get('MODULES.SECCIONESQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.SECCIONESQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  crearFormularioRegistroSeccionesQce(datos: any) {
    this.formaRegistroSeccionesQce = this.fb.group({
      idsection: [datos.idsection ? datos.idsection : ''],
      dessection: [datos.dessection ? datos.dessection : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }

  get dessectionNoValido() {
    return this.formaRegistroSeccionesQce.get('dessection');
  }

  crearEditarSeccionQce() {
    if (!this.formaRegistroSeccionesQce.invalid) {

      if (this.tituloAccion === 'Crear') {

        this.desactivar = true;
        this.seccionesQceService.create(this.formaRegistroSeccionesQce.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarSeccionesQce();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: JSON.stringify(this.formaRegistroSeccionesQce.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }


          this.seccionesQceService.createLogAsync(Loguser).then(respuesta => { });

        }, (error) => {


          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos: JSON.stringify(this.formaRegistroSeccionesQce.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }
          this.seccionesQceService.createLogAsync(Loguser).then(respuesta => { });

        });
      } else {
        this.seccionesQceService.update(this.formaRegistroSeccionesQce.value, this.formaRegistroSeccionesQce.value.idsection).subscribe(respuesta => {
          this.closeVentana();

          this.cargarSeccionesQce();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formaRegistroSeccionesQce.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }


          this.seccionesQceService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formaRegistroSeccionesQce.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }

          this.seccionesQceService.createLogAsync(Loguser).then(respuesta => { });

        });
      }
    }
  }
  actualizarEstadoSeccionQce(datosSeccion) {
    const estado = datosSeccion.active ? false : true;

    const datos = { idsection: datosSeccion.idsection, dessection: datosSeccion.dessection, active: estado };
    this.seccionesQceService.update(datos, datosSeccion.idsection).subscribe(respuesta => {
      this.tituloAccion = 'Editar';
      this.cargarSeccionesQce();
    });
  }

  eliminarSeccionQce(id: any) {

    this.seccionesQceService.delete('sectionQce', id).subscribe(respuesta => {

      this.cargarSeccionesQce();
      this.tituloAccion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.dateNowISO,
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: status
      }
      this.seccionesQceService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });

    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status
        }
        this.seccionesQceService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
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

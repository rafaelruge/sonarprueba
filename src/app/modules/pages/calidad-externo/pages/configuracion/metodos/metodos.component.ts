import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { createLog } from '@app/globals/logUser';
import { MetodosQceService } from '@app/services/configuracion/metodos-qce.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-metodos',
  templateUrl: './metodos.component.html',
  styleUrls: ['./metodos.component.css'],
  providers: [DatePipe]
})
export class MetodosComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroMetodoQce: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  desactivar = false;
  accion: any;
  image: string;
  messageError: string;
  listaSections: [];
  displayedColumns: string[] = ['desmethods', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  log = new createLog(this.datePipe,this.translate,this.metodosQceService);

  constructor(
    private metodosQceService: MetodosQceService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.cargarMetodosQce();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  cargarMetodosQce() {
    this.metodosQceService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.tituloAccion }
    this.ventanaService.openModal(data);
  }
  openModalRegistroMetodoQce(templateRegistroMetodoQce: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroMetodoQce(datos);
    this.ventanaModal = this.modalService.show(templateRegistroMetodoQce,{backdrop: 'static', keyboard: false });
    this.accionEditar = !!datos;
    datos ? this.translate.get('MODULES.METODOSQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.METODOSQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }
  crearFormularioRegistroMetodoQce(datos: any) {
    this.formaRegistroMetodoQce = this.fb.group({
      idmethods: [datos.idmethods ? datos.idmethods : ''],
      desmethods: [datos.desmethods ? datos.desmethods : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }
  get desNoValido() {
    return this.formaRegistroMetodoQce.get('desmethods');
  }

  crearEditarMetodoQce() {
    if (!this.formaRegistroMetodoQce.invalid) {

      if (this.tituloAccion === 'Crear') {

        this.desactivar = true;
        this.metodosQceService.create(this.formaRegistroMetodoQce.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarMetodosQce();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Configuración','Métodos','c',this.formaRegistroMetodoQce.value,JSON.stringify(respuesta),200);
        }, (err) => {
          this.toastr.error(this.translate.instant(err.error));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Configuración','Métodos','c',this.formaRegistroMetodoQce.value,err.message,err.status);
        });
      } else {
        this.metodosQceService.update(this.formaRegistroMetodoQce.value, this.formaRegistroMetodoQce.value.idmethods).subscribe(respuesta => {
          this.closeVentana();

          this.cargarMetodosQce();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
          this.log.logObj('Control Calidad Externo','Configuración','Métodos','a',this.formaRegistroMetodoQce.value,JSON.stringify(respuesta),200);
        }, (err) => {
          this.log.logObj('Control Calidad Externo','Configuración','Métodos','a',this.formaRegistroMetodoQce.value,err.message,err.status);
        });
      }
    }
  }
  actualizarEstadoMetodoQce(datosMetodoQce) {
    const estado = datosMetodoQce.active ? false : true;

    const datos = { idmethods: datosMetodoQce.idmethods, desmethods: datosMetodoQce.desmethods, active: estado };
    this.metodosQceService.update(datos, datosMetodoQce.idmethods).subscribe(respuesta => {
      this.tituloAccion = 'Editar';
      this.cargarMetodosQce();
    });
  }

  eliminarMetodoQce(id: any) {
    this.metodosQceService.delete('methodsQce', id).subscribe(respuesta => {

      this.cargarMetodosQce();
      this.tituloAccion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
      this.log.logObj('Control Calidad Externo','Configuración','Métodos','e',id,JSON.stringify(respuesta),200);
    },
      (err: HttpErrorResponse) => {
        this.log.logObj('Control Calidad Externo','Configuración','Métodos','e',id,err.message,err.status);
        this.toastr.error(this.messageError);
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

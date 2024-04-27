import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe } from '@angular/common';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { ToastrService } from 'ngx-toastr';
import { createLog } from '@app/globals/logUser';

@Component({
  selector: 'app-proveedores',
  templateUrl: './unidades.component.html',
  styleUrls: ['./unidades.component.css']
})
export class UnidadesComponent implements OnInit {

  dateNow: Date = new Date();
  formulario: FormGroup;
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

  dateNowISO = this.dateNow.toTimeString();
  log = new createLog(this.datePipe,this.translate,this.unitsQceService);

  constructor(

    private translate: TranslateService,
    private unitsQceService: UnitsQceService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe

  ) { }

  displayedColumns: string[] = ['descripcion', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.getUnits();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  getUnits() {
    this.unitsQceService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openModalGestionUnidades(templateGestionUnidades: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionUnidades(datos);
    this.vantanaModal = this.modalService.show(templateGestionUnidades,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.UNIDADES.FORMULARIO.EDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.UNIDADES.FORMULARIO.CREAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }

  get codunitsNoValido() {
    return this.formulario.get('codunits');
  }

  crearFormularioGestionUnidades(datos: any) {
    this.formulario = this.fb.group({
      idunits: [datos.idunits ? datos.idunits : ''],
      codunits: [datos.codunits ? datos.codunits : '', [Validators.required]],
      active: [datos.active ? datos.active : false]
    });
  }

  crearEditarGestionUnidades() {
    if (!this.formulario.invalid) {
      if (this.accion === 'Crear') {
        this.desactivar = true;
        this.unitsQceService.create(this.formulario.value).subscribe(respuesta => {
          this.closeVentana();
          this.getUnits();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Configuración','Unidades','c',this.formulario.value,JSON.stringify(respuesta),200);
        }, (err) => {
          this.toastr.error(this.translate.instant(err.error));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Configuración','Unidades','c',this.formulario.value,err.message,err.status);
        });
      } else {
        this.unitsQceService.update(this.formulario.value, this.formulario.value.idunits).subscribe(respuesta => {
          this.closeVentana();
          this.getUnits();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
          this.log.logObj('Control Calidad Externo','Configuración','Unidades','a',this.formulario.value,JSON.stringify(respuesta),200);
        }, (err) => {
          this.log.logObj('Control Calidad Externo','Configuración','Unidades','a',this.formulario.value,err.message,err.status);
        });
      }
    }
  }

  actualizarEstadoGestionUnidades(datosGestion) {
    const estado = datosGestion.active ? false : true;
    const datos = { idunits: datosGestion.idunits, codunits: datosGestion.codunits, active: estado }
    this.unitsQceService.update(datos, datosGestion.idunits).subscribe(respuesta => {
      this.getUnits();
      this.accion = 'Editar';
    });
  }

  eliminarGestionUnidades(id: any) {
    this.unitsQceService.delete('Unidades', id).subscribe(respuesta => {
      this.getUnits();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
      this.log.logObj('Control Calidad Externo','Configuración','Unidades','e',id,JSON.stringify(respuesta),200);
    },
      (err: HttpErrorResponse) => {
        this.log.logObj('Control Calidad Externo','Configuración','Unidades','e',id,err.message,err.status);
        this.toastr.error(this.messageError);
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


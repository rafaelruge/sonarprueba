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
import { SupplierQceService } from '@app/services/calidad-externo/supplierQce.service';
import { ToastrService } from 'ngx-toastr';
import { createLog } from '@app/globals/logUser';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {

  dateNow: Date = new Date();
  formulario: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  desactivar = false;
  confirmar: any;
  messageError: any;

  dateNowISO = this.dateNow.toTimeString();
  log = new createLog(this.datePipe,this.translate,this.supplierQceService);

  displayedColumns: string[] = ['proveedores', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private translate: TranslateService,
    private supplierQceService: SupplierQceService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe

  ) { }

  ngOnInit(): void {
    this.cargarProveedores();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  cargarProveedores() {
    this.supplierQceService.getAllAsync().then(respuesta => {
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

  openModalGestionProveedores(templateGestionProveedores: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionProveedores(datos);
    this.vantanaModal = this.modalService.show(templateGestionProveedores,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.PROVEEDORES_.FORMULARIO.EDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.PROVEEDORES_.FORMULARIO.CREAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }

  get dessupplierNoValido() {
    return this.formulario.get('dessupplier');
  }

  crearFormularioGestionProveedores(datos: any) {
    this.formulario = this.fb.group({
      idsupplier: [datos.idsupplier ? datos.idsupplier : ''],
      dessupplier: [datos.dessupplier ? datos.dessupplier : '', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      active: [datos.active ? datos.active : false]
    });
  }

  crearEditarGestionProveedores() {
    if (!this.formulario.invalid) {
      if (this.accion === 'Crear') {
        this.desactivar = true;
        this.supplierQceService.create(this.formulario.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarProveedores();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Configuración','Proveedores','c',this.formulario.value,JSON.stringify(respuesta),200);
        }, (err) => {
          this.log.logObj('Control Calidad Externo','Configuración','Proveedores','c',this.formulario.value,err.message,err.status);
        });

      } else {

        this.supplierQceService.update(this.formulario.value, this.formulario.value.idsupplier).subscribe(respuesta => {
          this.closeVentana();
          this.cargarProveedores();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
          this.log.logObj('Control Calidad Externo','Configuración','Proveedores','a',this.formulario.value,JSON.stringify(respuesta),200);
        }, (err) => {
          this.log.logObj('Control Calidad Externo','Configuración','Proveedores','a',this.formulario.value,err.message,err.status);
        });
      }
    }

  }

  actualizarEstadoGestionProveedores(datosGestion) {
    const estado = datosGestion.active ? false : true;
    const datos = { idsupplier: datosGestion.idsupplier, dessupplier: datosGestion.dessupplier, active: estado }
    this.supplierQceService.update(datos, datosGestion.idsupplier).subscribe(respuesta => {
      this.cargarProveedores();
      this.accion = 'Editar';
    });
  }

  eliminarGestionProveedores(id: any) {
    this.supplierQceService.delete('Proveedores', id).subscribe(respuesta => {
      this.cargarProveedores();

      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
      this.log.logObj('Control Calidad Externo','Configuración','Proveedores','e',this.formulario.value,JSON.stringify(respuesta),200);
    },
      (err: HttpErrorResponse) => {
        this.toastr.error(this.messageError);
        this.log.logObj('Control Calidad Externo','Configuración','Proveedores','e',this.formulario.value,err.message,err.status);
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

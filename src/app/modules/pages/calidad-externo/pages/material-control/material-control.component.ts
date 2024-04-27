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
import { ControlMaterialQceService } from '@app/services/calidad-externo/controlMaterialQce.service';
import { ToastrService } from 'ngx-toastr';
import { createLog } from '@app/globals/logUser';

@Component({
  selector: 'app-proveedores',
  templateUrl: './material-control.component.html',
  styleUrls: ['./material-control.component.css']
})
export class MaterialControlComponent implements OnInit {

  dateNow: Date = new Date();
  formulario: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  desactivar = false;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  dateNowISO = this.dateNow.toTimeString();
  log = new createLog(this.datePipe,this.translate,this.controlMatetialQceService);

  constructor(

    private translate: TranslateService,
    private controlMatetialQceService: ControlMaterialQceService,
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

    this.getControlMateriales();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();

  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  getControlMateriales() {
    this.controlMatetialQceService.getAllAsync().then(respuesta => {
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

  openModalGestionMateriales(templateGestionLotes: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionMateriales(datos);
    this.vantanaModal = this.modalService.show(templateGestionLotes,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.CONTROLMATERIAL.FORMULARIO.EDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.CONTROLMATERIAL.FORMULARIO.CREAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }

  get descontmatNoValido() {
    return this.formulario.get('descontmat');
  }

  crearFormularioGestionMateriales(datos: any) {
    this.formulario = this.fb.group({
      idControlMaterial: [datos.idControlMaterial ? datos.idControlMaterial : ''],
      descontmat: [datos.descontmat ? datos.descontmat : '', [Validators.required, Validators.minLength(2)]],
      active: [datos.active ? datos.active : false],

    });

  }

  crearEditarGestionMateriales() {
    if (!this.formulario.invalid) {
      if (this.accion === 'Crear') {
        this.desactivar = true;
        this.controlMatetialQceService.create(this.formulario.value).subscribe(respuesta => {
          this.closeVentana();
          this.getControlMateriales();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Configuración','Material de control','c',this.formulario.value,JSON.stringify(respuesta),200);
        }, (err) => {
          this.toastr.error(this.translate.instant(err.error));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Configuración','Material de control','c',this.formulario.value,err.message,err.status);
        });
      } else {
        this.controlMatetialQceService.update(this.formulario.value, this.formulario.value.idControlMaterial).subscribe(respuesta => {
          this.closeVentana();
          this.getControlMateriales();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
          this.log.logObj('Control Calidad Externo','Configuración','Material de control','a',this.formulario.value,JSON.stringify(respuesta),200);
        }, (err) => {
          this.log.logObj('Control Calidad Externo','Configuración','Proveedores','a',this.formulario.value,err.message,err.status);
        });
      }
    }
  }

  actualizarEstadoGestionMateriales(datosGestion) {
    const estado = datosGestion.active ? false : true;
    const datos = { idControlMaterial: datosGestion.idControlMaterial, descontmat: datosGestion.descontmat, active: estado }
    this.controlMatetialQceService.update(datos, datosGestion.idControlMaterial).subscribe(respuesta => {
      this.getControlMateriales();
      this.accion = 'Editar';
    });
  }

  eliminarGestionMateriales(id: any) {
    this.controlMatetialQceService.delete('Control Material', id).subscribe(respuesta => {
      this.getControlMateriales();
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

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
import { LotesQceService } from '@app/services/calidad-externo/lotsQce.service';
import { ControlMaterialQceService } from '@app/services/calidad-externo/controlMaterialQce.service';
import { LotesQceDetailsService } from '@app/services/calidad-externo/lotsQceDetails.service';
import { ToastrService } from 'ngx-toastr';
import dayjs from 'dayjs';
import { createLog } from '@app/globals/logUser';

@Component({
  selector: 'app-proveedores',
  templateUrl: './lotes.component.html',
  styleUrls: ['./lotes.component.css']
})
export class LotesComponent implements OnInit {

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

  today = dayjs().format('YYYY-MM-DD');
  proveedores = [];
  proveedoresActive = [];
  controlMaterials = [];
  controlMaterialsActive = [];
  lotesActive = [];

  dateNowISO = this.dateNow.toTimeString();
  log = new createLog(this.datePipe,this.translate,this.supplierQceService);

  displayedColumns: string[] = ['proveedor', 'mcontrol', 'numlote', 'fecha', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private translate: TranslateService,
    private lotesQceService: LotesQceService,
    private lotesQceDetailsService: LotesQceDetailsService,
    private supplierQceService: SupplierQceService,
    private controlMatetialQceService: ControlMaterialQceService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe
  ) { }

  async getProveedores() {
    this.proveedores = await this.supplierQceService.getAllAsync();
    this.proveedoresActive = this.proveedores.filter(e => e.active);
  }

  async getControlMaterial() {
    this.controlMaterials = await this.controlMatetialQceService.getAllAsync();
    this.controlMaterialsActive = await this.controlMaterials.filter(e => e.active);
  }

  ngOnInit(): void {
    this.getLotes();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.getProveedores();
    this.getControlMaterial();
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  getLotes() {
    this.lotesQceDetailsService.getAllAsync().then(respuesta => {
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

  openModalGestionLotes(templateGestionLotes: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionLotes(datos);
    this.vantanaModal = this.modalService.show(templateGestionLotes ,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.PROVEEDORES_.FORMULARIO.EDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.PROVEEDORES_.FORMULARIO.CREAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }

  get idsupplierNoValido() {
    return this.formulario.get('idsupplier');
  }

  get idControlMaterialNoValido() {
    return this.formulario.get('idControlMaterial');
  }

  get numlotNoValido() {
    return this.formulario.get('numlot');
  }

  get expdateNoValido() {
    return this.formulario.get('expdate');
  }

  crearFormularioGestionLotes(datos: any) {
    this.formulario = this.fb.group({
      idLot: [datos.IdLot ? datos.IdLot : ''],
      idsupplier: [datos.Idsupplier ? datos.Idsupplier : '', [Validators.required]],
      idControlMaterial: [datos.IdControlMaterial ? datos.IdControlMaterial : '', [Validators.required]],
      numlot: [datos.Numlot ? datos.Numlot : '', [Validators.required, Validators.min(1)]],
      expdate: [datos.Expdate ? dayjs(datos.Expdate).format() : '', [Validators.required]],
      active: [datos.Active ? datos.Active : false],
    });
  }

  crearEditarGestionLotes() {
    if (this.formulario.valid) {
      let idsupplier: number = parseInt(this.formulario.get('idsupplier').value);
      let idControlMaterial: number = parseInt(this.formulario.get('idControlMaterial').value);
      const data = {
        idLot: this.formulario.get('idLot').value,
        idsupplier: idsupplier,
        idControlMaterial: idControlMaterial,
        numlot: this.formulario.get('numlot').value,
        expdate: this.formulario.get('expdate').value,
        active: this.formulario.get('active').value,
      }

      if (this.accion === 'Crear') {
        this.desactivar = true;
        this.lotesQceService.create(data).subscribe(respuesta => {
          this.closeVentana();
          this.getLotes();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Configuración','Lotes','c',data,JSON.stringify(respuesta),200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo','Configuración','Lotes','c',data,error.message,error.status);
        });
      } else {
        this.lotesQceService.update(data, data.idLot).subscribe(respuesta => {
          this.closeVentana();
          this.getLotes();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
          this.log.logObj('Control Calidad Externo','Configuración','Lotes','a',data,JSON.stringify(respuesta),200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo','Configuración','Lotes','a',data,error.message,error.status);
        });
      }
    }
  }

  actualizarEstadoGestionLotes(datosGestion) {
    const estado = datosGestion.Active ? false : true;
    const datos = { idLot: datosGestion.IdLot, idsupplier: datosGestion.Idsupplier, idControlMaterial: datosGestion.IdControlMaterial, numlot: datosGestion.Numlot, expdate: datosGestion.Expdate, active: estado }
    this.lotesQceService.update(datos, datosGestion.IdLot).subscribe(respuesta => {
      this.getLotes();
      this.accion = 'Editar';
    });
  }

  eliminarGestionLotes(id: any) {
    this.lotesQceService.delete('Lotes', id).subscribe(respuesta => {
      this.getLotes();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
      this.log.logObj('Control Calidad Externo','Configuración','Lotes','e',id,JSON.stringify(respuesta),200);
    },
      (err: HttpErrorResponse) => {
        this.log.logObj('Control Calidad Externo','Configuración','Lotes','e',id,err.message,err.status);
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

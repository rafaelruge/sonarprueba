import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { createLog } from '@app/globals/logUser';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-analizadores',
  templateUrl: './analizadores.component.html',
  styleUrls: ['./analizadores.component.css'],
  providers: [DatePipe],

})
export class AnalizadoresComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroAnalizador: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  desactivar = false;
  image: string;
  messageError: string;
  displayedColumns: string[] = ['nameAnalyzer', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;
  log = new createLog(this.datePipe,this.translate,this.analizadoresqceService);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private analizadoresqceService: AnalyzerQceService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private sharedService: SharedService) { }

  ngOnInit(): void {
    this.cargarAnalizadores();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  cargarAnalizadores() {
    this.analizadoresqceService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.tituloAccion }
    this.ventanaService.openModal(data);
  }
  openModalRegistroAnalizador(templateRegistroAnalizador: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroCliente(datos);
    this.ventanaModal = this.modalService.show(templateRegistroAnalizador,{backdrop: 'static', keyboard: false });
    this.ventanaModal.setClass('modal-md');
    this.accionEditar = !!datos;
    datos ? this.translate.get('MODULES.ANALIZADORES.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.ANALIZADORES.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }
  crearFormularioRegistroCliente(datos: any) {

    this.formaRegistroAnalizador = this.fb.group({

      idAnalyzer: [datos.idAnalyzer ? datos.idAnalyzer : ''],
      nameAnalyzer: [datos.nameAnalyzer ? datos.nameAnalyzer : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],

    });

  }

  get nameNoValido() {
    return this.formaRegistroAnalizador.get('nameAnalyzer');
  }

  crearEditarAnalizador() {
    if (!this.formaRegistroAnalizador.invalid) {

      if (this.tituloAccion === 'Crear') {

        this.desactivar = true;
        this.analizadoresqceService.create(this.formaRegistroAnalizador.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarAnalizadores();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Configuración','Analizadores','c',this.formaRegistroAnalizador.value,JSON.stringify(respuesta),200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo','Configuración','Analizadores','c',this.formaRegistroAnalizador.value,error.message,error.status);
        });
      } else {
        this.analizadoresqceService.update(this.formaRegistroAnalizador.value, this.formaRegistroAnalizador.value.idAnalyzer).subscribe(respuesta => {
          this.closeVentana();
          this.cargarAnalizadores();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
          this.log.logObj('Control Calidad Externo','Configuración','Analizadores','a',this.formaRegistroAnalizador.value,JSON.stringify(respuesta),200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo','Configuración','Analizadores','a',this.formaRegistroAnalizador.value,error.message,error.status);
        });
      }
    }
  }
  actualizarEstadoAnalizador(datosAnalizador) {
    const estado = datosAnalizador.active ? false : true;

    const datos = { idAnalyzer: datosAnalizador.idAnalyzer, nameAnalyzer: datosAnalizador.nameAnalyzer, model: datosAnalizador.model, marker: datosAnalizador.marker, active: estado };
    this.analizadoresqceService.update(datos, datosAnalizador.idAnalyzer).subscribe(respuesta => {
      this.tituloAccion = 'Editar';
      this.cargarAnalizadores();
    });
  }

  eliminarAnalizador(id: any) {
    this.analizadoresqceService.delete('analyzerQce', id).subscribe(respuesta => {

      this.cargarAnalizadores();
      this.tituloAccion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
      this.log.logObj('Control Calidad Externo','Configuración','Analizadores','e',id,JSON.stringify(respuesta),200);
    },
      (err: HttpErrorResponse) => {
        this.log.logObj('Control Calidad Externo','Configuración','Analizadores','e',id,err.message,err.status);
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

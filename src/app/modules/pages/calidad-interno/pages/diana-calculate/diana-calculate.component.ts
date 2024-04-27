import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe } from '@angular/common';
import { LogsService } from '@app/services/configuracion/logs.service';
import { DianaCalculateService } from '@app/services/configuracion/diana-calculate.service';

@Component({
  selector: 'app-diana-calculate',
  templateUrl: './diana-calculate.component.html',
  styleUrls: ['./diana-calculate.component.css']
})
export class DianaCalculateComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();

  formularioRegistroEditar: FormGroup;
  accionEditar            : any;
  tituloAccion            : any;
  way                     : boolean = false;
  accion                  : any;
  vantanaModal            : BsModalRef;
  titulo                  : any;
  text                    : any;
  textError               : any;
  cancelar                : any;
  confirmar               : any;
  messageError            : any;
  idObjeto                : any;

  constructor(
    private translate                           : TranslateService,
    private dianaCalculateService               : DianaCalculateService,
    private logsService                         : LogsService,
    private fb                                  : FormBuilder,
    private modalService                        : BsModalService,
    private sharedService                       : SharedService,
    private ventanaService                      : VentanasModalesService,
    private datePipe                            : DatePipe
  ) { }

  displayedColumns: string[] = ['desdianacalculate', 'formula', 'data', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarValores();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  get desDianaCalculateNoValido() {
    return this.formularioRegistroEditar.get('desdianacalculate');
  }

  get formulaNoValida() {
    return this.formularioRegistroEditar.get('formula');
  }

  get dataNoValida() {
    return this.formularioRegistroEditar.get('data');
  }

  crearFormulario(datos: any) {

    this.formularioRegistroEditar = this.fb.group({

      idDianacalculate : [datos.idDianacalculate],
      desdianacalculate: [datos.desdianacalculate ? datos.desdianacalculate : '', [Validators.required, Validators.maxLength(100)]],
      formula          : [datos.formula ? datos.formula : '', [Validators.required, Validators.maxLength(100)]],
      data             : [datos.data ? datos.data : '', [Validators.required, Validators.maxLength(100)]],
      active           : [datos.active ? datos.active : false],

    });
  }

  cargarValores() {
    this.dianaCalculateService.getAllAsync().then(respuesta => {
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

  crearEditar() {
    if (!this.formularioRegistroEditar.invalid) {
      if (this.accion === 'Crear') {

        this.dianaCalculateService.create(this.formularioRegistroEditar.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarValores();
          this.openModal(this.translate.instant('MODULES.NOTIFICACIONES.DIANA_CALCULATE_CREADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: JSON.stringify(this.formularioRegistroEditar.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }

          console.log(Loguser);

          this.logsService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });

        }, (error) => {

          console.log(error);

          const Loguser = {
            fecha        : this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora         : this.dateNowISO,
            metodo       : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos        : JSON.stringify(this.formularioRegistroEditar.value),
            respuesta    : error.message,
            tipoRespuesta: error.status
          }
          this.logsService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });
      } else {
        this.dianaCalculateService.update(this.formularioRegistroEditar.value, this.formularioRegistroEditar.value.idDianacalculate).subscribe(respuesta => {
          this.closeVentana();

          this.cargarValores();
          this.way = true;

          const Loguser = {
            Fecha        : this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora         : this.dateNowISO,
            Metodo       : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos        : JSON.stringify(this.formularioRegistroEditar.value),
            Respuesta    : JSON.stringify(respuesta),
            TipoRespuesta: status
          }

          console.log(Loguser);

          this.logsService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        }, (error) => {

          console.log(error);

          const Loguser = {
            fecha        : this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora         : this.dateNowISO,
            metodo       : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos        : JSON.stringify(this.formularioRegistroEditar.value),
            respuesta    : error.message,
            tipoRespuesta: error.status
          }
          this.logsService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });
      }
    }
  }

  openModalEliminar(templateEliminarRegistro: TemplateRef<any>, id: any) {
    this.idObjeto = id;
    this.vantanaModal = this.modalService.show(templateEliminarRegistro, { class: 'modal-sm',backdrop: 'static', keyboard: false  });
  }

  eliminar() {
    this.closeVentana();
    this.dianaCalculateService.delete('', this.idObjeto).subscribe(respuesta => {
      this.cargarValores();
      this.accion = '';
      this.openModal(this.translate.instant('MODULES.NOTIFICACIONES.DIANA_CALCULATE_ELIMINADO'));

      const Loguser = {
        fecha        : this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora         : this.dateNowISO,
        metodo       : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos        : JSON.stringify(this.idObjeto),
        respuesta    : JSON.stringify(respuesta),
        tipoRespuesta: status
      }
      this.logsService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });

    },
      (err: HttpErrorResponse) => {

        this.sharedService.showLoader(false);
        this.accion = 'error';
        this.openModal(this.messageError);

        const Loguser = {
          fecha        : this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora         : this.dateNowISO,
          metodo       : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos        : JSON.stringify(this.idObjeto),
          respuesta    : err.message,
          tipoRespuesta: err.status
        }
        this.logsService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });

      });

  }
  actualizarEstado(objeto) {

    const estado = objeto.active ? false : true;
    const datos = { idDianacalculate: objeto.idDianacalculate, desdianacalculate: objeto.desdianacalculate, formula: objeto.formula, data: objeto.data, active: estado }

    this.dianaCalculateService.update(datos, objeto.idDianacalculate).subscribe(respuesta => {
      this.accion = 'Editar';
      this.cargarValores();
    });
  }

  openModalRegistro(templateRegistro: TemplateRef<any>, datos: any) {

    this.way = false;
    this.crearFormulario(datos);

    this.vantanaModal = this.modalService.show(templateRegistro ,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.DIANA_CALCULATE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.DIANA_CALCULATE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

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

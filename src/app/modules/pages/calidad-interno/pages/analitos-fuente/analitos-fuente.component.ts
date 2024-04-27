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
import { AnalitosFuenteService } from '@app/services/configuracion/analitos-fuente.service';
import { FuentesService } from '@app/services/configuracion/fuentes.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { LogsService } from '@app/services/configuracion/logs.service';

@Component({
  selector: 'app-analitos-fuente',
  templateUrl: './analitos-fuente.component.html',
  styleUrls: ['./analitos-fuente.component.css']
})
export class AnalitosFuenteComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();

  formularioRegistroEditar: FormGroup;
  accionEditar            : any;
  tituloAccion            : any;
  way                     : boolean = false;
  accion                  : any;
  vantanaModal            : BsModalRef;
  listaSources            : any[];
  listaAnalytes           : any[];
  titulo                  : any;
  text                    : any;
  textError               : any;
  cancelar                : any;
  confirmar               : any;
  messageError            : any;
  objeto                  : any;

  constructor(
    private translate                     : TranslateService,
    private analitosFuenteService         : AnalitosFuenteService,
    private fuentesService                : FuentesService,
    private analitosService               : AnalitosService,
    private logsService                   : LogsService,
    private fb                            : FormBuilder,
    private modalService                  : BsModalService,
    private sharedService                 : SharedService,
    private ventanaService                : VentanasModalesService,
    private datePipe                      : DatePipe
  ) { }

  displayedColumns : string[] = ['idsource', 'idanalytes', 'objetivoetmp', 'sesgomp', 'cvmp', 'active', 'editar', 'borrar'];
  dataSource       : MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarValores();
    this.cargarSourcesYAnalytes();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  get idSourceNoValido() {
    return this.formularioRegistroEditar.get('idsource');
  }

  get idAnalytesNoValido() {
    return this.formularioRegistroEditar.get('idanalytes');
  }

  get objetivoNoValido() {
    return this.formularioRegistroEditar.get('objetivoetmp');
  }

  get sesgoNoValido() {
    return this.formularioRegistroEditar.get('sesgomp');
  }

  get cvmpNoValido() {
    return this.formularioRegistroEditar.get('cvmp');
  }

  get valueActive() {
    return this.formularioRegistroEditar.get('active').value;
  }

  crearFormulario(datos: any) {

    this.formularioRegistroEditar = this.fb.group({

      idsourceanalyte: [datos.idsourceanalyte],
      idsource       : [datos.idsource ? datos.idsource : '', [Validators.required]],
      idanalytes     : [datos.idanalytes ? datos.idanalytes : '', [Validators.required]],
      objetivoetmp   : [datos.objetivoetmp ? datos.objetivoetmp : '', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
      sesgomp        : [datos.sesgomp ? datos.sesgomp : '', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
      cvmp           : [datos.cvmp ? datos.cvmp : '', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
      active         : [datos.active ? datos.active : false],

    });
  }

  cargarSourcesYAnalytes() {

    this.fuentesService.getAllAsync().then(respuesta => {
      this.listaSources = respuesta.filter(datos => datos.active == true);
    });

    this.analitosService.getAllAsync().then(respuesta => {
      this.listaAnalytes = respuesta.filter(datos => datos.active == true);

    });

}

  cargarValores() {
    this.analitosFuenteService.getAllAsync().then(respuesta => {
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

        this.analitosFuenteService.create(this.formularioRegistroEditar.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarValores();
          this.openModal(this.translate.instant('MODULES.NOTIFICACIONES.ANALITO_FUENTE_CREADO'));

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
        this.analitosFuenteService.update(this.formularioRegistroEditar.value, this.formularioRegistroEditar.value.idsourceanalyte).subscribe(respuesta => {
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

  openModalEliminar(templateEliminarRegistro: TemplateRef<any>, datos: any) {
    this.objeto = datos;
    this.vantanaModal = this.modalService.show(templateEliminarRegistro, { class: 'modal-sm',backdrop: 'static', keyboard: false });
  }

  eliminar() {
    this.closeVentana();
    this.analitosFuenteService.delete('', this.objeto.idsourceanalyte).subscribe(respuesta => {
      this.cargarValores();
      this.accion = '';
      this.openModal(this.translate.instant('MODULES.NOTIFICACIONES.ANALITO_FUENTE_ELIMINADO'));

      const Loguser = {
        fecha        : this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora         : this.dateNowISO,
        metodo       : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos        : JSON.stringify(this.objeto),
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
          datos        : JSON.stringify(this.objeto),
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
    const datos = { idsourceanalyte: objeto.idsourceanalyte, idsource: objeto.idsource, idanalytes: objeto.idanalytes, objetivoetmp: objeto.objetivoetmp, sesgomp: objeto.sesgomp, cvmp: objeto.cvmp, active: estado }

    this.analitosFuenteService.update(datos, objeto.idsourceanalyte).subscribe(respuesta => {
      this.accion = 'Editar';
      this.cargarValores();
    });
  }

  openModalRegistro(templateRegistro: TemplateRef<any>, datos: any) {

    this.way = false;
    this.crearFormulario(datos);

    this.vantanaModal = this.modalService.show(templateRegistro,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.ANALITOS_FUENTE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.ANALITOS_FUENTE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

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

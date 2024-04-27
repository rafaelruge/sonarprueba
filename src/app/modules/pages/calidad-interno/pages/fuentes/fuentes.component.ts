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
import { FuentesService } from '@app/services/configuracion/fuentes.service';

@Component({
  selector: 'app-fuentes',
  templateUrl: './fuentes.component.html',
  styleUrls: ['./fuentes.component.css']
})
export class FuentesComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();

  formularioRegistroEditar: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  way: boolean = false;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  idObjeto: any;

  constructor(
    private translate: TranslateService,
    private fuentesService: FuentesService,
    private logsService: LogsService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe
  ) { }

  displayedColumns: string[] = ['dessource', 'active', 'editar', 'borrar'];
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

  get desSourceNoValido() {
    return this.formularioRegistroEditar.get('dessource');
  }

  crearFormulario(datos: any) {

    this.formularioRegistroEditar = this.fb.group({

      idsource : [datos.idsource],
      idunits  : [datos.idunits],
      dessource: [datos.dessource ? datos.dessource : '', [Validators.required, Validators.maxLength(20)]],
      active   : [datos.active ? datos.active : false],

    });
  }

  cargarValores() {
    this.fuentesService.getAllAsync().then(respuesta => {
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

        this.fuentesService.create(this.formularioRegistroEditar.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarValores();
          this.openModal(this.translate.instant('MODULES.NOTIFICACIONES.FUENTE_CREADA'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Fuentes',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: JSON.stringify(this.formularioRegistroEditar.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200

          }

          this.logsService.createLogAsync(Loguser).then(respuesta => {
          
          });

        }, (error) => {

          console.log(error);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Fuentes',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos: JSON.stringify(this.formularioRegistroEditar.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }
          this.logsService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });
      } else {
        this.fuentesService.update(this.formularioRegistroEditar.value, this.formularioRegistroEditar.value.idsource).subscribe(respuesta => {
          this.closeVentana();

          this.cargarValores();
          this.way = true;
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Fuentes',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formularioRegistroEditar.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200
          }

          console.log(Loguser);

          this.logsService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        }, (error) => {

          console.log(error);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Fuentes',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formularioRegistroEditar.value),
            respuesta: error.message,
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
    this.vantanaModal = this.modalService.show(templateEliminarRegistro, { class: 'modal-sm',backdrop: 'static', keyboard: false });
  }

  eliminar() {
    this.closeVentana();
    this.fuentesService.delete('', this.idObjeto).subscribe(respuesta => {
      this.cargarValores();
      this.accion = '';
      this.openModal(this.translate.instant('MODULES.NOTIFICACIONES.FUENTE_ELIMINADA'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Fuentes',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(this.idObjeto),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200
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
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Fuentes',
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify(this.idObjeto),
          respuesta: err.message,
          tipoRespuesta: err.status
        }
        this.logsService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });

      });

  }
  actualizarEstado(objeto) {

    const estado = objeto.active ? false : true;
    const datos = { idsource: objeto.idsource, idunits: objeto.idunits, dessource: objeto.dessource, active: estado }

    this.fuentesService.update(datos, objeto.idsource).subscribe(respuesta => {
      this.accion = 'Editar';
      this.cargarValores();
    });
  }

  openModalRegistro(templateRegistro: TemplateRef<any>, datos: any) {
    this.way = false;
    this.crearFormulario(datos);

    this.vantanaModal = this.modalService.show(templateRegistro, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.FUENTES.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.FUENTES.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

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

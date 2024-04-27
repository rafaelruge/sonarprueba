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
import { ConfiguracionDeObjetivosService } from '@app/services/configuracion/configuracion-de-objetivos.service';
import { AnalitosFuenteService } from '@app/services/configuracion/analitos-fuente.service';
import { LogsService } from '@app/services/configuracion/logs.service';

@Component({
  selector: 'app-configuracion-de-objetivos',
  templateUrl: './configuracion-de-objetivos.component.html',
  styleUrls: ['./configuracion-de-objetivos.component.css']
})
export class ConfiguracionDeObjetivosComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();

  formularioRegistroEditar: FormGroup;
  accionEditar            : any;
  tituloAccion            : any;
  accion                  : any;
  vantanaModal            : BsModalRef;
  listaAnalitos           : any[]
  titulo                  : any;
  way                     : boolean = false;
  text                    : any;
  textError               : any;
  cancelar                : any;
  confirmar               : any;
  messageError            : any;
  idObjeto                : any;

  constructor(
    private translate                           : TranslateService,
    private configuracionDeObjetivosService     : ConfiguracionDeObjetivosService,
    private analitoFuenteService                : AnalitosFuenteService,
    private logsService                         : LogsService,
    private fb                                  : FormBuilder,
    private modalService                        : BsModalService,
    private sharedService                       : SharedService,
    private ventanaService                      : VentanasModalesService,
    private datePipe                            : DatePipe
  ) { }

  displayedColumns: string[] = ['objetivoetmp', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarValores();
    this.cargarAnalitos();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  get objetivoNoValido(){
    return this.formularioRegistroEditar.get('idsourceanalyte');
  }

  crearFormulario(datos: any) {


      this.formularioRegistroEditar = this.fb.group({

        idconfqualityobject: [datos.idconfqualityobject],
        idsourceanalyte    : [datos.idsourceanalyte ? datos.idsourceanalyte : '', [Validators.required]],
        active             : [datos.active ? datos.active : false],

      });

    }

  cargarAnalitos() {

      this.analitoFuenteService.getAllAsync().then(respuesta => {
      this.listaAnalitos = respuesta.filter(datos => datos.active == true);
      });

  }

  cargarValores() {
    this.configuracionDeObjetivosService.getAllAsync().then(respuesta => {
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

        this.configuracionDeObjetivosService.create(this.formularioRegistroEditar.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarValores();
          this.openModal(this.translate.instant('MODULES.NOTIFICACIONES.CONFIGURACION_DE_OBJETIVO_CREADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Administración',
            Item:'Metas de calidad por test',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: JSON.stringify(this.formularioRegistroEditar.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.logsService.createLogAsync(Loguser).then(respuesta => {
            
          });

        }, (error) => {

          console.log(error);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Administración',
            Item:'Metas de calidad por test',
            metodo       : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos        : JSON.stringify(this.formularioRegistroEditar.value),
            respuesta    : error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.logsService.createLogAsync(Loguser).then(respuesta => {
            
          });
        });
      } else {
        this.configuracionDeObjetivosService.update(this.formularioRegistroEditar.value, this.formularioRegistroEditar.value.idconfqualityobject).subscribe(respuesta => {
          this.closeVentana();

          this.cargarValores();
          this.way = true;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Administración',
            Item:'Metas de calidad por test',
            Metodo       : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos        : JSON.stringify(this.formularioRegistroEditar.value),
            Respuesta    : JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
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
            Submodulo: 'Administración',
            Item:'Metas de calidad por test',
            metodo       : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos        : JSON.stringify(this.formularioRegistroEditar.value),
            respuesta    : error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.logsService.createLogAsync(Loguser).then(respuesta => {
            
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
    this.configuracionDeObjetivosService.delete('', this.idObjeto).subscribe(respuesta => {
      this.cargarValores();
      this.accion = '';
      this.openModal(this.translate.instant('MODULES.NOTIFICACIONES.CONFIGURACION_DE_OBJETIVO_ELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Administración',
        Item:'Metas de calidad por test',
        metodo       : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos        : JSON.stringify(this.idObjeto),
        respuesta    : JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.logsService.createLogAsync(Loguser).then(respuesta => {
        
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
          Submodulo: 'Administración',
          Item:'Metas de calidad por test',
          metodo       : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos        : JSON.stringify(this.idObjeto),
          respuesta    : err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.logsService.createLogAsync(Loguser).then(respuesta => {
          
        });

      });

  }
  actualizarEstado(objeto) {

    const estado = objeto.active ? false : true;
    const datos = { idconfqualityobject: objeto.idconfqualityobject, idsourceanalyte: objeto.idsourceanalyte, objetivoetmp: objeto.idsourceanalyteDetalle.objetivoetmp, active: estado }

    this.configuracionDeObjetivosService.update(datos, objeto.idconfqualityobject).subscribe(respuesta => {
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
    datos ? this.translate.get('MODULES.CONFIGURACION_DE_OBJETIVOS.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.CONFIGURACION_DE_OBJETIVOS.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

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
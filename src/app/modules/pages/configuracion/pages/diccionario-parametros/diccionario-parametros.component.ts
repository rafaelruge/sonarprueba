import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '@app/services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DiccionarioParametrosService } from '@app/services/configuracion/diccionarioparametros.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-diccionario-parametros',
  templateUrl: './diccionario-parametros.component.html',
  styleUrls: ['./diccionario-parametros.component.css'],
  providers: [DatePipe]
})
export class DiccionarioParametrosComponent implements OnInit {
  dateNow : Date = new Date();
  dateNowISO = this.dateNow.toTimeString();

  formaRegistroDiccionarioParametros: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  desactivar = false;
  cancelar: any;
  confirmar: any;
  messageError: any;

  constructor(
    private translate: TranslateService,
    private diccionarioParametrosService: DiccionarioParametrosService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe
  ) { }
  displayedColumns: string[] = ['desdic', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarDicionarioParametros();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  get desDicNoValido() {
    return this.formaRegistroDiccionarioParametros.get('desDic');
  }

  crearFormularioDiccionarioParametros(datos: any) {
    this.formaRegistroDiccionarioParametros = this.fb.group({
      idDic: [datos.iddic ? datos.iddic : ''],
      desDic: [datos.desdic ? datos.desdic : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }
  cargarDicionarioParametros() {
    this.diccionarioParametrosService.getAllAsync().then(respuesta => {
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
  crearEditarDicionarioParametro() {
    if (!this.formaRegistroDiccionarioParametros.invalid) {
      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.diccionarioParametrosService.create(this.formaRegistroDiccionarioParametros.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarDicionarioParametros();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser  = {
            Fecha : this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora : this.dateNowISO,
            Metodo : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos : JSON.stringify(this.formaRegistroDiccionarioParametros.value),
            Respuesta : JSON.stringify(respuesta),
            TipoRespuesta : status
          }

          console.log(Loguser);

          this.diccionarioParametrosService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });

        },(error) =>{

          console.log(error);

          const Loguser  = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos : JSON.stringify(this.formaRegistroDiccionarioParametros.value),
            respuesta : error.message,
            tipoRespuesta : error.status
          }
          this.diccionarioParametrosService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });
      } else {
        this.diccionarioParametrosService.update(this.formaRegistroDiccionarioParametros.value, this.formaRegistroDiccionarioParametros.value.idDic).subscribe(respuesta => {
          this.closeVentana();

          this.cargarDicionarioParametros();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser  = {
            Fecha : this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora : this.dateNowISO,
            Metodo : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos : JSON.stringify(this.formaRegistroDiccionarioParametros.value),
            Respuesta : JSON.stringify(respuesta),
            TipoRespuesta : status
          }

          console.log(Loguser);

          this.diccionarioParametrosService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });

        },(error) =>{

          console.log(error);

          const Loguser  = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos : JSON.stringify(this.formaRegistroDiccionarioParametros.value),
            respuesta : error.message,
            tipoRespuesta : error.status
          }
          this.diccionarioParametrosService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });
      }
    }
  }

  eliminarDicionarioParametro(id: any) {
    this.diccionarioParametrosService.delete('Dicparams', id).subscribe(respuesta => {
      this.cargarDicionarioParametros();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser  = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.dateNowISO,
        metodo : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos : JSON.stringify(id),
        respuesta : JSON.stringify(respuesta),
        tipoRespuesta : status
      }
      this.diccionarioParametrosService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });

    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser  = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos : JSON.stringify(id),
          respuesta : err.message,
          tipoRespuesta : err.status
        }
        this.diccionarioParametrosService.createLogAsync(Loguser).then(respuesta => {
          
        });

      });
  }
  actualizarEstadoDicionario(evet, datosDic) {

    const estado = datosDic.active ? false : true;
    const datos = { iddic: datosDic.iddic, desdic: datosDic.desdic, active: estado }

    this.diccionarioParametrosService.update(datos, datosDic.iddic).subscribe(respuesta => {
      this.cargarDicionarioParametros();
      this.accion = 'Editar';
    });
  }

  openModalRegistroDicionarioParametro(templateRegistroCiudad: TemplateRef<any>, datos: any) {

    this.crearFormularioDiccionarioParametros(datos);
    this.vantanaModal = this.modalService.show(templateRegistroCiudad ,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.DICCIONARIOPARAMETROS.FORMULARIO.MODALEDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.DICCIONARIOPARAMETROS.FORMULARIO.MODALCREAR').subscribe(respuesta => this.tituloAccion = respuesta);
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

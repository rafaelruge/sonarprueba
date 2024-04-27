import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { WestgardService } from '../../../../../services/configuracion/westgard.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-westgard',
  templateUrl: './westgard.component.html',
  styleUrls: ['./westgard.component.css'],
  providers: [DatePipe]

})
export class WestgardComponent implements OnInit {
  dateNow : Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();
  formaWestgard: FormGroup;
  ventanaModal: BsModalRef;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  mostrarMensaje: boolean = false;
  messageError: any;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  idwestgardrules: any;

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['code', 'deswesgardrules', 'active', 'editar', 'borrar'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private ventanaService: VentanasModalesService,
    private sharedService: SharedService,
    private westgardService: WestgardService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.cargarWestgard();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  cargarWestgard() {
    this.westgardService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  mostrarM() {
    this.mostrarMensaje = true;
    setTimeout(() => {
      this.mostrarMensaje = false;
    }, 3000);
  }

  get codeNoValido() {
    return this.formaWestgard.get('code');
  }
  get deswesgardrulesNoValido() {
    return this.formaWestgard.get('deswesgardrules');
  }
  crearFormularioWestgard(datos: any) {
    this.formaWestgard = this.fb.group({
      idwesgardrules: [datos.idwesgardrules ? datos.idwesgardrules : ''],
      code: [datos.code ? datos.code : '', [Validators.required, Validators.minLength(3), Validators.maxLength(400)]],
      deswesgardrules: [datos.deswesgardrules ? datos.deswesgardrules : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false]
    });
  }
  openModalWestgard(templateRegistroWestgard: TemplateRef<any>, datos: any) {
    this.mostrarMensaje = false;
    this.crearFormularioWestgard(datos);

    this.ventanaModal = this.modalService.show(templateRegistroWestgard ,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.WESTGARD.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.WESTGARD.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }
  crearEditarWestgard() {
    if (!this.formaWestgard.invalid) {

      if (this.accion === 'Crear') {
        this.westgardService.create(this.formaWestgard.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarWestgard();
          this.openModal(this.translate.instant('MODULES.NOTIFICACIONES.WESTGARD_CREADO'));

          const Loguser  = {
            Fecha : this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora : this.dateNowISO,
            Metodo : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos : JSON.stringify(this.formaWestgard.value),
            Respuesta : JSON.stringify(respuesta),
            TipoRespuesta : status
          }

          this.westgardService.createLogAsync(Loguser).then(respuesta => {
          });

        },(error) =>{

          const Loguser  = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos : JSON.stringify(this.formaWestgard.value),
            respuesta : error.message,
            tipoRespuesta : error.status
          }
          this.westgardService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      } else {
        this.westgardService.update(this.formaWestgard.value, this.formaWestgard.value.idwesgardrules).subscribe(respuesta => {
          this.cargarWestgard();
          this.mostrarM();
          this.closeVentana();

          const Loguser  = {
            Fecha : this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora : this.dateNowISO,
            Metodo : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos : JSON.stringify(this.formaWestgard.value),
            Respuesta : JSON.stringify(respuesta),
            TipoRespuesta : status
          }

          this.westgardService.createLogAsync(Loguser).then(respuesta => {
          });

        },(error) =>{

          const Loguser  = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos : JSON.stringify(this.formaWestgard.value),
            respuesta : error.message,
            tipoRespuesta : error.status
          }
          this.westgardService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }
  }
  openModalEliminarRegistro(templateEliminarRegistro: TemplateRef<any>, datos: any) {
    this.idwestgardrules = datos;
    this.ventanaModal = this.modalService.show(templateEliminarRegistro, { class: 'modal-sm' , backdrop: 'static', keyboard: false  });
  }
  eliminarWestgard() {
    this.closeVentana();
    this.westgardService.delete('Westgardrules', this.idwestgardrules).subscribe(respuesta => {
      this.cargarWestgard();
      this.accion = '';
      this.openModal(this.translate.instant('MODULES.NOTIFICACIONES.WESTGARD_ELIMINADO'));

      const Loguser  = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.dateNowISO,
        metodo : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos : JSON.stringify(this.idwestgardrules),
        respuesta : JSON.stringify(respuesta),
        tipoRespuesta : status
      }
      this.westgardService.createLogAsync(Loguser).then(respuesta => {
      });
    },
      (err: HttpErrorResponse) => {

        this.sharedService.showLoader(false);
        this.accion = 'error';
        this.openModal(this.messageError);

        const Loguser  = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo : this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos : JSON.stringify(this.idwestgardrules),
          respuesta : err.message,
          tipoRespuesta : err.status
        }
        this.westgardService.createLogAsync(Loguser).then(respuesta => {
        });
      });
  }
  actualizarEstadoWestgard(datosWestgard) {

    const estado = datosWestgard.active ? false : true;
    const datos = { idwesgardrules: datosWestgard.idwesgardrules,code: datosWestgard.code, deswesgardrules: datosWestgard.deswesgardrules, active: estado }

    this.westgardService.update(datos, datosWestgard.idwesgardrules).subscribe(respuesta => {
      this.cargarWestgard();
      this.accion = 'Editar';
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

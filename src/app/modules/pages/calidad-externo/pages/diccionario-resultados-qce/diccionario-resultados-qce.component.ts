import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DiccionarioResultadosQceService } from '@app/services/calidad-externo/diccionarioResultadosQce.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-diccionario-resultados-qce',
  templateUrl: './diccionario-resultados-qce.component.html',
  styleUrls: ['./diccionario-resultados-qce.component.css'],
  providers: [DatePipe]
})
export class DiccionarioResultadosQceComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroDiccionario: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  desactivar = false;
  messageError: string;
  listaSections: [];
  displayedColumns: string[] = ['desresults', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private diccionarioResultadosQceService: DiccionarioResultadosQceService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private sharedService: SharedService

  ) { }

  ngOnInit(): void {
    this.cargarDiccionarioQce();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal()
  }
  cargarDiccionarioQce() {
    this.diccionarioResultadosQceService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.tituloAccion }
    this.ventanaService.openModal(data);
  }
  openModalRegistroDiccionario(templateRegistroDiccionarioQce: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroDiccionarioQce(datos);
    this.ventanaModal = this.modalService.show(templateRegistroDiccionarioQce,{backdrop: 'static', keyboard: false });
    this.accionEditar = !!datos;
    datos ? this.translate.get('MODULES.DICCIONARIORESULTQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.DICCIONARIORESULTQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }
  crearFormularioRegistroDiccionarioQce(datos: any) {
    this.formaRegistroDiccionario = this.fb.group({
      idresultsdictionary: [datos.idresultsdictionary ? datos.idresultsdictionary : ''],
      desresults: [datos.desresults ? datos.desresults : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }
  get desNoValido() {
    return this.formaRegistroDiccionario.get('desresults');
  }
  crearEditarDiccionarioQce() {
    if (!this.formaRegistroDiccionario.invalid) {

      if (this.tituloAccion === 'Crear') {

        this.desactivar = true;
        this.diccionarioResultadosQceService.create(this.formaRegistroDiccionario.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarDiccionarioQce();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: JSON.stringify(this.formaRegistroDiccionario.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }


          this.diccionarioResultadosQceService.createLogAsync(Loguser).then(respuesta => { });

        }, (error) => {


          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos: JSON.stringify(this.formaRegistroDiccionario.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }
          this.diccionarioResultadosQceService.createLogAsync(Loguser).then(respuesta => { });

        });
      } else {
        this.diccionarioResultadosQceService.update(this.formaRegistroDiccionario.value, this.formaRegistroDiccionario.value.idresultsdictionary).subscribe(respuesta => {
          this.closeVentana();

          this.cargarDiccionarioQce();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formaRegistroDiccionario.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }


          this.diccionarioResultadosQceService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formaRegistroDiccionario.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }

          this.diccionarioResultadosQceService.createLogAsync(Loguser).then(respuesta => { });

        });
      }
    }
  }
  actualizarEstadoDiccionarioQce(datosDiccionario) {
    const estado = datosDiccionario.active ? false : true;

    const datos = { idresultsdictionary: datosDiccionario.idresultsdictionary, desresults: datosDiccionario.desresults, active: estado };
    this.diccionarioResultadosQceService.update(datos, datosDiccionario.idresultsdictionary).subscribe(respuesta => {
      this.tituloAccion = 'Editar';
      this.cargarDiccionarioQce();
    });
  }

  eliminarDiccionarioQce(id: any) {

    this.diccionarioResultadosQceService.delete('resultsdictionaryQce', id).subscribe(respuesta => {

      this.cargarDiccionarioQce();
      this.tituloAccion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.dateNowISO,
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: status
      }
      this.diccionarioResultadosQceService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });

    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status
        }
        this.diccionarioResultadosQceService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });

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

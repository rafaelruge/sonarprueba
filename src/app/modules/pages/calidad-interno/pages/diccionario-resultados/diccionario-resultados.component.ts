import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DiccionarioResultadosService } from '@app/services/configuracion/diccionario-resultados.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-diccionario-resultados',
  templateUrl: './diccionario-resultados.component.html',
  styleUrls: ['./diccionario-resultados.component.css'],
  providers: [DatePipe]

})
export class DiccionarioResultadosComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroDiccionario: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  desactivar = false;
  accion: any;
  messageError: string;
  listaSections: [];
  displayedColumns: string[] = ['desresults', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private diccionarioResultadosService: DiccionarioResultadosService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.cargarDiccionario();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  cargarDiccionario() {
    this.diccionarioResultadosService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.tituloAccion }
    this.ventanaService.openModal(data);
  }
  openModalRegistroDiccionario(templateRegistroDiccionario: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroDiccionario(datos);
    this.ventanaModal = this.modalService.show(templateRegistroDiccionario, { backdrop: 'static', keyboard: false });
    this.accionEditar = !!datos;
    datos ? this.translate.get('MODULES.DICCIONARIORESULT.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.DICCIONARIORESULT.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }
  crearFormularioRegistroDiccionario(datos: any) {
    this.formaRegistroDiccionario = this.fb.group({
      idresultsdictionary: [datos.idresultsdictionary ? datos.idresultsdictionary : ''],
      desresults: [datos.desresults ? datos.desresults : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }
  get desNoValido() {
    return this.formaRegistroDiccionario.get('desresults');
  }
  crearEditarDiccionario() {
    if (!this.formaRegistroDiccionario.invalid) {
      if (this.tituloAccion === 'Crear') {

        this.desactivar = true;
        this.diccionarioResultadosService.create(this.formaRegistroDiccionario.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarDiccionario();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Diccionario de Resultados',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: JSON.stringify(this.formaRegistroDiccionario.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }


          this.diccionarioResultadosService.createLogAsync(Loguser).then(respuesta => { });

        }, (error) => {


          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Diccionario de Resultados',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos: JSON.stringify(this.formaRegistroDiccionario.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.diccionarioResultadosService.createLogAsync(Loguser).then(respuesta => { });

        });
      } else {
        this.diccionarioResultadosService.update(this.formaRegistroDiccionario.value, this.formaRegistroDiccionario.value.idresultsdictionary).subscribe(respuesta => {
          this.closeVentana();
          this.cargarDiccionario();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Diccionario de Resultados',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formaRegistroDiccionario.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }


          this.diccionarioResultadosService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Diccionario de Resultados',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formaRegistroDiccionario.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.diccionarioResultadosService.createLogAsync(Loguser).then(respuesta => { });

        });
      }
    }
  }
  actualizarEstadoDiccionario(datosDiccionario) {
    const estado = datosDiccionario.active ? false : true;

    const datos = { idresultsdictionary: datosDiccionario.idresultsdictionary, desresults: datosDiccionario.desresults, active: estado };
    this.diccionarioResultadosService.update(datos, datosDiccionario.idresultsdictionary).subscribe(respuesta => {
      this.tituloAccion = 'Editar';
      this.cargarDiccionario();
    });
  }

  eliminarDiccionario(id: any) {
    this.diccionarioResultadosService.delete('resultsdictionaries', id).subscribe(respuesta => {

      this.cargarDiccionario();
      this.tituloAccion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Configuración',
        Item:'Diccionario de Resultados',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.diccionarioResultadosService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });

    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Diccionario de Resultados',
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.diccionarioResultadosService.createLogAsync(Loguser).then(respuesta => {
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

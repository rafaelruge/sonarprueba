import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { InstrumentosService } from '@app/services/configuracion/instrumentos.service';
import { CasasComercialesService } from '@app/services/configuracion/casascomerciales.service';
import { DatePipe } from '@angular/common';
import { DetailsAnalyzerService } from '@app/services/configuracion/detailsAnalyzer.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gestion-instrumentos-lab',
  templateUrl: './gestion-instrumentos-lab.component.html',
  styleUrls: ['./gestion-instrumentos-lab.component.css'],
  providers: [DatePipe]
})
export class GestionInstrumentosLabComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionIntrumentos: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  vantanaModal: BsModalRef;
  listaCiudades: any;
  listaTradeMark: [];
  titulo: any;
  text: any;
  desactivar = false;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  constructor(
    private translate: TranslateService,
    private instrumentosService: InstrumentosService,
    private detailsAnalyzerService: DetailsAnalyzerService,
    private casasComercialesService: CasasComercialesService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService, private ventanaService: VentanasModalesService,
    private datePipe: DatePipe
  ) { }
  displayedColumns: string[] = ['name_Analyzer', 'model', 'marker', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionInstrumentos();
    this.cargarTradeMark();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  get modelNoValido() {
    return this.formaGestionIntrumentos.get('model');
  }
  get nameAnalyzerNoValido() {
    return this.formaGestionIntrumentos.get('nameAnalyzer');
  }
  get markerNoValido() {
    return this.formaGestionIntrumentos.get('marker');
  }
  get idtrademarkNoValido() {
    return this.formaGestionIntrumentos.get('idtrademark');
  }
  crearFormularioGestionInstrumentos(datos: any) {
    this.formaGestionIntrumentos = this.fb.group({
      idAnalyzer: [datos.IdAnalyzer ? datos.IdAnalyzer : ''],
      idtrademark: [datos.Idtrademark ? datos.Idtrademark : '', [Validators.required]],
      nameAnalyzer: [datos.NameAnalyzer ? datos.NameAnalyzer : '', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      model: [datos.Model ? datos.Model : '', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      active: [datos.Active ? datos.Active : false],
    });
  }
  cargarGestionInstrumentos() {
    this.detailsAnalyzerService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  cargarTradeMark() {
    this.casasComercialesService.getAllAsync().then(respuesta => {
      this.listaTradeMark = respuesta.filter(datos => datos.active == true);
    });

  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  crearEditarGestionInstrumentos() {

    if (!this.formaGestionIntrumentos.invalid) {

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.instrumentosService.create(this.formaGestionIntrumentos.value).subscribe(respuesta => {
          this.closeVentana();
          this.cargarGestionInstrumentos();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Instrumentos',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: JSON.stringify(this.formaGestionIntrumentos.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.instrumentosService.createLogAsync(Loguser).then(respuesta => {
          });
        }, (error) => {

          this.toastr.error(error.error);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Instrumentos',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos: JSON.stringify(this.formaGestionIntrumentos.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.instrumentosService.createLogAsync(Loguser).then(respuesta => {});
        });
      } else {
        this.instrumentosService.update(this.formaGestionIntrumentos.value, this.formaGestionIntrumentos.value.idAnalyzer).subscribe(respuesta => {
          this.closeVentana();

          this.cargarGestionInstrumentos();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Instrumentos',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formaGestionIntrumentos.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.instrumentosService.createLogAsync(Loguser).then(respuesta => {
            
          });
        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Instrumentos',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formaGestionIntrumentos.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.instrumentosService.createLogAsync(Loguser).then(respuesta => {
            
          });
        });
      }
    }
  }

  eliminarGestionInstrumento(id: any) {
    this.instrumentosService.delete('Analyzers', id).subscribe(respuesta => {

      this.cargarGestionInstrumentos();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Configuración',
        Item:'Instrumentos',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.instrumentosService.createLogAsync(Loguser).then(respuesta => {
        
      });
    },
      (err: HttpErrorResponse) => {
        
        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Instrumentos',
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.instrumentosService.createLogAsync(Loguser).then(respuesta => {
          
        });
      });
  }
  actualizarEstadoGestionInstrumento(event, datosGestionInstrumento) {

    const estado = datosGestionInstrumento.Active ? false : true;
    const datos = { idAnalyzer: datosGestionInstrumento.IdAnalyzer, idtrademark: datosGestionInstrumento.Idtrademark, nameAnalyzer: datosGestionInstrumento.NameAnalyzer, model: datosGestionInstrumento.Model, marker: datosGestionInstrumento.Marker, active: estado }

    this.instrumentosService.update(datos, datosGestionInstrumento.IdAnalyzer).subscribe(respuesta => {
      this.cargarGestionInstrumentos();
      this.accion = 'Editar';
    });
  }
  openModalGestionInstrumentos(templateGestionInstrumentos: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionInstrumentos(datos);

    this.vantanaModal = this.modalService.show(templateGestionInstrumentos, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.GESTIONINSTRUMENTOS.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.GESTIONINSTRUMENTOS.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
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

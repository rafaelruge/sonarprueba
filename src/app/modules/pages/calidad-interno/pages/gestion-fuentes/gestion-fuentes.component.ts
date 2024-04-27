import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FuentesService } from '@app/services/configuracion/fuentes.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { Unidadeservice } from '@app/services/configuracion/unidades.service';
import { DatePipe } from '@angular/common';
import { FuentesDetailsService } from '@app/services/configuracion/fuentesDetails.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gestion-fuentes',
  templateUrl: './gestion-fuentes.component.html',
  styleUrls: ['./gestion-fuentes.component.css'],
  providers: [DatePipe]
})
export class GestionFuentesComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionFuentes: FormGroup;
  listUnits: any;
  desactivar = false;
  unitsActive: any;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  vantanaModal: BsModalRef;
  listaCiudades: any;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  constructor(
    private translate: TranslateService,
    private fuentesService: FuentesService,
    private fuentesDetailsService: FuentesDetailsService,
    private unidadeservice: Unidadeservice,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe
  ) { }
  displayedColumns: string[] = ['dessource', 'unidad', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionFuentes();
    this.cargarUnits();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  async cargarUnits() {
    this.listUnits = await this.unidadeservice.getAllAsync();
    this.unitsActive = this.listUnits.filter(e => e.active == true);
  }
  get desSourceNoValido() {
    return this.formaGestionFuentes.get('dessource');
  }
  get idUnitsNoValido() {
    return this.formaGestionFuentes.get('idunits');
  }
  crearFormularioGestionFuentes(datos: any) {
    this.formaGestionFuentes = this.fb.group({
      idsource: [datos.Idsource ? datos.Idsource : ''],
      dessource: [datos.Dessource ? datos.Dessource : '', [Validators.required, Validators.minLength(5), Validators.maxLength(400)]],
      idunits: [datos.Idunits ? datos.Idunits : '', [Validators.required]],
      active: [datos.Active ? datos.Active : false],
    });
  }
  cargarGestionFuentes() {
    this.fuentesDetailsService.getAllAsync().then(respuesta => {
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
  crearEditarGestionFuentes() {
    if (!this.formaGestionFuentes.invalid) {

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.fuentesService.create(this.formaGestionFuentes.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarGestionFuentes();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Fuentes',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: JSON.stringify(this.formaGestionFuentes.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.fuentesService.createLogAsync(Loguser).then(respuesta => {
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
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos: JSON.stringify(this.formaGestionFuentes.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.fuentesService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });
      } else {
        this.fuentesService.update(this.formaGestionFuentes.value, this.formaGestionFuentes.value.idsource).subscribe(respuesta => {
          this.closeVentana();

          this.cargarGestionFuentes();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Fuentes',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formaGestionFuentes.value),
            DatosAnteriores:JSON.stringify(this.formaGestionFuentes.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.fuentesService.createLogAsync(Loguser).then(respuesta => {
            
          });
        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Fuentes',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formaGestionFuentes.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.fuentesService.createLogAsync(Loguser).then(respuesta => {
            
          });
        });
      }
    }
  }

  eliminarGestionFuentes(id: any) {
    this.fuentesService.delete('Sources', id).subscribe(respuesta => {

      this.cargarGestionFuentes();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Configuración',
        Item:'Fuentes',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.fuentesService.createLogAsync(Loguser).then(respuesta => {
        
      });
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Fuentes',
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.fuentesService.createLogAsync(Loguser).then(respuesta => {
          
        });
      });
  }
  actualizarEstadoGestionFuentes(event, datosGestionFuente) {
    const estado = datosGestionFuente.Active ? false : true;
    const datos = { idsource: datosGestionFuente.Idsource, dessource: datosGestionFuente.Dessource, idUnits: datosGestionFuente.Idunits, active: estado }

    this.fuentesService.update(datos, datosGestionFuente.Idsource).subscribe(respuesta => {
      this.cargarGestionFuentes();
      this.accion = 'Editar';
    });
  }
  openModalGestionFuentes(templateGestionFuentes: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionFuentes(datos);

    this.vantanaModal = this.modalService.show(templateGestionFuentes ,{backdrop: 'static', keyboard: false } );
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.GESTIONFUENTES.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.GESTIONFUENTES.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
    // this.modalRef.setClass('modal-lg');
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

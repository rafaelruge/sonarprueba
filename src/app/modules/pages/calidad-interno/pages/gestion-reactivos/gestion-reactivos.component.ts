import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { ReactivosService } from '@app/services/configuracion/reactivos.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gestion-reactivos',
  templateUrl: './gestion-reactivos.component.html',
  styleUrls: ['./gestion-reactivos.component.css'],
  providers: [DatePipe]
})
export class GestionReactivosComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionReactivos: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  desactivar = false;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  constructor(
    private datePipe: DatePipe,
    private translate: TranslateService,
    private reactivosService: ReactivosService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService
  ) { }

  displayedColumns: string[] = ['desReagents', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionReactivos();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  cargarGestionReactivos() {
    this.reactivosService.getAllAsync().then(respuesta => {
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
  openModalGestionReactivos(templateGestionReactivos: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionReactivos(datos);

    this.vantanaModal = this.modalService.show(templateGestionReactivos, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.GESTIONREACTIVOS.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.GESTIONREACTIVOS.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }
  get desReagentsNoValido() {
    return this.formaGestionReactivos.get('desreagents');
  }
  crearFormularioGestionReactivos(datos: any) {
    this.formaGestionReactivos = this.fb.group({
      idreagents: [datos.idreagents ? datos.idreagents : ''],
      desreagents: [datos.desreagents ? datos.desreagents : '', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      active: [datos.active ? datos.active : false]
    });
  }
  crearEditarGestionReactivos() {
    if (!this.formaGestionReactivos.invalid) {

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.reactivosService.create(this.formaGestionReactivos.value).subscribe(respuesta => {
          this.closeVentana();
          this.cargarGestionReactivos();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Reactivos',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: JSON.stringify(this.formaGestionReactivos.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.reactivosService.createLogAsync(Loguser).then(respuesta => {
            
          });
        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Reactivos',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos: JSON.stringify(this.formaGestionReactivos.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.reactivosService.createLogAsync(Loguser).then(respuesta => {
            
          });
        });
      } else {
        this.reactivosService.update(this.formaGestionReactivos.value, this.formaGestionReactivos.value.idreagents).subscribe(respuesta => {
          this.closeVentana();

          this.cargarGestionReactivos();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Reactivos',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formaGestionReactivos.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.reactivosService.createLogAsync(Loguser).then(respuesta => {
            
          });
        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Reactivos',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formaGestionReactivos.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.reactivosService.createLogAsync(Loguser).then(respuesta => {
            
          });
        });
      }
    }
  }
  actualizarEstadoGestionReactivos(datosReactivos) {
    const estado = datosReactivos.active ? false : true;
    const datos = { idreagents: datosReactivos.idreagents, desreagents: datosReactivos.desreagents, active: estado }

    this.reactivosService.update(datos, datosReactivos.idreagents).subscribe(respuesta => {
      this.cargarGestionReactivos();
      this.accion = 'Editar';
    });
  }

  eliminarGestionReactivos(id: any) {
    this.reactivosService.delete('Reagents', id).subscribe(respuesta => {

      this.cargarGestionReactivos();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Configuración',
        Item:'Reactivos',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.reactivosService.createLogAsync(Loguser).then(respuesta => {
        
      });
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Reactivos',
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.reactivosService.createLogAsync(Loguser).then(respuesta => {
          
        });
      });
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

import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { MetodosService } from '@app/services/configuracion/metodos.service';

@Component({
  selector: 'app-gestion-metodos',
  templateUrl: './gestion-metodos.component.html',
  styleUrls: ['./gestion-metodos.component.css'],
  providers: [DatePipe],
})
export class GestionMetodosComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionMetodos: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  desactivar = false;
  cancelar: any;
  confirmar: any;
  messageError: any;

  constructor(private datePipe: DatePipe,
    private translate: TranslateService,
    private metodosService: MetodosService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService) { }

  displayedColumns: string[] = ['desmethods', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionMetodos();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  cargarGestionMetodos() {
    this.metodosService.getAllAsync().then(respuesta => {
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
  openModalGestionMetodos(templateGestionMetodos: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionMetodos(datos);

    this.vantanaModal = this.modalService.show(templateGestionMetodos, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.GESTIONMETHODS.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.GESTIONMETHODS.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  get desMethodsNoValido() {
    return this.formaGestionMetodos.get('desmethods');
  }

  crearFormularioGestionMetodos(datos: any) {
    this.formaGestionMetodos = this.fb.group({
      idmethods: [datos.idmethods ? datos.idmethods : ''],
      desmethods: [datos.desmethods ? datos.desmethods : '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false]
    });
  }
  crearEditarGestionMetodos() {
    if (!this.formaGestionMetodos.invalid) {
      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.metodosService.create(this.formaGestionMetodos.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarGestionMetodos();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Métodos',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: JSON.stringify(this.formaGestionMetodos.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.metodosService.createLogAsync(Loguser).then(respuesta => {
            
          });
        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Métodos',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos: JSON.stringify(this.formaGestionMetodos.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.metodosService.createLogAsync(Loguser).then(respuesta => {
            
          });
        });
      } else {
        this.metodosService.update(this.formaGestionMetodos.value, this.formaGestionMetodos.value.idmethods).subscribe(respuesta => {
          this.closeVentana();

          this.cargarGestionMetodos();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Métodos',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formaGestionMetodos.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.metodosService.createLogAsync(Loguser).then(respuesta => {
            
          });
        }, (error) => {

          console.log(error);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Métodos',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formaGestionMetodos.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.metodosService.createLogAsync(Loguser).then(respuesta => {
            
          });
        });
      }
    }
  }
  actualizarGestionMetodos(datosMetodo) {
    const estado = datosMetodo.active ? false : true;
    const datos = { idmethods: datosMetodo.idmethods, desmethods: datosMetodo.desmethods, active: estado }

    this.metodosService.update(datos, datosMetodo.idmethods).subscribe(respuesta => {
      this.cargarGestionMetodos();
      this.accion = 'Editar';
    });
  }

  eliminarGestionMetodo(id: any) {
    this.metodosService.delete('Methods', id).subscribe(respuesta => {

      this.cargarGestionMetodos();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Configuración',
        Item:'Métodos',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.metodosService.createLogAsync(Loguser).then(respuesta => {
        
      });
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Métodos',
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.metodosService.createLogAsync(Loguser).then(respuesta => {
          
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

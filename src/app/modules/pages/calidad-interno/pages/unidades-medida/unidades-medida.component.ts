import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { Unidadeservice } from '@app/services/configuracion/unidades.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-unidades-medida',
  templateUrl: './unidades-medida.component.html',
  styleUrls: ['./unidades-medida.component.css'],
  providers: [DatePipe]
})
export class UnidadesMedidaComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();

  formaUnidadMedida: FormGroup;
  accionEditar: any;
  accion: any;
  desactivar = false;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  desunitsant:any;
  estadoant:any;

  constructor(
    private translate: TranslateService,
    private unidadeservice: Unidadeservice,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe
  ) { }
  displayedColumns: string[] = ['desUnits', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarUnidadesMedida();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  cargarUnidadesMedida() {
    this.unidadeservice.getAllAsync().then(respuesta => {
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
  openModalUnidadMedida(templateUnidadMedida: TemplateRef<any>, datos: any) {

    this.crearFormularioUnidadesMedida(datos);

    this.vantanaModal = this.modalService.show(templateUnidadMedida, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.UNIDADESMEDIDA.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.UNIDADESMEDIDA.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }
  get desUnitsNoValido() {
    return this.formaUnidadMedida.get('desunits');
  }

  crearFormularioUnidadesMedida(datos: any) {
    this.formaUnidadMedida = this.fb.group({
      idunits: [datos.idunits ? datos.idunits : ''],
      desunits: [datos.desunits ? datos.desunits : '', [Validators.required, Validators.minLength(1), Validators.maxLength(100),]],
      active: [datos.active ? datos.active : false]
    });
  }
  crearEditarUnidadMedida() {
    if (!this.formaUnidadMedida.invalid) {

      var antunidad = this.formaUnidadMedida.get('desunits').value;
      var antestado = this.formaUnidadMedida.get('active').value;
      var idunit = this.formaUnidadMedida.value.idunits;

      this.unidadeservice.getByIdAsync(idunit).then((dataunit: any) => {

        this.desunitsant = dataunit.desunits;
        this.estadoant = dataunit.active;
        
      }).catch(error => {
  
      });

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.unidadeservice.create(this.formaUnidadMedida.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarUnidadesMedida();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Unidades de Medida',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Unidad: ' + this.formaUnidadMedida.value.desunits + '| ' + 'Estado: ' +  this.formaUnidadMedida.value.active ),
            respuesta: JSON.stringify(respuesta),
            tipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.unidadeservice.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          console.log(error);

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Unidades de Medida',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Unidad: ' + this.formaUnidadMedida.value.desunits + '| ' + 'Estado: ' +  this.formaUnidadMedida.value.active ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.unidadeservice.createLogAsync(Loguser).then(respuesta => {
          });
        });
      } else {

        this.unidadeservice.update(this.formaUnidadMedida.value, this.formaUnidadMedida.value.idunits).subscribe(respuesta => {
          this.closeVentana();

          this.cargarUnidadesMedida();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Unidades de Medida',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Unidad: ' + this.formaUnidadMedida.value.desunits + '| ' + 'Estado: ' +  this.formaUnidadMedida.value.active ),
            DatosAnteriores: ('Unidad: ' + this.desunitsant + '| ' + 'Estado: ' +  this.estadoant ),
            respuesta: JSON.stringify(respuesta),
            tipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.unidadeservice.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Unidades de Medida',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Unidad: ' + this.formaUnidadMedida.value.desunits + '| ' + 'Estado: ' +  this.formaUnidadMedida.value.active ),
            DatosAnteriores: ('Unidad: ' + this.desunitsant + '| ' + 'Estado: ' +  this.estadoant ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.unidadeservice.createLogAsync(Loguser).then(respuesta => {
            
          });
        });
      }
    }
  }

  actualizarUnidadMedida(unidades) {
    const estado = unidades.active ? false : true;
    const datos = { idUnits: unidades.idunits, desunits: unidades.desunits, active: estado }

    this.unidadeservice.update(datos, unidades.idunits).subscribe(respuesta => {
      this.cargarUnidadesMedida();
      this.accion = 'Editar';
    });
  }

  eliminarUnidadMedida(id: any) {

    var idunidad = id;
    var desunidad = null;
    this.unidadeservice.getByIdAsync(idunidad).then((dataunit: any) => {

      desunidad = dataunit.desunits;
    
    });

    this.unidadeservice.delete('Units', id).subscribe(respuesta => {
      this.cargarUnidadesMedida();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Configuración',
        Item:'Unidades de Medida',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: (id + '| '+ 'Unidad: ' + desunidad ),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.unidadeservice.createLogAsync(Loguser).then(respuesta => {
       
      });

    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Unidades de Medida',
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          Datos: (id + '| '+ 'Unidad: ' + desunidad ),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.unidadeservice.createLogAsync(Loguser).then(respuesta => { });

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

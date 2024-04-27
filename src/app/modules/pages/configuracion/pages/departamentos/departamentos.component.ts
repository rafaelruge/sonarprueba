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
import { DepartmentsService } from '@app/services/configuracion/departamentos.service';
import { PaisesService } from '@app/services/configuracion/paises.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-departamentos',
  templateUrl: './departamentos.component.html',
  styleUrls: ['./departamentos.component.css'],
  providers: [DatePipe]
})
export class DepartamentosComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaRegistroDepartamento: FormGroup;
  accionEditar: any;
  accion: any;
  desactivar = false;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  listaPaises: [];
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  desdepartamentant:any;
  estadoant:any;

  constructor(
    private translate: TranslateService,
    private departmentsService: DepartmentsService,
    private paisesService: PaisesService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
  ) { }
  displayedColumns: string[] = ['desdepartament', 'coddivipola', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarDepartamentos();
    this.cargarPaises();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  get DesDepartamentNoValido() {
    return this.formaRegistroDepartamento.get('DesDepartament');
  }
  get idcountryNoValido() {
    return this.formaRegistroDepartamento.get('idcountry');
  }
  crearFormularioRegistroDepartamento(datos: any) {
    this.formaRegistroDepartamento = this.fb.group({
      iddepartament: [datos.iddepartament ? datos.iddepartament : ''],
      idcountry: [datos.idcountry ? datos.idcountry : '', [Validators.required]],
      DesDepartament: [datos.desdepartament ? datos.desdepartament : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      codDivipola: [datos.coddivipola ? datos.coddivipola : ''],
      Active: [datos.active ? datos.active : false],
    });
  }
  cargarDepartamentos() {
    this.departmentsService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

  }
  cargarPaises() {
    this.paisesService.getAllAsync().then(respuesta => {
      this.listaPaises = respuesta.filter(datos => datos.active == true);
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  crearEditarDepartamento() {
    if (!this.formaRegistroDepartamento.invalid) {

      var indepartamentant = this.formaRegistroDepartamento.value.iddepartament;

      this.departmentsService.getByIdAsync(indepartamentant).then((datadepartament: any) => {
        this.desdepartamentant = datadepartament.desdepartament;
        this.estadoant = datadepartament.active;
      }).catch(error => {});

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.departmentsService.create(this.formaRegistroDepartamento.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarDepartamentos();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Departamentos',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Departamento: ' + this.formaRegistroDepartamento.value.DesDepartament + '| ' +  this.formaRegistroDepartamento.value.Active ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')

          }


          this.departmentsService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Departamentos',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Departamento: ' + this.formaRegistroDepartamento.value.DesDepartament + '| ' +  this.formaRegistroDepartamento.value.Active ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.departmentsService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      } else {
        this.departmentsService.update(this.formaRegistroDepartamento.value, this.formaRegistroDepartamento.value.iddepartament).subscribe(respuesta => {
          this.closeVentana();

          this.cargarDepartamentos();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Departamentos',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
            Datos: ('Departamento: ' + this.formaRegistroDepartamento.value.DesDepartament + '| ' +  this.formaRegistroDepartamento.value.Active ),
            DatosAnteriores: ('Departamento: ' + this.desdepartamentant + '| ' +  this.estadoant ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }


          this.departmentsService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Departamentos',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
            Datos: ('Departamento: ' + this.formaRegistroDepartamento.value.DesDepartament + '| ' +  this.formaRegistroDepartamento.value.Active ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.departmentsService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }
  }
  actualizarEstadoDepartamento(evet, datosDepart) {
    const estado = datosDepart.active ? false : true;
    const datos = { iddepartament: datosDepart.iddepartament, idcountry: datosDepart.idcountry, desdepartament: datosDepart.desdepartament, coddivipola: datosDepart.coddivipola, active: estado }

    this.departmentsService.update(datos, datosDepart.iddepartament).subscribe(respuesta => {
      this.cargarDepartamentos();
      this.accion = 'Editar';
    });
  }
  openModalRegistroDepartamento(templateRegistroDepartamento: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroDepartamento(datos);

    this.vantanaModal = this.modalService.show(templateRegistroDepartamento,  {backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.DEPARTAMENTOS.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.DEPARTAMENTOS.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }

  eliminarDepartamento(id: any) {

    var iddepart = id;
    var namedept = null;
    this.departmentsService.getByIdAsync(iddepart).then((datadep: any) => {

      namedept = datadep.desdepartament;
    
    });

    this.departmentsService.delete('Departments', id).subscribe(respuesta => {
      this.cargarDepartamentos();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Configuración',
        Submodulo: 'Ubicaciones',
        Item:'Departamentos',
        Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: (id + '| ' + namedept ),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')

      }
      this.departmentsService.createLogAsync(Loguser).then(respuesta => {
      });

    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Configuración',
          Submodulo: 'Ubicaciones',
          Item:'Departamentos',
          Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          Datos: (id + '| ' + namedept ),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.departmentsService.createLogAsync(Loguser).then(respuesta => {
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

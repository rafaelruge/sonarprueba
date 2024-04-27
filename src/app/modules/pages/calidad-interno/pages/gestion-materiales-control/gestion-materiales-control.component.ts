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
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PermisosEspecialesService } from '@app/services/configuracion/permisos-especiales.service';

@Component({
  selector: 'app-gestion-materiales-control',
  templateUrl: './gestion-materiales-control.component.html',
  styleUrls: ['./gestion-materiales-control.component.css'],
  providers: [DatePipe]
})
export class GestionMaterialesControlComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionMateriales: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  desactivar = false;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  antmaterialcontrol:any;
  antestado:any;
  
  //permisos 
  eliminarsi: boolean = false;
  editarsi: boolean = false;
  crearsi: boolean = false;
  rolid: number;
  userid: number;   

  buttonValidate: boolean = true;

  constructor(
    private translate: TranslateService,
    private controlMaterialService: ControlMaterialService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private PermisosEspecialesService: PermisosEspecialesService
  ) { }

  displayedColumns: string[] = ['desContMat', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionMateriales();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.getPermissionsRol();
  }

  getPermissionsRol() {
    this.rolid = JSON.parse(sessionStorage.getItem('rolid'));
    this.userid = JSON.parse(sessionStorage.getItem('id'));
    this.PermisosEspecialesService.getAllAsyncpermissionsRol(this.rolid).then(lab => {
      lab.forEach(element => {
        debugger
        if (element.Desmoduleaccess === "QCI Configuración") {
          if (element.Editar) {
            this.editarsi = true;
          } else {
            this.editarsi = false;
          }

          if (element.Eliminar) {
            this.eliminarsi = true;
          } else {
            this.eliminarsi = false;
          }

          if (element.Crear){
            this.crearsi = true;
            this.buttonValidate = true;
          }else{
            this.crearsi = false;
            this.buttonValidate = false;
          }
          
          //Validación para quitar permisos
          if(this.editarsi == false && this.eliminarsi == false){
            this.displayedColumns = ['desContMat', 'active'];
          } else if (this.editarsi && this.eliminarsi == false){
            this.displayedColumns = ['desContMat', 'active','editar'];
          } else if (this.editarsi == false && this.eliminarsi){
            this.displayedColumns = ['desContMat', 'active','borrar'];
          }
        }
    });
  }, error => {
    this.crearsi = false;
    this.editarsi = false;
    this.eliminarsi = false;
  });
 }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  cargarGestionMateriales() {
    this.controlMaterialService.getAllAsync().then(respuesta => {
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
  openModalGestionMateriales(templateGestionMateriales: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionMateriales(datos);

    var idcontrolmaterialant = this.formaGestionMateriales.get('idControlMaterial').value;
    this.controlMaterialService.getByIdAsync(idcontrolmaterialant).then((datacontrolmaterialant: any) => {

      this.antmaterialcontrol = datacontrolmaterialant.descontmat;
      this.antestado = datacontrolmaterialant.active;
    }).catch(error => {});

    this.vantanaModal = this.modalService.show(templateGestionMateriales, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.GESTIONMATERIALES.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.GESTIONMATERIALES.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }
  get desContMatNoValido() {
    return this.formaGestionMateriales.get('desContMat');
  }

  crearFormularioGestionMateriales(datos: any) {
    this.formaGestionMateriales = this.fb.group({
      idControlMaterial: [datos.idControlMaterial ? datos.idControlMaterial : ''],
      desContMat: [datos.descontmat ? datos.descontmat : '', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      active: [datos.active ? datos.active : false]
    });
  }
  crearEditarGestionMaterial() {
    if (!this.formaGestionMateriales.invalid) {
      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.controlMaterialService.create(this.formaGestionMateriales.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarGestionMateriales();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Materiales de Control',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Material de control : '+ this.formaGestionMateriales.value.desContMat  + ' | Estado: ' +  this.formaGestionMateriales.value.active),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.controlMaterialService.createLogAsync(Loguser).then(respuesta => {
          });
        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Materiales de Control',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Material de control : '+ this.formaGestionMateriales.value.desContMat  + ' | Estado: ' +  this.formaGestionMateriales.value.active),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.controlMaterialService.createLogAsync(Loguser).then(respuesta => {
          });

          this.toastr.error(error.error);
          this.desactivar = false;
        });
      } else {
        this.controlMaterialService.update(this.formaGestionMateriales.value, this.formaGestionMateriales.value.idControlMaterial).subscribe(respuesta => {
          this.closeVentana();

          this.cargarGestionMateriales();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Materiales de Control',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Material de control : '+ this.formaGestionMateriales.value.desContMat  + ' | Estado: ' +  this.formaGestionMateriales.value.active),
            DatosAnteriores: ('Material de control : '+ this.antmaterialcontrol  + ' | Estado: ' +  this.antestado),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.controlMaterialService.createLogAsync(Loguser).then(respuesta => {
          });
        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Materiales de Control',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Material de control : '+ this.formaGestionMateriales.value.desContMat  + ' | Estado: ' +  this.formaGestionMateriales.value.active),
            DatosAnteriores: ('Material de control : '+ this.antmaterialcontrol  + ' | Estado: ' +  this.antestado),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.controlMaterialService.createLogAsync(Loguser).then(respuesta => {
          });

          this.toastr.error(error.error);
          this.desactivar = false;
        });
      }
    }
  }
  actualizarEstadoGestionMaterial(datosGestion) {
    const estado = datosGestion.active ? false : true;
    const datos = { idControlMaterial: datosGestion.idControlMaterial, descontmat: datosGestion.descontmat, active: estado }

    this.controlMaterialService.update(datos, datosGestion.idControlMaterial).subscribe(respuesta => {
      this.cargarGestionMateriales();
      this.accion = 'Editar';
    }, (error) => {
      this.cargarGestionMateriales();
      this.toastr.error(error.error);
    });
  }

  eliminarGestionMateriales(id: any) {

    var idmatcontrol = id;
    var matcontrolact = null;
    this.controlMaterialService.getByIdAsync(idmatcontrol).then((datamat: any) => {
      matcontrolact = datamat.descontmat;
    });

    this.controlMaterialService.delete('ControlMaterial', id).subscribe(respuesta => {

      this.cargarGestionMateriales();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Configuración',
        Item:'Materiales de Control',
        Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: (  id +'| '+ matcontrolact ),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.controlMaterialService.createLogAsync(Loguser).then(respuesta => {
      });
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Materiales de Control',
          Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          Datos: (  id +'| '+ matcontrolact ),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.controlMaterialService.createLogAsync(Loguser).then(respuesta => {
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

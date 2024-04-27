import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PaisesService } from '@app/services/configuracion/paises.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-paises',
  templateUrl: './paises.component.html',
  styleUrls: ['./paises.component.css'],
  providers: [DatePipe]

})

export class PaisesComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaRegistroPais: FormGroup;
  accionEditar: any;
  desactivar = false;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  descountryant:any;
  estadoant:any;

  constructor(
    private translate: TranslateService,
    private paisesService: PaisesService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private toastr: ToastrService,

  ) { }
  displayedColumns: string[] = ['descountry', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarPaises();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  get DesCountryNoValido() {
    return this.formaRegistroPais.get('descountry');
  }
  crearFormularioRegistroUsuario(datos: any) {
    this.formaRegistroPais = this.fb.group({
      idcountry: [datos.idcountry ? datos.idcountry : ''],
      descountry: [datos.descountry ? datos.descountry : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  cargarPaises() {
    this.paisesService.getAllAsync().then(respuesta => {
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
  crearEditarPais() {
    if (!this.formaRegistroPais.invalid) {

      var idcountyant = this.formaRegistroPais.value.idcountry;

      this.paisesService.getByIdAsync(idcountyant).then((datacountry: any) => {
        this.descountryant = datacountry.descountry;
        this.estadoant = datacountry.active;
      }).catch(error => {});

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.paisesService.create(this.formaRegistroPais.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarPaises();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Países',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('País: ' + this.formaRegistroPais.value.descountry + '| ' +  this.formaRegistroPais.value.active ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.paisesService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Países',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('País: ' + this.formaRegistroPais.value.descountry + '| ' +  this.formaRegistroPais.value.active ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.paisesService.createLogAsync(Loguser).then(respuesta => {
          });
        });

      } else {
        this.paisesService.update(this.formaRegistroPais.value, this.formaRegistroPais.value.idcountry).subscribe(respuesta => {
          this.closeVentana();

          this.cargarPaises();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Países',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('País: ' + this.formaRegistroPais.value.descountry + '| ' +  this.formaRegistroPais.value.active ),
            DatosAnteriores: ('País: ' + this.descountryant + '| ' +  this.estadoant ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')

          }

          this.paisesService.createLogAsync(Loguser).then(respuesta => {
          });
        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Países',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('País: ' + this.formaRegistroPais.value.descountry + '| ' +  this.formaRegistroPais.value.active ),
            DatosAnteriores: ('País: ' + this.descountryant + '| ' +  this.estadoant ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.paisesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }

  }
  actualizarEstadoPais(event, datosCiudad) {
    const estado = datosCiudad.active ? false : true;
    const datos = { idcountry: datosCiudad.idcountry, descountry: datosCiudad.descountry, active: estado }

    this.paisesService.update(datos, datosCiudad.idcountry).subscribe(respuesta => {
      this.accion = 'Editar';
      this.cargarPaises();
    });
  }
  openModalRegistroPais(templateRegistroPais: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroUsuario(datos);

    this.vantanaModal = this.modalService.show(templateRegistroPais, { class: 'modal-md',backdrop: 'static', keyboard: false  });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.PAISES.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.PAISES.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }

  eliminarPais(id: any) {
    var idpaises = id;
    var namepais = null;
    this.paisesService.getByIdAsync(idpaises).then((datapais: any) => {

      namepais = datapais.descountry;
    
    });
    this.paisesService.delete('Countries', id).subscribe(respuesta => {
      this.cargarPaises();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Configuración',
        Submodulo: 'Ubicaciones',
        Item:'Países',
        Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: ( id + '| ' + 'País: ' + namepais),
        Respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.paisesService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });

    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Configuración',
        Submodulo: 'Ubicaciones',
        Item:'Países',
        Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: ( id + '| '+ namepais),
        respuesta: err.message,
        tipoRespuesta: err.status,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.paisesService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
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


import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from '@app/services/shared.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { ParametrosGlobalesService } from '@app/services/configuracion/parametrosglobales.service';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-parametros-globales',
  templateUrl: './parametros-globales.component.html',
  styleUrls: ['./parametros-globales.component.css'],
  providers: [DatePipe]
})
export class ParametrosGlobalesComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaRegistroParametrosGlobales: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  listaDiccionarioP: [];
  titulo: any;
  text: any;
  desactivar = false;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  codparamant:any;
  desparamant:any;
  estadoant:any;

  constructor(
    private translate: TranslateService,
    private parametrosGlobalesService: ParametrosGlobalesService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe
  ) { }
  displayedColumns: string[] = ['codparam', 'desparam', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarParametrosGlobales();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  get codParamNoValido() {
    return this.formaRegistroParametrosGlobales.get('codParam');
  }
  get desParamNoValido() {
    return this.formaRegistroParametrosGlobales.get('desParam');
  }
  crearFormularioParametrosGlobales(datos: any) {
    this.formaRegistroParametrosGlobales = this.fb.group({
      idParametro: [datos.idparametro ? datos.idparametro : ''],
      codParam: [datos.codparam ? datos.codparam : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      desParam: [datos.desparam ? datos.desparam : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }
  cargarParametrosGlobales() {
    this.parametrosGlobalesService.getAllAsync().then(respuesta => {
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
  crearEditarParametroGlobal() {
    if (!this.formaRegistroParametrosGlobales.invalid) {

      var idparamglobal = this.formaRegistroParametrosGlobales.value.idParametro;

      this.parametrosGlobalesService.getByIdAsync(idparamglobal).then((dataparams: any) => {
        
        this.codparamant = dataparams.codparam;
        this.desparamant = dataparams.desparam;
        this.estadoant = dataparams.active;
        
      }).catch(error => {});

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.parametrosGlobalesService.create(this.formaRegistroParametrosGlobales.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarParametrosGlobales();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Generalidades',
            Item:'Parámetros Globales',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Cód. documento: ' + this.formaRegistroParametrosGlobales.value.codParam + '| ' + 'Tipo documento: ' +  this.formaRegistroParametrosGlobales.value.desParam + '| estado: ' + this.formaRegistroParametrosGlobales.value.active ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.parametrosGlobalesService.createLogAsync(Loguser).then(respuesta => {
          });


        }, (error) => {

          console.log(error);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Generalidades',
            Item:'Parámetros Globales',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Cód. documento: ' + this.formaRegistroParametrosGlobales.value.codParam + '| ' + 'Tipo documento: ' +  this.formaRegistroParametrosGlobales.value.desParam + '| estado: ' + this.formaRegistroParametrosGlobales.value.active ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.parametrosGlobalesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      } else {
        this.parametrosGlobalesService.update(this.formaRegistroParametrosGlobales.value, this.formaRegistroParametrosGlobales.value.idParametro).subscribe(respuesta => {
          this.closeVentana();

          this.cargarParametrosGlobales();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Generalidades',
            Item:'Parámetros Globales',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Cód. documento: ' + this.formaRegistroParametrosGlobales.value.codParam + '| ' + 'Tipo documento: ' +  this.formaRegistroParametrosGlobales.value.desParam + '| estado: ' + this.formaRegistroParametrosGlobales.value.active ),
            DatosAnteriores: ('Cód. documento: ' +this.codparamant + '| ' + 'Tipo documento: ' +this.desparamant+ '| estado: ' +this.estadoant ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.parametrosGlobalesService.createLogAsync(Loguser).then(respuesta => {
          });


        }, (error) => {

          console.log(error);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Generalidades',
            Item:'Parámetros Globales',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Cód. documento: ' + this.formaRegistroParametrosGlobales.value.codParam + '| ' + 'Tipo documento: ' +  this.formaRegistroParametrosGlobales.value.desParam + '| estado: ' + this.formaRegistroParametrosGlobales.value.active ),
            DatosAnteriores: ('Cód. documento: ' +this.codparamant + '| ' + 'Tipo documento: ' +this.desparamant+ '| estado: ' +this.estadoant ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.parametrosGlobalesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }
  }

  eliminarParametroGlobal(id: any) {
    var idparametro = id;
    var nameparametro = null;
    this.parametrosGlobalesService.getByIdAsync(idparametro).then((dataparametro: any) => {

      nameparametro = dataparametro.desparam;
    
    });
    this.parametrosGlobalesService.delete('Paramglobals', id).subscribe(respuesta => {
      this.cargarParametrosGlobales();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Configuración',
        Submodulo: 'Generalidades',
        Item:'Parámetros Globales',
        Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: ( id + '| ' + nameparametro ),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.parametrosGlobalesService.createLogAsync(Loguser).then(respuesta => {
      });

    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Configuración',
          Submodulo: 'Generalidades',
          Item:'Parámetros Globales',
          Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          Datos: ( id + '| ' + nameparametro ),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.parametrosGlobalesService.createLogAsync(Loguser).then(respuesta => {
        });

      });
  }
  actualizarEstadoParametroGlobal(evet, datosParaGlo) {
    const estado = datosParaGlo.active ? false : true;
    const datos = { idparametro: datosParaGlo.idparametro, iddic: datosParaGlo.iddic, codparam: datosParaGlo.codparam, desparam: datosParaGlo.desparam, active: estado }

    this.parametrosGlobalesService.update(datos, datosParaGlo.idparametro).subscribe(respuesta => {
      this.cargarParametrosGlobales();
      this.accion = 'Editar';
    });
  }
  openModalRegistroParametro(templateRegistroCiudad: TemplateRef<any>, datos: any) {

    this.crearFormularioParametrosGlobales(datos);
    this.vantanaModal = this.modalService.show(templateRegistroCiudad, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.PARAMETROSGLOBALES.FORMULARIO.MODALEDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.PARAMETROSGLOBALES.FORMULARIO.MODALCREAR').subscribe(respuesta => this.tituloAccion = respuesta);
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

import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import dayjs from 'dayjs';
import { ToastrService } from 'ngx-toastr';
import { PermisosEspecialesService } from '@app/services/configuracion/permisos-especiales.service';

@Component({
  selector: 'app-gestion-lotes',
  templateUrl: './gestion-lotes.component.html',
  styleUrls: ['./gestion-lotes.component.css'],
  providers: [DatePipe],
})
export class GestionLotesComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionLotes: FormGroup;
  accionEditar: any;
  accion: any;
  desactivar = false;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  today = dayjs().format('YYYY-MM-DD');
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  antnumlot:any;
  antexpdate:any;
  
  //permisos 
  eliminarsi: boolean = false;
  editarsi: boolean = false;
  crearsi: boolean = false;
  rolid: number;
  userid: number;  

  buttonValidate: boolean = true;

  constructor(
    private datePipe: DatePipe,
    private translate: TranslateService,
    private lotesService: LotesService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private PermisosEspecialesService: PermisosEspecialesService
  ) { }
  displayedColumns: string[] = ['numLot', 'expDate', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionLotes();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.getPermissionsRol();
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  cargarGestionLotes() {
    this.lotesService.getAllAsync().then(respuesta => {
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
  openModalGestionLotes(templateGestionLotes: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionLotes(datos);

    var idlotant = this.formaGestionLotes.get('idLot').value;
    this.lotesService.getByIdAsync(idlotant).then((datalotant: any) => {

      this.antnumlot = datalotant.numlot;
      this.antexpdate = dayjs(datalotant.expdate).format('YYYY-MM-DD');
    }).catch(error => {});

    this.vantanaModal = this.modalService.show(templateGestionLotes, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.GESTIONLOTES.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.GESTIONLOTES.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
    
  }
  get numLotNoValido() {
    return this.formaGestionLotes.get('numLot');
  }
  get expDateNoValido() {
    return this.formaGestionLotes.get('expDate');
  }
  crearFormularioGestionLotes(datos: any) {
    this.formaGestionLotes = this.fb.group({
      idLot: [datos.idLot ? datos.idLot : ''],
      numLot: [datos.numlot ? datos.numlot : '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      expDate: [datos.expdate ? datos.expdate : '', [Validators.required]],
      active: [datos.active ? datos.active : false]
    });
  }

  changeDate() {

    let fechaVencimiento = document.getElementById("expDate");
    fechaVencimiento.classList.remove('is-valid');

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
            this.displayedColumns = ['numLot', 'expDate', 'active'];
          } else if (this.editarsi && this.eliminarsi == false){
            this.displayedColumns = ['numLot', 'expDate', 'active','editar'];
          } else if (this.editarsi == false && this.eliminarsi){
            this.displayedColumns = ['numLot', 'expDate', 'active','borrar'];
          }
        }
    });
  }, error => {
    this.crearsi = false;
    this.editarsi = false;
    this.eliminarsi = false;
  });
 }

  crearEditarGestionLotes() {

    if (!this.formaGestionLotes.invalid) {
      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.lotesService.create(this.formaGestionLotes.value).subscribe(respuesta => {

          this.closeVentana();
          this.cargarGestionLotes();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Lotes',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Lote: '+ this.formaGestionLotes.value.numLot  + ' | Expdate: ' +  dayjs(this.formaGestionLotes.value.expDate).format('YYYY-MM-DD')),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.lotesService.createLogAsync(Loguser).then(respuesta => {});
        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Lotes',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Lote: '+ this.formaGestionLotes.value.numLot  + ' | Expdate: ' + dayjs(this.formaGestionLotes.value.expDate).format('YYYY-MM-DD')),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.lotesService.createLogAsync(Loguser).then(respuesta => {});

          this.toastr.error(error.error);
          this.desactivar = false;
        });
      } else {

        this.lotesService.update(this.formaGestionLotes.value, this.formaGestionLotes.value.idLot).subscribe(respuesta => {
          this.closeVentana();

          this.cargarGestionLotes();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Lotes',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Lote: '+ this.formaGestionLotes.value.numLot  + ' | Expdate: ' + dayjs(this.formaGestionLotes.value.expDate).format('YYYY-MM-DD')),
            DatosAnteriores: ('Lote: '+ this.antnumlot  + ' | Expdate: ' + this.antexpdate),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.lotesService.createLogAsync(Loguser).then(respuesta => { });
        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Lotes',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Lote: '+ this.formaGestionLotes.value.numLot  + ' | Expdate: ' + dayjs(this.formaGestionLotes.value.expDate).format('YYYY-MM-DD')),
            DatosAnteriores: ('Lote: '+ this.antnumlot  + ' | Expdate: ' + this.antexpdate),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.lotesService.createLogAsync(Loguser).then(respuesta => {
          });

          this.toastr.error(error.error);
          this.desactivar = false;
        });
      }
    }
  }
  actualizarGestionLotes(datosLote) {
    const estado = datosLote.active ? false : true;
    const datos = { idLot: datosLote.idLot, numlot: datosLote.numlot, expdate: datosLote.expdate, active: estado }

    this.lotesService.update(datos, datosLote.idLot).subscribe(respuesta => {
      this.cargarGestionLotes();
      this.accion = 'Editar';
    }, (error) => {
      this.cargarGestionLotes();
      this.toastr.error(error.error);
    });
  }

  eliminarGestionLotes(id: any) {

    var idlota = id;
    var numlotact = null;
    this.lotesService.getByIdAsync(idlota).then((datalot: any) => {
      numlotact = datalot.numlot;
    });

    this.lotesService.delete('Lots', id).subscribe(respuesta => {
      this.cargarGestionLotes();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Configuración',
        Item:'Lotes',
        Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        Datos: ( id + ' | Lote: '+ numlotact ),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.lotesService.createLogAsync(Loguser).then(respuesta => {
      });
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Lotes',
          Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          Datos: ( id + ' | Lote: '+ numlotact ),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.lotesService.createLogAsync(Loguser).then(respuesta => {});
        
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

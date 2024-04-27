import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatosAberrantesService } from '@app/services/calidad-externo/DatosAberrantesQce.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-criterios-datos-aberrantes',
  templateUrl: './criterios-datos-aberrantes.component.html',
  styleUrls: ['./criterios-datos-aberrantes.component.css'],
  providers: [DatePipe],
})
export class CriteriosDatosAberrantesComponent implements OnInit {

  displayedColumns: string[] = ['participantes', 'zscore', 'active', 'editar', 'eliminar'];
  dataSource: MatTableDataSource<any>;
  ventanaModal: BsModalRef;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  formaBuscarDatos: FormGroup;
  formaRegistroDatosAberrantes: FormGroup;
  bandera: boolean;
  accion: any;
  desactivar = false;
  accionEditar: any;
  tituloAccion: any;
  messageError: any;
  messageSinDatos: string;
  titulo: string = '';
  dataTable = [];
  ok: string;
  text: string = '';
  text2: string = '';
  text3: string = '';
  aceptar: string = '';
  dateNow: Date = new Date();
  ver: boolean = undefined;
  verBtn: boolean = false;
  spinner: boolean;
  datos: any;

  dateNowISO = this.dateNow.toTimeString();

  constructor(

    private fb: FormBuilder,
    private datePipe: DatePipe,
    private DatosAberrantesService: DatosAberrantesService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private ventanaService: VentanasModalesService

  ) { }

  ngOnInit(): void {

    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.cargarDatosAberrantes();

  }

  openModal(descripcion) {

    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  get participantsNoValido() {
    return this.formaRegistroDatosAberrantes.get('participants');
  }
  get zscoreNoValido() {
    return this.formaRegistroDatosAberrantes.get('zscore');
  }


  crearFormularioDatosAberrantes(datos: any) {

    this.formaRegistroDatosAberrantes = this.fb.group({

      idaberrantfiltercriteria: [datos.idaberrantfiltercriteria ? datos.idaberrantfiltercriteria : ''],
      participants: [datos.participants ? datos.participants : '', [Validators.required]],
      zscore: [datos.zscore ? datos.zscore : '', [Validators.required]],
      active: [datos.active ? datos.active : false],

    });
  }


  openModalRegistroDatosaberrantes(templateRegistroDatosAberrantes: TemplateRef<any>, datos: any) {

    this.crearFormularioDatosAberrantes(datos);

    this.ventanaModal = this.modalService.show(templateRegistroDatosAberrantes,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.DATOSABERRANTES.COLUMNS.EDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.DATOSABERRANTES.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  cargarDatosAberrantes() {
    this.DatosAberrantesService.getAllAsync().then(respuesta => {
      this.dataTable = respuesta;
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  crearEditarCA() {

    if (!this.formaRegistroDatosAberrantes.invalid) {

      if (this.accion === 'Crear') {

        let participantes = this.formaRegistroDatosAberrantes.get('participants').value;
        let existeNumero = this.dataTable.find(dato => dato.participants == participantes) || undefined;

        if (existeNumero != undefined) {

          this.closeVentana();
          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAEXISTEPARTICIPANTES'));

        } else {

          this.accion = 'Crear';
          this.desactivar = true;
          this.DatosAberrantesService.create(this.formaRegistroDatosAberrantes.value).subscribe(respuesta => {

            this.closeVentana();
            this.cargarDatosAberrantes();
            this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
            this.desactivar = false;

            const Loguser = {

              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
              Datos: JSON.stringify(this.formaRegistroDatosAberrantes.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: status

            }

            this.DatosAberrantesService.createLogAsync(Loguser).then(respuesta => {

            });

          }, error => {

            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.dateNowISO,
              metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
              datos: JSON.stringify(this.formaRegistroDatosAberrantes.value),
              respuesta: error.message,
              tipoRespuesta: error.status
            }

            this.DatosAberrantesService.createLogAsync(Loguser).then(respuesta => {
            });

          });

        }

      } else {

        this.accion = 'Editar';

        this.DatosAberrantesService.update(this.formaRegistroDatosAberrantes.value, this.formaRegistroDatosAberrantes.value.idaberrantfiltercriteria).subscribe(respuesta => {
          this.closeVentana();

          this.cargarDatosAberrantes();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {

            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formaRegistroDatosAberrantes.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status

          }

          this.DatosAberrantesService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {

            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formaRegistroDatosAberrantes.value),
            respuesta: error.message,
            tipoRespuesta: error.status

          }

          this.DatosAberrantesService.createLogAsync(Loguser).then(respuesta => {
          });

        });

      }

    }

  }

  actualizarCAEstado(datosConfi) {

    const estado = datosConfi.active ? false : true;
    const datos = { idaberrantfiltercriteria: datosConfi.idaberrantfiltercriteria, participants: datosConfi.participants, zscore: datosConfi.zscore, active: estado }

    this.DatosAberrantesService.update(datos, datosConfi.idaberrantfiltercriteria).subscribe(respuesta => {

      this.cargarDatosAberrantes();
      this.accion = 'Editar';

    });

  }

  eliminarCA(id: any) {
    this.DatosAberrantesService.delete('CA', id).subscribe(respuesta => {

      this.cargarDatosAberrantes();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.dateNowISO,
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: status
      }
      this.DatosAberrantesService.createLogAsync(Loguser).then(respuesta => {
      });
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status
        }
        this.DatosAberrantesService.createLogAsync(Loguser).then(respuesta => {
        });
      });
  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.ACEPTAR').subscribe(respuesta => this.aceptar = respuesta);
    this.translate.get('MODULES.SWAL.OK').subscribe(respuesta => this.ok = `<b>${respuesta}</b>`);

  }

  closeVentana(): void {
    this.ventanaModal.hide();
  }


}

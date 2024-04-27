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
import { DatePipe } from '@angular/common';
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-proveedores',
  templateUrl: './crear-programa.component.html',
  styleUrls: ['./crear-programa.component.css']
})
export class CrearProgramaComponent implements OnInit {

  dateNow: Date = new Date();
  formulario: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  desactivar = false;
  confirmar: any;
  messageError: any;
  dateNowISO = this.dateNow.toTimeString();

  constructor(

    private translate: TranslateService,
    private programQceService: ProgramaQceService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe

  ) { }

  displayedColumns: string[] = ['descripcion', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {

    this.getProgramas();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();

  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  getProgramas() {

    this.programQceService.getAllAsync().then(respuesta => {
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

  openModalGestionProgramas(templateGestionProgramas: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionProgramas(datos);

    this.vantanaModal = this.modalService.show(templateGestionProgramas,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.CREAR_PROGRAMA.FORMULARIO.EDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.CREAR_PROGRAMA.FORMULARIO.CREAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  get desprogramNoValido() {
    return this.formulario.get('desprogram');
  }

  crearFormularioGestionProgramas(datos: any) {

    this.formulario = this.fb.group({

      idProgram: [datos.idProgram ? datos.idProgram : ''],
      desprogram: [datos.desprogram ? datos.desprogram : '', [Validators.required, Validators.minLength(2)]],
      active: [datos.active ? datos.active : false]

    });

  }

  crearEditarGestionProgramas() {

    if (!this.formulario.invalid) {

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.programQceService.create(this.formulario.value).subscribe(respuesta => {

          this.getProgramas();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.closeVentana();
          this.desactivar = false;

          const Loguser = {

            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: JSON.stringify(this.formulario.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status

          }

          this.programQceService.createLogAsync(Loguser).then(respuesta => { });

        }, (error) => {

          this.toastr.error(this.translate.instant(error.error));
          this.desactivar = false;

          const Loguser = {

            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            datos: JSON.stringify(this.formulario.value),
            respuesta: error.message,
            tipoRespuesta: error.status

          }

          this.programQceService.createLogAsync(Loguser).then(respuesta => { });

        });

      } else {

        this.programQceService.update(this.formulario.value, this.formulario.value.idProgram).subscribe(respuesta => {
          this.closeVentana();

          this.getProgramas();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {

            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formulario.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status

          }

          this.programQceService.createLogAsync(Loguser).then(respuesta => { });

        }, (error) => {

          const Loguser = {

            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formulario.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }

          this.programQceService.createLogAsync(Loguser).then(respuesta => { });

        });

      }

    }

  }

  actualizarEstadoGestionProgramas(datosGestion) {

    const estado = datosGestion.active ? false : true;
    const datos = { idProgram: datosGestion.idProgram, desprogram: datosGestion.desprogram, active: estado }

    this.programQceService.update(datos, datosGestion.idProgram).subscribe(respuesta => {

      this.getProgramas();

    });

  }

  eliminarGestionProgramas(id: any) {

    this.programQceService.delete('Programas', id).subscribe(respuesta => {

      this.getProgramas();
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

      this.programQceService.createLogAsync(Loguser).then(respuesta => { });

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

        this.programQceService.createLogAsync(Loguser).then(respuesta => { });

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


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
import { LotesQceService } from '@app/services/calidad-externo/lotsQce.service';
import { SampleQceService } from '@app/services/calidad-externo/SampleQce.service';
import { SampleQceDetailsService } from '@app/services/calidad-externo/SampleQceDetails.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { createLog } from "../../../../../globals/logUser";

@Component({
  selector: 'app-proveedores',
  templateUrl: './muestras.component.html',
  styleUrls: ['./muestras.component.css']
})

export class MuestrasComponent implements OnInit {
  log = new createLog(this.datePipe,this.translate,this.sampleQceService);

  fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  dateNow: Date = new Date();
  formulario: FormGroup;
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
  //predictivos create
  filteredOptionsLotsCreate: Observable<string[]>;
  listlotscreate: any;
  //predictivo edit
  idlotpr: number;
  deslotpr: any;
  listalotpre: any;
  formularioEdit: FormGroup = this.fb.group({
    idSample: [],
    idLot: [, [Validators.required]],
    serialsample: [, [Validators.required]],
    active: []

  });

  lotes = [];
  lotesActive = [];

  dateNowISO = this.dateNow.toTimeString();

  constructor(

    private translate: TranslateService,
    private lotesQceService: LotesQceService,
    private sampleQceDetailsService: SampleQceDetailsService,
    private sampleQceService: SampleQceService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe

  ) { }

  displayedColumns: string[] = ['numuestra', 'numlote', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {

    this.getMuestras();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.getLotes();

  }

  private _filterlotsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listlotscreate
      .filter(result =>
        result.numlot.toLowerCase().includes(filterValue));
  }

  async getLotes() {
    this.lotes = await this.lotesQceService.getAllAsync();
    this.lotesActive = this.lotes.filter(e => e.active);
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  getMuestras() {

    this.sampleQceDetailsService.getAllAsync().then(respuesta => {

      //let muestras = respuesta.filter(muestra => muestra.Expdate > this.fechaActual);
      let muestras = respuesta;

      this.dataSource = new MatTableDataSource(muestras);
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

  async openModalGestionMuestras(templateGestionMuestras: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionMuestras(datos);

    await this.lotesQceService.getAllAsync().then(data => {
      this.listlotscreate = data.filter(e => e.active == true);;

      this.listlotscreate.sort((a: any, b: any) => {
        a.numlot = a.numlot.charAt(0) + a.numlot.slice(1);
        b.numlot = b.numlot.charAt(0) + b.numlot.slice(1);
      })

      this.listlotscreate.sort((a: any, b: any) => {
        if (a.numlot < b.numlot) return -1;
        if (a.numlot > b.numlot) return 1;
        return 0;
      })

      this.filteredOptionsLotsCreate = this.formulario.get('idLot').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterlotsCreate(value)
        }),
      );
    });

    this.vantanaModal = this.modalService.show(templateGestionMuestras,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.MUESTRAS.FORMULARIO.EDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.MUESTRAS.FORMULARIO.CREAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  async openModalGestionMuestrasEdit(templateGestionMuestras: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionMuestrasEdit(datos);

    this.vantanaModal = this.modalService.show(templateGestionMuestras,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.MUESTRAS.FORMULARIO.EDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.MUESTRAS.FORMULARIO.CREAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  get idLotNoValido() {
    return this.formulario.get('idLot');
  }

  get serialsampleNoValido() {
    return this.formulario.get('serialsample');
  }

  get idLotNoValidoEdit() {
    return this.formularioEdit.get('idLot');
  }

  get serialsampleNoValidoEdit() {
    return this.formularioEdit.get('serialsample');
  }

  crearFormularioGestionMuestras(datos: any) {

    this.formulario = this.fb.group({

      idSample: [datos.IdSample ? datos.IdSample : ''],
      idLot: [datos.IdLot ? datos.IdLot : '', [Validators.required]],
      serialsample: [datos.Serialsample ? datos.Serialsample : '', [Validators.required, Validators.minLength(2)]],
      active: [datos.Active ? datos.Active : false]

    });

  }
  async crearFormularioGestionMuestrasEdit(datos: any) {

    await this.lotesQceService.getByIdAsync(datos.IdLot).then((result: any) => {
      this.deslotpr = result.numlot;
    });

    this.formularioEdit.get('idSample').setValue(datos.IdSample ? datos.IdSample : '')
    this.formularioEdit.get('idLot').setValue(this.deslotpr.toLowerCase() ? this.deslotpr.toLowerCase() : '')
    this.formularioEdit.get('serialsample').setValue(datos.Serialsample ? datos.Serialsample : '')
    this.formularioEdit.get('active').setValue(datos.Active ? datos.Active : false)

    await this.lotesQceService.getAllAsync().then(data => {
      this.listlotscreate = data.filter(e => e.active == true);;

      this.listlotscreate.sort((a: any, b: any) => {
        a.numlot = a.numlot.charAt(0) + a.numlot.slice(1);
        b.numlot = b.numlot.charAt(0) + b.numlot.slice(1);
      })

      this.listlotscreate.sort((a: any, b: any) => {
        if (a.numlot < b.numlot) return -1;
        if (a.numlot > b.numlot) return 1;
        return 0;
      })

      this.filteredOptionsLotsCreate = this.formularioEdit.get('idLot').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterlotsCreate(value)
        }),
      );
    });
    // this.formulario = this.fb.group({

    //   idSample: [datos.IdSample ? datos.IdSample : ''],
    //   idLot: [datos.IdLot ? datos.IdLot : '', [Validators.required]],
    //   serialsample: [datos.Serialsample ? datos.Serialsample : '', [Validators.required, Validators.minLength(2)]],
    //   active: [datos.Active ? datos.Active : false]

    // });

  }

  crearEditarGestionMuestras() {
    let nomIdlot = this.formulario.get('idLot').value
    let nuevaData = this.formulario.value;
    let arrlot = this.listlotscreate.sort((a, b) => {
      a.numlot = a.numlot.charAt(0).toLowerCase() + a.numlot.slice(1);
      b.numlot = b.numlot.charAt(0).toLowerCase() + b.numlot.slice(1);

    })
    arrlot.sort((a, b) => {
      if (a.numlot < b.numlot) return -1;
      if (a.numlot > b.numlot) return 1;
      return 0;
    })

    arrlot.filter(result => {
      if (result.numlot.toLowerCase() === nomIdlot.toLowerCase()) {
        nuevaData.idLot = result.idLot;
        return
      }
      return
    })

    if (!this.formulario.invalid) {

      let idLot: number = parseInt(this.formulario.get('idLot').value);

      // const data = {

      //   idSample: this.formulario.get('idSample').value,
      //   idLot: idLot,
      //   serialsample: this.formulario.get('serialsample').value,
      //   active: this.formulario.get('active').value,

      // }

      // if (this.accion === 'Crear') {

        this.desactivar = true;
        this.sampleQceService.create(nuevaData).subscribe(respuesta => {

          this.closeVentana();
          this.getMuestras();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;
          nuevaData.lote = nomIdlot;
          this.log.logObj('Control Calidad Externo','Administración','Muestras','c',nuevaData,JSON.stringify(respuesta),200);
        }, (error) => {
          this.toastr.error(this.translate.instant(error.error));
          this.desactivar = false;
          nuevaData.lote = nomIdlot;
          this.log.logObj('Control Calidad Externo','Administración','Muestras','c',nuevaData,error.message,error.status);
        });

      // } else {
      // }
    }
  }

  crearEditarGestionMuestrasEdit() {

    let nomIdlot = this.formularioEdit.get('idLot').value
    let nuevaData = this.formularioEdit.value;
    let arrlot = this.listlotscreate.sort((a, b) => {
      a.numlot = a.numlot.charAt(0).toLowerCase() + a.numlot.slice(1);
      b.numlot = b.numlot.charAt(0).toLowerCase() + b.numlot.slice(1);

    })
    arrlot.sort((a, b) => {
      if (a.numlot < b.numlot) return -1;
      if (a.numlot > b.numlot) return 1;
      return 0;
    })

    arrlot.filter(result => {
      if (result.numlot.toLowerCase() === nomIdlot.toLowerCase()) {
        nuevaData.idLot = result.idLot;
        return
      }
      return
    })

    if (!this.formularioEdit.invalid) {
      let idLot: number = parseInt(nuevaData.idLot);
      // if (this.accion === 'Crear') {

      //   this.desactivar = true;
      //   this.sampleQceService.create(nuevaData).subscribe(respuesta => {

      //     this.closeVentana();
      //     this.getMuestras();
      //     this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
      //     this.desactivar = false;
      //     this.log.logObj('Control Calidad Externo','Administración','Muestras','a',nuevaData,JSON.stringify(respuesta),200);
      //   }, (error) => {
      //     this.log.logObj('Control Calidad Externo','Administración','Muestras','a',nuevaData,error.message,error.status);
      //   });

      // } else {
        this.sampleQceService.update(nuevaData, nuevaData.idSample).subscribe(respuesta => {
          this.closeVentana();

          this.getMuestras();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
          nuevaData.lote = nomIdlot;
          this.log.logObj('Control Calidad Externo','Administración','Muestras','a',nuevaData,JSON.stringify(respuesta),200);
        }, (error) => {
          nuevaData.lote = nomIdlot;
          this.log.logObj('Control Calidad Externo','Administración','Muestras','a',nuevaData,error.message,error.status);
        });

      // }

    }

  }

  actualizarEstadoGestionMuestras(datosGestion) {

    const estado = datosGestion.Active ? false : true;
    const datos = { idSample: datosGestion.IdSample, idLot: datosGestion.IdLot, serialsample: datosGestion.Serialsample, active: estado }

    this.sampleQceService.update(datos, datosGestion.IdSample).subscribe(respuesta => {

      this.getMuestras();

      this.accion = 'Editar';

    });

  }

  eliminarGestionMuestras(row: any) {

    this.sampleQceService.delete('Muestras', row.IdSample).subscribe(respuesta => {

      this.getMuestras();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
      this.log.logObj('Control Calidad Externo','Administración','Rondas','e',row,JSON.stringify(respuesta),200);

    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);
        this.log.logObj('Control Calidad Externo','Administración','Rondas','e',row,this.messageError,err.status);

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


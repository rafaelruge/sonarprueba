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
import { DatosAberrantesIntService } from '@app/services/configuracion/datos-aberrantes-int.service';
import { SedesService } from '../../../../../services/configuracion/sedes.service';
import { PublicService } from '@app/services/public.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { Observable } from 'rxjs';
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'datos-aberrantes',
  templateUrl: './datos-aberrantes.component.html',
  styleUrls: ['./datos-aberrantes.component.css'],
  providers: [DatePipe],
})
export class DatosAberrantesComponent implements OnInit {

  displayedColumns: string[] = ['participantes', 'zscore', 'active', 'editar', 'eliminar'];
  dataSource: MatTableDataSource<any>;
  ventanaModal: BsModalRef;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

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
  datos: any;

  formaBuscarDatos: FormGroup;
  sedesActive = [];
  sedes = [];
  habilitarSede: boolean = false;
  sedeId: number = 0;

  //predictivos
  filteredOptionsSections: Observable<string[]>;
  filteredOptionsControlmaterial: Observable<string[]>;
  filteredOptionsLots: Observable<string[]>;
  listsectionspr: any;
  idsectionspr: number;
  listcontrolmanterialpr: any;
  idcontrolmaterialpr: number;
  listlotspr: any;
  idlotspr: number;
  lotes = [];
  lotesActive = [];
  tests = [];
  secciones = [];
  seccionesActive = [];
  controlMaterial = [];
  controlMaterialActive = [];
  test: number;
  leveltest:number;
  dateNowISO = this.dateNow.toTimeString();

  constructor(

    private fb: FormBuilder,
    private datePipe: DatePipe,
    private DatosAberrantesIntService : DatosAberrantesIntService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private ventanaService: VentanasModalesService,
    private controlMaterialService: ControlMaterialService,
    private seccionesService: SeccionesService,
    private lotesService: LotesService,
    private publicService: PublicService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    //this.cargarSeccionesPre();
    this.crearFormularioBuscarDatos();
    this.loadData();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.cargarSedes();
    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));
    if (this.sedeId > 0) {
        this.formaBuscarDatos.controls['numLaboratorio'].setValue(this.sedeId);
        this.habilitarSede = true
      }
  }

  async cargarSedes() {
    this.sedes = await this.publicService.obtenerSedes();
    this.sedesActive = this.sedes.filter(e => e.active);
  }

  crearFormularioBuscarDatos() {
    this.formaBuscarDatos = this.fb.group({
      numLaboratorio: ['', [Validators.required]],
      seccion: ['', [Validators.required]],
      numMaterialControl: ['', [Validators.required]],
      numLote: ['', [Validators.required]],
      idtest: ['']
    });
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  // private _filterSections(value: string): string[] {
  //   const filterValue = value.toLowerCase();
  //   return this.listsectionspr
  //     .filter(seccion =>
  //       seccion.namesection.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  // }

  // private _filterControlMaterial(value: string): string[] {
  //   const filterValue = value.toLowerCase();
  //   return this.listcontrolmanterialpr
  //     .filter(contmat =>
  //       contmat.descontmat.toLowerCase().includes(filterValue)).filter(e => e.Active == true)
  // }

  // private _filterLots(value: string): string[] {
  //   const filterValue = value.toLowerCase();
  //   return this.listlotspr
  //     .filter(lots =>
  //       lots.Numlot.toLowerCase().includes(filterValue)).filter(e => e.Active == true)
  // }

  // async cargarSeccionesPre() {
  //   await this.seccionesService.getAllAsyncSecciones().then(data => {
  //     this.listsectionspr = data.filter(e => e.Active == true);

  //     this.listsectionspr.sort((a: any, b: any) => {
  //       a.namesection = a.namesection.charAt(0) + a.namesection.slice(1);
  //       b.namesection = b.namesection.charAt(0) + b.namesection.slice(1);
  //     })

  //     this.listsectionspr.sort((a: any, b: any) => {
  //       if (a.namesection < b.namesection) return -1;
  //       if (a.namesection > b.namesection) return 1;
  //       return 0;
  //     })


  //     this.filteredOptionsSections = this.formaBuscarDatos.get('seccion').valueChanges.pipe(
  //       startWith(''),
  //       map(value => {
  //         return this._filterSections(value)
  //       }),
  //     );
  //   });
  // }

  // async cambiarSeccion(NombreSeccion: string) {

  //   var namesection0 = this.formaBuscarDatos.get('seccion').setValue(NombreSeccion.split('|')[1]);
  //   var idsection0 = NombreSeccion.split('|')[0];
  //   this.idsectionspr = Number(idsection0);

  //   this.formaBuscarDatos.controls['numMaterialControl'].setValue('');
  //   this.formaBuscarDatos.controls['numLote'].setValue('');

  //   await this.controlMaterialService.getAllAsyncControlMaterialxsedesec(this.idsectionspr, this.sedeId).then(data => {
  //     this.listcontrolmanterialpr = data.filter(e => e.Active == true);


  //     this.listcontrolmanterialpr.sort((a: any, b: any) => {
  //       a.descontmat = a.descontmat.charAt(0) + a.descontmat.slice(1);
  //       b.descontmat = b.descontmat.charAt(0) + b.descontmat.slice(1);
  //     })

  //     this.listcontrolmanterialpr.sort((a: any, b: any) => {
  //       if (a.descontmat < b.descontmat) return -1;
  //       if (a.descontmat > b.descontmat) return 1;
  //       return 0;
  //     })

  //     this.filteredOptionsControlmaterial = this.formaBuscarDatos.get('numMaterialControl').valueChanges.pipe(
  //       startWith(''),
  //       map(value => {

  //         return this._filterControlMaterial(value)
  //       }),
  //     );
  //   });
  // }

  // async cambiarControlMaterial(NombreControlmaterial: string) {

  //   var descontmat001 = this.formaBuscarDatos.get('numMaterialControl').setValue(NombreControlmaterial.split('|')[1]);
  //   var idcontmat = NombreControlmaterial.split('|')[0];
  //   this.idcontrolmaterialpr = Number(idcontmat);

  //   if (idcontmat != '') {

  //     this.formaBuscarDatos.get('numLote').reset('');
      
  //     await this.lotesService.getAllAsynclotsxsedecontm(this.idcontrolmaterialpr, this.sedeId).then(data => {
  //       this.listlotspr = data.filter(e => e.Active == true);

  //       this.listlotspr.sort((a: any, b: any) => {
  //         a.Numlot = a.Numlot.charAt(0) + a.Numlot.slice(1);
  //         b.Numlot = b.Numlot.charAt(0) + b.Numlot.slice(1);
  //       })

  //       this.listlotspr.sort((a: any, b: any) => {
  //         if (a.Numlot < b.Numlot) return -1;
  //         if (a.Numlot > b.Numlot) return 1;
  //         return 0;
  //       })

  //       this.filteredOptionsLots = this.formaBuscarDatos.get('numLote').valueChanges.pipe(
  //         startWith(''),
  //         map(value => {
  //           return this._filterLots(value)
  //         }),
  //       );
  //     });
  //   } else {

  //     this.lotesActive = [];
  //     this.formaBuscarDatos.get('numLote').setValue('');
  //   }
  // }

  // async lotesPre(nombreLote: string) {

  //   var desnumlot = this.formaBuscarDatos.get('numLote').setValue(nombreLote.split('|')[1]);
  //   var idlot0 = nombreLote.split('|')[0];
  //   this.idlotspr = Number(idlot0);

  //   this.formaBuscarDatos.get('numLaboratorio').valueChanges.subscribe(data => {

  //     this.ver = false;
  //     this.tests = [];

  //     if (data != '') {

  //       this.seccionesActive = this.secciones.filter(e => e.active);

  //       this.formaBuscarDatos.get('seccion').reset('');
  //       this.formaBuscarDatos.get('numMaterialControl').reset('');
  //       this.formaBuscarDatos.get('numLote').reset('');

  //     } else {

  //       this.seccionesActive = [];
  //       this.controlMaterialActive = [];
  //       this.lotesActive = [];
  //       this.formaBuscarDatos.get('seccion').reset('');
  //       this.formaBuscarDatos.get('numMaterialControl').reset('');
  //       this.formaBuscarDatos.get('numLote').reset('');
  //     }

  //   });

  //   this.formaBuscarDatos.get('seccion').valueChanges.subscribe(data => {

  //     this.ver = false;
  //     this.tests = [];

  //     if (data != '') {

  //       this.controlMaterialActive = this.controlMaterial.filter(e => e.active);
  //       this.formaBuscarDatos.get('numMaterialControl').reset('');
  //       this.formaBuscarDatos.get('numLote').reset('');

  //     } else {
  //       this.controlMaterialActive = [];
  //       this.lotesActive = [];
  //       this.formaBuscarDatos.get('numMaterialControl').reset('');
  //       this.formaBuscarDatos.get('numLote').reset('');
  //     }

  //   });

  //   this.formaBuscarDatos.get('numMaterialControl').valueChanges.subscribe(data => {

  //     this.ver = false;
  //     this.tests = [];

  //     if (data != '') {

  //       this.lotesActive = this.lotes.filter(e => e.active);
  //       this.formaBuscarDatos.get('numLote').reset('');

  //     } else {
  //       this.lotesActive = [];
  //       this.formaBuscarDatos.get('numLote').reset('');
  //     }

  //   });

  //   this.DatosAberrantesIntService.GetInfoAberrantData().subscribe(response => {

  //     this.tests = [];
  //     this.verBtn = false;
  //     this.tests = response;
  //     this.formaBuscarDatos.get('idtest').setValue('');

  //   }, () => {

  //     let arr = [];
  //     this.dataSource = new MatTableDataSource(arr);
  //     this.accion = 'noDatos';
  //     this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
  //     // this.formaBuscarDatos.reset({ numLaboratorio: '', seccion: '', numMaterialControl: '', numLote: '' });
  //     this.tests = [];
  //     this.ver = false;
  //   });
  // }

  setTest(event: any) {
    const test = event.value;
    if (test != '') {
      this.test = parseInt(test);
      this.verBtn = true;
    } else {
      this.verBtn = false;
    }
  }

  loadData() {

    this.spinner.show();

    this.DatosAberrantesIntService.GetInfoAberrantData().subscribe(respuesta => {

      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      
      setTimeout(() => {

        this.spinner.hide();

      }, 3000);


    }, () => {

      this.spinner.hide();
      this.dataSource = new MatTableDataSource([]);
      this.accion = 'noDatos';
      this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
    });
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

      idaberrantdatafilter: [datos.Idaberrantdatafilter ? datos.Idaberrantdatafilter : ''],
      participants: [datos.Participants ? datos.Participants : '', [Validators.required]],
      zscore: [datos.Zscore ? datos.Zscore : '', [Validators.required]],
      active: [datos.Active ? datos.Active : false],

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
    this.DatosAberrantesIntService.getAllAsync().then(respuesta => {
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
          this.DatosAberrantesIntService.create(this.formaRegistroDatosAberrantes.value).subscribe(respuesta => {

            this.loadData();
            this.closeVentana();
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
            this.DatosAberrantesIntService.createLogAsync(Loguser).then(() => {
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

            this.DatosAberrantesIntService.createLogAsync(Loguser).then(() => {
            });
          });
        }

      } else {

        this.accion = 'Editar';

        this.DatosAberrantesIntService.update(this.formaRegistroDatosAberrantes.value, this.formaRegistroDatosAberrantes.value.idaberrantdatafilter).subscribe(respuesta => {
          this.closeVentana();
          this.loadData();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {

            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formaRegistroDatosAberrantes.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status

          }

          this.DatosAberrantesIntService.createLogAsync(Loguser).then(() => {
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
          this.DatosAberrantesIntService.createLogAsync(Loguser).then(() => {
          });
        });
      }
    }
  }

  actualizarCAEstado(datosConfi) {

    const estado = datosConfi.Active ? false : true;
    const datos = { idaberrantdatafilter: datosConfi.Idaberrantdatafilter, participants: datosConfi.Participants, zscore: datosConfi.Zscore,active: estado }
    this.DatosAberrantesIntService.update(datos, datosConfi.Idaberrantdatafilter).subscribe(() => {
      this.loadData();
      this.accion = 'Editar';
    });
  }

  eliminarCA(id: any) {
    this.DatosAberrantesIntService.delete('CA', id).subscribe(respuesta => {
      this.loadData();
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
      this.DatosAberrantesIntService.createLogAsync(Loguser).then(() => {
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
        this.DatosAberrantesIntService.createLogAsync(Loguser).then(() => {
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

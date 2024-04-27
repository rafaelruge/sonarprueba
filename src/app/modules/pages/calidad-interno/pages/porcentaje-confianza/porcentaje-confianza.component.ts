import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import html2canvas from 'html2canvas';
import { DomSanitizer } from '@angular/platform-browser';
import { SedesService } from '../../../../../services/configuracion/sedes.service';
import { SeccionesService } from '../../../../../services/configuracion/secciones.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { LotesService } from '../../../../../services/configuracion/lotes.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import * as dayjs from 'dayjs';
import { MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { TestsService } from '../../../../../services/configuracion/test.service';
import { DEAService } from '@app/services/configuracion/servicesDatosEstadisticosAcumulados.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SidebarService } from '../../../../../services/general/sidebar.service';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import { MatSelect } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { ExporterService } from '@app/services/mantenimiento-calibradores/exporter.service';
import { UsuariosService } from '@app/services/usuarios/usuarios.service';
import { PermisosEspecialesService } from '@app/services/configuracion/permisos-especiales.service';
import { SharedService } from '@app/services/shared.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { IngresoDatosService } from '@app/services/configuracion/ingreso-datos.service';
import { PorcentajeConfianzaService } from '@app/services/calidad-interno/porcentaje-confianza.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-porcentaje-confianza',
  templateUrl: './porcentaje-confianza.component.html',
  styleUrls: ['./porcentaje-confianza.component.css']
})
export class PorcentajeConfianzaComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();

  formularioRegistroEditar: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  idObjeto: any;
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
  idTest: number;

  sedes = [];
  secciones = [];
  materiales = [];
  lotes = [];
  tests = [];
  dataTable = [];
  verBtn = false;
  ver = false;
  leveltest:number;
  banderacreate: boolean;
  horaActual: string;

  formFiltro: FormGroup = this.fb.group({

    sede: ['', [Validators.required]],
    seccion: ['', [Validators.required]],
    material: ['', [Validators.required]],
    lote: ['', [Validators.required]],

  });

  formFiltroTest: FormGroup = this.fb.group({

    test: ['', [Validators.required]]

  });

  constructor(

    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private sedesService: SedesService,
    private seccionesService: SeccionesService,
    private translate: TranslateService,
    private testService: TestsService,
    private deaService: DEAService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private sidebarservice: SidebarService,
    private modalService: BsModalService,
    private datePipe: DatePipe,
    private analitosService: AnalitosService,
    private lotesService: LotesService,
    private ControlMaterialService: ControlMaterialService,
    private laboratoriosService: LaboratoriosService,
    private ExporterService: ExporterService,
    private usuariosService: UsuariosService,
    private PermisosEspecialesService: PermisosEspecialesService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private IDCN: IngresoDatosService,
    private PorcentajeConfianzaService: PorcentajeConfianzaService,
  ) {

  }

  displayedColumns: string[] = ['analito','equipo','controlmaterial','leveltest','percentconfi', 'active', 'editar', 'eliminar'];
  dataSource: MatTableDataSource<any>;
  ventanaModal: BsModalRef;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('sedeselect', { static: true }) sedeselect: MatSelect;

  ngOnDestroy(): void {
    this.closeVentana();
  }

  ngOnInit(): void {
    const fechaHora = new Date();
    this.horaActual = `${fechaHora.getHours()}:${fechaHora.getMinutes()}:${fechaHora.getSeconds()}`;
    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));
    this.cargarSeccionesPre(); 
    this.mainData();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    const arrow = this.sedeselect._elementRef.nativeElement.querySelector('div.mat-select-arrow.ng-tns-c196-2');
    if (arrow) {
      arrow.style.color = "#FFF";
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  async Consultatest(idtest) {

    this.testService.getByIdAsync(idtest).then((data: any) => {

      this.leveltest = data.level;
 
    });
  }

 
  private _filterSections(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listsectionspr
      .filter(seccion =>
        seccion.namesection.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  }

  private _filterControlMaterial(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listcontrolmanterialpr
      .filter(contmat =>
        contmat.descontmat.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  }

  private _filterLots(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listlotspr
      .filter(lots =>
        lots.Numlot.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  }

  async mainData() {

    await this.sedesService.getAllAsync().then(data => {
      this.sedes = data.filter(sede => sede.Active);
      const sedeId = sessionStorage.getItem('sede');
      this.formFiltro.get('sede').setValue(parseInt(sedeId));
    });

  }


  async cargarSeccionesPre() {
    await this.seccionesService.getAllAsyncSecciones().then(data => {
      this.listsectionspr = data.filter(e => e.Active == true);


      this.listsectionspr.sort((a: any, b: any) => {
        a.namesection = a.namesection.charAt(0) + a.namesection.slice(1);
        b.namesection = b.namesection.charAt(0) + b.namesection.slice(1);
      })

      this.listsectionspr.sort((a: any, b: any) => {
        if (a.namesection < b.namesection) return -1;
        if (a.namesection > b.namesection) return 1;
        return 0;
      })

      this.filteredOptionsSections = this.formFiltro.get('seccion').valueChanges.pipe(
        startWith(''),
        map(value => {

          return this._filterSections(value)
        }),
      );
    });
  }

  async cambiarSeccion(NombreSeccion: string, idsection?: number) {

    var namesection0 = this.formFiltro.get('seccion').setValue(NombreSeccion.split('|')[1]);
    var idsection0 = NombreSeccion.split('|')[0];
    this.idsectionspr = Number(idsection0);

    this.formFiltro.controls['material'].setValue('');
    this.formFiltro.controls['lote'].setValue('');

    await this.ControlMaterialService.getAllAsyncControlMaterialxsedesec(this.idsectionspr, this.sedeId).then(data => {
      this.listcontrolmanterialpr = data.filter(e => e.Active == true);


      this.listcontrolmanterialpr.sort((a: any, b: any) => {
        a.descontmat = a.descontmat.charAt(0) + a.descontmat.slice(1);
        b.descontmat = b.descontmat.charAt(0) + b.descontmat.slice(1);
      })

      this.listcontrolmanterialpr.sort((a: any, b: any) => {
        if (a.descontmat < b.descontmat) return -1;
        if (a.descontmat > b.descontmat) return 1;
        return 0;
      })

      this.filteredOptionsControlmaterial = this.formFiltro.get('material').valueChanges.pipe(
        startWith(''),
        map(value => {

          return this._filterControlMaterial(value)
        }),
      );
    });

  }

  async cambiarControlMaterial(NombreControlmaterial: string, idcontrolmaterial?: number) {

    var descontmat001 = this.formFiltro.get('material').setValue(NombreControlmaterial.split('|')[1]);
    var idcontmat = NombreControlmaterial.split('|')[0];
    this.idcontrolmaterialpr = Number(idcontmat);

    if (idcontmat != '') {

      this.formFiltro.get('lote').reset('');

      //let id: number = parseInt(idcontmat);

      await this.lotesService.getAllAsynclotsxsedecontm(this.idcontrolmaterialpr, this.sedeId).then(data => {
        this.listlotspr = data.filter(e => e.Active == true);

        this.listlotspr.sort((a: any, b: any) => {
          a.Numlot = a.Numlot.charAt(0) + a.Numlot.slice(1);
          b.Numlot = b.Numlot.charAt(0) + b.Numlot.slice(1);
        })

        this.listlotspr.sort((a: any, b: any) => {
          if (a.Numlot < b.Numlot) return -1;
          if (a.Numlot > b.Numlot) return 1;
          return 0;
        })

        this.filteredOptionsLots = this.formFiltro.get('lote').valueChanges.pipe(
          startWith(''),
          map(value => {
            return this._filterLots(value)
          }),
        );
      });
    } else {

      //this.lotesActive = [];
      this.formFiltro.get('lote').setValue('');

    }


  }

  async lotesPre(nombreLote: string) {

    var desnumlot = this.formFiltro.get('lote').setValue(nombreLote.split('|')[1]);
    var idlot0 = nombreLote.split('|')[0];
    this.idlotspr = Number(idlot0);

    if (this.formFiltro.valid) {
      this.IDCN.getTestFiltroIngresoDatos(this.sedeId, this.idsectionspr, this.idcontrolmaterialpr, this.idlotspr).subscribe(response => {

        this.tests = response;
        this.ver = false;
        this.verBtn = false;
        this.formFiltroTest.get('test').setValue('');

      }, error => {

        this.ver = false;
        this.tests = [];

        this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
      });
    }
  }

  async byTest(id: any) {

    if (id != '') {
      this.idTest = id;
      this.verBtn = true;
    } else {
      this.verBtn = false;
    }
  }

  async search(recargar: boolean) {
    var _dataTable;
    if (screen.width <= 768) {
      if (!this.sidebarservice.getSidebarState()) {
        this.sidebarservice.setSidebarState(!this.sidebarservice.getSidebarState());
      }
    }
   
    this.ver = false;
    var jsonTexto: any = '{"idtest":"' + this.idTest + '"}';

    this.PorcentajeConfianzaService.getinfoConfidencepercent(jsonTexto)
          .then(datavalid => {

            this.dataTable = datavalid;
            this.dataSource = new MatTableDataSource(this.dataTable);
            this.ver = true;
            
          })
          .catch(error => {

            this.dataTable = [];
            this.dataSource = new MatTableDataSource(this.dataTable);
            this.ver = true;
            this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));

          });
  }


  get leveltestNoValido() {
    return this.formularioRegistroEditar.get('leveltest');
  }
  get PercentconfNoValido() {
    return this.formularioRegistroEditar.get('Percentconf');
  }
  

  crearFormulario(datos: any) {

    this.formularioRegistroEditar = this.fb.group({

      Idconfidencepercent: [datos.Idconfidencepercent ? datos.Idconfidencepercent : ''],
      Id_test: [datos.IdTest ? datos.IdTest : this.idTest, [Validators.required]],
      Percentconf: [datos.Percentconf ? datos.Percentconf : '', [Validators.required, Validators.min(0)]],
      leveltest: [datos.Leveltest ? datos.Leveltest : '', [Validators.required, Validators.min(1), Validators.max(3)]],
      Datecreate: [this.datePipe.transform(new Date, "yyyy-MM-dd")],
      Hourcreate: [this.horaActual],
      userid: [datos.Userid ? datos.Userid : sessionStorage.getItem('userid')],
      active: [datos.Active ? datos.Active : false],

    });
  }

  async openModalRegistroPorctconf(templateRegistroPorcentajeconf: TemplateRef<any>, datos: any) {

    this.crearFormulario(datos);
    this.Consultatest(this.idTest);

    this.ventanaModal = this.modalService.show(templateRegistroPorcentajeconf, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.CONFIGURACIONOBJETIVOSANALITO.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.CONFIGURACIONOBJETIVOSANALITO.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  async crearEditarConfiObj() {

    let nuevaData = this.formularioRegistroEditar.value;
    if (!this.formularioRegistroEditar.invalid) {

      if (this.accion === 'Crear') {

        this.closeVentana();

        var jsonTexto: any = '{"idtest":"' + this.idTest + '"}';

        await this.PorcentajeConfianzaService.getinfoConfidencepercent(jsonTexto).then(respuesta => {

          respuesta.forEach(item => {

            if (item.Leveltest == nuevaData.leveltest) {
              this.closeVentana();
              this.banderacreate = false;
            }
          });

          if (this.banderacreate == false) {
            this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.VALIDCREATEPORCENTAJECONF'));
          }
        }).catch(error => {
          this.banderacreate = true;
        });

        this.banderacreate = true;

        if (this.banderacreate == true) {

          if (nuevaData.leveltest > this.leveltest) {

            this.accion = 'noDatos';
            this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.VALIDLEVELTESTCONF'));
          } 
          else 
          {

            this.PorcentajeConfianzaService.create(nuevaData).subscribe(respuesta => {

              this.closeVentana();
              this.search(true);
              this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
              
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Administración',
                Item:'Porcentaje de Confianza',
                Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
                Datos: JSON.stringify(nuevaData),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: 200,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }

              this.PorcentajeConfianzaService.createLogAsync(Loguser).then(respuesta => {
              });
            }, (error) => {

              console.log(error);

              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Administración',
                Item:'Porcentaje de Confianza',
                metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
                datos: JSON.stringify(nuevaData),
                respuesta: error.message,
                tipoRespuesta: error.status,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
              this.PorcentajeConfianzaService.createLogAsync(Loguser).then(respuesta => {
                console.log(respuesta);
              });
            });
          }
          
        }
      }else{
        if (nuevaData.leveltest > this.leveltest) {

          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.VALIDLEVELTESTCONF'));
        } 
        else 
        {

          this.PorcentajeConfianzaService.update(nuevaData,nuevaData.Idconfidencepercent).subscribe(respuesta => {

            this.closeVentana();
            this.search(true);
            this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
            
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Administración',
              Item:'Porcentaje de Confianza',
              Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
              Datos: JSON.stringify(nuevaData),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }

            this.PorcentajeConfianzaService.createLogAsync(Loguser).then(respuesta => {
            });
          }, (error) => {

            console.log(error);

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Administración',
              Item:'Porcentaje de Confianza',
              metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
              datos: JSON.stringify(nuevaData),
              respuesta: error.message,
              tipoRespuesta: error.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.PorcentajeConfianzaService.createLogAsync(Loguser).then(respuesta => {
              console.log(respuesta);
            });
          });
        }
       
      } 
    }
  }

  actualizarConfiObjEstado(datosConfi) {

    const filterlevel1 = this.dataSource.data.findIndex(e => e.Leveltest == 1 && e.Active == true);
    const filterlevel2 = this.dataSource.data.findIndex(e => e.Leveltest == 2 && e.Active == true);
    const filterlevel3 = this.dataSource.data.findIndex(e => e.Leveltest == 3 && e.Active == true);
    //var dataActive1 = filterlevel1.find(e=>e.Active == true);


    if (filterlevel1 != -1) {
      if (datosConfi.Leveltest == 1) {
        const estado = datosConfi.Active ? false : true;
        const datos = { Idconfidencepercent: datosConfi.Idconfidencepercent, Id_test: datosConfi.Id_test, userid: datosConfi.Userid, Percentconf: datosConfi.Percentconf, Leveltest: datosConfi.Leveltest, Datecreate: datosConfi.Datecreate, Hourcreate: datosConfi.Hourcreate, Active: estado }

        this.PorcentajeConfianzaService.update(datos, datosConfi.Idconfidencepercent).subscribe(_ => {
          this.search(true);
          this.accion = 'Editar';
        });
      }

    }
    else {
      if (datosConfi.Leveltest == 1) {
        const estado = datosConfi.Active ? false : true;
        const datos = { Idconfidencepercent: datosConfi.Idconfidencepercent, Id_test: datosConfi.Id_test, userid: datosConfi.Userid, Percentconf: datosConfi.Percentconf, Leveltest: datosConfi.Leveltest, Datecreate: datosConfi.Datecreate, Hourcreate: datosConfi.Hourcreate, Active: estado }

        this.PorcentajeConfianzaService.update(datos, datosConfi.Idconfidencepercent).subscribe(_ => {
          this.search(true);
          this.accion = 'Editar';
        });
      }

    }

    if (filterlevel2 != -1) {
      if (datosConfi.Leveltest == 2) {
        const estado = datosConfi.Active ? false : true;
        const datos = { Idconfidencepercent: datosConfi.Idconfidencepercent, Id_test: datosConfi.Id_test, userid: datosConfi.Userid, Percentconf: datosConfi.Percentconf, Leveltest: datosConfi.Leveltest, Datecreate: datosConfi.Datecreate, Hourcreate: datosConfi.Hourcreate, Active: estado }

        this.PorcentajeConfianzaService.update(datos, datosConfi.Idconfidencepercent).subscribe(_ => {
          this.search(true);
          this.accion = 'Editar';
        });
      }

    }
    else {
      if (datosConfi.Leveltest == 2) {
        const estado = datosConfi.Active ? false : true;
        const datos = { Idconfidencepercent: datosConfi.Idconfidencepercent, Id_test: datosConfi.Id_test, userid: datosConfi.Userid, Percentconf: datosConfi.Percentconf, Leveltest: datosConfi.Leveltest, Datecreate: datosConfi.Datecreate, Hourcreate: datosConfi.Hourcreate, Active: estado }

        this.PorcentajeConfianzaService.update(datos, datosConfi.Idconfidencepercent).subscribe(_ => {
          this.search(true);
          this.accion = 'Editar';
        });
      }

    }

    if (filterlevel3 != -1) {
      if (datosConfi.Leveltest == 3) {
        const estado = datosConfi.Active ? false : true;
        const datos = { Idconfidencepercent: datosConfi.Idconfidencepercent, Id_test: datosConfi.Id_test, userid: datosConfi.Userid, Percentconf: datosConfi.Percentconf, Leveltest: datosConfi.Leveltest, Datecreate: datosConfi.Datecreate, Hourcreate: datosConfi.Hourcreate, Active: estado }

        this.PorcentajeConfianzaService.update(datos, datosConfi.Idconfidencepercent).subscribe(_ => {
          this.search(true);
          this.accion = 'Editar';
        });
      }
    }
  }

  eliminarPorcentajeconfianza(id: any) {

    this.PorcentajeConfianzaService.delete('Confobjquaanalyte', id).subscribe(respuesta => {

      this.search(true);
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo: 'Control Calidad Interno',
        Submodulo: 'Administración',
        Item: 'Porcentaje de Confianza',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.lotesService.createLogAsync(Loguser).then(respuesta => {
      });
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Interno',
          Submodulo: 'Administración',
          Item: 'Porcentaje de Confianza',
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.lotesService.createLogAsync(Loguser).then(respuesta => {
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
    if(this.ventanaModal){
      this.ventanaModal.hide();
    }
  }


}

import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FuentesQceService } from '@app/services/calidad-externo/fuentesQce.service';
import { ObjetivosCalidadQceService } from '@app/services/calidad-externo/objetivosCalidadQce.service';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { AnalytesQceService } from '@app/services/calidad-externo/AnalytesQce.service';
import { LogsService } from '@app/services/configuracion/logs.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ProgramConfQceDetailsService } from '@app/services/calidad-externo/ProgramconfQceDetails.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend,
  ApexYAxis,
  ApexGrid
} from "ng-apexcharts";
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

type ApexXAxis = {
  type?: "category" | "datetime" | "numeric";
  categories?: any;
  labels?: {
    style?: {
      colors?: string | string[];
      fontSize?: string;
    };
  };
};
export type ChartOptions1 = {
  series1: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  colors: string[];
};
export type ChartOptions2 = {
  series2: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
};
@Component({
  selector: 'app-objetivos-calidad',
  templateUrl: './objetivos-calidad.component.html',
  styleUrls: ['./objetivos-calidad.component.css'],
  providers: [DatePipe]
})
export class ObjetivosCalidadComponent implements OnInit {
  titulo1 = "Coeficiente de Variación Relativo (% Pruebas con CVR < 1)";

  public chartOptions1: Partial<ChartOptions1>;
  public chartOptions2: Partial<ChartOptions2>;


  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();
  formularioRegistroEditar: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  ventanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  desactivar = false;
  messageError: any;
  titulo2: string;
  messageSinDatos: string;
  listaAnalitos: [];
  listaFuentes: [];
  listaUnits: [];
  listaObjetivosCalidad = [];
  formulario: FormGroup;
  programas = [];
  programasActive = [];
  bandera: boolean = false;
  ok: string;
  selectedProgram: string;
  idprogram:number;

  //predictivos create
  filteredOptionsAnalyteCreate: Observable<string[]>;
  listanalytecreate: any;
  filteredOptionsSourceCreate: Observable<string[]>;
  listsourcecreate: any;
  filteredOptionsUnitsCreate: Observable<string[]>;
  listunitscreate: any;

  //predictivo edit
  filteredOptionsAnalytesEdit: Observable<string[]>;
  idanalytepr: number;
  desanalytepr: any;
  listaanalytepre: any;
  filteredOptionsSourceEdit: Observable<string[]>;
  idsourcepr: number;
  dessourcepr: any;
  listasourcepre: any;
  filteredOptionsUnitsEdit: Observable<string[]>;
  idunitspr: number;
  desunitspr: any;
  listaunitspre: any;

  formularioRegistroEditarPre: FormGroup = this.fb.group({
    Idconfobjquaprogramanalyte: [],
    Idanalytes: [, [Validators.required]],
    Idsource: [, [Validators.required]],
    Objective: [, [Validators.required]],
    Idunits: [, [Validators.required]],
    idprogramconf: [],
    Datemod: [this.datePipe.transform(new Date, "yyyy-MM-dd")],
    Active: []
  });

  constructor(
    private translate: TranslateService,
    private objetivosCalidadQceService: ObjetivosCalidadQceService,
    private programQceService: ProgramaQceService,
    private fuentesQceService: FuentesQceService,
    private unitsQceService: UnitsQceService,
    private AnalytesQceService:AnalytesQceService,
    private logsService: LogsService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private programConfQceDetailsService: ProgramConfQceDetailsService
  ) { }

  displayedColumns: string[] = ['Desanalytes', 'Dessource', 'Objective', 'Codunits', 'Active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  ngOnInit(): void {
    this.crearFormularioFiltro();
    this.getPrograms();
    this.consultarFuentes();
    this.consultarUnits();
    this.titulosSwal();
    this.grafica();
    this.grafica2();
  }

  private _filterAnalytesCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listanalytecreate
      .filter(result =>
        result.Desanalytes.toLowerCase().includes(filterValue));
  }
  private _filterSourceCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listsourcecreate
      .filter(result =>
        result.dessource.toLowerCase().includes(filterValue)).filter(e => e.active == true)
  }
  private _filterUnitsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listunitscreate
      .filter(result =>
        result.codunits.toLowerCase().includes(filterValue)).filter(e => e.active == true)
  }

  async getPrograms() {
    this.programas = await this.programQceService.getAllAsync();
    this.programasActive = this.programas.filter(e => e.active);
  }

  consultarAnalitos(programa) {
    this.objetivosCalidadQceService.listaAnalytes(programa).then(respuesta => {
      this.listaAnalitos = respuesta;
    });
  }

  consultarFuentes() {
    this.fuentesQceService.getAllAsync().then(respuesta => {
      this.listaFuentes = respuesta.filter(datos => datos.active == true);
    });
  }
  consultarUnits() {
    this.unitsQceService.getAllAsync().then(respuesta => {
      this.listaUnits = respuesta.filter(datos => datos.active == true);
    });
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.tituloAccion }
    this.ventanaService.openModal(data);
  }
  crearFormularioFiltro() {
    this.formulario = this.fb.group({
      idProgram: ['', [Validators.required]],
    });
  }
  get idProgramInvalido() {
    return this.formulario.get('idProgram');
  }

  //obtener idprogram
  enviarId(id: number) {
    this.idprogram = id;
  }

  crearFormulario(datos: any) {

    this.formularioRegistroEditar = this.fb.group({
      Idconfobjquaprogramanalyte: [datos.Idconfobjquaprogramanalyte],
      Idanalytes: [datos.Idanalytes ? datos.Idanalytes : '', [Validators.required]],
      Idsource: [datos.Idsource ? datos.Idsource : '', [Validators.required]],
      Objective: [datos.Objective ? datos.Objective : '', [Validators.required, Validators.maxLength(20)]],
      Idunits: [datos.Idunits ? datos.Idunits : '', [Validators.required]],
      idprogramconf: [this.idProgramInvalido.value],
      Datemod: [this.datePipe.transform(new Date, "yyyy-MM-dd")],
      Active: [datos.Active ? datos.Active : false]
    });
  }
  
  get IdanalytesNoValido() {
    return this.formularioRegistroEditar.get('Idanalytes');
  }
  get IdsourceNoValido() {
    return this.formularioRegistroEditar.get('Idsource');
  }
  get ObjectiveNoValido() {
    return this.formularioRegistroEditar.get('Objective');
  }
  get IdunitsNoValido() {
    return this.formularioRegistroEditar.get('Idunits');
  }
  get IdanalytesNoValidoEdit() {
    return this.formularioRegistroEditarPre.get('Idanalytes');
  }
  get IdsourceNoValidoEdit() {
    return this.formularioRegistroEditarPre.get('Idsource');
  }
  get ObjectiveNoValidoEdit() {
    return this.formularioRegistroEditarPre.get('Objective');
  }
  get IdunitsNoValidoEdit() {
    return this.formularioRegistroEditarPre.get('Idunits');
  }

  async openModalRegistro(templateRegistro: TemplateRef<any>, datos: any) {
    this.crearFormulario(datos);
    this.consultarAnalitos(this.idprogram);
    await this.objetivosCalidadQceService.listaAnalytes(this.idprogram).then(data => {
      this.listanalytecreate = data;
      this.listanalytecreate.sort((a: any, b: any) => {
        a.Desanalytes = a.Desanalytes.charAt(0) + a.Desanalytes.slice(1);
        b.Desanalytes = b.Desanalytes.charAt(0) + b.Desanalytes.slice(1);
      })

      this.listanalytecreate.sort((a: any, b: any) => {
        if (a.Desanalytes < b.Desanalytes) return -1;
        if (a.Desanalytes > b.Desanalytes) return 1;
        return 0;
      })

      this.filteredOptionsAnalyteCreate = this.formularioRegistroEditar.get('Idanalytes').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterAnalytesCreate(value)
        }),
      );
    });

    await this.fuentesQceService.getAllAsync().then(data => {
      this.listsourcecreate = data.filter(e => e.active == true);
      this.listsourcecreate.sort((a: any, b: any) => {
        a.dessource = a.dessource.charAt(0) + a.dessource.slice(1);
        b.dessource = b.dessource.charAt(0) + b.dessource.slice(1);
      })

      this.listsourcecreate.sort((a: any, b: any) => {
        if (a.dessource < b.dessource) return -1;
        if (a.dessource > b.dessource) return 1;
        return 0;
      })

      this.filteredOptionsSourceCreate = this.formularioRegistroEditar.get('Idsource').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterSourceCreate(value)
        }),
      );
    });

    await this.unitsQceService.getAllAsync().then(data => {
      this.listunitscreate = data.filter(e => e.active == true);
      this.listunitscreate.sort((a: any, b: any) => {
        a.codunits = a.codunits.charAt(0) + a.codunits.slice(1);
        b.codunits = b.codunits.charAt(0) + b.codunits.slice(1);
      })

      this.listunitscreate.sort((a: any, b: any) => {
        if (a.codunits < b.codunits) return -1;
        if (a.codunits > b.codunits) return 1;
        return 0;
      })

      this.filteredOptionsUnitsCreate = this.formularioRegistroEditar.get('Idunits').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterUnitsCreate(value)
        }),
      );
    });

    this.ventanaModal = this.modalService.show(templateRegistro,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    this.accionEditar = !!datos;
    datos ? this.translate.get('MODULES.OBLETIVOSCALIDADQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.OBLETIVOSCALIDADQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  async openModalRegistroEdit(templateRegistroEdit: TemplateRef<any>, datos: any) {
   
    this.crearFormularioEdit(datos);
    this.consultarAnalitos(this.idprogram);
    
    this.ventanaModal = this.modalService.show(templateRegistroEdit,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    this.accionEditar = !!datos;
    datos ? this.translate.get('MODULES.OBLETIVOSCALIDADQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.OBLETIVOSCALIDADQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }
  async crearFormularioEdit(datos: any) {

    await this.AnalytesQceService.getByIdAsync(datos.Idanalytes).then((result: any) => {
      this.desanalytepr = result.desanalytes;
    });
    this.idanalytepr = datos.Idanalytes;

    await this.fuentesQceService.getByIdAsync(datos.Idsource).then((result: any) => {
      this.dessourcepr = result.dessource;
    });
    this.idsourcepr = datos.Idsource;

    await this.unitsQceService.getByIdAsync(datos.Idunits).then((result: any) => {
      this.desunitspr = result.codunits;
    });
    this.idanalytepr = datos.Idunits;

    this.formularioRegistroEditarPre.get('Idconfobjquaprogramanalyte').setValue(datos.Idconfobjquaprogramanalyte ? datos.Idconfobjquaprogramanalyte : '')
    this.formularioRegistroEditarPre.get('Idanalytes').setValue(this.desanalytepr.toLowerCase() ? this.desanalytepr.toLowerCase() : '')
    this.formularioRegistroEditarPre.get('Idsource').setValue(this.dessourcepr.toLowerCase() ? this.dessourcepr.toLowerCase() : '')
    this.formularioRegistroEditarPre.get('Objective').setValue(datos.Objective ? datos.Objective : '')
    this.formularioRegistroEditarPre.get('Idunits').setValue(this.desunitspr.toLowerCase() ? this.desunitspr.toLowerCase() : '')
    this.formularioRegistroEditarPre.get('idprogramconf').setValue(this.idProgramInvalido.value)
    this.formularioRegistroEditarPre.get('Datemod').setValue(this.datePipe.transform(new Date, "yyyy-MM-dd"))
    this.formularioRegistroEditarPre.get('Active').setValue(datos.active ? datos.active : false)

    await this.objetivosCalidadQceService.listaAnalytes(this.idprogram).then(data => {
      this.listanalytecreate = data;
      this.listanalytecreate.sort((a: any, b: any) => {
        a.Desanalytes = a.Desanalytes.charAt(0) + a.Desanalytes.slice(1);
        b.Desanalytes = b.Desanalytes.charAt(0) + b.Desanalytes.slice(1);
      })

      this.listanalytecreate.sort((a: any, b: any) => {
        if (a.Desanalytes < b.Desanalytes) return -1;
        if (a.Desanalytes > b.Desanalytes) return 1;
        return 0;
      })

      this.filteredOptionsAnalyteCreate = this.formularioRegistroEditarPre.get('Idanalytes').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterAnalytesCreate(value)
        }),
      );
    });
    await this.fuentesQceService.getAllAsync().then(data => {
      this.listsourcecreate = data.filter(e => e.active == true);
      this.listsourcecreate.sort((a: any, b: any) => {
        a.dessource = a.dessource.charAt(0) + a.dessource.slice(1);
        b.dessource = b.dessource.charAt(0) + b.dessource.slice(1);
      })

      this.listsourcecreate.sort((a: any, b: any) => {
        if (a.dessource < b.dessource) return -1;
        if (a.dessource > b.dessource) return 1;
        return 0;
      })

      this.filteredOptionsSourceCreate = this.formularioRegistroEditarPre.get('Idsource').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterSourceCreate(value)
        }),
      );
    });
    await this.unitsQceService.getAllAsync().then(data => {
      this.listunitscreate = data.filter(e => e.active == true);
      this.listunitscreate.sort((a: any, b: any) => {
        a.codunits = a.codunits.charAt(0) + a.codunits.slice(1);
        b.codunits = b.codunits.charAt(0) + b.codunits.slice(1);
      })

      this.listunitscreate.sort((a: any, b: any) => {
        if (a.codunits < b.codunits) return -1;
        if (a.codunits > b.codunits) return 1;
        return 0;
      })

      this.filteredOptionsUnitsCreate = this.formularioRegistroEditarPre.get('Idunits').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterUnitsCreate(value)
        }),
      );
    });
  }
  async crearEditar() {
    let nomIdanalyte = this.formularioRegistroEditar.get('Idanalytes').value
    let nuevaData = this.formularioRegistroEditar.value;
    let arranalytes = this.listanalytecreate.sort((a, b) => {
      a.Desanalytes = a.Desanalytes.charAt(0).toLowerCase() + a.Desanalytes.slice(1);
      b.Desanalytes = b.Desanalytes.charAt(0).toLowerCase() + b.Desanalytes.slice(1);

    })
    arranalytes.sort((a, b) => {
      if (a.Desanalytes < b.Desanalytes) return -1;
      if (a.Desanalytes > b.Desanalytes) return 1;
      return 0;
    })

    arranalytes.filter(result => {
      if (result.Desanalytes.toLowerCase() === nomIdanalyte.toLowerCase()) {
        nuevaData.Idanalytes = result.Idanalytes;
        return
      }
      return
    })

    let nomIdsource = this.formularioRegistroEditar.get('Idsource').value
    let arrsource = this.listsourcecreate.sort((a, b) => {
      a.dessource = a.dessource.charAt(0).toLowerCase() + a.dessource.slice(1);
      b.dessource = b.dessource.charAt(0).toLowerCase() + b.dessource.slice(1);

    })
    arrsource.sort((a, b) => {
      if (a.dessource < b.dessource) return -1;
      if (a.dessource > b.dessource) return 1;
      return 0;
    })

    arrsource.filter(result => {
      if (result.dessource.toLowerCase() === nomIdsource.toLowerCase()) {
        nuevaData.Idsource = result.idsource;
        return
      }
      return
    })

    let nomIdunit = this.formularioRegistroEditar.get('Idunits').value
    let arrunits = this.listunitscreate.sort((a, b) => {
      a.codunits = a.codunits.charAt(0).toLowerCase() + a.codunits.slice(1);
      b.codunits = b.codunits.charAt(0).toLowerCase() + b.codunits.slice(1);

    })
    arrunits.sort((a, b) => {
      if (a.codunits < b.codunits) return -1;
      if (a.codunits > b.codunits) return 1;
      return 0;
    })

    arrunits.filter(result => {
      if (result.codunits.toLowerCase() === nomIdunit.toLowerCase()) {
        nuevaData.Idunits = result.idunits;
        return
      }
      return
    })

    if (!this.formularioRegistroEditar.invalid) {
      const respuesta = await this.programxanalito(nuevaData.Idanalytes, this.idprogram);

      nuevaData.idprogramconf = respuesta[0].IdProgramconf;

      const datos = {
        Idconfobjquaprogramanalyte: this.formularioRegistroEditar.value.Idconfobjquaprogramanalyte,
        Idanalytes: this.formularioRegistroEditar.value.Idanalytes,
        Idsource: this.formularioRegistroEditar.value.Idsource,
        Objective: this.formularioRegistroEditar.value.Objective,
        Idunits: this.formularioRegistroEditar.value.Idunits,
        idProgramconf: respuesta[0].IdProgramconf,
        Datemod: this.datePipe.transform(new Date, "yyyy-MM-dd"),
        active: this.formularioRegistroEditar.value.Active
      }

      if (this.tituloAccion === 'Crear') {

        let analito = nuevaData.Idanalytes;
        let existeAnalito = this.listaObjetivosCalidad.find(objetivo => objetivo.Idanalytes == analito) || undefined;

        if (existeAnalito != undefined) {

          this.closeVentana();
          this.tituloAccion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAEXISTEANALITO'));

        } else {

          this.closeVentana();
          this.tituloAccion = 'Crear';

          this.desactivar = true;
          this.objetivosCalidadQceService.create(nuevaData).subscribe(respuesta => {

            this.filtrar();
            this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
            this.desactivar = false;

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
              Datos: JSON.stringify(this.formularioRegistroEditar.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: status
            }
            this.logsService.createLogAsync(Loguser).then(respuesta => {
            });

          }, (error) => {

            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.dateNowISO,
              metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
              datos: JSON.stringify(this.formularioRegistroEditar.value),
              respuesta: error.message,
              tipoRespuesta: error.status
            }
            this.logsService.createLogAsync(Loguser).then(respuesta => {
            });
          });

        }

      } else {

        this.tituloAccion = 'Editar';
        this.objetivosCalidadQceService.update(datos, datos.Idconfobjquaprogramanalyte).subscribe(respuesta => {
          this.closeVentana();
          this.filtrar();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formularioRegistroEditar.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }


          this.logsService.createLogAsync(Loguser).then(respuesta => {
          });
        }, (error) => {

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(this.formularioRegistroEditar.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }
          this.logsService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });

      }

    }
  }

  async crearEditarPred() {

    let nomIdanalyte = this.formularioRegistroEditarPre.get('Idanalytes').value
    let nuevaData = this.formularioRegistroEditarPre.value;
    let arranalytes = this.listanalytecreate.sort((a, b) => {
      a.Desanalytes = a.Desanalytes.charAt(0).toLowerCase() + a.Desanalytes.slice(1);
      b.Desanalytes = b.Desanalytes.charAt(0).toLowerCase() + b.Desanalytes.slice(1);

    })
    arranalytes.sort((a, b) => {
      if (a.Desanalytes < b.Desanalytes) return -1;
      if (a.Desanalytes > b.Desanalytes) return 1;
      return 0;
    })

    arranalytes.filter(result => {
      if (result.Desanalytes.toLowerCase() === nomIdanalyte.toLowerCase()) {
        nuevaData.Idanalytes = result.Idanalytes;
        return
      }
      return
    })

    let nomIdsource = this.formularioRegistroEditarPre.get('Idsource').value
    let arrsource = this.listsourcecreate.sort((a, b) => {
      a.dessource = a.dessource.charAt(0).toLowerCase() + a.dessource.slice(1);
      b.dessource = b.dessource.charAt(0).toLowerCase() + b.dessource.slice(1);

    })
    arrsource.sort((a, b) => {
      if (a.dessource < b.dessource) return -1;
      if (a.dessource > b.dessource) return 1;
      return 0;
    })

    arrsource.filter(result => {
      if (result.dessource.toLowerCase() === nomIdsource.toLowerCase()) {
        nuevaData.Idsource = result.idsource;
        return
      }
      return
    })

    let nomIdunit = this.formularioRegistroEditarPre.get('Idunits').value
    let arrunits = this.listunitscreate.sort((a, b) => {
      a.codunits = a.codunits.charAt(0).toLowerCase() + a.codunits.slice(1);
      b.codunits = b.codunits.charAt(0).toLowerCase() + b.codunits.slice(1);

    })
    arrunits.sort((a, b) => {
      if (a.codunits < b.codunits) return -1;
      if (a.codunits > b.codunits) return 1;
      return 0;
    })

    arrunits.filter(result => {
      if (result.codunits.toLowerCase() === nomIdunit.toLowerCase()) {
        nuevaData.Idunits = result.idunits;
        return
      }
      return
    })
    
    if (!this.formularioRegistroEditarPre.invalid) {
      const respuesta = await this.programxanalito(nuevaData.Idanalytes, this.idprogram)
      const datos = {
        Idconfobjquaprogramanalyte: nuevaData.Idconfobjquaprogramanalyte,
        Idanalytes: nuevaData.Idanalytes,
        Idsource: nuevaData.Idsource,
        Objective: nuevaData.Objective,
        Idunits: nuevaData.Idunits,
        idProgramconf: respuesta[0].IdProgramconf,
        Datemod: this.datePipe.transform(new Date, "yyyy-MM-dd"),
        active: nuevaData.Active
      }
      if (this.tituloAccion === 'Crear') {

        let analito = this.formularioRegistroEditar.get('Idanalytes').value;
        let existeAnalito = this.listaObjetivosCalidad.find(objetivo => objetivo.Idanalytes == analito) || undefined;

        if (existeAnalito != undefined) {

          this.closeVentana();
          this.tituloAccion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAEXISTEANALITO'));

        } else {
          this.closeVentana();
          this.tituloAccion = 'Crear';
          this.desactivar = true;
          this.objetivosCalidadQceService.create(datos).subscribe(respuesta => {

            this.filtrar();
            this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
            this.desactivar = false;

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
              Datos: JSON.stringify(this.formularioRegistroEditar.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: status
            }
            this.logsService.createLogAsync(Loguser).then(respuesta => {
            });

          }, (error) => {

            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.dateNowISO,
              metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
              datos: JSON.stringify(this.formularioRegistroEditar.value),
              respuesta: error.message,
              tipoRespuesta: error.status
            }
            this.logsService.createLogAsync(Loguser).then(respuesta => {
              console.log(respuesta);
            });
          });

        }

      } else {

        const respuesta = await this.programxanalito(nuevaData.Idanalytes, this.idprogram)
        nuevaData.idprogramconf = respuesta[0].IdProgramconf;
        this.tituloAccion = 'Editar';
      
        this.objetivosCalidadQceService.update(nuevaData, nuevaData.Idconfobjquaprogramanalyte).subscribe(respuesta => {
          this.closeVentana();
          this.filtrar();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(nuevaData),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }


          this.logsService.createLogAsync(Loguser).then(respuesta => {
          });
        }, (error) => {

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            datos: JSON.stringify(nuevaData),
            respuesta: error.message,
            tipoRespuesta: error.status
          }
          this.logsService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });

      }

    }
  }

  async actualizarEstado(objeto) {
    const respuesta = await this.programxanalito(objeto.Idanalytes, this.idprogram)

    const estado = objeto.Active ? false : true;
    const datos = {
      Idconfobjquaprogramanalyte: objeto.Idconfobjquaprogramanalyte,
      Idanalytes: objeto.Idanalytes,
      Idsource: objeto.Idsource,
      Objective: objeto.Objective,
      Idunits: objeto.Idunits,
      idProgramconf: respuesta[0].IdProgramconf,
      Datemod: this.datePipe.transform(new Date, "yyyy-MM-dd"),
      active: estado
    }
    this.objetivosCalidadQceService.update(datos, objeto.Idconfobjquaprogramanalyte).subscribe(respuesta => {

      this.filtrar();
    });
  }
  eliminar(id: any) {

    this.objetivosCalidadQceService.delete('qce/ConfobjquaprogramanalyteQce', id).subscribe(respuesta => {

      this.filtrar();
      this.tituloAccion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.dateNowISO,
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: status
      }
      this.logsService.createLogAsync(Loguser).then(respuesta => {
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
        this.logsService.createLogAsync(Loguser).then(respuesta => {
        });

      });

  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo2 = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.OK').subscribe(respuesta => this.ok = `<b>${respuesta}</b>`);
  }
  closeVentana(): void {
    this.ventanaModal.hide();
  }

  filtrar() {
    if (!this.formulario.invalid) {
      this.objetivosCalidadQceService.filtrarDatos(this.formulario.value.idProgram).then(respuesta => {
        setTimeout(() => {
          this.listaObjetivosCalidad = respuesta;
          this.dataSource = new MatTableDataSource(this.listaObjetivosCalidad);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.sharedService.customTextPaginator(this.paginator);

        }, 1000);
        this.bandera = true;
      }, err => {
        this.bandera = true;
        this.listaObjetivosCalidad = [];
        this.tituloAccion = 'noDatos';
        this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
        this.dataSource = new MatTableDataSource([]);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.sharedService.customTextPaginator(this.paginator);
      });
    }
  }
  changeValue(value) {

    if (this.programasActive && value) {
      var seleccion = this.programasActive.find(s => s.idProgram == value);
      if (seleccion)
        this.selectedProgram = seleccion.desprogram;
    }
  }
  async programxanalito(Idanalytes, idProgram) {
    return this.objetivosCalidadQceService.programaAnalito(Idanalytes, idProgram);
  }

  grafica() {
    this.chartOptions1 = {
      series1: [
        {
          name: "Actual",
          data: [
            {
              x: "Enero",
              y: 1292,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Febrero",
              y: 4432,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Marzo",
              y: 5423,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Abril",
              y: 6653,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Mayo",
              y: 8133,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Junio",
              y: 7132,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Julio",
              y: 7332,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Agosto",
              y: 6553,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            }
          ]
        }
      ],
      chart: {
        height: 350,
        type: "bar"
      },
      plotOptions: {
        bar: {
          columnWidth: "60%"
        }
      },
      colors: ["#00E396"],
      dataLabels: {
        enabled: true
      },
      legend: {
        show: true,
        showForSingleSeries: true,
        customLegendItems: ["Actual", "Expectativa"],
        markers: {
          fillColors: ["#00E396", "#775DD0"]
        }
      }
    };
  }
  grafica2() {
    this.chartOptions2 = {
      series2: [
        {
          name: "Cantidad",
          data: [21, 22, 10, 28, 16, 21]
        }
      ],
      chart: {
        height: 350,
        type: "bar",
        events: {
          click: function (chart, w, e) {
            // console.log(chart, w, e)
          }
        }
      },
      colors: [
        "#008FFB",
        "#00E396",
        "#FEB019",
        "#FF4560",
        "#775DD0",
        "#546E7A",
        "#26a69a",
        "#D10CE8"
      ],
      plotOptions: {
        bar: {
          columnWidth: "45%",
          distributed: true
        }
      },
      dataLabels: {
        enabled: true
      },
      legend: {
        show: false
      },
      grid: {
        show: true
      },
      xaxis: {
        categories: [
          "Menor 1,65",
          "Entre 1,65 y 2,99",
          "Entre 3 y 3,99",
          "Entre 4 y 5,99",
          "Mayor a 6",
          "Total"
        ],
        /*labels: {
          style: {
            colors: [
              "#008FFB",
              "#00E396",
              "#FEB019",
              "#FF4560",
              "#775DD0",
              "#546E7A"
            ],
            fontSize: "12px"
          }
        }*/
      }
    };
  }

  /* this.chartOptions2 = {
     series2: [
       {
         name: "Cantidad",
         data: [44, 55, 41, 67, 22, 43]
       }
     ],
     annotations: {
       points: [
         {
           x: "Total",
           seriesIndex: 0,
           label: {
             borderColor: "#775DD0",
             offsetY: 0,
             style: {
               color: "#fff",
               background: "#9b9b9b"
             },
             text: "Total"
           }
         }
       ]
     },
     chart: {
       height: 350,
       type: "bar"
     },
     colors: [
       "#008FFB",
       "#00E396",
       "#FEB019",
       "#FF4560",
       "#775DD0",
       "#546E7A",
       "#26a69a",
       "#D10CE8"
     ],
     plotOptions: {
       bar: {
         columnWidth: "50%",
         //endingShape: "rounded"
       }
     },
     dataLabels: {
       enabled: false
     },
     stroke: {
       width: 2
     },

     grid: {
       row: {
         colors: ["#fff", "#f2f2f2"]
       }
     },
     xaxis: {
       categories: [
         "Menor 1,65",
         "Entre 1,65 y 2,99",
         "Entre 3 y 3,99",
         "Entre 4 y 5,99",
         "Mayor a 6",
         "Total"
       ]
     },
     labels: {
       style: {
         colors: [
           "#008FFB",
           "#00E396",
           "#FEB019",
           "#FF4560",
           "#775DD0",
           "#546E7A",
           "#26a69a",
           "#D10CE8"
         ],
         fontSize: "12px"
       }
     },
     yaxis: {
       title: {
         text: "Servings"
       }
     },
     fill: {
       type: "gradient",
       gradient: {
         shade: "light",
         type: "horizontal",
         shadeIntensity: 0.25,
         gradientToColors: undefined,
         inverseColors: true,
         opacityFrom: 0.85,
         opacityTo: 0.85,
         stops: [50, 0, 100]
       }
     }
   };
 }*/
}

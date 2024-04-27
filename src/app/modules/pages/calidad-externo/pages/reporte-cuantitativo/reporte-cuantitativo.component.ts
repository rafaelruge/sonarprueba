import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProgramasQceService } from '../../../../../services/configuracion/programas-qce.service';
import { ReportesExternoService } from '../../../../../services/calidad-externo/reportesExterno.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ReporteCuantitativoService } from '../../../../../services/calidad-externo/reporte-cuantitativo.service';
import { Chart, registerables } from 'chart.js';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import { NgxSpinnerService } from 'ngx-spinner';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Canvas, Columns, Img, Line, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import domtoimage from 'dom-to-image';
import * as dayjs from 'dayjs';

import { DomSanitizer } from '@angular/platform-browser';
import { AnalitoElement, GroupedAnalitos, Sedes, TablaAnalitos } from '@app/interfaces/sedes.interface';
import { PdfService } from '../../../../../services/pdfs/pdf.service';
import { Location } from '@angular/common';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { PublicService } from '@app/services/public.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';


Chart.register(...registerables);
@Component({
  selector: 'app-reporte-cuantitativo',
  templateUrl: './reporte-cuantitativo.component.html',
  styleUrls: ['./reporte-cuantitativo.component.css']
})
export class ReporteCuantitativoComponent implements OnInit {
  canvas: any;
  ctx: any;
  @ViewChild('mychart') mychart: ElementRef;
  @ViewChild('mychartDiv') mychartDiv: ElementRef;
  @ViewChild('mychartDivTres') mychartDivTres: ElementRef;
  @ViewChild('myChartEvaluacion2DivOculto') myChartEvaluacion2DivOculto: ElementRef;
  @ViewChild('myChartEvaluacion3DivOculto') myChartEvaluacion3DivOculto: ElementRef;
  @ViewChild('myChartEvaluacion3DivOcultoZscore') myChartEvaluacion3DivOcultoZscore: ElementRef;
  @ViewChild('myChartEvaluacionDivocultoZescore') myChartEvaluacionDivocultoZescore: ElementRef;

  @ViewChild('myChartEvaluacion2') myChartEvaluacion2: ElementRef;
  @ViewChild('myChartEvaluacion3') myChartEvaluacion3: ElementRef;
  @ViewChild('myChartGraficaResumenRonda') myChartGraficaResumenRonda: ElementRef;
  @ViewChild('myChartGraficaResumenRondaDivOculto') myChartGraficaResumenRondaDivOculto: ElementRef;
  @ViewChild('myChartGraficaResumenRondaDivOculto2') myChartGraficaResumenRondaDivOculto2: ElementRef;


  @ViewChild('scroll') scroll: ElementRef;

  private nameUser: string = sessionStorage.getItem('nombres');
  private lastNameUser: string = sessionStorage.getItem('apellidos');

  rondas = [];
  programas = [];
  analitos = [];
  tipoReporte = -1;
  itemSeleccionado = -1;
  reporteUno = false;
  reporteDos = false;
  reporteTres = false;
  mostrarReportes = false;
  mostrarMuestras = false;
  mostrarDivOculto = false;
  mostrarBotonExportar = false;
  formaCuantitativo: FormGroup;
  formCuantitativoReporte2: FormGroup;
  formCuantitativoReporte3: FormGroup;
  formaEvaluacion: FormGroup;
  formaSelecione: FormGroup;
  formaSelecionMuestra: FormGroup = this.fb.group({
    muestra: ['', [Validators.required]],
    tipoMuestra: ['', [Validators.required, Validators.minLength(1)]],
    condicionMuestra: ['', [Validators.required, Validators.minLength(2)]],
    calidad: ['', [Validators.required]],
    recepcion: ['', [Validators.required]],
  });
  analitoSeleccionado: string;
  dataListaMuestra: string;
  clienteName: string;
  clienteNit: string;
  clienteAddres: string;
  logoSource: any;
  logoSourceToPDF: string;
  programaSeleccionado = [];

  listaAnalytes = [];
  respuestaBusqueda: any;
  tablaEstadisticaGeneral = [];
  tablaEstadisticaGeneralDivOculto = [];
  valorAsignado: number;
  maximo: number;
  valoresEjex = [];
  imageEvaluacionExterna: any;
  imageEstadisticaGeneral: any;
  imageZscoreUno: any;
  imageZscoreDos: any;
  imageIndiceUno: any;
  imageIndiceDos: any;
  imageIndiceTres: any;
  imageRonda: any[] = [];
  imageDatosLaboratorio: any;
  valoresTodosResultadosEjex = [];
  valoresEquipoMetodoEjex = [];
  valoresMetodoEjex = [];
  datosEvaluacionAnalito = [];
  listaAnalitos = [];
  clientesEvaluacionMuestra = [];
  listaAnalitosEvaluacion = [];
  datosClienteTable = [];
  listaResumenRonda = [];
  datosClienteTableDivZscore = []
  datosClienteTableDivVasignado = [];

  datosFinRonda = [];
  datosFinRondaTabla: any = {};
  datosFinRondaConstantes = [];
  xAxis = [];

  arrConsolidadoReporeUno = [];

  // Reporte 2
  analitosFiltradosVer: any[] = [];
  dataAnalitoFiltrada: Sedes[] = [];
  dataTablaReporte2: any[] = [];
  graficasGrupalesAniltos: any[] = [];
  dataBarraReporte2: any[] = [];
  dataLineasReporte2: any[] = [];
  datosCompletosOrdenados: any[] = [];
  analitosList: any[] = [];
  equipoList: any[] = [];
  graficasReporte2: any[] = [];
  seccionSeleccionado: any = '';
  sedes: any[] = [];
  itemData: any[] = [];
  datosLab: any = {};
  headerMayor: any[] = [];

  resumenMuestra: any[] = [];

  idUser: number = parseInt(sessionStorage.getItem('userid'));
  no_image = this.pdfService.returnNo_image;
  qc_blanco = this.pdfService.returnQc_blanco;

  ventanaModalMuestra: BsModalRef;

  // Reporte 2

  cliente: any;
  numGrafica: number = 1;
  mediaMetodo = 0;
  mediaListaTodosResultados = 0;
  mediaEquipoMetodo = 0;
  myGrafica: any;
  myGraficaDiv: any;
  myGraficaDivTres: any;
  graficaEvaluacion2: any;
  graficaEvaluacion3: any;
  graficaResumenRonda: any;
  graficaResumenRonda2: any;

  graficaUnoEjemplo: any;
  graficaDosEjemplo: any;


  dd: any;
  fechaActual = dayjs().format('YYYY-MM-DD');

  verTabla: boolean = true; idSample: any[] = [];



  tituloTablasReporteDos: any[] = [
    'Red de laboratorios',
    'Programa',
    'Datos laboratorio',
    'Sistema medición/Equipo',
    'Reactivo',
    'Analito',
    'Unidades',
  ]

  // Clientes
  flagCliente: boolean = true;
  clientes: any[] = [];
  ulr = this.location.path();
  participante: any = '';
  codigoparticipante: any = '';
  clienteSeleccionado: any = '';
  resumenRonda: any[] = [];


  // resumen de muestra
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['checks', 'analito', 'asignacion', 'sistema_medicion'];

  sistema_medicion = [{ name: 'EM' }, { name: 'M' }, { name: 'T' },]
  asignaciones = [{ name: 'z-score' }, { name: 'Valor asignado' },]
  allAnalytes: boolean = false
  jsonResumenMuestra: any = {
    Idprogram: 0,
    IdAnalytes: 0,
    Nroround: 0,
    Idclient: 0,
    Idsede: 0,
    idestadistica: 0,
    IdSample: 0,
    dataGenerate: false,
    DataAnalytes: [
      {
        IdAnalytes: 0,
        statisticalGeneral: ""
      }
    ]
  }
  asignacion = new FormControl("");
  sistema = new FormControl("");
  listAnalytesReport: any[] = []


  formSystem: FormGroup;

  constructor(private fb: FormBuilder,
    private programQceService: ProgramasQceService,
    private reportesExternoService: ReportesExternoService,
    private reporteCuantitativoService: ReporteCuantitativoService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private laboratoriosService: LaboratoriosService,
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private pdfService: PdfService,
    private clientesService: ClientesService,
    private location: Location,
    private publicService: PublicService,
    private modalService: BsModalService
  ) { }

  @ViewChild('seleccionMuestra') seleccionMuestra: TemplateRef<any>;

  ngOnInit() {
    sessionStorage.setItem('consultaSedeExterna', '0');
    this.crearFomularioCuantitativo();
    this.crearFomularioSelccione();

    this.consultarEquipos();
    this.crearFomularioCuantitativoReporte2();
    this.tipo(1);
    this.cargarGestionLab();
    this.getLogoSource();
    this.validarCliente();
    if (this.ulr.includes('reporte-cuantitativo-cliente')) {
      this.flagCliente = false;
      this.formCuantitativoReporte2.get('Nit').setValidators(null);
      this.formCuantitativoReporte2.updateValueAndValidity();
      // this.consultarProgramas();
    }
  }

  openSelecionMuestra() {
    this.ventanaModalMuestra = this.modalService.show(this.seleccionMuestra, { backdrop: 'static', keyboard: false, class: 'modal-lg modal-dialog-centered' });
  }

  async cargarSelects(header?: string) {
    this.clientes = await this.clientesService.getAllAsync();
    this.clientes = this.clientes.filter(z => z.header);
    if (header) {
      const idcliente = this.clientes.filter(x => String(x.header).toLocaleLowerCase() === String(header).toLocaleLowerCase())[0].idclient
      this.formaCuantitativo.get('idclient').setValue(idcliente)
      this.cargarSedes(this.clientes.filter(x => String(x.header).toLocaleLowerCase() === String(header).toLocaleLowerCase())[0].header);
      this.formaCuantitativo.get('idclient').setValue(this.clientes.filter(x => x.header === header)[0].idclient)
    }
  }

  cargarGestionLab() {
    this.laboratoriosService.getAllAsync().then(respuesta => {
      this.cliente = respuesta[0].header;
      this.participante = respuesta[0].name;
      this.codigoparticipante = respuesta[0].codecliente;
      if (this.ulr.includes('reporte-cuantitativo-cliente')) {
        this.formaCuantitativo.get('idclient').setValidators(null);
        this.formaCuantitativo.updateValueAndValidity();
        this.cargarSelects(this.cliente);
      } else {
        this.cargarSelects();
      }
    });
  }

  crearFomularioEvaluacion() {
    this.formaEvaluacion = this.fb.group({
      tipoFiltro: ['', [Validators.required]],
      idestadistica: ['', [Validators.required]],
    });
  }
  get tipoFiltro() {
    return this.formaEvaluacion.get('tipoFiltro');
  }
  crearFomularioSelccione() {
    this.formaSelecione = this.fb.group({
      tipoFiltro: ['', [Validators.required]],

    });
  }

  crearFomularioCuantitativo() {
    this.formaCuantitativo = this.fb.group({
      programa: ['', [Validators.required]],
      ronda: ['', [Validators.required]],
      idclient: ['', [Validators.required]],
      idsede: ['', [Validators.required]],
      analyte: ['', [Validators.required]],
      dataGenerate: [false, [Validators.required]]
    });
    this.formaCuantitativo.valueChanges.subscribe(x => {
      this.mostrarReportes = false;
      this.mostrarMuestras = false;
      this.analitoSeleccionado = '';
      this.itemSeleccionado = -1;
      this.tablaEstadisticaGeneral = [];
      this.respuestaBusqueda = null;
      this.listaAnalytes = [];
      this.datosClienteTable = [];
      this.formaEvaluacion?.reset()
      this.formaSelecione?.reset()
    })
    this.filtrar();
  }

  resetForm() { }

  crearFomularioCuantitativoReporte2() {
    this.formCuantitativoReporte2 = this.fb.group({
      Idprogram: [, [Validators.required]],
      Idanalyzer: [, [Validators.required]],
      Idheadquarters: [, [Validators.required]],
      IdAnalytes: [[], [Validators.required]],
      Nit: [null, [Validators.required]]
    });

    this.formCuantitativoReporte2.valueChanges.subscribe(x => {
      this.mostrarReportes = false;
    });
    this.formCuantitativoReporte2.get('Idprogram').valueChanges.subscribe(x => {
      this.reportesExternoService.getAnalitos(x).subscribe((datos: any) => {
        this.analitosList = datos;
      }, _ => {
        this.analitosList = [];
        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYANALITOS'));
      });
    });
  }

  consultarProgramas() {
    const nit = this.clientes.filter(x => x.idclient === this.formaCuantitativo.get('idclient')?.value)[0].nit;
    const idsede = this.formaCuantitativo.get('idsede')?.value;
    this.programQceService.getProgramasPorCliente(nit, idsede).then(respuesta => {
      this.programas = [...respuesta];
    }).catch(e => {
      this.toastr.error(e.error.error);
    });
  }

  consultarEquipos() {
    this.reportesExternoService.getEquipo().subscribe((x: any) => {
      this.equipoList = [...x];
    })
  }

  filtrar() {
    this.formaCuantitativo.get('programa').valueChanges.subscribe(programa => {
      this.analitos = [];
      this.rondas = [];
      this.formaCuantitativo.get('analyte').setValue('');
      this.formaCuantitativo.get('ronda').setValue('');

      if (programa != '') {
        this.reportesExternoService.getRondas(programa).subscribe((datos: any) => {
          this.rondas = datos;
        }, _ => {
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
        });
      }
      this.reportesExternoService.getAnalitos(programa).subscribe((datos: any) => {
        this.analitos = datos;
      }, _ => {
        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYANALITOS'));
      });
    });
  }

  selectNone(control: string) {
    this.formaCuantitativo.get(control).setValue('');
  }
  selectAll(control: string) {
    this.formaCuantitativo.get(control).setValue(['-1']);
  }

  selectOne(control: string) {
    if (this.formaCuantitativo.get(control).value[0] == '-1' || this.formaCuantitativo.get(control).value[0] == '') {
      this.formaCuantitativo.get(control).value.shift();
      this.formaCuantitativo.get(control).setValue(this.formaCuantitativo.get(control).value);
    }
  }
  obtenerPrograma(event) {
    if (event) {
      this.programaSeleccionado = this.programas.filter(datos => datos.IdProgram == event);
    }
  }

  async cargarSedes(id) {
    let cliente = this.clientes.find(x => x.header === id);
    if (cliente) {
      this.participante = cliente.name;
      this.clienteSeleccionado = cliente
    }


    sessionStorage.setItem('consultaSedeExterna', '1');
    await this.publicService.obtenerSedesAsigProg(id).then(r => {
      this.sedes = r.filter(e => e.active);
      sessionStorage.setItem('consultaSedeExterna', '0');
    }, e => this.sedes = []);
  }

  organizarInformacion(item: any): boolean {
    const temporal = this.datosFinRonda.filter(x => x.Analyte === item);
    if (temporal.length === 0) {
      this.spinner.hide();
      return false
    }
    this.datosFinRondaTabla['zscore'] = ['Z-score', ...temporal.map(x => x.Zscore)];
    this.datosFinRondaTabla['desvio'] = ['Indice Desvío', ...temporal.map(x => x.IndiceDesv)];
    this.datosFinRondaTabla['resultado'] = ['Resultado', ...temporal.map(x => x.Resultado)];
    this.datosFinRondaTabla['media'] = ['Media', ...temporal.map(x => x.Media)];
    this.datosFinRondaTabla['ds'] = ['DS', ...temporal.map(x => x.DS)];
    this.datosFinRondaTabla['cv'] = ['CV', ...temporal.map(x => x.CV)];
    this.datosFinRondaTabla['um'] = ['UM', ...temporal.map(x => x.UM)];
    this.datosFinRondaTabla['serial'] = ['Muestra', ...temporal.map(x => x.Serialsample)];
    return true
  }

  informacionFinRonda(data: any) {
    this.reporteCuantitativoService.finDeRonda(data).subscribe(async (res: any) => {
      this.datosFinRonda = [...res[0].Data.Analitos];
      this.datosFinRondaTabla = [];
      if (this.analitoSeleccionado) this.organizarInformacion(this.analitoSeleccionado);

    }, e => {
      this.datosFinRonda = [];
      this.datosFinRondaTabla = [];
    });
  }

  async search() {
    if (this.formaCuantitativo.valid) {
      this.obtenerPrograma(this.formaCuantitativo.value.programa);
      const {programa,analyte,ronda,idclient,idsede,idestadistica,dataGenerate} = this.formaCuantitativo.value;
      let json = {
        idprogram: programa,
        idAnalytes: analyte.join(),
        nroround: ronda,
        Idclient: idclient,
        Idsede: idsede,
        idestadistica: idestadistica ? idestadistica: null,
        dataGenerate
      }

      this.informacionFinRonda(json);
      this.reporteCuantitativoService.getDatos(json).subscribe(async res => {
        if (res[0].Data.length > 0) {
          this.mostrarReportes = true;
          this.respuestaBusqueda = res;
          const analytes = res[0].Data;
          this.resumenRonda = res[0].Evaluacion.resumenronda;
          this.listaAnalytes = await this.filtrarAnalytes(analytes);
        } else {
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
          return;
        }
      },error => {
        this.toastr.error(error.error);
      });
      return
    }
    this.toastr.error('Todos los campos deben ser llenados');
  }

  tipo(tipo: number) {
    this.reporteUno = false;
    this.reporteDos = false;
    this.reporteTres = false;
    this.mostrarReportes = false;
    this.mostrarBotonExportar = false;
    this.dataTablaReporte2 = [];
    this.graficasReporte2 = [];
    this.dataBarraReporte2 = [];

    this.dataLineasReporte2 = [];
    this.datosCompletosOrdenados = [];
    this.seccionSeleccionado = '';
    this.formCuantitativoReporte2.reset();
    this.formaCuantitativo.reset();
    this.itemSeleccionado = 0;

    if (this.ulr.includes('reporte-cuantitativo-cliente')) {
      this.cargarSelects(this.cliente);
    } else { this.sedes = [] }

    switch (tipo) {
      case 1:
        this.reporteUno = true;
        this.tipoReporte = 1;
        break;
      case 2:
        this.reporteDos = true;
        this.tipoReporte = 2;

        break;
      case 3:
        this.reporteTres = true;
        this.tipoReporte = 3;

        break;

      default:
        this.reporteUno = false;
        this.reporteDos = false;
        this.reporteTres = false;
        break;
    }
  }

  setItem(item: number): void {
    this.numGrafica = item;
    this.datosClienteTable = [];

    if (this.tablaEstadisticaGeneral.length === 0) {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOANALITO'));
      return;
    }

    this.itemSeleccionado = item;

    if (item === 1) {
      setTimeout(() => {
        this.graficoDos();
      }, 500);
    }
    if (item === 2) {
      this.crearFomularioEvaluacion();
    }
    if (item === 3) {
      setTimeout(() => {
        this.graficoSeis();
      }, 500);
    }
  }

  reporteDosSeleccionar(item: number) {
    this.itemSeleccionado = item;
  }

  async buscarAnalitos(analito: string, muestra?: string, consolidado: boolean = false) {
    this.mostrarDivOculto = true;
    this.spinner.show();
    this.analitoSeleccionado = analito;
    this.tablaEstadisticaGeneral = [];
    this.tablaEstadisticaGeneralDivOculto = [];
    this.valorAsignado = 0;

    const datosMetodo = this.respuestaBusqueda[0].Estadistica.Metodo;
    const equipoMetodo = this.respuestaBusqueda[0].Estadistica.EquipoMetodo;
    const todosResultados = this.respuestaBusqueda[0].Estadistica.TodosResultados;
    const data = this.respuestaBusqueda[0].Data;
    const dataEvaluacion = this.respuestaBusqueda[0].Evaluacion.Analitos;
    this.idSample = data;

    let listaMetodos = await this.promesaEstadistica(datosMetodo, analito);
    let listaEquipoMetodo = await this.promesaEstadistica(equipoMetodo, analito);
    let listaTodosResultados = await this.promesaEstadistica(todosResultados, analito);
    this.listaAnalitosEvaluacion = await this.promesaEstadistica(dataEvaluacion, analito);
    if (listaMetodos.length === 0 || listaEquipoMetodo.length === 0 ||
      listaTodosResultados.length === 0 || this.listaAnalitosEvaluacion.length === 0) {
      this.toastr.error('No se encontro información del analito');
      this.spinner.hide();
      this.itemSeleccionado = 1;
      return
    }
    if (!this.organizarInformacion(analito)) {
      this.toastr.error('No se encontro información del analito');
      return
    }

    this.listaResumenRonda = await this.promesaListaResumenRonda(this.listaAnalitosEvaluacion, listaEquipoMetodo);

    this.listaAnalitos = await this.promesaAnalitosData(data, analito);
    this.dataListaMuestra = await this.promesaListaMuestra(this.listaAnalitos);
    this.datosEvaluacionAnalito = await this.promesaAnalitoEvaluacion(dataEvaluacion, analito);
    this.clientesEvaluacionMuestra = await this.clientesAnalitoEvaluacionMuestra(this.listaAnalitosEvaluacion);

    if (listaMetodos.length === 0) {
      listaMetodos = [{
        Analyte: "0",
        CV: 0,
        Comments: "0",
        DS: 0,
        Metodo: "0",
        ReceptionDate: "0",
        SampleCondition: "",
        Um: 0,
        ValorAsignado: 0,
        media: 0,
        participantes: 0
      }]
    }
    if (listaEquipoMetodo.length === 0) {
      listaEquipoMetodo = [{
        Analyte: "0",
        CV: 0,
        Comments: "0",
        DS: 0,
        Metodo: "0",
        ReceptionDate: "0",
        SampleCondition: "",
        Um: 0,
        ValorAsignado: 0,
        media: 0,
        participantes: 0
      }]
    }
    if (listaTodosResultados.length === 0) {
      listaTodosResultados = [{
        Analyte: "0",
        CV: 0,
        Comments: "0",
        DS: 0,
        Metodo: "0",
        ReceptionDate: "0",
        SampleCondition: "",
        Um: 0,
        ValorAsignado: 0,
        media: 0,
        participantes: 0
      }]
    }

    this.valorAsignado = listaTodosResultados[0].ValorAsignado;
    this.mediaEquipoMetodo = listaMetodos[0].media;
    this.mediaMetodo = listaEquipoMetodo[0].media;
    this.mediaListaTodosResultados = listaTodosResultados[0].media;
    this.maximo = listaTodosResultados[0].participantes;

    this.tablaEstadisticaGeneral = [listaMetodos, listaEquipoMetodo, listaTodosResultados];
    this.tablaEstadisticaGeneralDivOculto = this.tablaEstadisticaGeneral;
    this.valoresEjex = await this.ValoresEjex(listaTodosResultados);
    this.valoresTodosResultadosEjex = listaTodosResultados[0].Data_resultALL;
    this.valoresEquipoMetodoEjex = listaEquipoMetodo[0].Data_resultEM;
    this.valoresMetodoEjex = listaMetodos[0].Data_result;
    this.setItem(this.numGrafica);
    setTimeout(async () => {
      await this.graficoDosDiv();
      this.obtenerDatosClienteDiv(muestra, consolidado);
    }, 800);
    await new Promise(() => {
      setTimeout(() => {
        this.mostrarBotonExportar = true;
      }, 1500);
    })

  }
  async promesaEstadistica(newData, analito) {
    const ar = newData.filter(datos => datos.Analyte === analito);
    return ar;
  }
  async promesaListaResumenRonda(listaAnalitosEvaluacion, listaEquipoMetodo) {
    const ar = [];
    listaEquipoMetodo.forEach(equipoMetodo => {
      listaAnalitosEvaluacion.forEach(evaluacion => {
        ar.push({
          Serialsample: evaluacion.Serialsample,
          Resultado: evaluacion.Resultado,
          media: equipoMetodo.media,
          DS: equipoMetodo.DS,
          CV: equipoMetodo.CV,
          Um: equipoMetodo.Um,
          IndiceDesv: evaluacion.IndiceDesv,
          Zscore: evaluacion.Zscore
        });
      });
    });
    return ar;
  }
  async clientesAnalitoEvaluacionMuestra(newData) {
    const datosAnalitoEvaluacion = [];
    //const ar = newData.filter(datos => datos.Name === this.cliente);
    const ar = newData;
    ar.forEach(element => {
      datosAnalitoEvaluacion.push(element.Serialsample);
    });
    return datosAnalitoEvaluacion;
  }
  async promesaAnalitoEvaluacion(newData, analito) {
    const datosAnalitoEvaluacion = [];
    let ar = newData.filter(datos => datos.Analyte === analito);
    ar.forEach(element => {
      datosAnalitoEvaluacion.push(element.Resultado);
    });
    return datosAnalitoEvaluacion;
  }
  async promesaAnalitosData(newData, analito) {
    const ar = newData.filter(datos => datos.desAnalytes === analito);
    return ar;
  }
  async promesaListaMuestra(data) {
    let ar: string = '';
    data.forEach(element => {
      ar += element.serialSample + ',';
    });
    return ar;
  }
  async filtrarAnalytes(newData) {
    const ar = [];
    newData.forEach(item => {
      ar.push(item.desAnalytes);
    });

    const dataArr = new Set(ar);
    let result = [...dataArr];

    return result;
  }
  async filtrarEquipoMetodo(newData) {
    const ar = [];
    newData.forEach(item => {
      let separado = item.EquipoMetodo.split("-");
      ar.push(separado[0].trim());
    });

    const dataArr = new Set(ar);
    let result = [...dataArr];

    return result;
  }
  graficoTres() {

    var xyValues = [{
      x: 1,
      y: this.tipoFiltro.value === '2' ? this.datosClienteTable[0].IndiceDesv : this.datosClienteTable[0].Zscore
    },];
    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.myGrafica) {
      this.myGrafica.destroy();
    }

    this.myGrafica = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: (context) => {
            if (this.tipoFiltro.value === '2') {
              if (context.parsed.y > 1 || context.parsed.y < -1) {
                return 'red';
              } else if (context.parsed.y <= 1 && context.parsed.y >= -1 && context.parsed.y != 0) {
                return '#25d366';
              }

              return '#000000';
            } else {
              if (context.parsed.y > 2 || context.parsed.y < -2) {
                return 'red';
              } else if (context.parsed.y <= 2 && context.parsed.y >= -2 && context.parsed.y != 0) {
                return '#25d366';
              }

              return '#000000';
            }

          },
          data: xyValues
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: this.tipoFiltro.value === '2' ? 'Indice desvío' : 'Zscore'
          },
          subtitle: {
            display: true,
            text: this.datosClienteTable[0].Resultado,
            color: 'blue',
            padding: {
              bottom: 10
            }
          }
        },

        scales: {
          x: {
            beginAtZero: true,
            max: 5,
            grid: {
              display: true,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            }
          },
          y: {
            max: 3,
            min: -3,
            grid: {
              drawBorder: false,
              color: (context) => {
                if (this.tipoFiltro.value === '2') {
                  if (context.tick.value > 1 || context.tick.value < -1) {
                    return 'blue';
                  } else if (context.tick.value <= 1 && context.tick.value >= -1 && context.tick.value != 0) {
                    return 'red';
                  }

                  return '#000000';
                } else {
                  if (context.tick.value > 2 || context.tick.value < -2) {
                    return 'blue';
                  } else if (context.tick.value === 2 || context.tick.value === -2) {
                    return 'red';
                  }

                  return '#000000';
                }

              },
            }
          }
        }
      }
    });
  }
  graficoCuatro() {
    var xyValues = [{
      x: Number(this.datosClienteTable[0].Resultado),
      y: this.tipoFiltro.value === '2' ? this.datosClienteTable[0].IndiceDesv : this.datosClienteTable[0].Zscore
    },];
    this.canvas = this.myChartEvaluacion2.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.graficaEvaluacion2) {
      this.graficaEvaluacion2.destroy();
    }

    this.graficaEvaluacion2 = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: (context) => {
            if (this.tipoFiltro.value === '2') {
              if (context.parsed.y > 1 || context.parsed.y < -1) {
                return 'red';
              } else if (context.parsed.y <= 1 && context.parsed.y >= -1 && context.parsed.y != 0) {
                return '#25d366';
              }

              return '#000000';
            } else {
              if (context.parsed.y > 2 || context.parsed.y < -2) {
                return 'red';
              } else if (context.parsed.y <= 2 && context.parsed.y >= -2 && context.parsed.y != 0) {
                return '#25d366';
              }

              return '#000000';
            }

          },
          data: xyValues
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: this.tipoFiltro.value === '2' ? 'Indice de Desvío /Concentración' : 'Z-score Concentación'
          },
          subtitle: {
            display: true,
            text: this.datosClienteTable[0].Resultado,
            color: 'blue',
            padding: {
              bottom: 10
            }
          }
        },

        scales: {
          x: {
            beginAtZero: true,
            max: this.tipoFiltro.value === '2' ? this.datosClienteTable[0].Resultado + 15 : Math.trunc(this.datosClienteTable[0].Resultado + 15),
            grid: {
              display: true,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            }
          },
          y: {
            max: 3,
            min: -3,
            grid: {
              drawBorder: false,
              color: (context) => {
                if (this.tipoFiltro.value === '2') {
                  if (context.tick.value > 1 || context.tick.value < -1) {
                    return 'blue';
                  } else if (context.tick.value <= 1 && context.tick.value >= -1 && context.tick.value != 0) {
                    return 'red';
                  }

                  return '#000000';
                } else {
                  if (context.tick.value > 2 || context.tick.value < -2) {
                    return 'blue';
                  } else if (context.tick.value === 2 || context.tick.value === -2) {
                    return 'red';
                  }

                  return '#000000';
                }

              },
            }
          }
        }
      }
    });
  }
  graficoCinco() {
    var xyValues = [{
      x: 1,
      y: this.datosClienteTable[0].Desvio
    },];
    this.canvas = this.myChartEvaluacion3.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.graficaEvaluacion3) {
      this.graficaEvaluacion3.destroy();
    }

    this.graficaEvaluacion3 = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: function (context) {

            if (context.parsed.y > 1 || context.parsed.y < -1) {
              return 'red';
            } else if (context.parsed.y <= 1 && context.parsed.y >= -1 && context.parsed.y != 0) {
              return '#25d366';
            }

            return '#000000';
          },
          data: xyValues
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: '% Desvío'
          },
          subtitle: {
            display: true,
            text: this.datosClienteTable[0].Desvio,
            color: 'blue',
            padding: {
              bottom: 10
            }
          }
        },

        scales: {
          x: {
            beginAtZero: true,
            max: Math.trunc(this.datosClienteTable[0].Desvio + 15),
            grid: {
              display: true,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            }
          },
          y: {
            max: this.datosClienteTable[0].Desvio + 15,
            min: -this.datosClienteTable[0].Desvio - 15,
            grid: {
              drawBorder: false,
              color: (context) => {
                if (context.tick.value === this.datosClienteTable[0].DesvAceptable || context.tick.value === -this.datosClienteTable[0].DesvAceptable) {
                  return 'red';
                } else if (context.tick.value > this.datosClienteTable[0].DesvAceptable || context.tick.value < -this.datosClienteTable[0].DesvAceptable) {
                  return 'blue';
                }

                return '#000000';
              },
            }
          }
        }
      }
    });
  }
  graficoDos() {
    const arrayTR = [];
    const arrayEM = [];
    const arrayM = [];

    const arrayTodosResultados = [];
    const arrayEquipoMetodo = [];
    const arrayMetodo = [];

    this.valoresTodosResultadosEjex.forEach((element, index) => {
      arrayTR.push(element.Result);
    });
    this.valoresEquipoMetodoEjex.forEach((element, index) => {
      arrayEM.push(element.Result);
    });
    this.valoresMetodoEjex.forEach((element, index) => {
      arrayM.push(element.Result);
    });

    this.valoresEjex.forEach((element, index) => {
      let res = arrayTR.includes(element.toString());
      if (res) {
        let resultado = this.buscarCantidadResultados(this.listaAnalitos, element);
        arrayTodosResultados.push(resultado);
      } else {
        arrayTodosResultados.push(0);
      }
    });
    this.valoresEjex.forEach((element, index) => {
      let res = arrayEM.includes(element.toString());
      if (res) {
        let resultado = this.buscarCantidadResultados(this.listaAnalitos, element);
        arrayEquipoMetodo.push(resultado);
      } else {
        arrayEquipoMetodo.push(0);
      }
    });
    this.valoresEjex.forEach((element, index) => {
      let res = arrayM.includes(element.toString());
      if (res) {
        let resultado = this.buscarCantidadResultados(this.listaAnalitos, element);
        arrayMetodo.push(resultado);
      } else {
        arrayMetodo.push(0);
      }
    });
    const arrayAnalito = [];
    this.listaAnalitos.forEach((element, index) => {

      arrayAnalito.push(element.result);

    });

    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.myGrafica) {
      this.myGrafica.destroy();
    }

    this.myGrafica = new Chart(this.ctx, {

      type: 'bar',
      data: {
        datasets: [{
          label: 'Todos los resultados',
          data: arrayTodosResultados,
          backgroundColor: "#E8BC5B",
          borderColor: "#E8BC5B"
        },
        {
          label: 'Equipo- Método',
          data: arrayEquipoMetodo,
          backgroundColor: "#3ac47d",
          borderColor: "#3ac47d"
        },
        {
          label: 'Método',
          data: arrayMetodo,
          backgroundColor: "#007bff",
          borderColor: "#007bff"
        },

        ],
        labels: this.valoresEjex

      },
      options: {
        plugins: {
          legend: {
            display: false,

          },
        },
        scales: {
          legend: {
            display: false
          },
          x: {
            stacked: true,
            beginAtZero: true,
            offset: true,
            grid: {
              display: false
              // color: '#000000'
            },
            title: {
              display: true,
              text: `Concentraciones`,
            },
            ticks: {
              color: (context) => {
                let numero = context.tick.label;
                let n = Number(numero);
                if (n === this.mediaListaTodosResultados) {
                  return '#007bff';
                }
                return '#000000';
              }
            }
          },
          /*x2: {
            labels: this.valoresTodosResultadosEjex,
            offset: true,
            ticks: {
              color: (context) => {
                let numero =context.tick.label;
                let n =Number(numero);
                if (n === this.mediaListaTodosResultados) {
                  return '#E8BC5B';
                } else {
                  return '#000000';
                }
              }
           }
          },*/
          y: {
            stacked: true,
            max: this.maximo,
            grid: {
              drawBorder: true,
            },
            title: {
              display: true,
              text: `Participantes (${this.maximo})`,
            }
          }
        }
      }
    });

  }
  graficoSeis() {

    let idMenor = 0,
      zscoreMenor = 0,
      idMayor = 0,
      zscoreMayor = 0;
    let datosGraficaSeis = [];
    this.listaResumenRonda.forEach(element => {
      if (element.IndiceDesv < 1) {
        idMenor++;
      } else if (element.IndiceDesv > 1) {
        idMayor++;
      }
      if (element.Zscore < 2) {
        zscoreMenor++;
      } else if (element.Zscore > 2) {
        zscoreMayor++;
      }
    });
    datosGraficaSeis.push(idMenor, zscoreMenor, idMayor, zscoreMayor, this.listaResumenRonda.length)
    this.canvas = this.myChartGraficaResumenRonda.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.graficaResumenRonda) {
      this.graficaResumenRonda.destroy();
    }

    this.graficaResumenRonda = new Chart(this.ctx, {

      type: 'bar',
      data: {
        datasets: [{
          data: datosGraficaSeis,
          backgroundColor: ["#42ab49", "#77dd77", "#c63637", "#ff6961", "#888a8a"],
          borderColor: ["#42ab49", "#77dd77", "#c63637", "#ff6961", "#888a8a"]
        }

        ],
        labels: ['< 1', 'Z-score < 2', '> 1', 'Z-score > 2', 'Total']

      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Resumen Ronda 1 Índice de Desvío'
          },
        },
        scales: {
          x: {
            stacked: false,
            beginAtZero: true,
            offset: true,
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            stacked: false,
            grid: {
              drawBorder: true,
            }
          }
        }
      }
    });
  }
  async ValoresEjex(listaDatos) {

    let mediaMas = listaDatos[0].media;
    let mediaMenos = listaDatos[0].media;

    const desviacion = listaDatos[0].DS;
    const vueltas = [...Array(2)]
    let nuevoArray = [mediaMas];
    this.listaAnalitos.forEach(element => {
      nuevoArray.push(Number(element.result));
    });
    vueltas.forEach(element => {
      mediaMas = desviacion + mediaMas;
      nuevoArray.push(mediaMas.toFixed(1));
    });

    vueltas.forEach(element => {
      mediaMenos = mediaMenos - desviacion;
      if (mediaMenos >= 0) {
        nuevoArray.push(mediaMenos.toFixed(1));
      }
    });
    const dataArr = new Set(nuevoArray);
    let result = [...dataArr];

    result.sort(function (a, b) {
      return a - b;
    });

    return result;
  }

  public scrollCards(flow: number): void {
    this.scroll.nativeElement.scrollLeft += (136.1 * flow);
  }

  validarRepetidos(array) {
    return new Set(array).size !== array.length;
  }

  buscarCantidadResultados(listaAnalitos, element) {

    const ar = listaAnalitos.filter(datos => datos.result === element.toString());
    return ar.length;

  }

  obtenerDatosCliente(muestrax?: string) {

    const muestra = this.formaSelecione.get('tipoFiltro').value;

    //const datos = this.listaAnalitosEvaluacion.filter(datos => datos.Name === this.cliente);
    const datos = this.listaAnalitosEvaluacion;
    this.datosClienteTable = datos.filter(datos => datos.Serialsample === muestra);
    setTimeout(() => {
      this.graficoTres();
      this.graficoCuatro();
      if (this.tipoFiltro.value === '2') {
        this.graficoCinco();
      }
    }, 1000);
  }

  async tipoOpcion() {

    if (this.tipoFiltro.value === '1' || this.tipoFiltro.value === '2') {
      if (this.graficaEvaluacion2) {
        this.graficaEvaluacion2.destroy();
      }
      if (this.graficaEvaluacion3) {
        this.graficaEvaluacion3.destroy();
      }
      if (this.myGrafica) {
        this.myGrafica.destroy();
      }
      await this.search()
      // this.datosClienteTable = [];
      this.mostrarMuestras = true;
    } else {
      this.mostrarMuestras = false;
    }
  }

  getLogoSource() {
    this.laboratoriosService.getLogoImage()
      .subscribe(logo => {

        this.logoSource = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/jpg;base64,${logo}`);
        this.logoSourceToPDF = `data:image/jpg;base64,${logo}`;

      });
  }

  validarCliente() {

    this.laboratoriosService.getAllAsync().then(lab => {
      //console.log(lab);
      this.datosLab['name'] = lab[0].name;
      this.datosLab['nit'] = lab[0].nit;
      this.datosLab['addres'] = lab[0].addres;
      this.clienteName = lab[0].name;
      this.clienteNit = lab[0].nit;
      this.clienteAddres = lab[0].addres;

    });

  }
  async graficoDosDiv() {
    const arrayTR = [];
    const arrayEM = [];
    const arrayM = [];

    const arrayTodosResultados = [];
    const arrayEquipoMetodo = [];
    const arrayMetodo = [];


    await new Promise((res, e) => {
      this.valoresTodosResultadosEjex.forEach((element, index) => {
        arrayTR.push(element.Result);
      });
      this.valoresEquipoMetodoEjex.forEach((element, index) => {
        arrayEM.push(element.Result);
      });
      this.valoresMetodoEjex.forEach((element, index) => {
        arrayM.push(element.Result);
      });

      this.valoresEjex.forEach((element, index) => {
        let res = arrayTR.includes(element.toString());
        if (res) {
          let resultado = this.buscarCantidadResultados(this.listaAnalitos, element);
          arrayTodosResultados.push(resultado);
        } else {
          arrayTodosResultados.push(0);
        }
      });
      this.valoresEjex.forEach((element, index) => {
        let res = arrayEM.includes(element.toString());
        if (res) {
          let resultado = this.buscarCantidadResultados(this.listaAnalitos, element);
          arrayEquipoMetodo.push(resultado);
        } else {
          arrayEquipoMetodo.push(0);
        }
      });
      this.valoresEjex.forEach((element, index) => {
        let res = arrayM.includes(element.toString());
        if (res) {
          let resultado = this.buscarCantidadResultados(this.listaAnalitos, element);
          arrayMetodo.push(resultado);
        } else {
          arrayMetodo.push(0);
        }
      });
      const arrayAnalito = [];
      this.listaAnalitos.forEach((element, index) => {

        arrayAnalito.push(element.result);

      });

      this.canvas = this.mychartDiv.nativeElement;
      this.ctx = this.canvas.getContext('2d');

      if (this.myGraficaDiv) {
        this.myGraficaDiv.destroy();
      }

      this.myGraficaDiv = new Chart(this.ctx, {
        type: 'bar',
        data: {
          datasets: [{
            label: 'Todos los resultados',
            data: arrayTodosResultados,
            backgroundColor: "#E8BC5B",
            borderColor: "#E8BC5B"
          },
          {
            label: 'Equipo- Método',
            data: arrayEquipoMetodo,
            backgroundColor: "#3ac47d",
            borderColor: "#3ac47d"
          },
          {
            label: 'Método',
            data: arrayMetodo,
            backgroundColor: "#007bff",
            borderColor: "#007bff"
          },

          ],
          labels: this.valoresEjex

        },
        options: {
          animation: {
            onComplete: () => {
              this.imageEstadisticaGeneral = this.myGraficaDiv.toBase64Image();

            }
          },
          plugins: {
            legend: {
              display: false,

            },
          },
          scales: {
            legend: {
              display: false
            },
            x: {
              stacked: true,
              beginAtZero: true,
              offset: true,
              grid: {
                display: false
                // color: '#000000'
              },
              title: {
                display: true,
                text: `Concentraciones`,
              },
              ticks: {
                color: (context) => {
                  let numero = context.tick.label;
                  let n = Number(numero);
                  if (n === this.mediaListaTodosResultados) {
                    return '#007bff';
                  }
                  return '#000000';
                }
              }
            },
            /*x2: {
              labels: this.valoresTodosResultadosEjex,
              offset: true,
              ticks: {
                color: (context) => {
                  let numero =context.tick.label;
                  let n =Number(numero);
                  if (n === this.mediaListaTodosResultados) {
                    return '#E8BC5B';
                  } else {
                    return '#000000';
                  }
                }
             }
            },*/
            y: {
              stacked: true,
              max: this.maximo,
              grid: {
                drawBorder: true,
              },
              title: {
                display: true,
                text: `Participantes (${this.maximo})`,
              }
            }
          }
        }
      });

      res(this.myGraficaDiv);
    }).then(x => {
    })
  }

  graficoTresDiv(muestra?: string) {

    let xyValues: any;
    if (!muestra) {
      xyValues = [{
        x: 1,
        y: this.datosClienteTableDivVasignado[0].IndiceDesv
      },];
    } else {
      xyValues = [{
        x: 1,
        y: this.datosClienteTableDivVasignado.filter(x => x.Serialsample === muestra)[0].IndiceDesv
      },];
    }


    this.canvas = this.mychartDivTres.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.myGraficaDivTres) {
      this.myGraficaDivTres.destroy();
    }

    this.myGraficaDivTres = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: (context) => {

            if (context.parsed.y > 1 || context.parsed.y < -1) {
              return 'red';
            } else if (context.parsed.y <= 1 && context.parsed.y >= -1 && context.parsed.y != 0) {
              return '#25d366';
            }

            return '#000000';


          },
          data: xyValues
        }]
      },
      options: {
        animation: {
          onComplete: () => {
            this.imageIndiceUno = this.myGraficaDivTres.toBase64Image();
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Indice desvío'
          },
        },

        scales: {
          x: {
            beginAtZero: true,
            max: 5,
            grid: {
              display: true,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            }
          },
          y: {
            max: 3,
            min: -3,
            grid: {
              drawBorder: false,
              color: (context) => {

                if (context.tick.value > 1 || context.tick.value < -1) {
                  return 'blue';
                } else if (context.tick.value <= 1 && context.tick.value >= -1 && context.tick.value != 0) {
                  return 'red';
                }

                return '#000000';


              },
            }
          }
        }
      }
    });
  }

  graficoCuatroDiv(muestra?: string) {

    let xyValues: any;
    if (!muestra) {
      xyValues = [{
        x: Number(this.datosClienteTableDivVasignado[0].Resultado),
        y: this.datosClienteTableDivVasignado[0].IndiceDesv
      },];
    } else {
      xyValues = [{
        x: Number(this.datosClienteTableDivVasignado.filter(x => x.Serialsample === muestra)[0].Resultado),
        y: this.datosClienteTableDivVasignado.filter(x => x.Serialsample === muestra)[0].IndiceDesv
      },];
    }
    this.canvas = this.myChartEvaluacion2DivOculto.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.graficaEvaluacion2) { this.graficaEvaluacion2.destroy(); }

    this.graficaEvaluacion2 = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: (context) => {

            if (context.parsed.y > 1 || context.parsed.y < -1) {
              return 'red';
            } else if (context.parsed.y <= 1 && context.parsed.y >= -1 && context.parsed.y != 0) {
              return '#25d366';
            }

            return '#000000';


          },
          data: xyValues
        }]
      },
      options: {
        animation: {
          onComplete: () => {
            this.imageIndiceDos = this.graficaEvaluacion2.toBase64Image();
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Indice de Desvío /Concentración'
          },
        },

        scales: {
          x: {
            beginAtZero: true,
            max: xyValues[0].y + 5,
            grid: {
              display: true,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            }
          },
          y: {
            max: 3,
            min: -3,
            grid: {
              drawBorder: false,
              color: (context) => {

                if (context.tick.value > 1 || context.tick.value < -1) {
                  return 'blue';
                } else if (context.tick.value <= 1 && context.tick.value >= -1 && context.tick.value != 0) {
                  return 'red';
                }

                return '#000000';


              },
            }
          }
        }
      }
    });
  }

  graficoCincoDiv(muestra?: string) {

    let xyValues: any;
    if (!muestra) {
      xyValues = [{
        x: 1,
        y: this.datosClienteTableDivVasignado[0].Desvio
      },];
    } else {
      xyValues = [{
        x: 1,
        y: this.datosClienteTableDivVasignado.filter(x => x.Serialsample === muestra)[0].Desvio
      },];
    }
    this.canvas = this.myChartEvaluacion3DivOculto.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.graficaEvaluacion3) { this.graficaEvaluacion3.destroy(); }

    this.graficaEvaluacion3 = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: function (context) {

            if (context.parsed.y > 1 || context.parsed.y < -1) {
              return 'red';
            } else if (context.parsed.y <= 1 && context.parsed.y >= -1 && context.parsed.y != 0) {
              return '#25d366';
            }

            return '#000000';
          },
          data: xyValues
        }]
      },
      options: {
        animation: {
          onComplete: () => {
            this.imageIndiceTres = this.graficaEvaluacion3.toBase64Image();
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: '% Desvío'
          },
        },

        scales: {
          x: {
            beginAtZero: true,
            max: Math.trunc(xyValues[0].y + 15),
            grid: {
              display: true,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            }
          },
          y: {
            max: xyValues[0].y + 20,
            min: -xyValues[0].y - 20,
            grid: {
              drawBorder: false,
              color: (context) => {
                if (context.tick.value === this.datosClienteTableDivVasignado[0].DesvAceptable || context.tick.value === -this.datosClienteTableDivVasignado[0].DesvAceptable) {
                  return 'red';
                } else if (context.tick.value > this.datosClienteTableDivVasignado[0].DesvAceptable || context.tick.value < -this.datosClienteTableDivVasignado[0].DesvAceptable) {
                  return 'blue';
                }

                return '#000000';
              },
            }
          }
        }
      }
    });
  }

  graficoTresDivZscore(muestra?: string) {
    let xyValues: any;
    if (!muestra) {
      xyValues = [{
        x: 1,
        y: this.datosClienteTableDivZscore[0].Zscore
      },];
    } else {
      xyValues = [{
        x: 1,
        y: this.datosClienteTableDivZscore.filter(x => x.Serialsample === muestra)[0].Zscore
      },];
    }
    this.canvas = this.myChartEvaluacion3DivOcultoZscore.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    if (this.graficaUnoEjemplo) { this.graficaUnoEjemplo.destroy(); }

    this.graficaUnoEjemplo = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: (context) => {

            if (context.parsed.y > 2 || context.parsed.y < -2) {
              return 'red';
            } else if (context.parsed.y <= 2 && context.parsed.y >= -2 && context.parsed.y != 0) {
              return '#25d366';
            }

            return '#000000';


          },
          data: xyValues
        }]
      },
      options: {
        animation: {
          onComplete: () => {
            this.imageZscoreUno = this.graficaUnoEjemplo.toBase64Image();
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Zscore'
          },
        },

        scales: {
          x: {
            beginAtZero: true,
            max: 5,
            grid: {
              display: true,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            }
          },
          y: {
            max: 3,
            min: -3,
            grid: {
              drawBorder: false,
              color: (context) => {

                if (context.tick.value > 2 || context.tick.value < -2) {
                  return 'blue';
                } else if (context.tick.value === 2 || context.tick.value === -2) {
                  return 'red';
                }

                return '#000000';


              },
            }
          }
        }
      }
    });
  }

  graficoCuatroDivZscore(muestra?: string) {
    let xyValues: any;
    if (!muestra) {
      xyValues = [{
        x: Number(this.datosClienteTableDivZscore[0].Resultado),
        y: this.datosClienteTableDivZscore[0].Zscore
      },];
    } else {
      xyValues = [{
        x: Number(this.datosClienteTableDivZscore.filter(x => x.Serialsample === muestra)[0].Resultado),
        y: this.datosClienteTableDivZscore.filter(x => x.Serialsample === muestra)[0].Zscore
      },];
    }
    this.canvas = this.myChartEvaluacionDivocultoZescore.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.graficaDosEjemplo) { this.graficaDosEjemplo.destroy(); }

    this.graficaDosEjemplo = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: (context) => {

            if (context.parsed.y > 2 || context.parsed.y < -2) {
              return 'red';
            } else if (context.parsed.y <= 2 && context.parsed.y >= -2 && context.parsed.y != 0) {
              return '#25d366';
            }

            return '#000000';


          },
          data: xyValues
        }]
      },
      options: {
        animation: {
          onComplete: () => {
            this.imageZscoreDos = this.graficaDosEjemplo.toBase64Image();

          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Z-score Concentración'
          },
        },

        scales: {
          x: {
            beginAtZero: true,
            max: Math.trunc(xyValues[0].x + 15),
            grid: {
              display: true,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            }
          },
          y: {
            max: 3,
            min: -3,
            grid: {
              drawBorder: false,
              color: (context) => {

                if (context.tick.value > 2 || context.tick.value < -2) {
                  return 'blue';
                } else if (context.tick.value === 2 || context.tick.value === -2) {
                  return 'red';
                }

                return '#000000';


              },
            }
          }
        }
      }
    });
  }

  graficoSeisDivOculto(consolidado: boolean,key:string) {
    let idMenor = 0;
    let idMayor = 0;
    let datosGraficaSeis = [];
    this.resumenMuestra.forEach(element => {
      const valor = element[key]; 
      if (valor < -2 || valor > 2) idMenor++;
      if (valor > -2 && valor < 2) idMayor++;
    });
    
    datosGraficaSeis.push(idMenor, idMayor, this.resumenMuestra.length)
    this.canvas =  this.myChartGraficaResumenRondaDivOculto.nativeElement;
    this.ctx = this.canvas.getContext('2d');


    if (this.graficaResumenRonda) { this.graficaResumenRonda.destroy(); }

    this.graficaResumenRonda = new Chart(this.ctx, {
      type: 'bar',
      data: {
        datasets: [{
          data: datosGraficaSeis,
          backgroundColor: ["#42ab49", "#77dd77", "#888a8a"],
          borderColor: ["#42ab49", "#77dd77", "#888a8a"]
        }

        ],
        labels: ['Z-score < -2 o > 2', 'Z-score > -2 o < 2', 'Total']

      },
      options: {
        animation: {
          onComplete: () => {
            this.imageRonda[0]=this.graficaResumenRonda.toBase64Image();
            if (!consolidado) {
              this.mostrarDivOculto = false;
              this.spinner.hide();
              return;
            }
          }
        },
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Z-score'
          },
        },
        scales: {
          x: {
            stacked: false,
            beginAtZero: true,
            offset: true,
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            stacked: false,
            grid: {
              drawBorder: true,
            }
          }
        }
      }
    });
  }
  graficoSeisDivOculto2(consolidado: boolean,key:string) {
    let idMenor = 0;
    let idMayor = 0;
    let datosGraficaSeis = [];
    this.resumenMuestra.forEach(element => {
      const valor = element[key]; 
      if (valor < -1 || valor > 1) idMenor++;
      if (valor > -1 && valor < 1) idMayor++;
    });
    
    datosGraficaSeis.push(idMenor, idMayor, this.resumenMuestra.length)
    this.canvas = this.myChartGraficaResumenRondaDivOculto2.nativeElement;
    this.ctx = this.canvas.getContext('2d');


    if (this.graficaResumenRonda2) { this.graficaResumenRonda2.destroy(); }

    this.graficaResumenRonda2 = new Chart(this.ctx, {
      type: 'bar',
      data: {
        datasets: [{
          data: datosGraficaSeis,
          backgroundColor: ["#42ab49", "#77dd77", "#888a8a"],
          borderColor: ["#42ab49", "#77dd77", "#888a8a"]
        }

        ],
        labels: ['ID < -1 o > 1', 'ID > -1 o < 1', 'Total']

      },
      options: {
        animation: {
          onComplete: () => {
            this.imageRonda[1]=this.graficaResumenRonda2.toBase64Image();
            if (!consolidado) {
              this.mostrarDivOculto = false;
              this.spinner.hide();
              return;
            }
          }
        },
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text:'Índice de Desvío'
          },
        },
        scales: {
          x: {
            stacked: false,
            beginAtZero: true,
            offset: true,
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            stacked: false,
            grid: {
              drawBorder: true,
            }
          }
        }
      }
    });
  }

  async generarPdf(FlagConsolidado: boolean = false) {
    this.arrConsolidadoReporeUno.length = 0;
    let json = this.jsonResumenMuestra

    if (json.DataAnalytes && json.DataAnalytes.length) {


      let iNotsValid = json.DataAnalytes.find(e => e.statisticalGeneral == "" || e.statisticalGeneral == "-")

      if (iNotsValid) {
        iNotsValid.IdAnalytes == -1 ? this.toastr.error('Debe seleccionar un sistema de medición') : this.toastr.error('Debe seleccionar un sistema de medición para los analitos seleccionados')
        return
      }

    } else {
      this.toastr.error('Debe seleccionar analitos')
      return
    }

    if (this.mostrarDivOculto === true) {
      return
    }

    if (this.tablaEstadisticaGeneral.length === 0) {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOANALITO'));
      return;
    }
    this.ventanaModalMuestra.hide();

    const muestraSeleccionda = this.formaSelecionMuestra.value.muestra;

    await this.reporteCuantitativoService
      .getResumenMuestra(json)
      .toPromise()
      .then((x: any) => {
        this.resumenMuestra = x;
        this.jsonResumenMuestra.DataAnalytes = [];
        this.allAnalytes = false;
        this.limpiarFormulario(false)
      });

    for (const key in this.listaAnalytes) {

      let consolidado = this.listaAnalytes[key] !== this.listaAnalytes[this.listaAnalytes.length - 1] ? true : false;
      if (this.listaAnalytes.length === 1) consolidado = false;
      
      this.buscarAnalitos(this.listaAnalytes[key], muestraSeleccionda, consolidado);
      await new Promise((res, e) => {
        setTimeout(() => {
          const nuevoArrImagen = [null,[this.imageIndiceUno, this.imageIndiceDos, this.imageIndiceTres], [this.imageZscoreUno, this.imageZscoreDos]]
          // ...this.graficasReporte2 graficas de fin de ronda
          let datosResumenRonda = []
          moment.locale('es');
          const datosAdicionales = this.datosFinRonda.filter(eq => eq.Analyte === this.analitoSeleccionado)[0];
          const datosCabecero = {
            analito: this.analitoSeleccionado,
            programa: this.programaSeleccionado[0].Desprogram,
            ronda: this.formaCuantitativo.value.ronda,
            muestra: muestraSeleccionda,
            fecha: moment(this.fechaActual).format('ll'),
            tipomuestra: this.formaSelecionMuestra.get('tipoMuestra')?.value,
            condicionesmuestra: this.formaSelecionMuestra.get('condicionMuestra')?.value,
            fecharecepcion: moment(this.formaSelecionMuestra.get('recepcion')?.value).format('ll'),
            si: this.formaSelecionMuestra.get('calidad')?.value == 1 ? ' X ' : '___',
            no: this.formaSelecionMuestra.get('calidad')?.value == 2 ? ' X ' : '___',
            cod: this.respuestaBusqueda[0].Data[0].codeClient,
            equipo:datosAdicionales.Equipo,
            metodo:datosAdicionales.Metodo,
            reactivo:datosAdicionales.Reactivo,
            unidades:datosAdicionales.Unidades,
            valorAsign:datosAdicionales.ValorAsign,
            fechaFinal: moment(datosAdicionales.EndDate).format('ll')
          }
          const grupos = ['Método','Equipo - Método','Todos los resultado'];
          const nuevaTablaEstadistica = this.tablaEstadisticaGeneral.map((x,i) => {
            return {
              A_N: x[0].participantes,
              B_Media: x[0].media,
              C_DS: x[0].DS,
              D_CV: x[0].CV,
              E_UM: x[0].Um,
              F_grupo:grupos[i]
            }
          })

          const nuevaTablaZscore = this.datosClienteTableDivZscore.filter(y => y.Serialsample === muestraSeleccionda).map(x => {
            return {
              A_resultado: x.Resultado,
              B_zScore: x.Zscore,
              C_media: x.Media,
              D_ds: x.DS,
              E_rmzs: '""'
            }
          })

          const nuevaTablaIndiceDesvio = this.datosClienteTableDivVasignado.filter(y => y.Serialsample === muestraSeleccionda).map(x => {
            return {
              A_resultado: x.Resultado,
              B_valorAsignado: x.ValorAsign,
              C_porcentajeDesvio: x.Desvio,
              D_desviacionAceptable: x.DesvAceptable,
              E_indiceDesvio: x.IndiceDesv,
              F_RMID: '""',
            }
          })

          this.listaResumenRonda.map(analito => {
            datosResumenRonda.push([{
              A_serialSample: analito.Serialsample,
              B_resultado: analito.Resultado,
              C_media: analito.media,
              D_ds: analito.DS,
              E_cv: analito.CV,
              F_um: analito.Um,
              G_indiceDesvio: analito.IndiceDesv,
              zScore: analito.Zscore === 'No Determinado' ? `♾` : analito.Zscore,
            }
            ]);
          });


          let nuevaTablaFinRonda = this.datosFinRonda.filter(x => x.Analyte === this.analitoSeleccionado);
          nuevaTablaFinRonda = nuevaTablaFinRonda.map(x => {
            return {
              A_serialSample: x.Serialsample,
              B_resultado: x.Resultado,
              C_media: x.Media,
              D_ds: x.DS,
              E_cv: x.CV,
              F_um: x.UM,
              G_indiceDesvio: x.IndiceDesv,
              zScore: x.Zscore === 'No Determinado' ? `♾` : x.Zscore,
            }
          })

          datosResumenRonda = datosResumenRonda.reduce((a, b) => a.concat(b), []);

          const tablas = [nuevaTablaEstadistica, nuevaTablaIndiceDesvio, nuevaTablaZscore, datosResumenRonda, nuevaTablaFinRonda];
          const caberosTablaEstadisticaGeneral = ['N', 'Media', 'DS', 'CV', 'UM','Grupo'];
          const caberosTablasZscore = ['Resultado Ronda', 'Z-score', 'Media', 'DS', 'RMZs'];
          const caberosTablasDesvio = ['Resultado Ronda', 'Valor asignado', '% Desvío', '% Desviación Aceptable', '% Indice de Desvío', 'RMID'];
          const caberosTablasResumenRonda_Ciclo = ['Muestra', 'Resultado', 'Media', 'DS', 'CV', 'UM', 'Indice Desvio', 'Z-score'];
          //const caberosTablasResumenMuestras = ['Analito', 'Resultado', 'valor Asignado', 'Media', 'DS', 'CV', 'UM', 'Indice Desvio', 'Z-Score', 'Grupo'];
          //Por requerimiento se quita el valor asignado y indice desvio
          const caberosTablasResumenMuestras = ['Analito', 'Resultado', 'Media', 'DS', 'CV', 'UM', 'Z-Score', 'Grupo'];
          //const caberosTablasResumenRonda = ['Ronda', 'Muestra', 'Analito', 'Media', 'Resultado', 'DS', 'CV', 'UM', 'Indice Desvio', 'Z-Score'];
          //Por requerimiento se quita indice desvio
          const caberosTablasResumenRonda = ['Ronda', 'Muestra', 'Analito', 'Media', 'Resultado', 'DS', 'CV', 'UM', 'Z-Score'];
          const cabeceros = [caberosTablaEstadisticaGeneral, caberosTablasDesvio, caberosTablasZscore, caberosTablasResumenRonda_Ciclo];
          const resumenes = [caberosTablasResumenMuestras, caberosTablasResumenRonda ]

          res([[nuevoArrImagen, tablas, cabeceros, datosCabecero], datosCabecero, resumenes]);

        }, 9000);
      }).then(x => {
        
        this.arrConsolidadoReporeUno.push(x[0]);
        if (this.listaAnalytes[key] === this.listaAnalytes[this.listaAnalytes.length - 1]) {
          setTimeout(() => {
            let clienteInfo:any={};
            if (this.flagCliente) {
              clienteInfo = {
                isClient:true,
                header:this.clienteSeleccionado.header,
                nameClient:this.clienteSeleccionado.name
              }
            }

            // Respuesta de la promesa
            //Se elimina las imagenes de las graficas que tengan que ver con desvio
            for (let i=0; i < this.arrConsolidadoReporeUno.length; i++){
              delete this.arrConsolidadoReporeUno[i][0][1];
            }
            this.pdfService.PdfExternoCuantitativo(this.arrConsolidadoReporeUno, x[1], this.resumenMuestra, x[2],this.resumenRonda,this.imageRonda,clienteInfo) ;
          }, 1000);
        }
      })
    }
    this.formaSelecionMuestra.reset();
    this.reiniciarAnalitos();
    this.listAnalytesReport.length=0;
  }

  obtenerDatosClienteDiv(muestra?: string, consolidado?: boolean) {
    this.datosClienteTableDivZscore.length = 0;
    this.datosClienteTableDivVasignado.length = 0;

    //const datos = this.listaAnalitosEvaluacion.filter(datos => datos.Name === this.cliente);
    const datos = this.listaAnalitosEvaluacion;
    this.clientesEvaluacionMuestra.forEach(async element => {
      let retorno = await this.arrayZscore(element, datos);
      this.datosClienteTableDivZscore.push({
        Serialsample: retorno[0].Serialsample,
        Resultado: retorno[0].Resultado,
        Zscore: retorno[0].Zscore,
        Media: retorno[0].Media,
        DS: retorno[0].DS
      });

      let retornoindiceDesvio = await this.arrayIndiceDesvio(element, datos);
      this.datosClienteTableDivVasignado.push({
        Serialsample: retornoindiceDesvio[0].Serialsample,
        Resultado: retornoindiceDesvio[0].Resultado,
        ValorAsign: retornoindiceDesvio[0].ValorAsign,
        Desvio: retornoindiceDesvio[0].Desvio,
        DesvAceptable: retornoindiceDesvio[0].DesvAceptable,
        IndiceDesv: retornoindiceDesvio[0].IndiceDesv
      });
    });

    setTimeout(() => {
      // Indice de desvio
      this.graficoTresDiv(muestra);
      this.graficoCuatroDiv(muestra);
      this.graficoCincoDiv(muestra);
      // zScore
      this.graficoTresDivZscore(muestra);
      this.graficoCuatroDivZscore(muestra);

      this.graficoSeisDivOculto(consolidado,'zScore');
      this.graficoSeisDivOculto2(consolidado,'indiceDesvio');
    }, 1000);
  }
  async arrayZscore(elemento, datos) {
    let retorno = datos.filter(datos => datos.Serialsample === elemento);
    return retorno;
  }
  async arrayIndiceDesvio(elemento, datos) {
    let retorno = datos.filter(datos => datos.Serialsample === elemento);
    return retorno;
  }


  // Reporte 2

  groupAnalitosBySede(data: AnalitoElement[], sedeName: string) {
    const sedeMap: { [key: string]: { [key: string]: AnalitoElement[] } } = {};
    data.forEach((d: AnalitoElement) => {

      if (!sedeMap[d.Sede]) {
        sedeMap[d.Sede] = {};
      }
      if (!sedeMap[d.Sede][d.Analito]) {
        sedeMap[d.Sede][d.Analito] = [];
      }
      if (!sedeMap[d.Sede][d.Analito].includes(d)) {
        sedeMap[d.Sede][d.Analito].push(d);
      }
      // sedeMap[d.Sede][d.Analito].push(d);
    });
    const result: GroupedAnalitos[] = [];
    Object.keys(sedeMap).forEach((sedeKey: string) => {
      result.push({
        Sede: sedeName,
        Analitos: sedeMap[sedeKey]
      });
    });

    return result;
  }

  limpiar1(campo: string) {
    let sinMenosUno: any[] = this.formCuantitativoReporte2.get(campo)?.value;
    if (sinMenosUno.length !== 1 && sinMenosUno.includes('-1')) {
      sinMenosUno = sinMenosUno.filter(x => x !== '-1');
    }
    this.formCuantitativoReporte2.get(campo).setValue(sinMenosUno);
  }

  limpiar2(campo: string) {
    let sinMenosUno: any[] = this.formCuantitativoReporte2.get(campo)?.value;
    if (sinMenosUno.length !== 1 && sinMenosUno.includes('-1')) {
      sinMenosUno = sinMenosUno.filter(x => x !== '-1');
    }
    this.formaCuantitativo.get(campo).setValue(sinMenosUno);
  }

  filtrarAnalitos(campo: string) {

    let ids: any[] = this.formCuantitativoReporte2.get(campo).value;
    this.analitosFiltradosVer = [];

    if (ids.includes('-1') && ids.length === 1) {
      if (ids.includes('')) {
        this.analitosFiltradosVer = [];
        ids = ids.filter(x => x !== '');
        this.formCuantitativoReporte2.get(campo).setValue(ids);
        return
      }
      this.analitosFiltradosVer = this.analitosList;
    } else {
      // if (ids.length !== 1 && !ids.includes('-1')) {
      //   ids = ids.filter(x => x !== '-1');

      // }
      const isMultipleSelection = ids.length !== 1;
      const hasNegativeOne = ids.includes('-1');

      if (isMultipleSelection && hasNegativeOne) {
        ids = ids.filter(selectedId => selectedId !== '-1');
      }

      this.formCuantitativoReporte2.get(campo).setValue(ids);
      this.analitosFiltradosVer = this.analitosList.filter(x => ids.includes(x.Idanalytes));
    }
  }

  crearGraficaBarrasReporte2(arryReturn: any[]) {
    let contador1 = 0;
    let contador2 = 0;
    const colores = ['red', 'green', 'gray'];
    let iterar: any = [1, 2, 3];

    arryReturn.map(i => {
      i.analito.map((z, index) => {
        if (z.IndiceDesvio > 1) {
          contador1 += 1;
        } else {
          contador2 += 1;
        }
      })
    });

    iterar = iterar.map((x: any, index: number) => {
      return {
        value: '',
        itemStyle: { color: colores[index] },
        label: {
          show: true,
          position: 'inside',
          color: 'white'
        },
      }
    });

    iterar[0].value = contador1;
    iterar[1].value = contador2;
    iterar[2].value = contador2 + contador1;

    this.dataBarraReporte2 = [...iterar];
  }

  async traerInfoAnalitoReporte2Individual(analito: string) {
    let arryReturn = [];
    this.dataLineasReporte2 = [];
    this.seccionSeleccionado = analito;
    this.dataTablaReporte2 = []
    // Extrae informacion zScore, indices desvio por el filtro de analitos
    await new Promise((res, e) => {
      this.dataAnalitoFiltrada.map(x => {

        let cambio = this.groupAnalitosBySede((x.Programas[0].Analitos), x.Sede)[0];
        const { Sede, Unidad, Programa, Equipo, Reactivo } = x;
        Object.keys(cambio.Analitos)
          .filter(f => f === analito)
          .forEach(f => {
            const objetoTabla = {
              ['titulo']: ['Red de laboratorios', 'Programa', 'Datos laboratorio', 'Sistema medición/Equipo', 'Reactivo', 'Analito', 'Unidades'],
              ['informacion']: ['ANNAR DX', Programa, Sede, Equipo, Reactivo, f, Unidad],
              ['sedeNumber']: [],
            };
            arryReturn.push({ sede: cambio.Sede, analito: cambio.Analitos[f] });
            this.mostrarReportes = true;
            this.dataTablaReporte2.push(objetoTabla);
            this.itemData = [Sede, Unidad, Programa, Equipo, Reactivo, f];
            res(true);
          });
        if (arryReturn.length === 0) {
          e(false);
          this.toastr.error('No se encontraron datos para el analito "' + analito + '"');
        }
      })
    });

    if (arryReturn.length === 0) {
      this.mostrarReportes = false;
      this.toastr.error('No se encontraron datos');
      return
    }

    // Grafica de lineas
    let arrTemporalIndiceDesvio = [];
    let arrTemporalZscore = [];
    arrTemporalIndiceDesvio = arryReturn.map((item, index) => {
      let data = item.analito.map((x: AnalitoElement) => String(x.IndiceDesvio));
      // Informacion de la tabla
      this.dataTablaReporte2[index].desvio = ['Índice desvío', ...data];
      if (index === 0) this.dataTablaReporte2[index].sedeNumber = data.length;
      if (this.dataTablaReporte2[index].sedeNumber < data.length) this.dataTablaReporte2[index].sedeNumber = data.length;
      // Informacion de la tabla
      return {
        name: item.sede,
        type: 'line',
        data
      }
    });
    arrTemporalZscore = arryReturn.map((item, index) => {
      const data = item.analito.map((x: AnalitoElement) => String(x.Zscore));
      const arrSedeNumber = [];
      // Informacion de la tabla
      this.dataTablaReporte2[index].zScore = ['Z-score', ...data];
      if (index === 0) this.dataTablaReporte2[index].sedeNumber = data.length;
      if (this.dataTablaReporte2[index].sedeNumber < data.length) this.dataTablaReporte2[index].sedeNumber = data.length;
      for (let index = 0; index < data.length; index++) {
        arrSedeNumber.push(index + 1);
      }
      this.dataTablaReporte2[index].sedeNumber = [item.sede, ...arrSedeNumber];
      // Informacion de la tabla
      return {
        name: item.sede,
        type: 'line',
        data: item.analito.map((x: AnalitoElement) => String(x.Zscore))
      }
    });  // Fin Grafica de lineas

    this.dataTablaReporte2.map(x => {
      if (x.zScore.length > this.headerMayor.length) {
        this.headerMayor = [...x.zScore];
      }
    })
    this.headerMayor.shift();
    this.dataLineasReporte2.push(arrTemporalIndiceDesvio, arrTemporalZscore);
    // Organizar informacion de grafica barras
    this.crearGraficaBarrasReporte2(arryReturn);
  }

  traerInfoAnalitoReporte2Grupal(arr: Sedes[]) {
    let analitos: string[] = [];
    let data: any[] = [];
    let agrupado: any[] = [];
    let agrupadoreturn: any[] = [];
    const colores = ['red', 'green', 'gray'];

    arr.map((x, index) => {
      x.Programas[0].Analitos.filter((y) => {
        if (!analitos.includes(y.Analito)) analitos.push(y.Analito);
      })
    });

    arr.map((x, index) => {
      // Informacion lineas
      analitos.map((i, index2) => {
        let contador1 = 0;
        let contador2 = 0;
        let iterar: any = [1, 2, 3];
        let desvio = [];
        let zScore = [];

        x.Programas[0].Analitos.filter((y) => {
          if (y.Analito === i) {
            if (y.IndiceDesvio > 1) {
              contador1 += 1;
            } else {
              contador2 += 1;
            }

            desvio.push(String(y.IndiceDesvio));
            zScore.push(String(y.Zscore));
          }
        });// Informacion lineas
        // Informacion grafica de barras
        iterar = iterar.map((x: any, index: number) => {
          return {
            value: '',
            itemStyle: { color: colores[index] },
            label: { show: true, position: 'inside', color: 'white' },
          }
        });

        iterar[0].value = String(contador1);
        iterar[1].value = String(contador2);
        iterar[2].value = String((contador2 + contador1)); // Informacion grafica de barras

        data.push({
          analito: i,
          informacion: [
            {
              sede: x.Sede,
              unidad: x.Unidad,
              programa: x.Programa,
              equipo: x.Equipo,
              reactivo: x.Reactivo,
              lineas: {
                desvio: { name: x.Sede, type: "line", data: desvio },
                zScore: { name: x.Sede, type: "line", data: zScore },
                barra: iterar
              }
            }
          ]
        });
      });
    });

    analitos.map(x => {
      agrupado.push(data.filter(y => y.analito === x));
    })

    agrupadoreturn = agrupado.map((y: any) => {
      let informacion = []
      y.map(z => {
        informacion.push(z.informacion[0])
      })
      return { base64Grafica: [], analito: y[0].analito, lineas: informacion }
    })
    this.datosCompletosOrdenados = [...agrupadoreturn];
    this.pdf2Reporte2([...agrupadoreturn])
  }

  datosClienteSelect(z) {
    this.reporteCuantitativoService.getDatosLabXcliente(z).subscribe(x => this.datosLab = { ...x });
  }

  consultarReporte2() {
    if (this.formCuantitativoReporte2.invalid) {
      this.formCuantitativoReporte2.markAllAsTouched();
      return
    }
    this.dataTablaReporte2 = [];
    this.dataBarraReporte2 = [];
    this.graficasReporte2 = [];
    this.headerMayor = [];

    let data = {
      Idprogram: this.formCuantitativoReporte2.get('Idprogram')?.value,
      Idanalyzer: this.formCuantitativoReporte2.get('Idanalyzer')?.value.join(),
      IdAnalytes: this.formCuantitativoReporte2.get('IdAnalytes')?.value.join(),
      Idheadquarters: this.formCuantitativoReporte2.get('Idheadquarters')?.value.join(),
    }
    this.reporteCuantitativoService.getDatosReporte2(data, this.formCuantitativoReporte2.get('Nit')?.value).subscribe((resp: any) => {

      if (resp[0].Sedes.Sedes.length === 0) {
        this.toastr.error('No se encontraron datos');
        return
      }
      this.dataAnalitoFiltrada = resp[0].Sedes.Sedes;
      this.traerInfoAnalitoReporte2Individual(resp[0].Sedes.Sedes[0].Programas[0].Analitos[0].Analito);
      this.mostrarReportes = true;
      this.mostrarBotonExportar = true;
    }, err => {
      this.dataTablaReporte2 = [];
      this.dataBarraReporte2 = [];
      this.graficasReporte2 = [];
      this.dataLineasReporte2 = [];
      this.datosCompletosOrdenados = [];
      this.headerMayor = [];
      this.seccionSeleccionado = '';
      this.mostrarReportes = false;
      this.mostrarBotonExportar = false;
      this.toastr.error('No se encontraron datos');
    })
  }

  obtenerGraficas(num: number, base64: string) {
    this.graficasReporte2[num] = base64;
  }

  crearColumnas(): any[] {
    let newArray = [];
    this.dataTablaReporte2.map(async (x: any, index: number) => {
      newArray[index] = new Stack([
        new Columns([
          new Stack([
            x.titulo.map((y: any, j: number) => {
              return new Txt(y).alignment('right').color('#3A49A5').bold().end
            })
          ]).noWrap().end,
          new Stack([
            x.informacion.map((y: any, j: number) => {
              return new Txt(y).alignment('left').end
            })
          ]).end,
          new Stack([
            x.sedeNumber.map((y: any, j: number) => {
              if (j === 0) {
                return new Txt(y).alignment('left').color('#3A49A5').bold().end
              }
              return new Txt(y).alignment('left').end
            })
          ]).end,
          new Stack([
            x.desvio.map((y: any, j: number) => {
              if (j === 0) {
                return new Txt(y).alignment('left').color('#3A49A5').bold().end
              }
              return new Txt(y).alignment('left').end

            })
          ]).end,
          new Stack([
            x.zScore.map((y: any, j: number) => {
              if (j === 0) {
                return new Txt(y).alignment('left').color('#3A49A5').bold().end
              }
              return new Txt(y).alignment('left').end
            })
          ]).end,
        ]).columnGap(10).alignment('center').fontSize(11).margin([0, 35, 0, 20]).width('90%').end
      ]).end
    });

    return newArray
  }

  reportePDF2() {
    this.itemSeleccionado = 4;
    setTimeout(async () => {

      PdfMakeWrapper.setFonts(pdfFonts);
      const pdf = new PdfMakeWrapper();
      pdf.pageSize('B4');
      pdf.pageMargins([30, 220, 30, 50]);
      pdf.header(
        new Stack([
          new Canvas([
            new Line([298, 70], [300, 70]).lineWidth(160).lineColor('#6E6E6E').end,
          ]).absolutePosition(-50, 55).end,
          await new Img('assets/imagenes/headerPDF.png').relativePosition(0, 0).width(700).height(100).build(),
          await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(80, 40).build(),
          '\n',

          new Stack([
            new Columns([
              new Txt(`Cliente : ${this.clienteName}`).width(200).fontSize(11).end,
              new Txt(``).fontSize(11).end,
              new Txt(``).fontSize(11).end,
            ]).end
          ]).width(100).relativePosition(20, 140).end,
          // new Txt (`Cliente : ${this.clienteName} \nNit : ${this.clienteNit}\nDirección : ${this.clienteAddres}`).relativePosition(60,140).fontSize(11).end,
          new Stack([
            new Txt('Reporte Consolidado\nCuantitativo').margin([250, 0, 0, 20]).bold().fontSize(20).end
          ]).margin(20).end
        ]).width('100%').height('auto').alignment('left').end
      );

      pdf.add(
        this.crearColumnas()
      )
      for (const key in this.graficasReporte2) { //Graficas
        pdf.add(await new Img(this.graficasReporte2[key]).height(180).width(600).alignment('center').build());
        pdf.add('\n');
      }
      pdf.add(
        new Stack([
          new Txt([new Txt(`Homogeneidad y estabilidad:`).bold().end, ` La información relacionada con la homogeneidad y estabilidad de esta muestra ha sido declarada por el fabricante.
           `, new Txt(`Confidencialidad:`).bold().end, ` El informe presentado a continuación presenta información de caracter confidencia; la divulgación del mismo se realiza únicamente con el participante al cual corresponde; en caso que alguna autoridad requiera la socialización del mismo, esta solo se realiza con autorización expresa del participante.
           `, new Txt(`Subcontratación:`).bold().end, ` Annar Health Technologies no realiza la subcontratación de actividades relacionadas con la planificación, análisis y emisión de los reportes de resultados relacionados con los reportes de control de calidad externo.
           `, new Txt(`Autorizado por:`).bold().end, ` Leydy Paola González, Especialista de producto.
           `]).end
        ]).end
      )

      async function getBase64ImageFromUrl(imageUrl) {
        var res = await fetch(imageUrl);
        var blob = await res.blob();

        return new Promise((resolve, reject) => {
          var reader = new FileReader();
          reader.addEventListener("load", function () {
            resolve(reader.result);
          }, false);

          reader.onerror = () => {
            return reject(this);
          };
          reader.readAsDataURL(blob);
        })
      }
      function footerFunc(img) {
        pdf.footer(function (page: any, pages: any) {
          return {
            // margin: [5, 0, 10, 0],
            height: 30,
            columns: [
              {
                alignment: "center",
                image: img,

                fit: [700, 100],
                absolutePosition: { x: 10, y: 10 }
              },
              {
                text: [
                  { text: 'Pag ' + page.toString() },
                  " - ",
                  { text: pages.toString() }
                ],
                color: 'white',
                fontSize: 8,
                absolutePosition: { x: 640, y: 38 }
              },

            ],

          }
        });
      }
      let base64Footer: any = '';
      await getBase64ImageFromUrl('assets/imagenes/footerPDF.png')
        .then(result => base64Footer = result)
        .catch(err => console.error(err));
      footerFunc(base64Footer);
      pdf.create().open();
      this.itemSeleccionado = -1;
    }, 3000);
  }

  iterarTablasCompletasAnlitos(informacionTabla: TablaAnalitos[]) {
    let newArray = [];
    informacionTabla.map(async (x: TablaAnalitos, index: number) => {
      newArray[index] = x.lineas.map((infoTablas, index2: number) => {
        let numIterar = 0;
        let arrIterar = [];
        const desvio = infoTablas.lineas.desvio.data.length;
        const zScore = infoTablas.lineas.zScore.data.length;
        desvio > zScore ? numIterar = desvio : numIterar = zScore;
        for (let index = 0; index < numIterar; index++) {
          arrIterar.push(index + 0);
        }
        const imagenesGrafica = (): any => {
          let data = {}
          if ((x.lineas.length - 1) === index2) {
            data = x.base64Grafica.map(img => {
              return {
                alignment: "center",
                image: img,
                height: 180,
                width: 600,
              }
            })
          }
          return data
        }

        return new Stack([
          new Columns([
            new Stack([
              new Txt('Red de laboratorios').color('#3A49A5').bold().alignment('right').end,
              new Txt('Programa').color('#3A49A5').bold().alignment('right').end,
              new Txt('Datos laboratorio').color('#3A49A5').bold().alignment('right').end,
              new Txt('Sistema medición/Equipo').color('#3A49A5').bold().alignment('right').end,
              new Txt('Reactivo').color('#3A49A5').bold().alignment('right').end,
              new Txt('Analito').color('#3A49A5').bold().alignment('right').end,
              new Txt('Unidades').color('#3A49A5').bold().alignment('right').end,
            ]).width(150).noWrap().end,
            new Stack([
              new Txt('ANNAR DX').alignment('left').end,
              new Txt(infoTablas.programa).alignment('left').end,
              new Txt(infoTablas.sede).alignment('left').end,
              new Txt(infoTablas.equipo).alignment('left').end,
              new Txt(infoTablas.reactivo).alignment('left').end,
              new Txt(x.analito).alignment('left').end,
              new Txt(infoTablas.unidad).alignment('left').end,
            ]).width(250).end,
            new Stack([
              new Txt(infoTablas.sede).color('#3A49A5').bold().alignment('center').end,
              arrIterar.map(item => new Txt(String((parseInt(item) + 1))).alignment('center').end)
            ]).noWrap().width(80).end,
            new Stack([
              new Txt('Índice desvío').color('#3A49A5').bold().alignment('center').end,
              infoTablas.lineas.desvio.data.map(item => new Txt(String(item)).alignment('center').end)
            ]).noWrap().width(80).end,
            new Stack([
              new Txt('Z-score').color('#3A49A5').bold().alignment('center').end,
              infoTablas.lineas.zScore.data.map(item => new Txt(String(item)).alignment('center').end)
            ]).noWrap().width(80).end,
          ]).columnGap(5).alignment('left').fontSize(11).width('95%').end,
          imagenesGrafica(),
          index2 + 1 === x.lineas.length && (index + 1) !== informacionTabla.length ? new Txt('').pageBreak('after').end : new Txt('').pageOrientationAndBreak('portrait', 'after').end,
          index2 + 1 === x.lineas.length && (index + 1) === informacionTabla.length ? new Stack([
            new Txt([new Txt(`Homogeneidad y estabilidad:`).bold().end, ` La información relacionada con la homogeneidad y estabilidad de esta muestra ha sido declarada por el fabricante.
             `, new Txt(`Confidencialidad:`).bold().end, ` El informe presentado a continuación presenta información de caracter confidencia; la divulgación del mismo se realiza únicamente con el participante al cual corresponde; en caso que alguna autoridad requiera la socialización del mismo, esta solo se realiza con autorización expresa del participante.
             `, new Txt(`Subcontratación:`).bold().end, ` Annar Health Technologies no realiza la subcontratación de actividades relacionadas con la planificación, análisis y emisión de los reportes de resultados relacionados con los reportes de control de calidad externo.
             `, new Txt(`Autorizado por:`).bold().end, ` Leydy Paola González, Especialista de producto.
             `]).end
          ]).margin([30, 0]).end : ''
        ]).end
      });
    })

    return newArray
  }

  pdf2Reporte2(informacionTabla: TablaAnalitos[]) {
    this.itemSeleccionado = 5;
    setTimeout(async () => {
      PdfMakeWrapper.setFonts(pdfFonts);
      const pdf = new PdfMakeWrapper();
      pdf.pageSize('B4');
      pdf.pageMargins([5, 250, 30, 50]);
      pdf.header(
        new Stack([
          new Canvas([
            new Line([298, 70], [300, 70]).lineWidth(200).lineColor('#6E6E6E').end,
          ]).absolutePosition(-50, 55).end,
          await new Img('assets/imagenes/headerPDF.png').relativePosition(0, 0).width(700).height(100).build(),
          await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(80, 40).build(),
          '\n',

          new Stack([
            new Columns([
              new Txt(`Cliente : ${this.clienteName}`).width(200).fontSize(11).end,
              new Txt(``).fontSize(11).end,
              new Txt(``).fontSize(11).end,
            ]).end
          ]).width(100).relativePosition(20, 140).end,
          // new Txt (`Cliente : ${this.clienteName} \nNit : ${this.clienteNit}\nDirección : ${this.clienteAddres}`).relativePosition(60,140).fontSize(11).end,
          new Stack([
            new Txt('Reporte de Analitos\nCuantitativos').margin([250, 0, 0, 20]).bold().fontSize(20).end
          ]).margin(20).end
        ]).width('100%').height('auto').alignment('left').end
      );

      pdf.add(this.iterarTablasCompletasAnlitos(informacionTabla).reduce((a, b) => a.concat(b), []));

      async function getBase64ImageFromUrl(imageUrl) {
        var res = await fetch(imageUrl);
        var blob = await res.blob();

        return new Promise((resolve, reject) => {
          var reader = new FileReader();
          reader.addEventListener("load", function () {
            resolve(reader.result);
          }, false);

          reader.onerror = () => {
            return reject(this);
          };
          reader.readAsDataURL(blob);
        })
      }
      function footerFunc(img) {
        pdf.footer(function (page: any, pages: any) {
          return {
            // margin: [5, 0, 10, 0],
            height: 30,
            columns: [
              {
                alignment: "center",
                image: img,

                fit: [700, 100],
                absolutePosition: { x: 10, y: 10 }
              },
              {
                text: [
                  { text: 'Pag ' + page.toString() },
                  " - ",
                  { text: pages.toString() }
                ],
                color: 'white',
                fontSize: 8,
                absolutePosition: { x: 640, y: 38 }
              },

            ],

          }
        });
      }
      let base64Footer: any = '';
      await getBase64ImageFromUrl('assets/imagenes/footerPDF.png')
        .then(result => base64Footer = result)
        .catch(err => console.error(err));
      footerFunc(base64Footer);
      pdf.create().open();
      this.itemSeleccionado = -1;
    }, 3000);
  }


  activarTodos(event: any) {

    if (this.jsonResumenMuestra.DataAnalytes.length) {
      this.listAnalytesReport.forEach((item) => {
        let current = 'analyte_' + item.idAnalytes;
        this.formSystem.get(current).setValue("")
        this.formSystem.get(current).disable()
        item.isSelect = false;
      });
    }



    if (event.checked) {
      this.allAnalytes = event.checked;
      this.jsonResumenMuestra = {
        Idprogram: this.formaCuantitativo.value.programa,
        IdAnalytes: this.formaCuantitativo.value.analyte.join(),
        Nroround: this.formaCuantitativo.value.ronda,
        Idclient: this.formaCuantitativo.value.idclient,
        Idsede: this.formaCuantitativo.value.idsede,
        IdSample: this.listAnalytesReport[0].idSample,
        dataGenerate: this.formaCuantitativo.value.dataGenerate,
        DataAnalytes: [
          {
            IdAnalytes: -1,
            statisticalGeneral: ""
          }
        ],
      }

    } else {
      this.jsonResumenMuestra.DataAnalytes = []
      this.sistema.setValue("")
      this.allAnalytes = event.checked;
    }

  }



  traerAnaltos(event: any) {
    let valorSeleccionado;
    if (event.isUserInput) {
      valorSeleccionado = event.source.value;

    }
    this.listAnalytesReport = this.respuestaBusqueda[0].Data
                                  .filter(e => e.serialSample == valorSeleccionado)
                                  .map(e => {
                                    e.isSelect = false;
                                    return e
                                  });
    console.log(this.listAnalytesReport);
    
    this.allAnalytes = false;
    this.dataSource = new MatTableDataSource<any>(this.listAnalytesReport);
    this.crearFormularioTabla();
  }


  crearFormularioTabla() {

    this.formSystem = this.fb.group({});
    this.listAnalytesReport.forEach((item) => {
      let current = 'analyte_' + item.idAnalytes;
      this.formSystem.addControl(current, new FormControl(''));
      this.formSystem.get(current).disable()
    });
  }

  limpiarFormulario(borrar: boolean) {
    if (!borrar) {
      this.listAnalytesReport.forEach((item) => {
        let current = 'analyte_' + item.idAnalytes;
        this.formSystem.get(current).setValue("");
        this.formSystem.get(current).disable();
      });
    }
  }

  AgregarAnalito(event: any, analito, id) {
    let item = this.listAnalytesReport.find(e => e.idAnalytes == id)
    if (item) {
      item.isSelect = event
    }
    let current = 'analyte_' + id;
    if (event) {
      this.formSystem.get(current).enable()
      this.formSystem.get(current).setValue("")
      if (this.jsonResumenMuestra.Idprogram) {
        if (this.jsonResumenMuestra.DataAnalytes && this.jsonResumenMuestra.DataAnalytes.length) {
          this.jsonResumenMuestra.DataAnalytes.push({
            IdAnalytes: id,
            statisticalGeneral: ""
          })
        } else {
          this.jsonResumenMuestra.DataAnalytes = [{
            IdAnalytes: id,
            statisticalGeneral: ""
          }]
        }
      } else {
        this.jsonResumenMuestra = {
          Idprogram: this.formaCuantitativo.value.programa,
          IdAnalytes: this.formaCuantitativo.value.analyte.join(),
          Nroround: this.formaCuantitativo.value.ronda,
          Idclient: this.formaCuantitativo.value.idclient,
          Idsede: this.formaCuantitativo.value.idsede,
          IdSample: this.listAnalytesReport[0].idSample,
        }
        if (this.jsonResumenMuestra.DataAnalytes && this.jsonResumenMuestra.DataAnalytes.length) {
          this.jsonResumenMuestra.DataAnalytes.push({
            IdAnalytes: id,
            statisticalGeneral: ""
          })
        } else {
          this.jsonResumenMuestra.DataAnalytes = [{
            IdAnalytes: id,
            statisticalGeneral: ""
          }]
        }
      }
    } else {
      this.jsonResumenMuestra.DataAnalytes = this.jsonResumenMuestra.DataAnalytes.filter(s => s.IdAnalytes != id)
      this.formSystem.get(current).disable()
      this.formSystem.get(current).setValue("")
    }
  }


  reiniciarAnalitos() {
    this.formaSelecionMuestra.reset()
    this.jsonResumenMuestra.DataAnalytes = [];
    this.allAnalytes = false;
  }


  selectSistema(event: any) {

    if (this.jsonResumenMuestra.DataAnalytes && this.jsonResumenMuestra.DataAnalytes.length) {
      let item = this.jsonResumenMuestra.DataAnalytes.find(e => e.IdAnalytes == -1)
      if (item) {
        item.statisticalGeneral = event.value
      }
    }
  }

  selectSistemInInput(value: any, id: any) {

    let item = this.jsonResumenMuestra.DataAnalytes.find(e => e.IdAnalytes == id)
    if (item) {
      item.statisticalGeneral = value;
    }
  }

}

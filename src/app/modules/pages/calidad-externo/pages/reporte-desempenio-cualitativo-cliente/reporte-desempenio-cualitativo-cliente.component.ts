import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import $ from 'jquery';
import { ProgramConfClientHeaderqQceService } from '@app/services/calidad-externo/program-conf-client-headerq-qce.service';
import { RondasQceService } from '@app/services/configuracion/rondas-qce.service';
import { LotesQceService } from '@app/services/calidad-externo/lotsQce.service';
import { AnalytesQceService } from '@app/services/calidad-externo/AnalytesQce.service';
import { SampleQceService } from '@app/services/calidad-externo/SampleQce.service';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import * as echarts from 'echarts';
import { PdfService } from '@app/services/pdfs/pdf.service';

@Component({
  selector: 'app-reporte-desempenio-cualitativo-cliente',
  templateUrl: './reporte-desempenio-cualitativo-cliente.component.html',
  styleUrls: ['./reporte-desempenio-cualitativo-cliente.component.css']
})
export class ReporteDesempenioCualitativoClienteComponent implements OnInit {
  @ViewChild('item_2') item_2: ElementRef;
  @ViewChild('item_3') item_3: ElementRef;
  @ViewChild('item_4') item_4: ElementRef;



  //predictivos
  filteredOptionsProgram: Observable<string[]>;
  listprogram: any = [];
  filteredOptionsRonda: Observable<string[]>;
  listRonda: any;
  filteredOptionsLote: Observable<string[]>;
  listLote: any;
  filteredOptionsSample: Observable<string[]>;
  listSample: any;
  filteredOptionsAnalito: Observable<string[]>;
  listAnalito: any;

  rondas: any;
  interpretacion = [
    {
      value: 'Verdadero positivo',
      puntuacion: '0'
    },
    {
      value: 'Verdadero negativo',
      puntuacion: '0'
    },
    {
      value: 'Intermedio',
      puntuacion: '0'
    },
    {
      value: 'Falso positivo',
      puntuacion: '6'
    },
    {
      value: 'Falso negativo',
      puntuacion: '-10'
    },
  ]
  formulario: FormGroup = this.fb.group({
    idProgram: ['', [Validators.required]],
    idRonda: ['', [Validators.required]],
    idMuestra: ['', [Validators.required]],
    idAnalito: [''],
  });
  analitos: any = [{
    Idanalytes: 1,
    Desanalytes: 'Prueba'
  }];
  @ViewChild('scroll') scroll: ElementRef;
  graficasBase64: any = {
    barras: [],
    torta: [],
    lineas: []
  };
  score = ['-10', '6', '0', '2', '0'];
  analites: any = [];
  indexSelect = 0;
  verInfo: boolean = false;
  lotes: any;
  Muestras: any;
  programaSeleccionado: any;
  rondaSeleccionada: any;
  loteSeleccionado: any;
  muestraSeleccionado: any;
  analytes: any;
  analitoSeleccionado: any;
  datosFiltro: any;
  idClient: any;
  imgFilter = [
    {
      id: 1,
      img: 'btn_ensayo.png'
    },
    {
      id: 2,
      img: 'btn_world.png'
    },
    {
      id: 3,
      img: 'btn_consenso.png'
    },
    {
      id: 4,
      img: 'btn_puntiacion.png'
    },
  ]
  itemSelected: number = 1;
  canvas: any;
  // @ViewChild("chart") chart: ChartComponent;
  EChartsOption = echarts;
  chartDom: any;
  datosGraf: any;
  verInterpret: boolean;
  showOverlay: boolean = false;
  arrValueX: any = [];
  dataSeriesX: any = [];
  graficaSelect: any = 2;

  // public chartOptions: Partial<ChartOptions>;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private translate: TranslateService,
    private programConfClientHeaderqQceService: ProgramConfClientHeaderqQceService,
    private rondasQceService: RondasQceService,
    private laboratoriosService: LaboratoriosService,
    private lotesQceService: LotesQceService,
    private analytesQceService: AnalytesQceService,
    private SampleQceService: SampleQceService,
    private pdfService: PdfService
  ) { }

  ngOnInit(): void {
    this.getProgram();
  }

  getCoord(item) {
    if (item.resultClientInterpretation === 'VP') return [0, 0]
    if (item.resultClientInterpretation === 'VN') return [1, 0]
    if (item.resultClientInterpretation === 'FP') return [2, 0]
    if (item.resultClientInterpretation === 'FN') return [3, 0]
  }


  async graficaBarras(it?) {
    this.itemSelected = 2;
    $("#key_2").show();
    this.graficasBase64.barras = [];

    setTimeout(async () => {
      for (let index = 0; index < this.datosGraf.length; index++) {
        let chartDom = echarts.init(document.getElementById('chart' + index));

        const option = {
          title: {
            left: 'left',
            text:'N°'+(index+1) + ' - ' + this.datosFiltro.analytesList.filter(x => x.idAnalite === this.datosGraf[index].idAnalit)[0].desAnalytes
          },
          xAxis: {
            type: 'category',
            data: ['VP', 'VN', 'FP', 'FN']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              color: 'black',
              markPoint: {
                data: [
                  {
                    coord: this.getCoord(this.datosGraf[index]),
                    symbol: 'triangle',
                    y: '91%',
                    symbolSize: 20,
                  }
                ]
              },
              data: [
                {
                  value: this.datosGraf[index].tvp,
                  label: {
                    show: true,
                    position: 'inside'
                  },
                  itemStyle: {
                    color: '#3850EB',
                    decal: this.datosGraf[index].resultClientInterpretation === 'VP' ? {
                      symbol: 'arrow',
                      symbolSize: 2,
                      symbolKeepAspect: true,
                      symbolOffset: [2, 2],
                      color: '#3850EB',
                      resultCLient: 'VP'
                    } : ''
                  }
                },
                {
                  value: this.datosGraf[index].tvn,
                  label: {
                    show: true,
                    position: 'inside'
                  },
                  itemStyle: {
                    color: '#28a745',
                    decal: this.datosGraf[index].resultClientInterpretation === 'VN' ? {
                      symbol: 'arrow',
                      symbolSize: 2,
                      symbolKeepAspect: true,
                      symbolOffset: [2, 2],
                      color: '#28a745'
                    } : ''
                  }
                },
                {
                  value: this.datosGraf[index].tfp,
                  label: {
                    show: true,
                    position: 'inside'
                  },
                  itemStyle: {
                    color: '#ffc107',
                    decal: this.datosGraf[index].resultClientInterpretation === 'FP' ? {
                      symbol: 'arrow',
                      symbolSize: 2,
                      symbolKeepAspect: true,
                      symbolOffset: [2, 2],
                      color: '#ffc107'
                    } : ''
                  }
                },
                {
                  value: this.datosGraf[index].tfn,
                  label: {
                    show: true,
                    position: 'inside'
                  },
                  itemStyle: {
                    color: '#dc3545',
                    decal: this.datosGraf[index].resultClientInterpretation === 'FN' ? {
                      symbol: 'arrow',
                      symbolSize: 2,
                      symbolKeepAspect: true,
                      symbolOffset: [2, 2],
                      color: '#dc3545'
                    } : ''
                  }
                }],
              type: 'bar',
            }
          ]
        };
        chartDom.setOption(option);
        await new Promise((res, e) => {
          chartDom.on('finished', () => {
            res(this.graficasBase64.barras[index] = chartDom.getDataURL())
          });
        });
      }
      if (it === 1) {
        this.graficaSelect = 3;
        this.cargarGraficas();
      }
    }, 500);
  }


  async graficaTorta(it?) {
    this.graficasBase64.torta = [];
    this.itemSelected = 3;
    $("#key_3").show();
    setTimeout(async () => {
      for (let index = 0; index < this.datosGraf.length; index++) {
        let chartDom = echarts.init(document.getElementById('chartTorta' + index));

        const option = {
          title: {
            left: 'left',
            text:'N°'+(index+1)  + ' - ' + this.datosFiltro.analytesList.filter(x => x.idAnalite === this.datosGraf[index].idAnalit)[0].desAnalytes
          },
          legend: {
            top: 'bottom'
          },
          series: [
            {
              name: 'Access From',
              type: 'pie',
              radius: '50%',
              label: {
                formatter: function (data) {
                  return `${Math.round(data.percent * 10) / 10}%`
                },
                backgroundColor: '#FFF',
                borderColor: '#FFF',
                borderWidth: 1,
                borderRadius: 2,
                outerWidth: 20,
                rich: {
                  per: {
                    color: '#3A49A5',
                    backgroundColor: '#FFF',
                    padding: [2, 0],
                    with: [20, 20],
                    borderRadius: 0
                  }
                }
              },
              data: [
                { value: this.datosGraf[index].pvp, name: 'VP' },
                { value: this.datosGraf[index].pvn, name: 'VN' },
                { value: this.datosGraf[index].pfp, name: 'FP' },
                { value: this.datosGraf[index].pfn, name: 'FN' },
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };

        await new Promise((res, e) => {
          chartDom.on('rendered', () => res(this.graficasBase64.torta[index] = chartDom.getDataURL()));
          chartDom.setOption(option);
        })
      }
      if (it === 1) {
        this.graficaSelect = 4;
        this.cargarGraficas();
      }
    }, 500);
  }

  async graficaLineas(it?) {
    this.itemSelected = 4;
    this.arrValueX = [];
    this.dataSeriesX = [];
    $("#key_4").show();
    setTimeout(async () => {
      this.chartDom = echarts.init(document.getElementById('chartLine'));
      for (let index = 0; index < this.datosFiltro.reactivoValueList.length; index++) {
        this.arrValueX.push(index + 1)
        this.dataSeriesX.push(this.valorSccore(this.datosFiltro.reactivoValueList[index]));
      }
      const option = {
        xAxis: {
          type: 'category',
          data: this.arrValueX
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.dataSeriesX,
            type: 'line'
          }
        ]
      };

      this.chartDom.setOption(option);
      await new Promise((res, e) => {
        this.chartDom.on('rendered', () => res(this.graficasBase64.lineas = this.chartDom.getDataURL()));
      })
      if (it === 1) {
        this.reportePDF();
      }
    }, 500);

  }

  private _filterProgramsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listprogram.filter(result => result.desprogram.toLowerCase().includes(filterValue));
  }

  private _filterRondasCreate(value: string): string[] {
    const filterValue = value;
    return this.rondas;
  }

  private _filterLotesCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.lotes.filter(result => result.numlot.includes(filterValue));
  }

  private _filterMuestrasCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.Muestras.filter(result => result.Serialsample.includes(filterValue));
  }

  private _filterAnalitosCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.analitos.filter(result => result.desanalytes.includes(filterValue));
  }

  async getProgram() {
    this.laboratoriosService.getAllAsync().then(async lab => {
      await this.programConfClientHeaderqQceService.getProgramReportCualiCl(lab[0].nit, Number(sessionStorage.getItem('sede'))).then(data => {

        this.listprogram = data;
        this.listprogram.sort((a: any, b: any) => {
          a.desprogram = a.desprogram.charAt(0) + a.desprogram.slice(1);
          b.desprogram = b.desprogram.charAt(0) + b.desprogram.slice(1);
        })

        this.listprogram.sort((a: any, b: any) => {
          if (a.desprogram < b.desprogram) return -1;
          if (a.desprogram > b.desprogram) return 1;
          return 0;
        })

        this.filteredOptionsProgram = this.formulario.get('idProgram').valueChanges.pipe(
          startWith(''),
          map(value => {
            return this._filterProgramsCreate(value)
          }),
        );
      }, _ => {
        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYPROGRAMAS'));
      });
    });
  }


  selectRonda(programa) {
    this.programaSeleccionado = programa;
    this.idClient = this.listprogram.find((x: any) => x.idProgram === programa);
    this.rondasQceService.getRoundReportCualiCl(programa, this.idClient.idClient).then((datos: any) => {
      this.rondas = datos;
      this.filteredOptionsRonda = this.formulario.get('idRonda').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterRondasCreate(value)
        }),
      );
    }, _ => {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    });
  }


  selectLote(nroround) {
    this.rondaSeleccionada = nroround;
    this.lotesQceService.getLotReportCualiCl(Number(this.programaSeleccionado), nroround, this.idClient.idClient).then((datos: any) => {
      this.lotes = datos;
      this.filteredOptionsLote = this.formulario.get('idLote').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterLotesCreate(value)
        }),
      );
    }, _ => {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    });
  }

  //filtro de muestras por ronda-programa
  selectSample(nroround) {
    this.rondaSeleccionada = nroround;
    this.SampleQceService.getSamplesByClienteReport(this.idClient.idClient, Number(sessionStorage.getItem('sede')), Number(this.programaSeleccionado), nroround).then((datos: any) => {
      this.Muestras = datos;
      this.filteredOptionsSample = this.formulario.get('idMuestra').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterMuestrasCreate(value)
        }),
      );
    }, _ => {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    });
  }

  // selectAnalito(lote) {
  //   this.loteSeleccionado = lote;
  //   this.analytesQceService.getAnalytesReportCualiCl(Number(this.programaSeleccionado), this.rondaSeleccionada, lote,this.idClient.idClient).then((datos: any) => {
  //     this.analytes = datos;
  //   }, _ => {
  //     this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
  //   });
  // }

  selectAnalito(muestra) {
    this.muestraSeleccionado = muestra;
    this.analytesQceService.getAnalytesReportCualiClxsamples(Number(this.programaSeleccionado), this.rondaSeleccionada, muestra, this.idClient.idClient).then((datos: any) => {
      this.analytes = datos;
    }, _ => {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    });
  }

  selectNone(control: string) {
    this.formulario.get(control).setValue('');
  }
  selectAll(control: string) {
    this.formulario.get(control).setValue(['-1']);
  }

  selectOne(control: string) {
    if (this.formulario.get(control).value[0] == '-1' || this.formulario.get(control).value[0] == '') {
      this.formulario.get(control).value.shift();
      this.formulario.get(control).setValue(this.formulario.get(control).value);
    }
  }

  get idProgramNoValido() {
    return this.formulario.get('idProgram');
  }
  get idRondaNoValido() {
    return this.formulario.get('idRonda');
  }
  get idmuestraNoValido() {
    return this.formulario.get('idMuestra');
  }
  get idAnalitoNoValido() {
    return this.formulario.get('idAnalito');
  }



  buscar() {
    if (this.formulario.valid) {
      const obj = {
        "IdProgram": Number(this.programaSeleccionado),
        "NRound": Number(this.rondaSeleccionada),
        //"IdLot": [ Number(this.loteSeleccionado) ],
        "IdSample": [Number(this.muestraSeleccionado)],
        "IdAnalytes": this.formulario.value.idAnalito == "" ? [] : this.formulario.value.idAnalito,
        "IdClient": this.idClient.idClient,
        "idSede": Number(sessionStorage.getItem('sede')),
      }
      this.programConfClientHeaderqQceService.performanceReportCualiCl(obj).then(r => {

        if (r.analytesList.length > 0) {
          this.datosFiltro = r;
          this.datosGraf = this.datosFiltro.reactivoValueList;
          console.log( this.datosGraf);
          
          this.analitoSeleccionado = this.datosFiltro.analytesList[0];
          // console.log('report', this.datosFiltro);
          this.verInfo = true;
        } else {
          this.verInfo = false;
          this.toastr.info('No se encontraron resultados para esta búsqueda');
        }
      }).catch(err => {
        console.log(err);
        this.toastr.info('No se encontraron resultados para esta búsqueda');
      });
    } else {
      this.toastr.info('Debe ingresar los datos solicitados');
    }
  }


  scrollCards(flow: number): void {
    this.scroll.nativeElement.scrollLeft += (136.1 * flow);
  }

  buscarAnalitos(_analito: string, btnSecc: any, i: any) {
    this.analitoSeleccionado = _analito;
    this.indexSelect = Number(i);
  }


  selecItem(img) {
    this.itemSelected = img.id;
    switch (img.id) {
      case 2:
        setTimeout(() => {
          this.graficaBarras();
        }, 100);
        break;
      case 3:
        setTimeout(() => {
          this.graficaTorta();
        }, 100);
        break;
      case 4:
        setTimeout(() => {
          this.graficaLineas();
        }, 100);
        break;
    }
  }

  interpretar() {
    this.verInterpret = !this.verInterpret;
    this.verInterpret ? $('#info').removeClass('infoOut') : $('#info').addClass('infoOut');
  }

  valorSccore(item) {
    if (item.tvp == 1) return '0';
    if (item.tvn == 1) return '0';
    if (item.ti == 1) return '0';
    if (item.tfp == 1) return '6';
    if (item.tfn == 1) return '-10';
  }

  cargarGraficas() {
    this.showOverlay = true;
    if (this.graficaSelect == 2) {
      this.graficaBarras(1);
    } else if (this.graficaSelect == 3) {
      this.graficaTorta(1);
    } else if (this.graficaSelect == 4) {
      this.graficaLineas(1);
    }
  }

  async reportePDF() {
    var date = new Date();
    const formatDate = (date) => {
      let formatted_date = date.getDate() + " / " + (date.getMonth() + 1) + " / " + date.getFullYear()
      return formatted_date;
    }
    let puntuacion = [];

    for (let index = 0; index < this.datosFiltro.reactivoValueList.length; index++) {
      puntuacion.push({ cod: this.datosFiltro.reactivoValueList[index].sample, dev: this.valorSccore(this.datosFiltro.reactivoValueList[index]) });
    }
    let infoCabecera = {
      deteccion: this.analitoSeleccionado.desAnalytes,
      metodologia: this.datosFiltro.nameMethod,
      fechaD: formatDate(date),
      ronda: this.formulario.get('idRonda').value,
      codLab: this.datosFiltro.codclient,
      programa: this.formulario.get('idProgram').value,
      analito:''
    }
    let displayedColumns = ['N°', 'N', 'VP', 'VN', 'FN', 'FP', 'I', 'Consenso', 'Resultado', '%C (%concordancia)', 'Desempeño'];
    let displayedColumns2 = ['Resultado total concordancia %', 'Desempeño global'];
    let headPuntuacion = ['Código control', '(%DEV)'];

    let dataTotal = [
      {
        desempeGlobal: this.datosFiltro.desempeGlobal,
        resultConcor: this.datosFiltro.resultConcor,
      }
    ]
    await this.pdfService.PdfPlantillaCualiCliente(this.graficasBase64, displayedColumns, this.datosFiltro.reactivoValueList, displayedColumns2, dataTotal, headPuntuacion, puntuacion, infoCabecera).then(_ => { })
    this.graficaSelect = 2;
    this.itemSelected = 1;
    setTimeout(() => {
      this.showOverlay = false;
    }, 5000);
  }
}

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

import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import * as echarts from 'echarts';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';
import { PdfService } from '@app/services/pdfs/pdf.service';
import { element } from 'protractor';
import { PdfSemicualitativoService } from '@app/services/pdfs/pdf-semicualitativo.service';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-reporte-semicuantitativo',
  templateUrl: './reporte-semicuantitativo.component.html',
  styleUrls: ['./reporte-semicuantitativo.component.css']
})
export class ReporteSemicuantitativoComponent implements OnInit {
  @ViewChild('item_2') item_2: ElementRef;
  @ViewChild('item_3') item_3: ElementRef;
  @ViewChild('item_4') item_4: ElementRef;

  @ViewChild('scroll') scroll: ElementRef;

  //predictivos
  filteredOptionsProgram: Observable<string[]>;
  listprogram: any = [];
  filteredOptionsRonda: Observable<string[]>;
  listRonda: any;
  filteredOptionsLote: Observable<string[]>;
  listLote: any;
  filteredOptionsAnalito: Observable<string[]>;
  listAnalito: any;

  arrGraficasUno:echarts.EChartsCoreOption[] = [];
  arrGraficasDos:echarts.EChartsCoreOption[] = [];
  arrGraficasTres:echarts.EChartsCoreOption[][] = [];
  arrGraficasCuatro:echarts.EChartsCoreOption[][] = [];
  arrImgGraficasUno: any[] = [];
  arrImgGraficasDos: any[] = [];
  arrImgGraficasTres: any[] = [];
  arrImgGraficasCuatro: any[] = [];

  formulario: FormGroup = this.fb.group({
    idProgram: ['', [Validators.required]],
    idRonda: ['', [Validators.required]],
    idLote: ['', [Validators.required]],
    idAnalito: [''],
  });

  graficasBase64: any = {
    cont1: [],
    cont2: [],
    cont3: {
      graf1: '',
      graf2: []
    },
    cont4: {
      graf1: '',
      graf2: []
    }
  };
  rondas: any;
  indexSelect = 0;
  verInfo: boolean = false;
  lotes: any;
  programaSeleccionado: any;
  rondaSeleccionada: any;
  loteSeleccionado: any;
  analytes: any = [];
  analitoSeleccionado: any;
  datosFiltro: any[] = [];
  listaCliente: any;
  idClient: any;
  imgFilter = [
    {
      id: 1,
      img: 'btn_ensayo.png'
    },
    {
      id: 2,
      img: 'btn_iconStar.png'
    },
    {
      id: 3,
      img: 'btn_graficaConcord.png'
    },
    {
      id: 4,
      img: 'btn_consenso.png'
    },
  ]
  itemSelected: number = 1;
  datosGraf: any;
  verInterpret: boolean;
  arrValueX: any = [];
  dataSeriesX: any = [];
  graficaSelect: any = 2;
  dataTablaEstGenMet: any = [];
  dataTablaEstGen: any = [];
  headersTabla: any = [];
  dataGrafEstGenMetVal: any = [];
  dataGrafEstGenVal: any = [];
  dataAnalitoTblConcord: { idAnalytes: number; desAnalytes: string; Muestras: { samples: string; total: number; aceptados: number; rechazados: number; acepPorcentaje: any; recPorcentaje: string; }[]; GraficaGeneral: { aceptado: any; rechazado: string; }[]; };
  arrDataGraf2: any = [];
  dataConcordancia: any;
  dataFinCiclo: any;
  showOverlay: boolean = false;


  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private translate: TranslateService,
    private programConfClientHeaderqQceService: ProgramConfClientHeaderqQceService,
    private rondasQceService: RondasQceService,
    private laboratoriosService: LaboratoriosService,
    private lotesQceService: LotesQceService,
    private analytesQceService: AnalytesQceService,
    private pdfSemicualitativoService: PdfSemicualitativoService
  ) { }

  ngOnInit(): void {
    this.getProgram();
  }


  get idProgramNoValido() {
    return this.formulario.get('idProgram');
  }
  get idRondaNoValido() {
    return this.formulario.get('idRonda');
  }
  get idLoteNoValido() {
    return this.formulario.get('idLote');
  }
  get idAnalitoNoValido() {
    return this.formulario.get('idAnalito');
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

  private _filterAnalitosCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.analytes.filter(result => result.desanalytes.includes(filterValue));
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


  async getProgram() {
    this.laboratoriosService.getAllAsync().then(async lab => {
      await this.programConfClientHeaderqQceService.programReportSemiCualiCl(lab[0].nit, Number(sessionStorage.getItem('sede'))).then(data => {

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

  selectAnalito(lote) {
    this.loteSeleccionado = lote;
    this.analytesQceService.getAnalytesReportCualiCl(Number(this.programaSeleccionado), this.rondaSeleccionada, lote, this.idClient.idClient).then((datos: any) => {
      this.analytes = datos;
    }, _ => {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    });
  }


  buscar() {
    if (this.formulario.valid) {
      const obj =
      // { "IdProgram":43, "NRound":1, "IdLot": [70],  "IdAnalytes": [], "IdSede":5, "IdClient":29 }
      {
        "IdProgram": Number(this.programaSeleccionado),
        "NRound": Number(this.rondaSeleccionada),
        "IdLot": [Number(this.loteSeleccionado)],
        "IdAnalytes": this.formulario.value.idAnalito == "" ? [] : this.formulario.value.idAnalito,
        "IdClient": this.idClient.idClient,
        "idSede": Number(sessionStorage.getItem('sede')),
      }

      this.programConfClientHeaderqQceService.performanceReportSemiCualiCl(obj).then(r => {
        if (r.modelo1.length > 0) {
          this.programConfClientHeaderqQceService.ConcordancePlots(obj).then(resp => {
            this.programConfClientHeaderqQceService.endOfCycle(obj).then(response => {
              for (let item of r.modelo1) {
                item.tables = item.tables.filter((x: any) => x.idAnalytes === item.idAnalytes);
                for (let key of item.tables) {
                  if (key.results == key.valueAsing) {
                    key.score = '10';
                  } else {
                    key.score = '0';
                  }
                }
              }
              this.dataFinCiclo = response;
              this.dataConcordancia = resp;
              this.datosFiltro = r.modelo1;
              this.listaCliente = r.modelo2;
              this.buscarAnalitos(this.datosFiltro[0], 0,null,false);
              this.verInfo = true;
            });
          });
        } else {
          this.verInfo = false;
          this.toastr.info('No se encontraron resultados para esta búsqueda');
        }
      }).catch(err => {
        this.toastr.info('No se encontraron resultados para esta búsqueda');
      });
    } else {
      this.toastr.info('Debe ingresar los datos solicitados');
    }
  }


  scrollCards(flow: number): void {
    this.scroll.nativeElement.scrollLeft += (136.1 * flow);
  }

  async buscarAnalitos(_analito: string, i?: any, btnSecc?: any, flagConsolidado: boolean = false) {
    this.analitoSeleccionado = _analito;
    this.tablaEstGen(_analito);
    this.indexSelect = Number(i);

    let analito = this.dataConcordancia[0].analytes;
    this.dataAnalitoTblConcord = analito.find(x => x.idAnalytes === this.analitoSeleccionado.idAnalite);
    this.arrDataGraf2 = this.dataAnalitoTblConcord.Muestras;
    flagConsolidado ? await this.graficaCont1(i, 1, true) : await this.graficaCont1(1);
  }

  tablaEstGen(analito: any) {
    let arrXmethod = this.listaCliente.filter(x => x.idMethod === analito.idMethod);
    this.headersTabla = [];
    this.dataTablaEstGenMet = [];
    this.dataTablaEstGen = [];
    this.dataGrafEstGenMetVal = [];
    this.dataGrafEstGenVal = [];
    for (let item of analito.results) {
      this.headersTabla.push(item.results);
      let arrXresult = arrXmethod.filter(x => x.result === item.results);
      let arrXresultGen = this.listaCliente.filter(x => x.result === item.results);
      this.dataTablaEstGenMet.push(arrXresult);
      this.dataGrafEstGenMetVal.push(arrXresult.length);
      this.dataTablaEstGen.push(arrXresultGen);
      this.dataGrafEstGenVal.push(arrXresultGen.length);
    }
  }

  selecItem(img) {
    switch (img.id) {
      case 1:
        setTimeout(() => {
          this.graficaCont1(img.id);
        }, 100);
        break;
      case 2:
        setTimeout(() => {
          this.graficaCont2(img.id);
        }, 100);
        break;
      case 3:
        setTimeout(() => {
          this.graficaCont3(img.id);
        }, 100);
        break;
      case 4:
        setTimeout(() => {
          this.graficaCont4(img.id);
        }, 100);
        break;
    }
  }

  calcProm(data) {
    let score = 0;
    for (let item of data) {
      score += Number(item.score)
    }
    return score / data.length;
  }


  async graficaCont1(contSelect, it?: any, consolidado: boolean = false) {
    if (!consolidado) {
      this.itemSelected = contSelect;
      $("#key_1").show();
      this.graficasBase64.cont1 = [];
    }

    const option = {
      title: {
        text: 'Histograma'
      },
      xAxis: [
        {
          type: 'category',
          data: this.headersTabla,
          axisPointer: {
            type: 'shadow'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
        }
      ],
      grid: {
        top: 'center',
        height: 110,
      },
      series: [
        {
          barWidth: '20%',
          name: '',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              return value;
            }
          },
          data: this.dataGrafEstGenMetVal
        },
        {
          barWidth: '20%',
          name: '',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              return value;
            }
          },
          data: this.dataGrafEstGenVal
        }
      ]
    };
    this.arrGraficasUno.push({ ...option });
    setTimeout(async () => {

      let chartDom;
      if (!consolidado) {
        $("#graf1").css('width', '50em');
        chartDom = echarts.init(document.getElementById('graf1'));
        chartDom.setOption(option);
        console.log(option);
        
        await new Promise((res, e) => {
          chartDom.on('rendered', () => {
            res(this.graficasBase64.cont1 = chartDom.getDataURL())
          });
        });
      }
      if (it === 1) {
        this.graficaSelect = 2;
        this.cargarGraficas(consolidado);
      }
    }, 500);

  }
  
  async graficaCont2(contSelect, it?: any, consolidado: boolean = false) {
    if (!consolidado) {
      this.itemSelected = contSelect;
    }
    this.graficasBase64.cont2 = [];

    var results = this.datosFiltro[this.indexSelect].results;
    var header = [];
    var value = [];
    var tables = this.datosFiltro[this.indexSelect].tables;

    for (let item of this.datosFiltro[this.indexSelect].tables) {
      header.push(item.serialSample);
      value.push(item.order);
      $("#key_2").show();
    }
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function (data) {
          var resultado = tables.find(x => x.serialSample == data[0].axisValue);
          var muestra = data[0].axisValue;
          return '<b>Resultado:</b> ' + resultado.results + '<br>' + '<b>Muestra:</b> ' + muestra;
        }
      },
      xAxis: {
        type: 'category',
        data: header
      },
      yAxis: {
        type: 'value',
        show: true,
        axisLabel: {
          fontWeight: 'bold',
          formatter: function (params) {
            let item = results.find(x => x.order == params);
            return item == undefined ? '' : item.results;
          }
        }
      },
      grid: {
        top: 'center',
        height: 100,
        left: 100,
        right: 20
      },
      series: [
        {
          name: 'Resultado',
          data: value,
          type: 'line'
        }
      ]
    };
    this.arrGraficasDos.push({ ...option });
    setTimeout(async () => {

      let chartDom;
      if (!consolidado) {
        chartDom = echarts.init(document.getElementById('graf2'));
      }
      if (chartDom) {
        chartDom.setOption(option);
        await new Promise((res, e) => {
          chartDom.on('rendered', () => res(this.graficasBase64.cont2[0]=chartDom.getDataURL()));
        })
      }
      if (it === 1) {
        this.graficaSelect = 3;
        this.cargarGraficas(consolidado);
      }
    }, 700);

  }

  async graficaCont3(contSelect, it?: any, consolidado: boolean = false) {
    let dataGraf1 = this.dataAnalitoTblConcord.GraficaGeneral[0];
    let arrOpcionesConsolidadas:echarts.EChartsCoreOption[] = [];
    this.graficasBase64.cont3.graf1 = '';
    this.graficasBase64.cont3.graf2 = [];
    if (!consolidado) {
      this.itemSelected = contSelect;
      $("#key_3").show();
    }

    const option = {
      dataset: {
        source: [
          ['score', 'product'],
          [dataGraf1.rechazado, 'Rechazados'],
          [dataGraf1.aceptado, 'Aceptados'],
        ]
      },
      grid: { containLabel: true },
      xAxis: { name: '' },
      yAxis: { type: 'category' },

      series: [
        {
          type: 'bar',
          encode: {
            // Map the "amount" column to X axis.
            x: 'score',
            // Map the "product" column to Y axis
            y: 'product'
          }
        }
      ]
    };
    arrOpcionesConsolidadas.push(option);
    setTimeout(async () => {

      let chartDom;
      if (!consolidado) {
        chartDom = echarts.init(document.getElementById('graf3'));
      }

      if (chartDom) {
        chartDom.setOption(option);
        await new Promise((res, e) => {
          chartDom.on('rendered', () => res(this.graficasBase64.cont3.graf1  = chartDom.getDataURL()));
        })
      }
    }, 500);


    setTimeout(async () => {
      for (let index = 0; index < this.arrDataGraf2.length; index++) {
        let chartDom;
        if (!consolidado) {
          chartDom = echarts.init(document.getElementById('graf4' + index));
        }
        const option2 = {
          title: {
            subtext: 'Muestra: ' + this.arrDataGraf2[index].samples,
            left: 'center'
          },
          xAxis: {
            type: 'category',
            data: ['Concord', 'No Concord']
          },
          yAxis: {
            type: 'value'
          },
          grid: {
            top: '20%',
            left: '4%',
            right: '4%',
            bottom: '1%',
            containLabel: true
          },
          series: [
            {
              data: [
                {
                  value: this.arrDataGraf2[index].acepPorcentaje,
                  itemStyle: {
                    color: '#5C7BD9'
                  }
                },
                {
                  value: this.arrDataGraf2[index].recPorcentaje,
                  itemStyle: {
                    color: '#6B4B8B'
                  }
                }
              ],
              type: 'bar',
              barWidth: '40%',
            }
          ]
        };
        arrOpcionesConsolidadas.push(option2);

        if (chartDom) {
          chartDom.setOption(option2);
          await new Promise((res, e) => {
            chartDom.on('rendered', () => res(this.graficasBase64.cont3.graf2[index] = chartDom.getDataURL()));
          })
        }
      }
      this.arrGraficasTres.push([...arrOpcionesConsolidadas]);
      if (it === 1) {
        this.graficaSelect = 4;
        this.cargarGraficas(consolidado);
      }
    }, 500);
  }

  graficaCont4(contSelect, it?: any, consolidado: boolean = false) {
    if (!consolidado) {
      this.itemSelected = contSelect;
      $("#key_4").show();
    }
    let arrOpcionesConsolidadas = [];
    this.graficasBase64.cont4.graf1 = '';
    this.graficasBase64.cont4.graf2 = [];

    let maxData = 100;
    const option = {
      xAxis: {
        max: maxData,
        splitLine: { show: false },
        offset: 10,
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          margin: 0
        }
      },
      yAxis: {
        data: ['Concordancia'],
        inverse: true,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          margin: 10,
          color: '#999',
          fontSize: 16
        }
      },
      grid: {
        top: 'center',
        height: 50,
        left: 120,
        right: 50
      },
      series: [
        {
          // current data
          type: 'pictorialBar',
          symbolRepeat: 'fixed',
          symbolMargin: '5%',
          symbolClip: true,
          symbolSize: 17,
          symbolBoundingData: maxData,
          data: [this.dataFinCiclo.OverallGraph[0].aceptado],
          markLine: {
            symbol: 'none',
            label: {
              formatter: 'max: {c}',
              position: 'start'
            },
            lineStyle: {
              color: 'blue',
              type: 'dotted',
              opacity: 0.2,
              width: 2
            },
            data: [
              {
                type: 'max'
              }
            ]
          },
          z: 10
        },
        {
          // full data
          type: 'pictorialBar',
          animationDuration: 0,
          symbolRepeat: 'fixed',
          symbolMargin: '5%',
          symbolSize: 17,
          symbolBoundingData: maxData,
          data: [this.dataFinCiclo.OverallGraph[0].aceptado],
          color: 'gray',
          z: 5
        }
      ]
    };
    arrOpcionesConsolidadas.push(option);
    setTimeout(async () => {

      let chartDom;
      if (!consolidado) {
        chartDom = echarts.init(document.getElementById('graf5'));
      }
      if (chartDom) {
        chartDom.setOption(option);
        await new Promise((res, e) => {
          chartDom.on('rendered', () => res(this.graficasBase64.cont4.graf1 = chartDom.getDataURL()));
        })
      }
    }, 500);
    setTimeout(async () => {
      for (let index = 0; index < this.dataFinCiclo.samples.length; index++) {
        let chartDom;
        if (!consolidado) {
          chartDom = echarts.init(document.getElementById('graf6' + index));
        }
        const option2 = {
          title: {
            subtext: 'Muestra: ' + this.dataFinCiclo.samples[index].serialNumber,
            left: 'center'
          },
          xAxis: {
            type: 'category',
            data: ['Concord', 'No Concord']
          },
          yAxis: {
            type: 'value'
          },
          grid: {
            top: '20%',
            left: '4%',
            right: '4%',
            bottom: '1%',
            containLabel: true
          },
          series: [
            {
              data: [
                {
                  value: this.dataFinCiclo.samples[index].acepPorcentaje,
                  itemStyle: {
                    color: '#5C7BD9'
                  }
                },
                {
                  value: this.dataFinCiclo.samples[index].recPorcentaje,
                  itemStyle: {
                    color: '#6B4B8B'
                  }
                }
              ],
              type: 'bar',
              barWidth: '40%',
            }
          ]
        };

        arrOpcionesConsolidadas.push(option2);

        if (chartDom) {
          chartDom.setOption(option2);
          await new Promise((res, e) => {
            chartDom.on('rendered', () => res(this.graficasBase64.cont4.graf2[index] = chartDom.getDataURL()));
          })
        }
      }

      this.arrGraficasCuatro.push([...arrOpcionesConsolidadas]);
      if (it === 1) {
        !consolidado ? this.reportePDF() : '';
      }
    }, 500);
  }

  async cargarGraficas(flagConsolidado: boolean = false) {
    this.showOverlay = true;
    if (this.graficaSelect == 2) {
      await this.graficaCont2(2, 1, flagConsolidado);
    } else if (this.graficaSelect == 3) {
      await this.graficaCont3(3, 1, flagConsolidado);
    } else if (this.graficaSelect == 4) {
      this.graficaCont4(4, 1, flagConsolidado);
    }
  }

  async reportePDF() {
    var date = new Date();
    const formatDate = (date) => {
      let formatted_date = date.getDate() + " / " + (date.getMonth() + 1) + " / " + date.getFullYear()
      return formatted_date;
    }

    this.datosFiltro[this.indexSelect].tables.forEach((element, index) => {
      index == this.datosFiltro[this.indexSelect].tables.length - 1 ? element.prom = this.calcProm(this.datosFiltro[this.indexSelect].tables) : element.prom = 0
    });


    var objTblCont1: any = []
    for (let key of this.datosFiltro[this.indexSelect].results) {
      objTblCont1.push(key);
    }

    this.datosFiltro[this.indexSelect].results.forEach((element, index) => {
      objTblCont1[index].metodo = this.dataTablaEstGenMet[index].length;
      objTblCont1[index].totalResults = this.dataTablaEstGen[index].length;
    });

    let infoCabecera = {
      deteccion: this.analitoSeleccionado.desAnalytes,
      metodologia: this.analitoSeleccionado.desMethods,
      fechaD: formatDate(date),
    }

    const headerTBL = {
      headerTblCont1: ['Resultado', 'Por método', 'Todos los resultados'],
      headerTbl1Cont2: ['Sistema de medición', 'Reactivo', 'Analito', 'Unidades'],
      headerTbl2Cont2: ['Muestra', 'Resultado', 'Valor asignado', 'Score', 'Rms'],
      headerTblCont3: ['Control', 'N Datos', 'Aceptados', 'Rechazados', '% Aceptados', '% Rechazados'],
      headerTblCont4: ['Muestra', 'N Datos', 'Concordante', 'No Concordante', '% Concordante', '% No Concordante']
    }

    const colTBL = {
      colCont1: objTblCont1,
      colCont2Tbl1: this.datosFiltro[this.indexSelect],
      colCont2Tbl2: this.datosFiltro[this.indexSelect].tables,
      colCont3: this.dataAnalitoTblConcord.Muestras,
      colCont4: this.dataFinCiclo.samples
    }

    console.log(this.graficasBase64);
    
    await this.pdfSemicualitativoService.PdfPlantillaCualiCliente(infoCabecera, this.graficasBase64, headerTBL, colTBL).then(_ => { })
    
    this.graficaSelect = 1;
    this.itemSelected = 1;
    this.buscarAnalitos(this.datosFiltro[0], 0,null,false);
    setTimeout(() => {
      this.showOverlay = false;
    }, 5000);
  }

  async obtenerImgraficas(){
    let index= 0;
    let index2= 0;

    for (const item  in this.arrGraficasUno) {
      
      let chartDom = echarts.init(document.getElementById('primera'+index),null,{renderer:'svg'});
      
      chartDom.setOption(this.arrGraficasUno[item]);
      chartDom
      await new Promise((res, e) => {
        chartDom.on('finished', () =>res(chartDom.getDataURL()));
      })
      .then(x => {
        console.log(x);
        
        this.arrImgGraficasUno[index] = x
      })
      .catch(e =>console.log('fallo1'));
      index++;
    }
    index= 0;
    for (const item  in this.arrGraficasDos) {
      let chartDom = echarts.init(document.getElementById('segunda'+index));
      chartDom.setOption(this.arrGraficasDos[item]);
      await new Promise((res, e) => {
        chartDom.on('finished', () => res(chartDom.getDataURL()));
      })
      .then(x => this.arrImgGraficasDos[index] = x)
      .catch(e =>console.log('fallo2'));;
      index++;
    }

    index= 0;
    index2= 0;
    for (const item  in this.arrGraficasTres) {
      let imagenes:any[]=[];
      for (const key in this.arrGraficasTres[item]) {
        let chartDom = echarts.init(document.getElementById('tercera'+index2+'P'+index));
        // console.log(this.arrGraficasTres[item][key]);
        
        chartDom.setOption(this.arrGraficasTres[item][key]);
        await new Promise((res, e) => {
          chartDom.on('finished', () =>  res(chartDom.getDataURL()))
        }).then(x => imagenes[index] = x).catch(e =>console.log('fallo31'));;
        index++;
      }
      this.arrImgGraficasTres[index2]=imagenes;
      index= 0;
      index2++;
    }

    index= 0;
    index2= 0;
    for (const item  in this.arrGraficasCuatro) {
      let imagenes:any[]=[];
      for (const key in this.arrGraficasCuatro[item]) {
        let chartDom = echarts.init(document.getElementById('cuarta'+index2+'Z'+index));
        chartDom.setOption(this.arrGraficasCuatro[item][key]);
        await new Promise((res, e) => {
          chartDom.on('finished', () => res(chartDom.getDataURL()));
        }).then(x => imagenes[index] = x).catch(e =>console.log('fallo32'));;
        index++;
      }
      this.arrImgGraficasCuatro[index2]=imagenes;
      index= 0;
      index2++;
    }
  }

  async reporteConsolidado() {
    this.arrGraficasUno = [] ;
    this.arrGraficasDos = [] ;
    this.arrGraficasTres = [] ;
    this.arrGraficasCuatro = [] ;
    this.itemSelected = 5 ;
    this.datosFiltro.map(async (x, index) => {
      await this.buscarAnalitos(x, index, null, true)
    });
    setTimeout( async() => {
      await this.obtenerImgraficas();
      this.showOverlay = false;
      var date = new Date();
      const formatDate = (date) => {
        let formatted_date = date.getDate() + " / " + (date.getMonth() + 1) + " / " + date.getFullYear()
        return formatted_date;
      }
      let infoCabecera = {
        deteccion: '',
        metodologia: '',
        fechaD: formatDate(date),
      }
      let arrconsolidado:any[]=[];
      const headerTBL = {
        headerTblCont1: ['Resultado', 'Por método', 'Todos los resultados'],
        headerTbl1Cont2: ['Sistema de medición', 'Reactivo', 'Analito', 'Unidades'],
        headerTbl2Cont2: ['Muestra', 'Resultado', 'Valor asignado', 'Score', 'Rms'],
        headerTblCont3: ['Control', 'N Datos', 'Aceptados', 'Rechazados', '% Aceptados', '% Rechazados'],
        headerTblCont4: ['Muestra', 'N Datos', 'Concordante', 'No Concordante', '% Concordante', '% No Concordante']
      }

      let analito = this.dataConcordancia[0].analytes;
      this.datosFiltro.map((x,cont) =>{
        this.datosFiltro[cont].tables.forEach((element, index) => {
          index == this.datosFiltro[cont].tables.length - 1 ? element.prom = this.calcProm(this.datosFiltro[cont].tables) : element.prom = 0
        });
        var objTblCont1: any = []
        for (let key of this.datosFiltro[cont].results) {
          objTblCont1.push(key);
        }
        this.datosFiltro[cont].results.forEach((element, index) => {
          objTblCont1[index].metodo = this.dataTablaEstGenMet[index].length;
          objTblCont1[index].totalResults = this.dataTablaEstGen[index].length;
        });
        const colTBL = {
          colCont1: objTblCont1,
          colCont2Tbl1: this.datosFiltro[cont],
          colCont2Tbl2: this.datosFiltro[cont].tables,
          colCont3:analito[cont].Muestras,
          colCont4: this.dataFinCiclo.samples
        }
        const arrImg =[this.arrImgGraficasUno[cont],this.arrImgGraficasDos[cont],this.arrImgGraficasTres[cont],this.arrImgGraficasCuatro[cont]];
        arrconsolidado[cont] = {arrImg,headerTBL,colTBL};
      })
      await this.pdfSemicualitativoService.PdfPlantillaCualiClienteConsolidado(infoCabecera, arrconsolidado).then(_ => { 
        this.itemSelected = 1 ;
        this.buscarAnalitos(this.datosFiltro[0], 0,null,false);
      })
    }, 1000);
    
    

  }

}


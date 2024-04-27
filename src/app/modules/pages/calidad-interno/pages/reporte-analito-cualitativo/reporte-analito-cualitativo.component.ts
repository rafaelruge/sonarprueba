import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SedesXUserService } from '@app/services/configuracion/sedesxuser.service';
import { ToastrService } from 'ngx-toastr';
import { ReporteCualitativoService } from '../../../../../services/calidad-interno/reporte.cualitativo.service';
import { DataPorMes, Niveles, NivelesDesemp } from '@app/interfaces/analito.cualitativo.barras.interface';

import { PdfService } from '@app/services/pdfs/pdf.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import moment from 'moment';

@Component({
  selector: 'app-reporte-analito-cualitativo',
  templateUrl: './reporte-analito-cualitativo.component.html',
  styleUrls: ['../reporte-analitos-alerta/reporte-analitos-alerta.component.css']
})
export class ReporteAnalitoCualitativoComponent implements OnInit {

  @Input() flagFromParent: boolean = true;
  @ViewChild('scroll') scroll: ElementRef;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['1', '2', '3', '4', '5', '6', '7'];
  displayedColumns2: string[] = ['Control', 'N° Datos', 'Concordancia', 'No concordancia', '% Aceptación', '% Rechazados', 'Métrica Sigma'];

  idUser: number = parseInt(sessionStorage.getItem("userid"));

  formulario: FormGroup;
  desactivado = true;
  verGraficas: boolean = false;
  minFecha: any;

  verFormAdicional: boolean = false;
  verListaAnalitos: boolean = false;

  seccionSeleccionado: any;
  analitoSeleccionado: any = {};

  flagGeneral: boolean = false;

  graficaConcordancia: any = [];
  graficaConcordanciaXAxis: string[] = [];
  infoConcordancia: Niveles[] = [];
  graficaDesemp = [];
  graficaDesempXaxis: string[] = [];
  infoDesemp: NivelesDesemp[] = [];
  graficaSigma = [];
  graficaSigmaXaxis: string[] = [];
  graficaSigmaLegend: string[] = [];
  infoSigma: DataPorMes[] = [];

  graficasBase64: string[] = [];
  tablaDatos: any[] = [];

  secciones = [];
  sedes = [];
  equipos = [];
  analitos = [];
  analitosFiltrados = [];
  lotes = [];
  reportes = [];
  programas = [];
  analitosExterno = [];
  equiposExterno = [];
  ict = [
    { value: 1, item: "Valor asignado" },
    { value: 2, item: "Z-Score" },
  ];

  headerTable: string = 'Sección';
  analitoInfo: any = [];
  nomobreAnalito: string = "";
  legend: any = [];

  constructor(private fb: FormBuilder,
    private sedesXUserService: SedesXUserService,
    private reporteCualitativoService: ReporteCualitativoService,
    private toastr: ToastrService,
    private pdfService: PdfService) { }

  ngOnInit(): void {
    this.crearFormularioBuscarDatos();
    this.dataFilters();
  }

  limpiaFiltros()
  {
    this.graficaConcordancia = [];
    this.graficaConcordanciaXAxis = [];
    this.graficaDesemp = [];
    this.graficaDesempXaxis = [];
    this.graficaSigma = [];
    this.graficaSigmaXaxis = [];
    this.graficaSigmaLegend = [];
    this.graficasBase64 = [];
    this.tablaDatos = [];
  }

  async dataFilters() {
    await this.sedesXUserService.getByIdAsync(this.idUser).then((data: any) => {
      this.sedes = data.filter((data) => data.active);
    });
  }


  selectOneheadquarters() {
    if (this.formulario.get('sedes').value.length == this.sedes.length) {
      let all = this.sedes.map(e => { return e.idheadquarters })
      all.unshift("-1")
      this.formulario.get('sedes').setValue(all)
    }
    this.seccionesFill(this.formulario.get('sedes').value)
  }


  selectAllheadquarters(control) {
    let all = this.sedes.map(e => { return e.idheadquarters })
    all.unshift("-1")
    this.formulario.get(control).setValue(all)
    this.seccionesFill(this.formulario.get(control).value)
  }
  seccionesFill(idheadquarters: string[]) {
    this.reporteCualitativoService.sedesXseccionCualitativo({ idheadquarters: idheadquarters.join() })
      .subscribe((x: any) => this.secciones = [...x.filter((data) => data.active)],
        (e) => {
          this.secciones = [];
          this.toastr.error('No hay información asociada');
        })
  }



  selectOneSection(control) {
    if (this.formulario.get(control).value.length == this.secciones.length) {
      let all = this.secciones.map(e => { return e.idsection })
      all.unshift("-1")
      this.formulario.get(control).setValue(all)
    }
    this.analitosXequipos(this.formulario.get(control).value)
  }


  selectAllSections(control) {
    let all = this.secciones.map(e => { return e.idsection })
    all.unshift("-1")
    this.formulario.get(control).setValue(all)
    this.analitosXequipos(this.formulario.get(control).value)
  }

  loteFill(idsection: string) {
    if (idsection !== "")
      {
        this.reporteCualitativoService.loteXsection({ idsection: idsection })
        .subscribe((x: any) => this.lotes = [...x.filter((data) => data.active)],
          (e) => {
            this.lotes = [];
            this.toastr.error('No hay información asociada');
          });
      }
  }



  selectOneEquipo(control) {
    if (this.formulario.get(control).value.length == this.equipos.length) {
      let all = this.equipos.map(e => { return e.idAnalyzer })
      all.unshift("-1")
      this.formulario.get(control).setValue(all)
    }
  }


  selectAllEquipos(control) {
    let all = this.equipos.map(e => { return e.idAnalyzer })
    all.unshift("-1")
    this.formulario.get(control).setValue(all)
  }


  equiposFill(idsection: string) {
    if (idsection !== "")
      {
        this.reporteCualitativoService.equipoXsedeCualitativo({ idsection: idsection })
        .subscribe((x: any) => this.equipos = [...x.filter((data) => data.active)],
          (e) => {
            this.equipos = [];
            this.toastr.error('No hay información asociada');
          });
      }
  }

  analitosFill(idsection: string) {
    if (idsection !== ""){
      this.reporteCualitativoService.analitosXsedeCualitativo({ idsection: idsection })
      .subscribe((x: any) => this.analitos = [...x.filter((data) => data.active)],
        (e) => {
          this.analitos = [];
          this.toastr.error('No hay información asociada');
        });
    }
  }

  // lotesFill(idsection:string){
  //   this.reporteCualitativoService.analitosXsedeCualitativo({idsection})
  //       .subscribe((x:any) => this.analitos = [...x.filter((data) => data.active)],
  //        (e)=>{
  //         this.analitos = [] ;
  //         this.toastr.error('No hay información asociada');
  //        })
  // }

  analitosXequipos(idsection: string[]) {
    if (idsection.length !== 0){
      let id = idsection.join();
      this.equiposFill(id);
      this.analitosFill(id);
      this.loteFill(id);
    }
    else{
      this.equipos = [];
      this.analitos = [];
      this.lotes = [];
    }
  }

  selectOneLote(control) {
    if (this.formulario.get(control).value.length == this.lotes.length) {
      let all = this.lotes.map(e => { return e.idLot })
      all.unshift("-1")
      this.formulario.get(control).setValue(all)
    }
  }

  selectAllLotes(control) {
    let all = this.lotes.map(e => { return e.idLot })
    all.unshift("-1")
    this.formulario.get(control).setValue(all)
  }


  crearFormularioBuscarDatos() {
    this.formulario = this.fb.group({
      desde: ["", [Validators.required]],
      hasta: ["", [Validators.required]],
      secciones: [[], [Validators.required]],
      sedes: [[], [Validators.required]],
      equipos: [[], [Validators.required]],
      analitos: [[], []],
      lotes: [[], []],
    });

    this.formulario.valueChanges.subscribe(x => {
      this.verListaAnalitos = false;
      this.verGraficas = false;
      this.tablaDatos = [];
    })
  }

  observeFechas(campo: string) {

    let x = this.formulario.get("desde").value;
    let y = this.formulario.get("hasta").value;
    let fechaX;
    let fechaY;
    if (x) {
      fechaX = moment(x).format()
    }
    if (y) {
      fechaY = moment(y).format()
    }

    if (fechaX === 'Invalid date') {
      this.formulario.get(campo).setValue(null);
      this.toastr.error('La fecha es invalida');
      return
    }

    if (x !== 'Invalid date' && x && y && y !== 'Invalid date') {
      if (moment(x).format() > moment(y).format()) {
        this.formulario.get('hasta').setValue(null);
        this.toastr.error(`La fecha "hasta" no puede ser menor a la fecha "desde"`);
      }
    }
  }

  public scrollCards(flow: number): void {
    this.scroll.nativeElement.scrollLeft += (136.1 * flow);
  }

  cambiarEstado() {
    this.analitoInfo = [];
    this.flagGeneral = !this.flagGeneral;
    if (this.flagGeneral) {
      this.formulario.get('analitos').setValidators([Validators.required]);
      this.formulario.get('lotes').setValidators([Validators.required]);
    } else {
      this.formulario.get('analitos').setValidators(null);
      this.formulario.get('lotes').setValidators(null);
      this.nomobreAnalito = null;
    }
    this.formulario.updateValueAndValidity();
    this.verListaAnalitos = false;
    this.verGraficas = false;
  }

  limpiarFecha(event: any, campo: string) {
    this.formulario.get(campo).setValue(event.value);
    this.observeFechas(campo);
  }

  sinMenosUno(campo: string) {
    let sinMenosUno: any[] = this.formulario.get(campo)?.value;
    if (sinMenosUno.length !== 1 && sinMenosUno.includes('-1')) {
      sinMenosUno = sinMenosUno.filter(x => x !== '-1');
    }
    this.formulario.get(campo).setValue(sinMenosUno);
  }

  limpiarCampo(event: any) {
    if (event.isUserInput) {

      let all = this.analitos.map(e => { return e.idanalytes })
      all.unshift("-1")
      this.formulario.get('analitos').setValue(all)

      this.analitosFiltrados = [...this.analitos];

      this.filtrarAnalitos('analitos')
      //this.loteFill(['-1'].join());
    }
  }

  selectOneAnalyte(control : any){
    if(this.formulario.get(control).value.length == this.analitos.length){
      let all =  this.analitos.map(e => { return e.idanalytes })
      all.unshift("-1")
      this.formulario.get(control).setValue(all)
    }
    this.filtrarAnalitos('analitos')
  }

  filtrarAnalitos(campo: string) {

    let ids: any[] = this.formulario.get('analitos').value;
    this.analitosFiltrados = [];
    if (ids.length === 1 && ids.includes('-1')) {
      this.analitosFiltrados = [...this.analitos];
      return
    }

    if (ids.includes('')) {
      this.formulario.get(campo).setValue([]);
      this.analitosFiltrados = [];
      //this.lotes = [];
      return
    }
    if (ids.length !== 1 && ids.includes('-1')) {
     // ids = ids.filter(x => x !== '-1');
      this.formulario.get(campo).setValue(ids);
    }
    this.analitosFiltrados = [...this.analitos.filter(x => ids.includes(x.idanalytes))];

  }

  traerInformacion(item: any) {
    this.seccionSeleccionado = item;
    this.verGraficas = true;
    this.analitoSeleccionado['analito'] = item.desanalytes;
    this.organizarConcordancia(item.desanalytes);
    this.organizarDesemp(item.desanalytes);
    this.organizarSigma(item.desanalytes);
    this.generarData(item.desanalytes);
  }

  private generarData(analito: string) {
    this.nomobreAnalito = analito;
    this.analitoInfo = this.tablaDatos.filter(x => x.Analito === analito);
    if (this.analitoInfo.length === 0) {
      // this.tablaDatos = [] ;
      this.dataSource.data.length = 0;
      this.toastr.error('No hay información');
      return
    }
    this.dataSource = new MatTableDataSource(this.analitoInfo[0].arregloTabla);
    this.dataSource.sort = this.sort;
  }

  organizarConcordancia(analito: string) {
    const analitoInfo = this.infoConcordancia.filter(x => x.Analito === analito);
    if (analitoInfo.length === 0) {
      this.graficaConcordancia = [];
      this.toastr.error('No hay informacion del analito para la grafica de "Porcentaje concordancia leucocitos"');
      return
    }
 
    let fecha1 = this.formulario.get('desde')?.value;
    let fecha2 = this.formulario.get('hasta')?.value;
    let numerosAceptados: any[] = [[], [], []];
    let numerosRechazados: any[] = [[], [], []];
    this.analitoSeleccionado['fechaD'] = moment(fecha1, "MM/DD/YYYY").format('DD/MM/YYYY');
    this.analitoSeleccionado['fechaH'] = moment(fecha2, "MM/DD/YYYY").format('DD/MM/YYYY');
    this.analitoSeleccionado['lote'] = analitoInfo[0].lote;
    this.analitoSeleccionado['equipo'] = analitoInfo[0].equipo;
    this.analitoSeleccionado['seccion'] = analitoInfo[0].seccion;
    this.legend = ['No Concordante', 'Concordante']

    analitoInfo.map(z => {
      let aceptados: any[] = Object.keys(z.Aceptados).map(acp => String(z.Aceptados[acp]));
      let rechazados: any[] = Object.keys(z.Rechazados).map(recha => String(z.Rechazados[recha]));

      aceptados = aceptados.map((num: string, index: number) => numerosAceptados[index].push(num));
      rechazados = rechazados.map((num: string, index: number) => {
        numerosRechazados[index].push({ value: num, itemStyle: { color: '#D11C22' }, name: 'No Concordante' })
      });
    });

    numerosAceptados = numerosAceptados.map((x, index) => {

      if (numerosRechazados[index][0] != undefined) {
        numerosRechazados[index][0].name = "No Concordante";
        numerosRechazados[index][0].type = 'bar';
        numerosRechazados[index][0].barGap = 2;
        numerosRechazados[index][0].label = { show: true, formatter: '{c} % - Nivel ' + `${index + 1}`, color: 'black', position: 'top', },
          numerosRechazados[index][0].emphasis = { focus: 'series' };
        numerosRechazados[index][0].type = 'bar';
        numerosRechazados[index][0].data = [numerosRechazados[index][0].value];
        numerosRechazados[index][0].itemStyle = { color: '#D11C22' };
      }
      // x.push(numerosRechazados[index]);
      x = x.reduce((a, b) => a.concat(b), []).reverse();
      return {
        name: 'Concordante',
        type: 'bar',
        barGap: .2,
        label: { show: true, formatter: '{c} % - Nivel ' + `${index + 1}`, color: 'black', position: 'top', },
        emphasis: {
          focus: 'series'
        },
        data: x,
        itemStyle: { color: '#4051FC' }
      }
    })

    var arrRechazados = [];
    for (let item of numerosRechazados) {
      arrRechazados.push(item[0]);
    }

    this.graficaConcordancia = [...arrRechazados, ...numerosAceptados];
  }

  organizarDesemp(analito: string) {
    const analitoInfo = this.infoDesemp.filter(x => x.Analito === analito);
    if (analitoInfo.length === 0) {
      this.graficaDesemp = [];
      this.toastr.error('No hay informacion del analito para la grafica de "Desempeño por año"');
      return
    }
    const meses = analitoInfo[0].DataxMes[0].Meses;
    let numerosAceptados: any[] = [[], [], []];
    let numerosRechazados: any[] = [[], [], []];

    this.graficaDesempXaxis = [];

    meses.map(z => {
      let aceptados: any[] = Object.keys(z.Aceptados).map(acp => String(z.Aceptados[acp]));
      let rechazados: any[] = Object.keys(z.Rechazados).map(recha => String(z.Rechazados[recha]));
      this.graficaDesempXaxis.push(z.Mes);
      aceptados = aceptados.map((num: string, index: number) => numerosAceptados[index].push(num));
      rechazados = rechazados.map((num: string, index: number) => numerosRechazados[index].push(num));
    });

    numerosAceptados = numerosAceptados.map((x, index) => {
      return {
        name: 'Concordante',
        type: 'bar',
        barGap: .2,
        label: { show: true, formatter: '{c} % - Nivel ' + `${index + 1}`, color: 'black', position: 'top' },
        emphasis: {
          focus: 'series'
        },
        data: x,
        itemStyle: { color: '#4051FC' }
      }
    })
    numerosRechazados = numerosRechazados.map((x, index) => {
      return {
        name: 'No Concordante',
        type: 'bar',
        barGap: .2,
        label: { show: true, formatter: '{c} % - Nivel ' + `${index + 1}`, color: 'black', position: 'top' },
        emphasis: {
          focus: 'series'
        },
        data: x,
        itemStyle: { color: '#D11C22' }
      }
    });

    this.graficaDesemp = [...numerosRechazados, ...numerosAceptados];
  }

  organizarSigma(analito: string) {
    const analitoInfo = this.infoSigma.filter(x => x.Analito === analito);
    if (analitoInfo.length === 0) {
      this.graficaSigma = [];
      this.toastr.error('No hay informacion del analito para la grafica de "Grafíco Métrica Sigma QC1"');
      return
    }
    let newGrafic = [];
    let iteraciones: any[] = [];
    const meses = analitoInfo[0].DataxMes;
    this.graficaSigmaXaxis = ['Menor 3', 'Entre 3 y 3.99', 'Entre 4 y 4.99',
      'Entre 5 y 5.99', 'Mayor a 6', 'Total'];
    // 'Indefinido',
    this.graficaSigmaLegend = [];
    newGrafic = meses.map(x => {
      this.graficaSigmaLegend.push(x.Mes);
      let total: number = (x.validsigma.validrojo + x.validsigma.validamarillo1) + (x.validsigma.validamarillo2 + x.validsigma.validverde1) + (x.validsigma.validverde2); //+x.validsigma.validazul
      iteraciones = [
        { value: String(x.validsigma.validrojo), itemStyle: { color: '#D11C22' } },
        { value: String(x.validsigma.validamarillo1), itemStyle: { color: '#FFC300' } },
        { value: String(x.validsigma.validamarillo2), itemStyle: { color: '#F4D03F' } },
        { value: String(x.validsigma.validverde1), itemStyle: { color: '#F4D03F' } },
        { value: String(x.validsigma.validverde2), itemStyle: { color: '#229954' } },
        // { value: String(x.validsigma.validazul), itemStyle: { color: '#3498DB'}},
        { value: String(total), itemStyle: { color: '#BDC3C7' } },
      ]
      return {
        name: x.Mes,
        type: 'bar',
        barGap: .2,
        emphasis: {
          focus: 'series'
        },
        label: { show: true, color: 'black', position: 'top', },
        data: iteraciones
      }
    });
    this.graficaSigma = [...newGrafic];
  }


  especifico(data: any) {
    this.headerTable = 'Control';
    this.displayedColumns2[0] = 'Control';
    this.tablaDatos = [];
    this.reporteCualitativoService.graficaBarrasConcordancia(data)
      .subscribe((y) => {
        this.infoConcordancia = y[0].Niveles;
        this.verListaAnalitos = true;
      }, e => {
        this.infoConcordancia = [];
        this.graficaConcordancia = [];
        this.verGraficas = false;
        this.toastr.error('Ha ocurrido un error, por ende no podra visualiza la grafica de "Porcentaje concordancia"');
      });
    this.reporteCualitativoService.graficaDesemp(data)
      .subscribe((y) => {
        this.infoDesemp = y[0].Niveles;
        this.verListaAnalitos = true;
      }, e => {
        this.infoDesemp = [];
        this.graficaDesemp = [];
        this.verGraficas = false;
        this.toastr.error('Ha ocurrido un error, por ende no podra visualiza la grafica de "Desempeño por año"');
      });
    this.reporteCualitativoService.graficaSigma(data)
      .subscribe(y => {

        this.infoSigma = y[0].Niveles;
        console.log(this.infoSigma);
        this.verListaAnalitos = true;
      }, e => {
        console.log(e);
        this.infoSigma = [];
        this.graficaSigma = [];
        this.verGraficas = false;
        this.toastr.error('Ha ocurrido un error, por ende no podra visualiza la grafica de "Grafíco Métrica Sigma QC1"');
      });
    this.reporteCualitativoService.tabla(data)
      .subscribe((y: any) => {
        this.verListaAnalitos = true;
        this.tablaDatos = y[0].Niveles.map((z: any) => {
          let arregloTabla = [];
          if (z.datalvl1) arregloTabla.push(z.datalvl1)
          if (z.datalvl2) arregloTabla.push(z.datalvl2)
          if (z.datalvl3) arregloTabla.push(z.datalvl3)

          return { Analito: z.Analito, arregloTabla }
        });
      }, e => {
        this.verGraficas = false;
        this.tablaDatos = [];
        this.toastr.error('Ha ocurrido un error, por ende no podra visualizar la tabla de datos');
      });
  }

  general(data) {

    this.headerTable = 'Sección';
    this.reporteCualitativoService.graficaBarrasConcordanciaGeneral(data)
      .subscribe((y: any) => {
        this.graficaConcordancia = [
          {
            name: 'Concordante',
            type: 'bar',
            barGap: .2,
            label: { show: true, formatter: '{c} %', color: 'black', position: 'top' },
            emphasis: {
              focus: 'series'
            },
            data: [y.totalaceptados],
            itemStyle: { color: '#4051FC' }
          },
          {
            name: 'No Concordante',
            type: 'bar',
            barGap: .2,
            label: { show: true, formatter: '{c} % ', color: 'black', position: 'top' },
            emphasis: {
              focus: 'series'
            },
            data: [y.totalrechazados],
            itemStyle: { color: '#D11C22' }
          }
          // {
          //   type: 'bar',
          //   barGap: .2,
          //   label:{show: true,formatter: '{c} % ',color:'black',position: 'top',},
          //   emphasis: {
          //     focus: 'series'
          //   },
          //   data: [y.totalaceptados, { value: String(y.totalrechazados), itemStyle: { color: '#D11C22'}}],
          //   itemStyle:{color:'#4051FC'}
          // }
        ];
        this.verGraficas = true;
        this.verListaAnalitos = true;
      }, e => {
        this.infoConcordancia = [];
        this.graficaConcordancia = [];
        this.verGraficas = false;
        this.toastr.error('Ha ocurrido un error, por ende no podra visualizar las graficas');
      });
    this.reporteCualitativoService.graficaDesempGeneral(data)
      .subscribe((y: any[]) => {
        let aceptados: any[] = [];
        let rechazados: any[] = [];
        y.map(resp => {
          this.graficaDesempXaxis.push(resp.Mes + '/' + resp.Anio);
          if (resp.totalaceptados) {
            aceptados.push(resp.totalaceptados)
          }
          if (resp.totalrechazados) {
            rechazados.push(resp.totalrechazados)
          }
        });
        this.graficaDesemp = [
          {
            name: 'Concordante',
            type: 'bar',
            barGap: .2,
            label: { show: true, formatter: '{c} %', color: 'black', position: 'top' },
            emphasis: {
              focus: 'series'
            },
            data: [...aceptados],
            itemStyle: { color: '#4051FC' }
          },
          {
            name: 'No Concordante',
            type: 'bar',
            barGap: .2,
            label: { show: true, formatter: '{c} % ', color: 'black', position: 'top' },
            emphasis: {
              focus: 'series'
            },
            data: [...rechazados],
            itemStyle: { color: '#D11C22' }
          }
        ];
        this.verGraficas = true;
        this.verListaAnalitos = true;
      }, e => {
        this.infoConcordancia = [];
        this.verGraficas = false;
        this.graficaDesemp = [];
        this.toastr.error('Ha ocurrido un error, por ende no podra visualizar las graficas');
      });
    this.reporteCualitativoService.tablaGeneral(data)
      .subscribe((y: any) => {
        this.tablaDatos = y[0].Niveles.map((z: any) => {
          return {
            totalaceptados: z.data.aceptados,
            totalrechazados: z.data.rechazados,
            pctaceptados: z.data.pctaceptados,
            pctrechazados: z.data.pctrechazados,
            sigma: z.data.sigma,
            Seccion: z.Seccion
          }
        });
        let fecha1 = this.formulario.get('desde')?.value;
        let fecha2 = this.formulario.get('hasta')?.value;
        this.analitoSeleccionado['fechaD'] = moment(fecha1, "MM/DD/YYYY").format('DD/MM/YYYY');
        this.analitoSeleccionado['fechaH'] = moment(fecha2, "MM/DD/YYYY").format('DD/MM/YYYY');
        this.dataSource = new MatTableDataSource(this.tablaDatos);
        this.dataSource.sort = this.sort;
        this.displayedColumns2[0] = 'Sección';
      }, e => {
        this.tablaDatos = [];
        this.verGraficas = false;
        this.toastr.error('Ha ocurrido un error, por ende no podra visualizar la tabla de datos');
      });
  }

  filtrar() {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.toastr.error('Todos los campos deben ser llenados');
      return
    }
    this.infoConcordancia = [];
    this.graficaConcordancia = [];

    this.tablaDatos = [];

    this.infoSigma = [];
    this.graficaSigmaLegend = [];
    this.graficaSigma = [];

    this.infoDesemp = [];
    this.graficaDesempXaxis = [];
    this.graficaDesemp = [];

    this.graficasBase64 = [];
    this.limpiaFiltros();
    let lot = this.formulario.get('lotes').value.includes("-1")? "-1" : (this.formulario.get('lotes').value).join()
    if (!lot) {
      lot = '-1';
    }

    let data = {
      Fechadesde: this.formulario.get('desde').value,
      Fechahasta: this.formulario.get('hasta').value,
      idanalytes: this.formulario.get('analitos').value.includes("-1")? "-1" :  (this.formulario.get('analitos').value).join(),
      idanalyzer: this.formulario.get('equipos').value.includes("-1")? "-1" :  (this.formulario.get('equipos').value).join(),
      idlot: lot,
      idsection: this.formulario.get('secciones').value.includes("-1")? "-1" :  (this.formulario.get('secciones').value).join()
    };

    !this.flagGeneral ? this.general(data) : this.especifico(data);
  }


  async reportePDF() {
    if (!this.dataSource?.data) {
      this.toastr.error('No hay información en la tabla de datos');
      return
    }

    for (let item of this.dataSource.data) {
      if (item.sigma === 0) {
        item.sigma = '>6'
      }
    }
    await this.pdfService.PdfPlantilla1(this.graficasBase64, this.displayedColumns2, this.dataSource.data, this.analitoSeleccionado,'').then(_ => { })
  }

}

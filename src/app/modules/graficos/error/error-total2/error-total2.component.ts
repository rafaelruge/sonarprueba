import { Component, OnInit, TemplateRef, Output, EventEmitter } from '@angular/core';
import { CuantitativosService } from '../../services/cuantitativos.service';

import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AccionesCorrectivasService } from '@app/services/configuracion/asociaciones.service';


@Component({
  selector: 'app-error-total2',
  templateUrl: './error-total2.component.html',
  styleUrls: ['./error-total2.component.css']
})
export class ErrorTotal2Component implements OnInit {

  @Output('imgGrafica02') imgGrafica02: EventEmitter<string> = new EventEmitter();
  @Output('loadGrafica02') loadGrafica02:EventEmitter<boolean> = new EventEmitter();

  min: any;
  max: any;

  pts: any;

  desv = [];

  valores = [];

  labels = [];
  DEI1 = [];
  DEI2 = [];
  DEI3 = [];
  DEI4 = [];
  MEDIA = [];
  DIANA = [];
  LS = [];
  LI = [];
  DES1 = [];
  DES2 = [];
  DES3 = [];
  DES4 = [];

  puntosAR = [];
  listaAccionesC: any

  ventanaModal: BsModalRef;

  btnHide = false;


  constructor(private cuantitativosService: CuantitativosService,
    private modalService: BsModalService,
    private accionesCorrectivasService: AccionesCorrectivasService,
    private toastr: ToastrService,
  ) {

    //this.pts = this.cuantitativosService.pts.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    this.pts = this.cuantitativosService.puntosprueba;
    //.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    this.pts.sort((a,b)=>Number(a.Idresult) - Number(b.Idresult))
    this.desv = this.cuantitativosService.desviacionesNvl2;
    this.pts = this.pts.filter((x: any) => {
      // if(x.valuelevel2 !== undefined || x.valuelevel2 !== null){
      //   return x
      // }
      if (x.Valuelevel2 !== null || x.Valuelevel2 !== undefined) {
        return x
      }
    });

  }


  ngOnInit() {
    this.pts = this.cuantitativosService.puntosprueba
    //.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    this.desv = this.cuantitativosService.desviacionesNvl2;
    this.pts = this.pts.filter((x: any) => x.Valuelevel2 !== null);
    if(this.pts.length){
      this.loadGrafica02.emit(true)
    }else{
      this.loadGrafica02.emit(false)
    }
    this.validarMinYMax();
    this.buildGraph('main2');
    if (screen.width <= 1300) {
      this.btnHide = true;
    }
  }



  //------------------------
  // MODAL Mas Datos
  //------------------------
  closeVentana(): void {
    this.ventanaModal.hide();
  }

  openGraficaModal(templateModal: TemplateRef<any>) {

    this.ventanaModal = this.modalService.show(templateModal, { backdrop: 'static', keyboard: false });
    let modal_size = 'modal-xl';
    if (screen.width <= 1400) {
      modal_size = 'modal-lg';
    }
    this.ventanaModal.setClass(modal_size);

    this.buildGraph('modalchart2');
  }

  validarMaxYMinDesvio(value:number,desvioMax:number,desvioMin:number){
    if(value > desvioMax ){

      // if(desvioMax<=10 && desvioMax>=1){

      //   return value;
      // }
      return desvioMax+0.5;
    }

    if(value < desvioMin){

      // if(desvioMin<=-10 && desvioMin>=10){

      //   return value;
      // }
      return desvioMin-0.5;
    }
    return value;
  }

  validarMinYMax() {
    let ptsAux=[...this.pts];
    for (let i = 0; i < ptsAux.length; i++) {
      // inferior
      this.DEI1.push(this.desv[3]);
      this.DEI2.push(this.desv[2]);
      this.DEI3.push(this.desv[1]);
      this.DEI4.push(this.desv[0]);
      // Superior
      this.DES1.push(this.desv[4]);
      this.DES2.push(this.desv[5]);
      this.DES3.push(this.desv[6]);
      this.DES4.push(this.desv[7]);
      this.MEDIA.push(this.desv[8]);
      
      if (this.desv[9] === undefined){
        this.LI.push(0);
      }
      else
      {
        this.LI.push(this.desv[9]);
      }

        if (this.desv[10] === undefined){
          this.LS.push(0);
        }
        else
        {
          this.LS.push(this.desv[10]);
        }

        if (this.desv[11] === undefined){
          this.DIANA.push(0);
        }
        else
        {
          this.DIANA.push(this.desv[11]);
        }


      if (this.pts[i].Valuelevel2 === 0) {
        this.pts[i].Valuelevel2 = String(this.pts[i].Valuelevel2);
      }
      if (this.pts[i].Valuelevel2 === 0) {
        this.pts[i].Valuelevel2 = String(this.pts[i].Valuelevel2);
      }

      if (this.pts[i].Valuelevel2) {
        let resultado = Object.assign({} , ptsAux[i])
        this.valores.push(String( this.validarMaxYMinDesvio(resultado.Valuelevel2,this.desv[7],this.desv[0]) ));
      }
      if (this.pts[i].valuelevel2) {
        let resultado = Object.assign({} , ptsAux[i])
        this.valores.push(String(this.validarMaxYMinDesvio(resultado.valuelevel2,this.desv[7],this.desv[0]) ));
      }

      if (this.pts[i].Date) {
        this.labels.push(dayjs(this.pts[i].Date).format('DD-MM-YYYY'));
      }
      if (this.pts[i].date) {
        this.labels.push(dayjs(this.pts[i].date).format('DD-MM-YYYY'));
      }

      var color: string = '';

      this.pts[i].Arlevel2 == 'R' ? color = 'red' : this.pts[i].Arlevel2 == 'I' ? color = '#FAB005' : color = '#4141FC';
      if (this.pts[i].arlevel2) {
        this.pts[i].arlevel2 == 'R' ? color = 'red' : this.pts[i].arlevel2 == 'I' ? color = '#FAB005' : color = '#4141FC';
      }

      let objeto = {
        value: String(this.validarMaxYMinDesvio(this.pts[i].Valuelevel2,this.desv[7],this.desv[0])),
        itemStyle: {
          color: color
        }

      }

      if (this.pts[i].valuelevel2) {
        objeto = {
          value: String(this.validarMaxYMinDesvio(this.pts[i].valuelevel2,this.desv[7],this.desv[0])),
          itemStyle: {
            color: color
          }

        }
      }

      this.puntosAR.push(objeto);

    }

    // // validar minimos y maximos
    var validMin = [Math.min.apply(null, this.valores), this.desv[0], this.desv[9]];
    var validMax = [Math.max.apply(null, this.valores), this.desv[7], this.desv[10]];

    if (this.desv[9] == 0 || this.desv[10] == 0 || this.desv[11] == 0) {
      validMin = [Math.min.apply(null, this.valores), this.desv[0], this.desv[7]];
      validMax = [Math.max.apply(null, this.valores), this.desv[0], this.desv[7]];
    }
    this.min = Math.min.apply(null, validMin);
    this.max = Math.max.apply(null, validMax);
  }

  buildGraph(_elemt: string) {


    var accion: any
    this.accionesCorrectivasService.getAllAsync().then(data => {
      accion = data
    });
    // -- Si datos iguales no grafica--

    const numeros = this.desv;
    let duplicados = [];

    const tempArray = [...numeros].sort();

    for (let i = 0; i < tempArray.length; i++) {
      if (tempArray[i + 1] === tempArray[i] && tempArray[i] !== undefined ) {
        duplicados.push(tempArray[i]);
      }
    }

    if (duplicados.length >= 9) {
      this.toastr.error('No es posible gráficar porque la DESV es igual a la Media Nivel 2');
      return;
    }

    //---------------

    var datos = this.pts;

    var functLabel: Function = (label: any, px: number) => {

      const regex = /[EISei]/i;

      if (label.data % 1 == 0) {

        if (label.seriesName == 'Diana') {
          return 'D: ' + label.data;
        }
        if (px < 72 && label.seriesName != 'LS' && label.seriesName != 'LI') {
          return label.seriesName.replace(regex, '') + ': ' + label.data;
        }

        return label.seriesName + ': ' + label.data;

      } else {

        var decimales = label.data.toString();

        var cortar = decimales.substr(decimales.indexOf('.') + 1);

        if (cortar.length > 1) {

          if (label.seriesName == 'Diana') {
            return 'D: ' + label.data.toFixed(2);
          }
          if (px < 72 && label.seriesName != 'LS' && label.seriesName != 'LI') {

            return label.seriesName.replace(regex, '') + ': ' + label.data;
          }

          return label.seriesName + ': ' + label.data.toFixed(2);

        } else {

          if (label.seriesName == 'Diana') {
            return 'D: ' + label.data.toFixed(1);
          }
          if (px < 72 && label.seriesName != 'LS' && label.seriesName != 'LI') {

            return label.seriesName.replace(regex, '') + ': ' + label.data;
          }

          return label.seriesName + ': ' + label.data.toFixed(1);

        }

      }
    }



    //--------------------------------------------

    const _parent = document.getElementById('error-2').parentElement;
    const _boxChart = _parent.parentElement; // contenedor de la grafica
    //console.log('boxChart: ',_boxChart.clientWidth);

    var _wChart = 1000;
    var _px = 72;
    var _titulo = 'Levey Jennings Nvl. 2';
    var _endLabelOffset = [0, 0];
    var _align = 'right';


    if (_boxChart.clientWidth <= 1366) {
      document.getElementById('error-2').style.width = `${_boxChart.clientWidth}px`;
      //document.getElementById('error-2').style.overflowX = 'scroll';

      _wChart = _boxChart.clientWidth * 0.99;

    }

    if (_boxChart.clientWidth <= 300) {
      _titulo = 'N. 2';
      _px = _px * 0.27;
      _endLabelOffset = [-28, 0];
    }
    if (_boxChart.clientWidth > 300 && _boxChart.clientWidth <= 576) {
      _titulo = 'Nvl. 2';
      _px = _px * 0.6;
      _endLabelOffset = [-25, 0];
    }
    if (_boxChart.clientWidth > 576 && _boxChart.clientWidth <= 776) {
      _titulo = 'JL Nvl. 2';
      _px = _px * 0.79;
      _endLabelOffset = [-4, 0];
      _align = 'left';
    }
    if (_boxChart.clientWidth > 776 && _boxChart.clientWidth <= 1000) {
      _px = _px * 1.05;
      _endLabelOffset = [0, 0];
      _align = 'left';
    }
    if (_wChart > 1000) {
      _px = _px * 1.3;
      _wChart = 1000;
      _align = 'left';
    }

    Object.defineProperty(document.getElementById(_elemt), 'clientWidth', { get: function () { return _wChart } });
    Object.defineProperty(document.getElementById(_elemt), 'clientHeight', { get: function () { return _elemt == 'main' ? 500 : 350 } });
    document.getElementById(_elemt).style.marginTop = '16px';
    var myChart = echarts.init(document.getElementById(_elemt));


    //---------------Condición para quitar limite Sup / Inf = 0------------------------------------
    if (this.LI[0] == 0 || this.LS[0] == 0) {
      myChart.setOption({

        dataZoom: [
          {
            show: false,
            throttle: 5,
            moveOnMouseWheel: true,
            type: 'inside',
            start: 0,
            end: 100,
            top: 80
          },
          {
            start: 0,
            end: 10
          },
        ],
        title: {
          text: _titulo
        },
        tooltip: {
          trigger: 'axis',
          formatter:  (data) => {

            var filtro = data.filter(dato => dato.componentSubType == 'scatter');
            var objeto = datos[filtro[0].dataIndex];
            var fecha = objeto.Date ? dayjs(objeto.Date).format('DD-MM-YYYY') : dayjs(objeto.date).format('DD-MM-YYYY');
            let colorItem = '';
            let comentarios = '';
            let acciones = '';
            let estado = '';
            let regla02 = '';
            console.log(objeto)
            regla02 = objeto.Ruleslevel2 ? objeto.Ruleslevel2 : objeto.Ruleslevel2;
            comentarios = objeto.Comments ? objeto.Comments : objeto.comments;
            acciones = objeto.Descorrectiveactions ? objeto.Descorrectiveactions : objeto.descorrectiveactions;
            if (objeto.Comments == "") {
              comentarios = 'NR'
            }
            if (objeto.Ruleslevel2 == "" || objeto.Ruleslevel2 == null) {
              regla02 = 'NR'
            }

            if (objeto.Idcorrectiveactions == null) {
              acciones = 'NR'
            } else {
              var nombre = accion.filter(acc => acc.idcorrectiveactions == objeto.Idcorrectiveactions);
              if (nombre.length > 0) {
                acciones = nombre[0]['descorrectiveactions']
              } else {
                acciones = 'NR'
              }

            }

            if (objeto.Arlevel2 == 'R' || objeto.arlevel2 == 'R') {

              colorItem = 'red';
              estado = 'Rechazado';

            } else if (objeto.Arlevel2 == 'I' || objeto.arlevel2 == 'I') {

              colorItem = '#FAB005';
              estado = 'Alerta';

            } else {

              colorItem = '#007D00',
                estado = 'Aceptado'
            }
            return '<b>Resultado:</b> ' + this.pts[filtro[0].dataIndex].Valuelevel2+ '<br>' + '<b>Fecha:</b> ' + fecha + '<br>' + '<b>Regla:</b> ' + regla02 + '<br>' + '<b>Estado:</b> ' + `<b style="color: ${colorItem}">${estado}</b>` + '<br>' + '<b>Acción correctiva:</b> ' + acciones + '<br>' + '<b>Comentarios:</b> ' + comentarios;
          }
        },
        silent: true,
        legend: {
          data: ['Diana']
        },
        grid: {
          left: '8%',
          right: '8%',
          bottom: '16%',
          containLabel: true,
          show: true,
          borderWidth: 3
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: this.labels,
            axisLabel: {
              fontWeight: 'bold'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            min: this.min,
            max: this.max,
            show: false,
          }
        ],
        series: [
          {
            name: 'DES4',
            type: 'line',
            data: this.DES4,
            showSymbol: true,
            symbolSize: 0,
            areaStyle: { // difuminado del background

              color: new echarts.graphic.LinearGradient(0, 0, 0, 0.4, [{
                offset: 0,
                color: 'rgba(177,177,177,0.3)'
              },
              {
                offset: 1,
                color: 'rgba(177,177,177,0)'
              }
              ], false),
              shadowColor: 'rgba(177,177,177, 0.9)',
              shadowBlur: 20

            },
            lineStyle: {
              color: 'red',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'red',
              color: 'red'
            },
            label: {
              show: false,
              formatter: function (label) {


                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'red',
              fontWeight: 'bold',
            }
          },
          {
            name: 'DES3',
            type: 'line',
            data: this.DES3,
            showSymbol: true,
            symbolSize: 0,
            lineStyle: {
              color: 'orange',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'orange',
              color: 'orange'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'orange',
              fontWeight: 'bold',
            }
          },
          {
            name: 'DES2',
            type: 'line',
            data: this.DES2,
            showSymbol: true,
            symbolSize: 0,
            lineStyle: {
              color: '#F3E827',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#F3E827',
              color: '#F3E827'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: '#F3E827',
              fontWeight: 'bold',
            }
          },
          {
            name: 'DES1',
            type: 'line',
            // areaStyle: {
            //   opacity: 1,
            //   color: '#FFFFFF'

            // },
            data: this.DES1,
            showSymbol: true,
            symbolSize: 0,
            lineStyle: {
              color: 'green',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'green',
              color: 'green'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'green',
              fontWeight: 'bold',
            }
          },
          {
            name: 'Media',
            type: 'line',
            data: this.MEDIA,
            showSymbol: false,
            symbolSize: 0,
            lineStyle: {
              color: 'black',
              width: 2
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'black',
              color: 'black'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'black',
              fontWeight: 'bold',
            }
          },
          {
            name: 'DEI1',
            type: 'line',
            data: this.DEI1,
            showSymbol: false,
            lineStyle: {
              color: 'green',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'green',
              color: 'green'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'green',
              fontWeight: 'bold',
            }
          },
          {
            name: 'DEI2',
            type: 'line',
            data: this.DEI2,
            showSymbol: false,
            lineStyle: {
              color: '#F3E827',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#F3E827',
              color: '#F3E827'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: '#F3E827',
              fontWeight: 'bold',
            }
          },
          {
            name: 'DEI3',
            type: 'line',
            data: this.DEI3,
            showSymbol: false,
            lineStyle: {
              color: 'orange',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'orange',
              color: 'orange'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'orange',
              fontWeight: 'bold',
            }
          },
          {
            name: 'DEI4',
            type: 'line',
            data: this.DEI4,
            showSymbol: false,
            areaStyle: { // difuminado del background

              color: new echarts.graphic.LinearGradient(0, 0.6, 0, 0, [{
                offset: 0,
                color: 'rgba(177,177,177,0.3)'
              },
              {
                offset: 1,
                color: 'rgba(177,177,177,0)'
              }
              ], false),
              shadowColor: 'rgba(177,177,177, 0.9)',
              shadowBlur: 20

            },
            lineStyle: {
              color: 'red',
              width: 2,

            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'red',
              color: 'red'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'red',
              fontWeight: 'bold',
            }
          },
          {
            name: 'Resultado',
            type: 'line',
            data: this.valores,
            showSymbol: true,
            symbol: 'square',
            symbolSize: 7,
            lineStyle: {
              color: '#4141FC',
              width: 2.5
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#4141FC',
              color: '#A0A0FF'
            },
            label: {
              show: false,
              position: 'top',
              fontWeight: 'bold',
              color: '#6F4B8B'
            }
          },
          {
            type: 'scatter',
            name: 'hola',
            symbol: 'rect',
            symbolSize: 10,
            zlevel: 1,
            data: this.puntosAR
          }

        ]

      });

      setTimeout(() => {
        this.imgGrafica02.emit(myChart.getDataURL());
      }, 1000);


    } else {

      myChart.setOption({

        dataZoom: [
          {
            show: false,
            throttle: 5,
            moveOnMouseWheel: true,
            type: 'inside',
            start: 0,
            end: 100,
            top: 80
          },
          {
            start: 0,
            end: 10
          },
        ],
        title: {
          text: _titulo
        },
        tooltip: {
          trigger: 'axis',
          formatter: (data) => {

            var filtro = data.filter(dato => dato.componentSubType == 'scatter');
            var objeto = datos[filtro[0].dataIndex];
            var fecha = objeto.Date ? dayjs(objeto.Date).format('DD-MM-YYYY') : dayjs(objeto.date).format('DD-MM-YYYY');
            let colorItem = '';
            let comentarios = '';
            let acciones = '';
            let estado = '';
            let regla02 = '';

            regla02 = objeto.Ruleslevel2 ? objeto.Ruleslevel2 : objeto.Ruleslevel2;
            comentarios = objeto.Comments ? objeto.Comments : objeto.comments;
            acciones = objeto.Descorrectiveactions ? objeto.Descorrectiveactions : objeto.descorrectiveactions;
            if (objeto.Comments == "") {
              comentarios = 'NR'
            }

            if (objeto.Ruleslevel2 == "" || objeto.Ruleslevel2 == null) {
              regla02 = 'NR'
            }

            if (objeto.Idcorrectiveactions == null) {
              acciones = 'NR'
            } else {
              var nombre = accion.filter(acc => acc.idcorrectiveactions == objeto.Idcorrectiveactions);
              if (nombre.length > 0) {
                acciones = nombre[0]['descorrectiveactions']
              } else {
                acciones = 'NR'
              }

            }
            console.log(acciones);

            if (objeto.Arlevel2 == 'R' || objeto.arlevel2 == 'R') {

              colorItem = 'red';
              estado = 'Rechazado';

            } else if (objeto.Arlevel2 == 'I' || objeto.arlevel2 == 'I') {

              colorItem = '#FAB005';
              estado = 'Alerta';

            } else {

              colorItem = '#007D00',
                estado = 'Aceptado'
            }

            return '<b>Resultado:</b> ' + this.pts[filtro[0].dataIndex].Valuelevel2 + '<br>' + '<b>Fecha:</b> ' + fecha + '<br>' + '<b>Regla:</b> ' + regla02 + '<br>' + '<b>Estado:</b> ' + `<b style="color: ${colorItem}">${estado}</b>` + '<br>' + '<b>Acción correctiva:</b> ' + acciones + '<br>' + '<b>Comentarios:</b> ' + comentarios;
          }
        },
        silent: true,
        legend: {
          data: ['LS', 'LI', 'Diana']
        },
        grid: {
          left: '8%',
          right: '8%',
          bottom: '16%',
          containLabel: true,
          show: true,
          borderWidth: 3
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: this.labels,
            axisLabel: {
              fontWeight: 'bold'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            min: this.min,
            max: this.max,
            show: false,
          }
        ],
        series: [
          {
            name: 'DES4',
            type: 'line',
            data: this.DES4,
            showSymbol: true,
            symbolSize: 0,
            areaStyle: { // difuminado del background

              color: new echarts.graphic.LinearGradient(0, 0, 0, 0.4, [{
                offset: 0,
                color: 'rgba(177,177,177,0.3)'
              },
              {
                offset: 1,
                color: 'rgba(177,177,177,0)'
              }
              ], false),
              shadowColor: 'rgba(177,177,177, 0.9)',
              shadowBlur: 20

            },
            lineStyle: {
              color: 'red',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'red',
              color: 'red'
            },
            label: {
              show: false,
              formatter: function (label) {


                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'red',
              fontWeight: 'bold',
            }
          },
          {
            name: 'DES3',
            type: 'line',
            data: this.DES3,
            showSymbol: true,
            symbolSize: 0,
            lineStyle: {
              color: 'orange',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'orange',
              color: 'orange'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'orange',
              fontWeight: 'bold',
            }
          },
          {
            name: 'DES2',
            type: 'line',
            data: this.DES2,
            showSymbol: true,
            symbolSize: 0,
            lineStyle: {
              color: '#F3E827',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#F3E827',
              color: '#F3E827'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: '#F3E827',
              fontWeight: 'bold',
            }
          },
          {
            name: 'DES1',
            type: 'line',
            // areaStyle: {
            //   opacity: 1,
            //   color: '#FFFFFF'

            // },
            data: this.DES1,
            showSymbol: true,
            symbolSize: 0,
            lineStyle: {
              color: 'green',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'green',
              color: 'green'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'green',
              fontWeight: 'bold',
            }
          },
          {
            name: 'Media',
            type: 'line',
            data: this.MEDIA,
            showSymbol: false,
            symbolSize: 0,
            lineStyle: {
              color: 'black',
              width: 2
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'black',
              color: 'black'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'black',
              fontWeight: 'bold',
            }
          },
          {
            name: 'Diana',
            type: 'line',
            data: this.DIANA,
            showSymbol: false,
            lineStyle: {
              color: '#FF8181',
              width: 2
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#FF8181',
              color: '#FF8181'
            },
            endLabel: {
              show: true,
              align: _align,
              borderType: 'solid',
              borderWidth: 0.5,
              borderColor: 'rgba(255,255,255,1)',
              backgroundColor: 'rgba(255,255,255, 0.8)',
              //shadowColor: 'rgba(0,0,0, 0.3)',
              //shadowOffsetX: 0,
              //shadowOffsetY: 2,
              //shadowBlur:8,
              //padding: 2,
              offset: _endLabelOffset,
              color: '#FF8181',
              fontWeight: 'bold',
              fontSize: 10,
              formatter: function (label) {

                return functLabel(label, _px);

              }

            }

          },
          {
            name: 'LS',
            type: 'line',
            data: this.LS,
            showSymbol: false,
            lineStyle: {
              color: '#4141FC',
              width: 2
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#4141FC',
              color: '#4141FC'
            },
            endLabel: {
              show: true,
              align: _align,
              borderType: 'solid',
              borderWidth: 0.5,
              borderColor: 'rgba(255,255,255,1)',
              backgroundColor: 'rgba(255,255,255, 0.8)',
              //shadowColor: 'rgba(0,0,0, 0.3)',
              //shadowOffsetX: 0,
              //shadowOffsetY: 2,
              //shadowBlur:8,
              //padding: 2,
              offset: _endLabelOffset,
              color: '#4141FC',
              fontWeight: 'bold',
              fontSize: 10,
              formatter: function (label) {

                return functLabel(label, _px);

              }
            }
          },
          {
            name: 'LI',
            type: 'line',
            data: this.LI,
            showSymbol: false,
            lineStyle: {
              color: '#4141FC',
              width: 2
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#4141FC',
              color: '#4141FC'
            },
            endLabel: {
              show: true,
              align: _align,
              borderType: 'solid',
              borderWidth: 0.5,
              borderColor: 'rgba(255,255,255,1)',
              backgroundColor: 'rgba(255,255,255, 0.8)',
              //shadowColor: 'rgba(0,0,0, 0.3)',
              //shadowOffsetX: 0,
              //shadowOffsetY: 2,
              //shadowBlur:8,
              //padding: 2,
              offset: _endLabelOffset,
              color: '#4141FC',
              fontWeight: 'bold',
              fontSize: 10,
              formatter: function (label) {

                return functLabel(label, _px);

              }
            }
          },
          {
            name: 'DEI1',
            type: 'line',
            data: this.DEI1,
            showSymbol: false,
            lineStyle: {
              color: 'green',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'green',
              color: 'green'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'green',
              fontWeight: 'bold',
            }
          },
          {
            name: 'DEI2',
            type: 'line',
            data: this.DEI2,
            showSymbol: false,
            lineStyle: {
              color: '#F3E827',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#F3E827',
              color: '#F3E827'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: '#F3E827',
              fontWeight: 'bold',
            }
          },
          {
            name: 'DEI3',
            type: 'line',
            data: this.DEI3,
            showSymbol: false,
            lineStyle: {
              color: 'orange',
              width: 2,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'orange',
              color: 'orange'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'orange',
              fontWeight: 'bold',
            }
          },
          {
            name: 'DEI4',
            type: 'line',
            data: this.DEI4,
            showSymbol: false,
            areaStyle: { // difuminado del background

              color: new echarts.graphic.LinearGradient(0, 0.6, 0, 0, [{
                offset: 0,
                color: 'rgba(177,177,177,0.3)'
              },
              {
                offset: 1,
                color: 'rgba(177,177,177,0)'
              }
              ], false),
              shadowColor: 'rgba(177,177,177, 0.9)',
              shadowBlur: 20

            },
            lineStyle: {
              color: 'red',
              width: 2,

            },
            itemStyle: {
              borderWidth: 2,
              borderColor: 'red',
              color: 'red'
            },
            label: {
              show: false,
              formatter: function (label) {

                return functLabel(label);

              }
            },
            endLabel: {
              distance: (_wChart - _px) * -1, // Posicion Label,
              show: true,
              color: 'red',
              fontWeight: 'bold',
            }
          },
          {
            name: 'Resultado',
            type: 'line',
            data: this.valores,
            showSymbol: true,
            symbol: 'square',
            symbolSize: 7,
            lineStyle: {
              color: '#4141FC',
              width: 2.5
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#4141FC',
              color: '#A0A0FF'
            },
            label: {
              show: false,
              position: 'top',
              fontWeight: 'bold',
              color: '#6F4B8B'
            }
          },
          {
            type: 'scatter',
            name: 'hola',
            symbol: 'rect',
            symbolSize: 10,
            zlevel: 1,
            data: this.puntosAR
          }

        ]

      });

      setTimeout(() => {
        this.imgGrafica02.emit(myChart.getDataURL());
      }, 1000);


    }

  }


}

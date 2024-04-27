import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as echarts from 'echarts';
import { CualitativosService } from '../services/cualitativos.service';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-cualitativos-nivel-tres',
  templateUrl: './cualitativos-nivel-tres.component.html',
  styleUrls: ['./cualitativos-nivel-tres.component.css']
})

export class CualitativosNivelTresComponent implements OnInit {

  @Output('grafica3C') grafica3C:EventEmitter<string>= new EventEmitter();

  pts = [];
  results = [];
  ars = [];

  constructor(private cualitativosService: CualitativosService) {

    this.pts = this.cualitativosService.ejesNvlTres.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());;
    this.ars = this.cualitativosService.ars;

  }

  ngOnInit() {

    this.loadData();

  }

  loadData() {

    var puntos = [];
    var labels = [];
    var puntosAR = [];
    var arsRef = this.ars.filter(x => x.Resultlevel3 != null);
    var ptsDos = this.pts;
    this.pts.sort((a,b)=>Number(a.idresultqualitative) - Number(b.idresultqualitative))
    .map((dato,i)=>{
      puntos.push(Number(this.pts[i].ordergraph));
      labels.push(dayjs(this.pts[i].Fecha).format('DD-MM-YYYY'));

      var color: string = '';
      var referencia = this.ars.find(dato => dato.Idresultqualitative == parseInt(this.pts[i].idresultqualitative));
      referencia.Arlevel3 == 'R' ? color = 'red' : color = '#D0A0D0';

      const objeto = {
        value: Number(this.pts[i].ordergraph),
        itemStyle: {
          color: color
        }
      }

      puntosAR.push(objeto);
    });
   

    // ----------------------------------
    const _parent =  document.getElementById('nivel-3').parentElement;
    const _boxChart = _parent.parentElement; // contenedor de la grafica
    var _wChart = 1000;

    if (_boxChart.clientWidth <= 1366) {
      document.getElementById('nivel-3').style.width = `${_boxChart.clientWidth}px`;
      //document.getElementById('nivel-3').style.overflowX = 'scroll';

      _wChart = _boxChart.clientWidth * 0.99;

    }

    if(_wChart > 1000){
      _wChart = 1000;
    }

    Object.defineProperty(document.getElementById('main3'), 'clientWidth', { get: function () { return _wChart  } });
    Object.defineProperty(document.getElementById('main3'), 'clientHeight', { get: function () { return 400 } });
    document.getElementById('main3').style.marginTop = '40px';
    var myChart = echarts.init(document.getElementById('main3'));

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
        }
      ],
      title: {
        text: 'Nivel 3',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (data)=>{

          let colorItem = '';
          let comentarios = '';
          let acciones = '';
          let estado = '';
          let referencia = this.pts[data[0].dataIndex];
          var fecha = dayjs(referencia.Fecha).format('DD-MM-YYYY');

          referencia.Comments != '' && referencia.Comments != null ? comentarios = referencia.Comments : comentarios = 'N/R';
          referencia.Descorrectiveactions != '' && referencia.Descorrectiveactions != null ? acciones = referencia.Descorrectiveactions : acciones = 'N/R';

          if (referencia.Arlevel3 == 'R') {

            colorItem = 'red';
            estado = 'Rechazado';

          } else {

            colorItem = '#007D00',
              estado = 'Aceptado'
          }

          return '<b>Resultado:</b> ' + referencia.resultlevel3 + '<br>' + '<b>Fecha:</b> ' + fecha + '<br>' + '<b>Estado:</b> ' + `<b style="color: ${colorItem}">${estado}</b>` + '<br>' + '<b>Acción correctiva:</b> ' + acciones + '<br>' + '<b>Comentarios:</b> ' + comentarios;

        }

      },
      grid: {
        bottom: '16%',
        containLabel: true,
      },
      silent: true,
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          fontWeight: 'bold'
        }
      },
      yAxis: {
        type: 'value',
        show: true,
        axisLabel: {
          fontWeight: 'bold',
          formatter: function (params) {

            for (let i = 0; i < ptsDos.length; i++) {

              if (params == ptsDos[i].ordergraph) {

                return ptsDos[i].Result.toLowerCase();

              }

            }

          }
        }
      },
      series: [
        {
          data: puntos,
          type: 'line',
          showSymbol: true,
          symbol: 'square',
          symbolSize: 10,
          lineStyle: {
            color: '#7C007C',
            width: 2.5
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: '#7C007C',
            color: '#D0A0D0'
          }
        },
        {
          type: 'scatter',
          name: 'hola',
          symbol: 'rect',
          symbolSize: 10,
          zlevel: 1,
          data: puntosAR
        }
      ]

    });

    setTimeout(() => {
      this.grafica3C.emit(myChart.getDataURL());
    }, 1000);
  }

}

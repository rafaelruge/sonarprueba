import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ChartComponent } from "ng-apexcharts";

@Component({
  selector: 'app-reporte-consolidado',
  templateUrl: './reporte-consolidado.component.html',
  styleUrls: ['./reporte-consolidado.component.css']
})
export class ReporteConsolidadoComponent {

  @Input() chartOptions1;
  @Input() chartOptions2;
  @Input() titulo2;
  @Input() titulo1;
  
  @ViewChild("chart") chart: ChartComponent;

  constructor() {}
}

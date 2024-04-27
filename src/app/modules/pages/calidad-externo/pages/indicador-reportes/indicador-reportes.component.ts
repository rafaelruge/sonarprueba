import { Component } from '@angular/core';

@Component({

  selector: 'app-indicador-reportes',
  templateUrl: './indicador-reportes.component.html',
  styleUrls: ['./indicador-reportes.component.css']
})

export class IndicadorReportesComponent {

  tipoReporte: number = 1;

  constructor() { }

  tipo(tipo: number){

    this.tipoReporte = tipo;

  }

}

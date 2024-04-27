import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-indicadores',
  templateUrl: './indicadores.component.html',
  styleUrls: ['./indicadores.component.css']
})
export class IndicadoresComponent {

  tipoReporte: number = 1;
  tituloInd: string = '';

  constructor() { }

  
  selectedIndicador(itemIndicador: Document, pElement: HTMLHRElement, tipo: number){
    this.tipoReporte = tipo;
    this.tituloInd = pElement.innerText;    
  }
}

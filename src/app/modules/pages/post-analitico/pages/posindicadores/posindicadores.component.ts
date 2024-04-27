import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-posindicadores',
  templateUrl: './posindicadores.component.html',
  styleUrls: ['./posindicadores.component.css']
})
export class PosindicadoresComponent implements OnInit {


  tipoReporte: number = 1;
  tituloInd: string = 'Informe de valores críticos al médico tratante(QT1)';
  
  constructor() { }

  ngOnInit(): void {
  }
  
  selectedIndicador(itemIndicador: Document, pElement: HTMLHRElement, tipo: number){
    this.tipoReporte = tipo;
    this.tituloInd = pElement.innerText;    
  }
  desplazarInterpretacionesDerecha(campo:any){

    // this.renderer2.setStyle(this.moverInterpretaciones.nativeElement,'transform','translate(100%)');

    let div = document.getElementById(campo);
   console.log("Div",campo);

    if(campo){

      campo.scrollLeft += 900;

    }

  }


  desplazarInterpretacionesIzquierda(campo:any){

    // this.renderer2.setStyle(this.moverInterpretaciones.nativeElement,'transform','translate(100%)');

    let div = document.getElementById(campo);
   console.log("Div",campo);

    if(campo){

      campo.scrollLeft -= 900;

    }

  }

}

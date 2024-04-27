import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-indicadores-reportes',
  templateUrl: './indicadores-reportes.component.html',
  styleUrls: ['./indicadores-reportes.component.css']
})
export class IndicadoresReportesComponent implements OnInit {

  loader = false;
  hideElemts = false;
  radioSelect = 1

  constructor() { }

  ngOnInit(): void {
  }

}

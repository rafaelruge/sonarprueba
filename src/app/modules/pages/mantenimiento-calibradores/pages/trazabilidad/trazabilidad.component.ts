import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TrazabilidadServices } from '@app/services/mantenimiento-calibradores/trazabililidad.service';
import { MatTableDataSource } from '@angular/material/table';
import * as dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { ExporterService } from '@app/services/mantenimiento-calibradores/exporter.service';


// Interface - referencia para la echarts
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  theme: ApexTheme;
  annotations: ApexAnnotations
  labels: any;
  colors: any;
  horas:any;
};

@Component({
  selector: 'app-trazabilidad',
  templateUrl: './trazabilidad.component.html',
  styleUrls: ['./trazabilidad.component.css']
})
export class TrazabilidadComponent implements OnInit {
  today: number = Date.now();
  modules = [];
  modulesname :any;
  submodname :any;
  submodules = [];
  itemslist = [];
  ventanaModal: BsModalRef;
  ver: boolean = undefined;
  verbtnexcel: boolean = undefined;
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['fecha', "hora","modulo","submodulo",'item','accion','datosnuevos','datosanteriores','usuarios'];
  //------
 
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  acciones = [
    {nameaction:'creación'},
    {nameaction:'actualización'},
    {nameaction:'eliminación'}
  ];

  formaCalendarModal = this.fb.group({
    desde: ['', [Validators.required]],
    hasta: [ '', [Validators.required]],
    modulo:[ '', [Validators.required]],
    submodulo:[ ''],
    item:[ ''],
    accion:[ ''],

  });

 

  constructor( private fb: FormBuilder,
              private translate: TranslateService,
              private toastr: ToastrService,
              private TrazabilidadService: TrazabilidadServices,
              private ExporterService:ExporterService
              ) { }

  ngOnInit(): void {
    
    this.getModules();
    

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async getModules() {
    this.modules = await this.TrazabilidadService.getModules();
  }

  async getSubmodules(id:any) {
    this.submodules = await this.TrazabilidadService.getSubmodules(id);
    
    this.TrazabilidadService.getMenuxId(id).subscribe(respuesta => {
      this.modulesname = respuesta[0].Displayname;
    });

  }

  async getItems(id:any) {
    this.itemslist = await this.TrazabilidadService.getSubmodules(id);
    
    this.TrazabilidadService.getMenuxId(id).subscribe(respuesta => {
      this.submodname = respuesta[0].Displayname;
    });
  }

  enviarFechaForm(){

    if (this.formaCalendarModal.invalid) {
      return  Object.values( this.formaCalendarModal.controls ).forEach( control => {
        control.markAsTouched();
      });
    }

    this.searchByDate();

  }

  selectAll(control: string, form: string) {

    form == 'formaCalendarModal' ? this.formaCalendarModal.get(control).setValue(['-1']) : form == 'formaCalendarModal' ? this.formaCalendarModal.get(control).setValue(['-1']) : this.formaCalendarModal.get(control).setValue(['-1']);

  }

  selectOne(control: string, form: string) {

    if (form == 'formaCalendarModal' && (this.formaCalendarModal.get(control).value[0] == '-1' || this.formaCalendarModal.get(control).value[0] == '')) {

      this.formaCalendarModal.get(control).value.shift();
      this.formaCalendarModal.get(control).setValue(this.formaCalendarModal.get(control).value);

    } else if (form == 'formaCalendarModal' && (this.formaCalendarModal.get(control).value[0] == '-1' || this.formaCalendarModal.get(control).value[0] == '')) {

      this.formaCalendarModal.get(control).value.shift();
      this.formaCalendarModal.get(control).setValue(this.formaCalendarModal.get(control).value);
    } 
  }

  async searchByDate(){

    var desde = dayjs(this.formaCalendarModal.get('desde').value).format('YYYY-MM-DD');
    var hasta = dayjs(this.formaCalendarModal.get('hasta').value).format('YYYY-MM-DD');

    let namemod = this.modulesname;
    let namesubmod;
    var item;
    var accion;

    if(this.submodname != null){
      namesubmod = this.submodname;
    }else{
      namesubmod = null;
    }
    if(this.formaCalendarModal.get('item').value != "" ){
      item = (this.formaCalendarModal.get('item').value);
    }else{
      item=null;
    }
    if(this.formaCalendarModal.get('accion').value == ""){
      accion = null;
    }else{
      accion = this.formaCalendarModal.get('accion').value;
    }

    var jsonTexto: any = '{"fechaini":"' + desde + '","fechafinal":"'+ hasta +'","modulo":"' + namemod +'","submod":"'+ namesubmod +'","item":"'+ item +'","accion":"'+ accion +'"}';
    
    await this.TrazabilidadService.getTrazabilidadLogs(jsonTexto).subscribe(res=>{
     
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.ver = true;
      this.verbtnexcel = true;

      if(res.length == 0){
        this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
        this.ver = false;
        this.verbtnexcel = false;
        this.formaCalendarModal.reset();
      }
      
    },(err):any=>{
      
    })
  }

  name = 'ExcelSheet.xlsx';
  exportToExcel(): void {
    console.log(this.dataSource.data)
    let Modulo;
    let Submodulo;
    let Metodo;
  
    const filteredData = this.dataSource.data.map(item => {
      const data = {
        Fecha:item.fecha,
        Hora: item.hora,
        Modulo: item.modulo,
        Submodulo: item.submodulo,
        Item: item.item,
        Metodo:item.metodo,
        Datos: item.datos,
        Usuario: item.usuario,
        DatosAnteriores: item.datosAnteriores || 'Sin datos anteriores'
      };
      Modulo = item.modulo;
      Submodulo = item.submodulo;
      Metodo = item.metodo;
    
      return data;
    });

    this.ExporterService.exportToExcel(filteredData,`${ Modulo} | ${Submodulo} | ${Metodo} | `);

  }

  //------------------------
  // MODAL
  //------------------------
closeVentana(): void {
  this.ventanaModal.hide();
  //this.itemInd = null;
}

}

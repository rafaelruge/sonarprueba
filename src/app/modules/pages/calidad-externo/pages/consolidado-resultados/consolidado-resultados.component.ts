import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AppConstants } from '@app/Constants/constants';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DiccionarioResultadosqceService } from '@app/services/configuracion/diccionario-resultadosqce.service';
import { ConsolidadoResultadosService } from '@app/services/calidad-externo/ConsolidadoResultadosqce.service';
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-consolidado-resultados',
  templateUrl: './consolidado-resultados.component.html',
  styleUrls: ['./consolidado-resultados.component.css'],
  providers: [DatePipe],
})
export class ConsolidadoResultadosComponent implements OnInit {

  displayedColumns: string[] = ['programa', 'ronda', 'nummuestras', 'muestra', 'analito', 'resultado', 'date'];
  dataSource: MatTableDataSource<any>;
  ventanaModal: BsModalRef;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  formaBuscarDatos: FormGroup;
  formFiltroTest: FormGroup;
  formaRegistroCA: FormGroup;
  bandera: boolean;
  accion: any;
  accionEditar: any;
  tituloAccion: any;
  idacceptancerequirements: any;
  messageError: any;
  messageSinDatos: string;
  titulo: string = '';
  text: string = '';
  text2: string = '';
  text3: string = '';
  aceptar: string = '';
  dateNow: Date = new Date();
  load: boolean;
  show: boolean = false;
  test: number;
  lab: number;
  sec: number;
  mat: number;
  lote: number;
  fechaini = moment().format('YYYY-MM-DD');;
  fechafin = moment().format('YYYY-MM-DD');;
  program: number;
  client: number;
  campaignOne: FormGroup;
  campaignTwo: FormGroup;

  dateNowISO = this.dateNow.toTimeString();
  sedes = [];
  sedesActive = [];
  secciones = [];
  seccionesActive = [];
  controlMaterial = [];
  controlMaterialActive = [];
  lotes = [];
  lotesActive = [];
  tests = [];
  resultsDictionary = [];
  resultsDictionaryActive = [];
  programas = [];
  clientes = [];
  clientesdff = [];
  resultados = [];


  constructor(

    private fb: FormBuilder,
    private consolidadoresultadosService: ConsolidadoResultadosService,
    private DiccionarioResultadosqceService: DiccionarioResultadosqceService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,
    private ventanaService: VentanasModalesService,
    private programservice: ProgramaQceService,
    private datePipe: DatePipe,

  ) { }



  ngOnInit(): void {

    this.crearFormularioBuscarDatos();
    this.cargarProgramas();
    this.cargarClientes();
    this.cargarDicResul();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();

  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);

  }

  get fechadesdeNoValido() {
    return this.formaBuscarDatos.get('fechadesde');
  }

  get fechahastaNoValido() {
    return this.formaBuscarDatos.get('fechahasta');
  }

  get programaNoValido() {
    return this.formaBuscarDatos.get('programa');
  }

  get clienteNoValido() {
    return this.formaBuscarDatos.get('cliente');
  }

  crearFormularioBuscarDatos() {

    this.formaBuscarDatos = this.fb.group({

      fechadesde: ['', [Validators.required]],
      fechahasta: ['', [Validators.required]],
      programa: ['',[Validators.required]],
      cliente: ['', [Validators.required]],

    });

  }

  async cargarProgramas() {
    this.programas = await this.programservice.getAllAsync();
  }

  async cargarClientes() {
    this.clientes = await this.consolidadoresultadosService.getfilterClientresult();
  }

  async cargarDicResul() {
    this.resultsDictionary = await this.DiccionarioResultadosqceService.getAllAsync();
    this.resultsDictionaryActive = this.resultsDictionary.filter(e => e.active == true);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  loadData() {

    if (!this.formaBuscarDatos.invalid) {

      this.show = false;
      this.spinner.show();

      var fechainicial = this.datePipe.transform(this.formaBuscarDatos.value.fechadesde, 'yyyy-MM-dd')
      var fechafin = this.datePipe.transform(this.formaBuscarDatos.value.fechahasta, 'yyyy-MM-dd')

      this.consolidadoresultadosService.getfilterConsolidadoResult(this.formaBuscarDatos.value.cliente, fechainicial, fechafin, this.formaBuscarDatos.value.programa).subscribe(respuesta => {

        this.dataSource = new MatTableDataSource(respuesta);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        setTimeout(() => {

          this.show = true;
          this.spinner.hide();

        }, 3000);

      }, error => {

        this.accion = 'noDatos';
        this.dataSource = new MatTableDataSource([]);
        this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
        this.formaBuscarDatos.reset({ cliente: '', fechadesde: '', fechahasta: '', programa: '' });
        this.show = false;
        this.spinner.hide();

      });

    }

  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.ACEPTAR').subscribe(respuesta => this.aceptar = respuesta);
  }

  closeVentana(): void {
    this.ventanaModal.hide();
  }

}

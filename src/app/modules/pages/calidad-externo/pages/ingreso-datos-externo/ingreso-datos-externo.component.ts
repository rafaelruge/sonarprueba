import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
import { InfoResultQceService } from '@app/services/calidad-externo/inforesultQce.service';
import { ResponsexSampleService } from '@app/services/calidad-externo/responsexsample.service';
import * as moment from 'moment';
import { InfoDetailsResultQceService } from '@app/services/calidad-externo/infodetailsresultQce.service';
import { DiccionarioResultadosQceService } from '@app/services/calidad-externo/diccionarioResultadosQce.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { ProgramaPorClienteService } from '../../../../../services/calidad-externo/programaXCliente.service';
import { LaboratoriosService } from '../../../../../services/configuracion/laboratorios.service';
import { AnalytesQceService } from '../../../../../services/calidad-externo/AnalytesQce.service';
import { ResultQceUpdateService } from '../../../../../services/calidad-externo/resultQceUpdate.service';
import { ResultQceService } from '@app/services/calidad-externo/resultQce.service';
import { ConfigResultsService } from '@app/services/calidad-externo/configResults.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as dayjs from 'dayjs';
//import { isSameDay } from 'date-fns';

@Component({
  selector: 'app-ingreso-datos-externo',
  templateUrl: './ingreso-datos-externo.component.html',
  styleUrls: ['./ingreso-datos-externo.component.css'],
  providers: [DatePipe]
})

export class IngresoDatosExternoComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formulario: FormGroup;
  formFiltroMuestra: FormGroup;

  formFiltroresult: FormGroup = this.fb.group({

    idresult: ['']

  })

  accionEditar: any;
  accion: any;
  tituloAccion: any;
  mostrarTabla: boolean;
  ok: string;
  fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  //fechaActual0 = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  fechaActual0 = new Date();
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  idcountry: any;
  programS: string = '';
  numRondas: number;
  titulo2: string;
  objetoResultado: any;
  objectUpdate: any;
  isCuanti = null;
  messageSinDatos: string;
  bandera: boolean = false;
  bandera2: boolean = false;
  nit: any;
  idCliente: number;
  idMuestra: number;
  dataTable = [];
  programa2: string;
  idPrograma: number;
  numRonda: number;
  ventanaModal: BsModalRef;
  programas = [];
  programasActive = [];
  muestrasActive = [];
  dicRes = [];
  dicResActive = [];
  listaResultados = [];
  programasXCliente = [];
  sedeId:any;
  editarResultados:boolean=false;
  noeditarResultados:boolean=false;

  constructor(
    private translate: TranslateService,
    private programQceService: ProgramaQceService,
    private infoResultQceService: InfoResultQceService,
    private diccionarioResultadosQceService: DiccionarioResultadosQceService,
    private analytesQceService: AnalytesQceService,
    private infoDetailsResultQceService: InfoDetailsResultQceService,
    private responsexSampleService: ResponsexSampleService,
    private resultQceUpdateService: ResultQceUpdateService,
    private toastr: ToastrService,
    private onfigResultsService: ConfigResultsService,
    private resultQceService: ResultQceService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private datePipe: DatePipe,
    private sharedService: SharedService,
    private programaPorClienteService: ProgramaPorClienteService,
    private laboratoriosService: LaboratoriosService,
    private ventanaService: VentanasModalesService,

  ) { }

  displayedColumns: string[] = ['rondas', 'muestras', 'vencido', 'responder', 'ver'];
  displayedColumns2 = ['analito', 'analizador', 'metodo', 'resultado', 'inicio', 'fin', 'editar'];
  displayedColumns3: string[] = ['muestra', 'analito', 'analizador', 'metodo', 'resultado', 'inicio', 'fin'];
  dataSource: MatTableDataSource<any>;
  dataSource2: MatTableDataSource<any>;
  dataSource3: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));
    this.validarCliente();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.crearFormulario();
    this.crearFormFiltroMuestra();
    this.filtroMuestra();
    this.getDicResult();

  }

 
  validarCliente() {
    this.laboratoriosService.getAllAsync().then(lab => {

      this.nit = (lab[0].nit);

      this.programaPorClienteService.getProgramasPorCliente(this.nit,this.sedeId).subscribe((data: any) => {

        this.programasActive = data;
        this.idCliente = data[0].Idclient;
      });
    });
  }

  async getDicResult() {

    this.dicRes = await this.diccionarioResultadosQceService.getAllAsync();
    this.dicResActive = this.dicRes.filter(e => e.active);

  }

  filtrar() {

    if (this.formulario.valid) {

      this.idPrograma = parseInt(this.formulario.value.idProgram);

      this.programQceService.getByIdAsync(this.idPrograma).then((data: any) => {

        this.programS = data.desprogram;

      });


      this.infoResultQceService.getData(this.idCliente, this.sedeId,this.idPrograma).subscribe(data => {

        var rondas = [];

        for (let i = 0; i < data.length; i++) {

          if (!rondas.includes(data[i].Nroround)) {

            rondas.push(data[i].Nroround);

          }

        }

        this.dataTable = [];
        for (let i = 0; i < rondas.length; i++) {

          let arreglo = data.filter(ronda => ronda.Nroround == rondas[i]);
          let ronda = arreglo.pop();
          this.dataTable.push(ronda);

        }

        this.dataTable.sort(((a, b) => a.Nroround - b.Nroround));
        this.dataSource = new MatTableDataSource(this.dataTable);
        this.bandera = true;
        console.log(this.dataTable)



      }, err => {
        
        this.accion = 'noDatos';
        this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
        this.bandera = false;
        this.formulario.reset({ idProgram: '' });

      })

    }

  }

  filtroMuestra() {
    
    this.formFiltroMuestra.valueChanges.subscribe(muestra => {

      if (muestra.idMuestra != '') {

        this.idMuestra = parseInt(muestra.idMuestra);

        this.responsexSampleService.getData(this.idCliente, this.sedeId,this.idPrograma, this.numRondas, this.idMuestra).subscribe((data: any) => {

          this.dataSource2 = new MatTableDataSource(data);
          
          
          for(var i=0; i<data.length;i++){
           
            const fechainicial : Date = new Date();
            const otraFecha: Date = new Date(data[i].Enddate); // Reemplaza esto con la fecha que deseas comparar

           
            if(otraFecha > fechainicial){
              this.editarResultados = true;
            }else if(otraFecha < fechainicial){
              this.editarResultados = false;
            }

          }
          
          this.loader();

        }, error => {
          
          this.accion = 'noDatos';
          this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
          this.formFiltroMuestra.reset({ idMuestra: '' });
          this.bandera2 = false;

        });

      }

    });

  }

  loader() {

    this.bandera2 = false;
    this.spinner.show();

    setTimeout(() => {

      this.bandera2 = true;
      this.spinner.hide();

    }, 3000)

  }

  crearObjetoUpdate(resultado: any) {
    if (resultado != '' && resultado != undefined && resultado != null) {

      this.objectUpdate = {
        idresult: this.objetoResultado.Idresult,
        idround: this.objetoResultado.Idround,
        IdProgramconf: this.objetoResultado.IdProgramconf,
        userclient: this.objetoResultado.Userclient,
        date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hour: dayjs().format('HH:mm:ss'),
        result: resultado,
        comments: this.objetoResultado.Comments,
        active: this.objetoResultado.Active,
        idheadquarters:this.sedeId,
        idProgramConfClientHead: this.objetoResultado.IdProgramConfClientHead
      }
    }
  }

  actualizarResultado() {
    if (this.objectUpdate != undefined) {
      if (this.objectUpdate.result != null && this.objectUpdate.result != undefined && this.objectUpdate.result != '') {

        if (this.isCuanti == true) {

          this.resultQceUpdateService.update(this.objectUpdate, this.objectUpdate.idresult).subscribe(data => {

            this.responsexSampleService.getData(this.idCliente, this.sedeId,this.idPrograma, this.numRondas, this.idMuestra).subscribe((data: any) => {

              this.dataSource2 = new MatTableDataSource(data);

            });

          });

        } else {

          this.resultQceService.update(this.objectUpdate, this.objectUpdate.idresult).subscribe(data => {

            this.responsexSampleService.getData(this.idCliente, this.sedeId,this.idPrograma, this.numRondas, this.idMuestra).subscribe((data: any) => {

              this.dataSource2 = new MatTableDataSource(data);

            });

          });

        }

        this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
        this.isCuanti = null;
        this.objetoResultado = null;
        this.objectUpdate = undefined;
        this.loader();
        this.bandera2 = false;
        console.log(this.objetoResultado,'row')
        console.log(this.objectUpdate,'obj')
      }
      //Validar que ingrese por lo menos un resultado 
      /*
      else
      {
        this.toastr.error("Por favor ingrese alg");
      }
      */
    }
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  crearFormulario() {

    this.formulario = this.fb.group({

      idProgram: ['', [Validators.required]],

    });

  }

  get idProgramInvalido() {

    return this.formulario.get('idProgram');

  }

  crearFormFiltroMuestra() {

    this.formFiltroMuestra = this.fb.group({

      idMuestra: ['', [Validators.required]],

    });

  }

  cancelUpdate() {

    this.isCuanti = null

  }

  editResult(data: any, idresult:number) {
    this.objetoResultado = data;
    this.analytesQceService.getByIdAsync(data.Idanalytes).then((analito: any) => {

      if (analito.typeresult == 'N') {

        this.isCuanti = true

      } else {
        this.onfigResultsService.getResults(this.idPrograma, analito.idanalytes).subscribe((resp: any) => {

          if (resp?.error)
          {
            this.toastr.error(resp?.error.text);
            return
          }


            this.listaResultados = resp;

            // this.objetoResultado = null
          
        },err => {
          this.listaResultados.length = 0;

          this.toastr.error(err.error.text);

        });

        this.isCuanti = false

      }

    });

  }

  openModalResponder(templateResponder: TemplateRef<any>, datos: any) {
    if (datos.Enddate > this.fechaActual) {

      this.isCuanti = null;

      this.infoResultQceService.getSamplesByClienteAndRound(this.idCliente, this.sedeId,datos.IdProgram, datos.Nroround).subscribe((muestras: any) => {

        this.muestrasActive = muestras;

        this.formFiltroMuestra.reset({ idMuestra: '' });
        this.bandera2 = false;
        this.numRondas = datos.Nroround;
        this.ventanaModal = this.modalService.show(templateResponder, { class: 'modal-lg',backdrop: 'static', keyboard: false });
        this.translate.get('MODULES.INGRESODATOSEXTERNO.FORMULARIO.RESPONDER').subscribe(respuesta => this.tituloAccion = respuesta);

      });

    }

  }

  openModalVisualizar(templateVer: TemplateRef<any>, datos: any) {

    this.programa2 = datos.Desprogram;
    this.numRonda = datos.Nroround;
    var idprograma = datos.IdProgram;
    
    this.infoDetailsResultQceService.getData(this.idCliente,this.sedeId, idprograma,this.numRonda).subscribe(data => {

      data.sort((a, b) => a.Nrosample - b.Nrosample);
      this.dataSource3 = new MatTableDataSource(data);

    }, err => {
      this.accion = 'null';
      this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));

    })

    this.ventanaModal = this.modalService.show(templateVer, { class: 'modal-lg' ,backdrop: 'static', keyboard: false});
    this.translate.get('MODULES.INGRESODATOSEXTERNO.FORMULARIO.VISUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.TITULO').subscribe(respuesta => this.titulo = respuesta);
    this.translate.get('MODULES.SWAL.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWAL.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWAL.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
    this.translate.get('MODULES.SWAL.TEXTERROR').subscribe(respuesta => this.textError = respuesta);
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo2 = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.OK').subscribe(respuesta => this.ok = `<b>${respuesta}</b>`);

  }
  closeVentana(): void {
    this.ventanaModal.hide();
  }

}



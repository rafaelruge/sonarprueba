import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe } from '@angular/common';
import { ProgramaConfQceService } from '@app/services/calidad-externo/ProgramconfQce.service';
import { AnalytesQceService } from '@app/services/calidad-externo/AnalytesQce.service';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { MethodsQceService } from '@app/services/calidad-externo/MethodsQce.service';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
import { ProgramConfQceDetailsService } from '@app/services/calidad-externo/ProgramconfQceDetails.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ReactivosQceService } from '@app/services/calidad-externo/reactivos-qce.service';
import { createLog } from "../../../../../globals/logUser";

@Component({
  selector: 'app-proveedores',
  templateUrl: './programas.component.html',
  styleUrls: ['./programas.component.css']
})
export class ProgramasComponent implements OnInit {

  dateNow: Date = new Date();
  formulario: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  desactivar = false;
  cancelar: any;
  confirmar: any;
  messageError: any;
  isCuanti = false;

  analytes = [];
  analytesActive = [];
  analyzers = [];
  analyzersActive = [];
  methods = [];
  methodsActive = [];
  units = [];
  unitsActive = [];
  programs = [];
  programsActive = [];

  dateNowISO = this.dateNow.toTimeString();

  //predictivos create
  filteredOptionsProgramCreate: Observable<string[]>;
  listprogramcreate: any;
  filteredOptionsAnalyteCreate: Observable<string[]>;
  listanalytecreate: any;
  filteredOptionsAnalyzerCreate: Observable<string[]>;
  listAnalyzercreate: any;
  filteredOptionsReagentsCreate: Observable<string[]>;
  listreagentscreate: any;
  filteredOptionsMethodsCreate: Observable<string[]>;
  listmethodscreate: any;
  filteredOptionsUnitsCreate: Observable<string[]>;
  listunitscreate: any;

  //predictivo edit
  idprogrampr: number;
  desprogrampr: any;
  listaprogrampre: any;
  idanalytepr: number;
  desanalytepr: any;
  listaanalytepre: any;
  idanalyzerpr: number;
  desanalyzerpr: any;
  listaanalyzerpre: any;
  idmethodpr: number;
  idreagentpr: number;
  desmethodpr: any;
  desreagentpr: any;
  listamethodpre: any;
  idunitspr: number;
  desunitspr: any;
  listaunitspre: any;

  formularioEdit: FormGroup = this.fb.group({
    idProgramconf: [],
      idanalytes: [, [Validators.required]],
      idAnalyzer: [, [Validators.required]],
      idmethods: [, [Validators.required]],
      idunits: [, [Validators.required]],
      idProgram: [, [Validators.required]],
      idReagents: [, [Validators.required]],
      valueasign: [],
      active: []
  });
  reactivos: any;
  reactivosActive: any[];
  log = new createLog(this.datePipe,this.translate,this.programConfQceService);

  constructor(
    private reactivosQceService:ReactivosQceService,
    // private programConfQceDetailsService: ProgramConfQceDetailsService,
    private translate: TranslateService,
    private programConfQceService: ProgramaConfQceService,
    private programConfQceDetailsService: ProgramConfQceDetailsService,
    private analytesQceService: AnalytesQceService,
    private analyzerQceService: AnalyzerQceService,
    private programQceService: ProgramaQceService,
    private methodsQceService: MethodsQceService,
    private toastr: ToastrService,
    private unitsQceService: UnitsQceService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe

  ) { }

  displayedColumns: string[] = ['programa', 'analitos', 'analizador','reactivo','metodo', 'unidades', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {

    this.getProgramas();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.getAnalytes();
    this.getAnalyzers();
    this.getMethods();
    this.getUnits();
    this.getPrograms();
    this.getReactivos();
  }

  private _filterProgramsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listprogramcreate
      .filter(result =>
        result.desprogram.toLowerCase().includes(filterValue));
  }

  private _filterAnalytesCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listanalytecreate
      .filter(result =>
        result.desanalytes.toLowerCase().includes(filterValue));
  }
  private _filterAnalyzerCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listAnalyzercreate
      .filter(result =>
        result.nameAnalyzer.toLowerCase().includes(filterValue)).filter(e => e.active == true)
  }
  private _filterMethodsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listmethodscreate
      .filter(result =>
        result.desmethods.toLowerCase().includes(filterValue)).filter(e => e.active == true)
  }

  private _filterReagentsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listreagentscreate
      .filter(result =>
        result.desreagents.toLowerCase().includes(filterValue)).filter(e => e.active == true)
  }
  private _filterUnitsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listunitscreate
      .filter(result =>
        result.codunits.toLowerCase().includes(filterValue)).filter(e => e.active == true)
  }

  async getAnalytes() {
    this.analytes = await this.analytesQceService.getAllAsync();
    this.analytesActive = this.analytes.filter(e => e.active);
  }

  async getAnalyzers() {
    this.analyzers = await this.analyzerQceService.getAllAsync();
    this.analyzersActive = this.analyzers.filter(e => e.active);
  }

  async getReactivos() {
    this.reactivos = await this.reactivosQceService.getAllAsync();
    this.reactivosActive = this.reactivos.filter(e => e.active);
  }

  async getMethods() {
    this.methods = await this.methodsQceService.getAllAsync();
    this.methodsActive = this.methods.filter(e => e.active);
  }

  async getUnits() {
    this.units = await this.unitsQceService.getAllAsync();
    this.unitsActive = this.units.filter(e => e.active);
  }

  async getPrograms() {
    this.programs = await this.programQceService.getAllAsync();
    this.programsActive = this.programs.filter(e => e.active);
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  getProgramas() {
    this.programConfQceDetailsService.getListprogramconf().toPromise().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  validarAnalito(analito: any) {

    if (analito != '') {

      this.analytesQceService.getByIdAsync(analito).then((data: any) => {
        if (data.typeresult == 'N') {
          this.isCuanti = true;
        } else {
          this.isCuanti = false;
        }
      });
    }
  }

  async openModalGestionProgramas(templateGestionProgramas: TemplateRef<any>, datos: any) {
 
    this.crearFormularioGestionProgramas(datos);

    await this.programQceService.getAllAsync().then(data => {
      this.listprogramcreate = data.filter(e => e.active == true);;

      this.listprogramcreate.sort((a: any, b: any) => {
        a.desprogram = a.desprogram.charAt(0) + a.desprogram.slice(1);
        b.desprogram = b.desprogram.charAt(0) + b.desprogram.slice(1);
      })

      this.listprogramcreate.sort((a: any, b: any) => {
        if (a.desprogram < b.desprogram) return -1;
        if (a.desprogram > b.desprogram) return 1;
        return 0;
      })

      this.filteredOptionsProgramCreate = this.formulario.get('idProgram').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterProgramsCreate(value)
        }),
      );
    });

    await this.analytesQceService.getAllAsync().then(data => {
      this.listanalytecreate = data.filter(e => e.active == true);
      this.listanalytecreate.sort((a: any, b: any) => {
        a.desanalytes = a.desanalytes.charAt(0) + a.desanalytes.slice(1);
        b.desanalytes = b.desanalytes.charAt(0) + b.desanalytes.slice(1);
      })

      this.listanalytecreate.sort((a: any, b: any) => {
        if (a.desanalytes < b.desanalytes) return -1;
        if (a.desanalytes > b.desanalytes) return 1;
        return 0;
      })

      this.filteredOptionsAnalyteCreate = this.formulario.get('idanalytes').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterAnalytesCreate(value)
        }),
      );
    });

    await this.analyzerQceService.getAllAsync().then(data => {
      this.listAnalyzercreate = data.filter(e => e.active == true);
      this.listAnalyzercreate.sort((a: any, b: any) => {
        a.nameAnalyzer = a.nameAnalyzer.charAt(0) + a.nameAnalyzer.slice(1);
        b.nameAnalyzer = b.nameAnalyzer.charAt(0) + b.nameAnalyzer.slice(1);
      })

      this.listAnalyzercreate.sort((a: any, b: any) => {
        if (a.nameAnalyzer < b.nameAnalyzer) return -1;
        if (a.nameAnalyzer > b.nameAnalyzer) return 1;
        return 0;
      })

      this.filteredOptionsAnalyzerCreate = this.formulario.get('idAnalyzer').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterAnalyzerCreate(value)
        }),
      );
    });





    await this.methodsQceService.getAllAsync().then(data => {
      this.listmethodscreate = data.filter(e => e.active == true);
      this.listmethodscreate.sort((a: any, b: any) => {
        a.desmethods = a.desmethods.charAt(0) + a.desmethods.slice(1);
        b.desmethods = b.desmethods.charAt(0) + b.desmethods.slice(1);
      })

      this.listmethodscreate.sort((a: any, b: any) => {
        if (a.desmethods < b.desmethods) return -1;
        if (a.desmethods > b.desmethods) return 1;
        return 0;
      })

      this.filteredOptionsMethodsCreate = this.formulario.get('idmethods').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterMethodsCreate(value)
        }),
      );
    });

    // reactivos
    await this.reactivosQceService.getAllAsync().then(data => {
      this.listreagentscreate = data.filter(e => e.active == true);
      this.listreagentscreate.sort((a: any, b: any) => {
        a.desreagents = a.desreagents.charAt(0) + a.desreagents.slice(1);
        b.desreagents = b.desreagents.charAt(0) + b.desreagents.slice(1);
      })

      this.listreagentscreate.sort((a: any, b: any) => {
        if (a.desreagents < b.desreagents) return -1;
        if (a.desreagents > b.desreagents) return 1;
        return 0;
      })

      this.filteredOptionsReagentsCreate = this.formulario.get('idReagents').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterReagentsCreate(value)
        }),
      );
    });

    await this.unitsQceService.getAllAsync().then(data => {
      this.listunitscreate = data.filter(e => e.active == true);
      this.listunitscreate.sort((a: any, b: any) => {
        a.codunits = a.codunits.charAt(0) + a.codunits.slice(1);
        b.codunits = b.codunits.charAt(0) + b.codunits.slice(1);
      })

      this.listunitscreate.sort((a: any, b: any) => {
        if (a.codunits < b.codunits) return -1;
        if (a.codunits > b.codunits) return 1;
        return 0;
      })

      this.filteredOptionsUnitsCreate = this.formulario.get('idunits').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterUnitsCreate(value)
        }),
      );
    });

    this.vantanaModal = this.modalService.show(templateGestionProgramas,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.PROGRAMAS.FORMULARIO.EDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.PROGRAMAS.FORMULARIO.CREAR').subscribe(respuesta => this.tituloAccion = respuesta);
    this.vantanaModal.setClass('modal-xl');

  }
  openModalGestionProgramasEdit(templateGestionProgramas: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionProgramasEdit(datos);

    this.vantanaModal = this.modalService.show(templateGestionProgramas,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.PROGRAMAS.FORMULARIO.EDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.PROGRAMAS.FORMULARIO.CREAR').subscribe(respuesta => this.tituloAccion = respuesta);
    this.vantanaModal.setClass('modal-xl');

  }

  get idanalytesNoValido() {
    return this.formulario.get('idanalytes');
  }

  get idAnalyzerNoValido() {
    return this.formulario.get('idAnalyzer');
  }

  get idreagentsNoValido() {
    return this.formulario.get('idReagents');
  }
  get idmethodsNoValido() {
    return this.formulario.get('idmethods');
  }

  get idunitsNoValido() {
    return this.formulario.get('idunits');
  }

  get idProgramNoValido() {
    return this.formulario.get('idProgram');
  }

  get valueasignNoValido() {
    return this.formulario.get('valueasign');
  }

  get idanalytesNoValidoEdit() {
    return this.formularioEdit.get('idanalytes');
  }

  get idAnalyzerNoValidoEdit() {
    return this.formularioEdit.get('idAnalyzer');
  }

  get idreagentsNoValidoEdit() {
    return this.formularioEdit.get('idReagents');
  }

  get idmethodsNoValidoEdit() {
    return this.formularioEdit.get('idmethods');
  }

  get idunitsNoValidoEdit() {
    return this.formularioEdit.get('idunits');
  }

  get idProgramNoValidoEdit() {
    return this.formularioEdit.get('idProgram');
  }

  get valueasignNoValidoEdit() {
    return this.formularioEdit.get('valueasign');
  }

  crearFormularioGestionProgramas(datos: any) {

    this.formulario = this.fb.group({

      idProgramconf: [datos.IdProgramconf ? datos.IdProgramconf : ''],
      idanalytes: [datos.Idanalytes ? datos.Idanalytes : '', [Validators.required]],
      idAnalyzer: [datos.IdAnalyzer ? datos.IdAnalyzer : '', [Validators.required]],
      idReagents: [datos.Idreagents ? datos.Idreagents : '', [Validators.required]],
      idmethods: [datos.Idmethods ? datos.Idmethods : '', [Validators.required]],
      idunits: [datos.Idunits ? datos.Idunits : '', [Validators.required]],
      idProgram: [datos.IdProgram ? datos.IdProgram : '', [Validators.required]],
      valueasign: [datos.Valueasign ? datos.Valueasign : '', this.isCuanti == true ? [Validators.required] : [Validators.nullValidator]],
      active: [datos.Active ? datos.Active : false]

    });

  }

  async crearFormularioGestionProgramasEdit(datos: any) {


    await this.programQceService.getByIdAsync(datos.IdProgram).then((result: any) => {
      this.desprogrampr = result.desprogram;
    });
    await this.analytesQceService.getByIdAsync(datos.Idanalytes).then((result: any) => {
      this.desanalytepr = result.desanalytes;
    });
    this.idanalytepr = datos.Idanalytes;

    await this.analyzerQceService.getByIdAsync(datos.IdAnalyzer).then((result: any) => {
      this.desanalyzerpr = result.nameAnalyzer;
    });
    this.idanalyzerpr = datos.IdAnalyzer;

    await this.reactivosQceService.getAllAsync().then((result: any) => {
      let desReagent = result.find((x:any) => x.idreagents == datos.IdReagents);
      this.desreagentpr = desReagent.desreagents;
    });
    this.idreagentpr = datos.IdReagents;

    await this.methodsQceService.getByIdAsync(datos.Idmethods).then((result: any) => {
      this.desmethodpr = result.desmethods;
    });
    this.idmethodpr = datos.Idmethods;

    await this.unitsQceService.getByIdAsync(datos.Idunits).then((result: any) => {
      this.desunitspr = result.codunits;
    });
    this.idunitspr = datos.Idunits;

    this.formularioEdit.get('idProgramconf').setValue(datos.IdProgramconf ? datos.IdProgramconf : '')
    this.formularioEdit.get('idanalytes').setValue(this.desanalytepr.toLowerCase() ? this.desanalytepr.toLowerCase() : '')
    this.formularioEdit.get('idAnalyzer').setValue(this.desanalyzerpr.toLowerCase() ? this.desanalyzerpr.toLowerCase() : '')
    this.formularioEdit.get('idReagents').setValue(this.desreagentpr.toLowerCase() ? this.desreagentpr.toLowerCase() : '')
    this.formularioEdit.get('idmethods').setValue(this.desmethodpr.toLowerCase() ? this.desmethodpr.toLowerCase() : '')
    this.formularioEdit.get('idunits').setValue(this.desunitspr.toLowerCase() ? this.desunitspr.toLowerCase() : '')
    this.formularioEdit.get('idProgram').setValue(this.desprogrampr.toLowerCase() ? this.desprogrampr.toLowerCase() : '')
    this.formularioEdit.get('valueasign').setValue(datos.Valueasign ? datos.Valueasign : '')
    this.formularioEdit.get('active').setValue(datos.Active ? datos.Active : false)

    await this.programQceService.getAllAsync().then(data => {
      this.listprogramcreate = data.filter(e => e.active == true);;

      this.listprogramcreate.sort((a: any, b: any) => {
        a.desprogram = a.desprogram.charAt(0) + a.desprogram.slice(1);
        b.desprogram = b.desprogram.charAt(0) + b.desprogram.slice(1);
      })

      this.listprogramcreate.sort((a: any, b: any) => {
        if (a.desprogram < b.desprogram) return -1;
        if (a.desprogram > b.desprogram) return 1;
        return 0;
      })

      this.filteredOptionsProgramCreate = this.formularioEdit.get('idProgram').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterProgramsCreate(value)
        }),
      );
    });

    await this.analytesQceService.getAllAsync().then(data => {
      this.listanalytecreate = data.filter(e => e.active == true);
      this.listanalytecreate.sort((a: any, b: any) => {
        a.desanalytes = a.desanalytes.charAt(0) + a.desanalytes.slice(1);
        b.desanalytes = b.desanalytes.charAt(0) + b.desanalytes.slice(1);
      })

      this.listanalytecreate.sort((a: any, b: any) => {
        if (a.desanalytes < b.desanalytes) return -1;
        if (a.desanalytes > b.desanalytes) return 1;
        return 0;
      })

      this.filteredOptionsAnalyteCreate = this.formularioEdit.get('idanalytes').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterAnalytesCreate(value)
        }),
      );
    });

    await this.analyzerQceService.getAllAsync().then(data => {
      this.listAnalyzercreate = data.filter(e => e.active == true);
      this.listAnalyzercreate.sort((a: any, b: any) => {
        a.nameAnalyzer = a.nameAnalyzer.charAt(0) + a.nameAnalyzer.slice(1);
        b.nameAnalyzer = b.nameAnalyzer.charAt(0) + b.nameAnalyzer.slice(1);
      })

      this.listAnalyzercreate.sort((a: any, b: any) => {
        if (a.nameAnalyzer < b.nameAnalyzer) return -1;
        if (a.nameAnalyzer > b.nameAnalyzer) return 1;
        return 0;
      })

      this.filteredOptionsAnalyzerCreate = this.formularioEdit.get('idAnalyzer').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterAnalyzerCreate(value)
        }),
      );
    });


    // reactivos
    await this.reactivosQceService.getAllAsync().then(data => {
      this.listreagentscreate = data.filter(e => e.active == true);
      this.listreagentscreate.sort((a: any, b: any) => {
        a.desreagents = a.desreagents.charAt(0) + a.desreagents.slice(1);
        b.desreagents = b.desreagents.charAt(0) + b.desreagents.slice(1);
      })

      this.listreagentscreate.sort((a: any, b: any) => {
        if (a.desreagents < b.desreagents) return -1;
        if (a.desreagents > b.desreagents) return 1;
        return 0;
      })

      this.filteredOptionsReagentsCreate = this.formularioEdit.get('idReagents').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterReagentsCreate(value)
        }),
      );
    });


    await this.methodsQceService.getAllAsync().then(data => {
      this.listmethodscreate = data.filter(e => e.active == true);
      this.listmethodscreate.sort((a: any, b: any) => {
        a.desmethods = a.desmethods.charAt(0) + a.desmethods.slice(1);
        b.desmethods = b.desmethods.charAt(0) + b.desmethods.slice(1);
      })

      this.listmethodscreate.sort((a: any, b: any) => {
        if (a.desmethods < b.desmethods) return -1;
        if (a.desmethods > b.desmethods) return 1;
        return 0;
      })

      this.filteredOptionsMethodsCreate = this.formularioEdit.get('idmethods').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterMethodsCreate(value)
        }),
      );
    });

    await this.unitsQceService.getAllAsync().then(data => {
      this.listunitscreate = data.filter(e => e.active == true);
      this.listunitscreate.sort((a: any, b: any) => {
        a.codunits = a.codunits.charAt(0) + a.codunits.slice(1);
        b.codunits = b.codunits.charAt(0) + b.codunits.slice(1);
      })

      this.listunitscreate.sort((a: any, b: any) => {
        if (a.codunits < b.codunits) return -1;
        if (a.codunits > b.codunits) return 1;
        return 0;
      })

      this.filteredOptionsUnitsCreate = this.formularioEdit.get('idunits').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterUnitsCreate(value)
        }),
      );
    });


  }

  crearEditarGestionProgramas() {

    let nomIdprogram = this.formulario.get('idProgram').value
    let nuevaData = this.formulario.value;
    let arrprogram = this.listprogramcreate.sort((a, b) => {
      a.desprogram = a.desprogram.charAt(0).toLowerCase() + a.desprogram.slice(1);
      b.desprogram = b.desprogram.charAt(0).toLowerCase() + b.desprogram.slice(1);

    })
    arrprogram.sort((a, b) => {
      if (a.desprogram < b.desprogram) return -1;
      if (a.desprogram > b.desprogram) return 1;
      return 0;
    })

    arrprogram.filter(result => {
      if (result.desprogram.toLowerCase() === nomIdprogram.toLowerCase()) {
        nuevaData.idProgram = result.idProgram;
        return
      }
      return
    })

    let nomIdanalyte = this.formulario.get('idanalytes').value
    let arranalytes = this.listanalytecreate.sort((a, b) => {
      a.desanalytes = a.desanalytes.charAt(0).toLowerCase() + a.desanalytes.slice(1);
      b.desanalytes = b.desanalytes.charAt(0).toLowerCase() + b.desanalytes.slice(1);

    })
    arranalytes.sort((a, b) => {
      if (a.desanalytes < b.desanalytes) return -1;
      if (a.desanalytes > b.desanalytes) return 1;
      return 0;
    })

    arranalytes.filter(result => {
      if (result.desanalytes.toLowerCase() === nomIdanalyte.toLowerCase()) {
        nuevaData.idanalytes = result.idanalytes;
        return
      }
      return
    })

    let nomIdanalyzer = this.formulario.get('idAnalyzer').value
    let arranalyzer = this.listAnalyzercreate.sort((a, b) => {
      a.nameAnalyzer = a.nameAnalyzer.charAt(0).toLowerCase() + a.nameAnalyzer.slice(1);
      b.nameAnalyzer = b.nameAnalyzer.charAt(0).toLowerCase() + b.nameAnalyzer.slice(1);

    })
    arranalyzer.sort((a, b) => {
      if (a.nameAnalyzer < b.nameAnalyzer) return -1;
      if (a.nameAnalyzer > b.nameAnalyzer) return 1;
      return 0;
    })

    arranalyzer.filter(result => {
      if (result.nameAnalyzer.toLowerCase() === nomIdanalyzer.toLowerCase()) {
        nuevaData.idAnalyzer = result.idAnalyzer;
        return
      }
      return
    })



    let nomIdreagent = this.formulario.get('idReagents').value
    let arrReagents = this.listreagentscreate.sort((a, b) => {
      a.desreagents = a.desreagents.charAt(0).toLowerCase() + a.desreagents.slice(1);
      b.desreagents = b.desreagents.charAt(0).toLowerCase() + b.desreagents.slice(1);

    })
    arrReagents.sort((a, b) => {
      if (a.desreagents < b.desreagents) return -1;
      if (a.desreagents > b.desreagents) return 1;
      return 0;
    })

    arrReagents.filter(result => {
      if (result.desreagents.toLowerCase() === nomIdreagent.toLowerCase()) {
        nuevaData.idReagents = result.idreagents;
        return
      }
      return
    })




    let nomIdmethod = this.formulario.get('idmethods').value
    let arrmethods = this.listmethodscreate.sort((a, b) => {
      a.desmethods = a.desmethods.charAt(0).toLowerCase() + a.desmethods.slice(1);
      b.desmethods = b.desmethods.charAt(0).toLowerCase() + b.desmethods.slice(1);

    })
    arrmethods.sort((a, b) => {
      if (a.desmethods < b.desmethods) return -1;
      if (a.desmethods > b.desmethods) return 1;
      return 0;
    })

    arrmethods.filter(result => {
      if (result.desmethods.toLowerCase() === nomIdmethod.toLowerCase()) {
        nuevaData.idmethods = result.idmethods;
        return
      }
      return
    })

    let nomIdunit = this.formulario.get('idunits').value
    let arrunits = this.listunitscreate.sort((a, b) => {
      a.codunits = a.codunits.charAt(0).toLowerCase() + a.codunits.slice(1);
      b.codunits = b.codunits.charAt(0).toLowerCase() + b.codunits.slice(1);

    })
    arrunits.sort((a, b) => {
      if (a.codunits < b.codunits) return -1;
      if (a.codunits > b.codunits) return 1;
      return 0;
    })

    arrunits.filter(result => {
      if (result.codunits.toLowerCase() === nomIdunit.toLowerCase()) {
        nuevaData.idunits = result.idunits;
        return
      }
      return
    })

    if (this.formulario.valid) {

      const data = {

        idProgramconf: this.formulario.get('idProgramconf').value,
        idanalytes: this.formulario.get('idanalytes').value,
        idAnalyzer: this.formulario.get('idAnalyzer').value,
        idReagents: this.formulario.get('idReagents').value,
        idmethods: this.formulario.get('idmethods').value,
        idunits: this.formulario.get('idunits').value,
        idProgram: this.formulario.get('idProgram').value,
        valueasign: this.formulario.get('valueasign').value,
        active: this.formulario.get('active').value,

      }

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.programConfQceService.create(nuevaData).subscribe(respuesta => {

          this.getProgramas();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;
          this.formulario.reset({ idProgramconf: '', idanalytes: '', idAnalyzer: '',idReagents:'', idmethods: '', idunits: '', idProgram: '', active: false });
          this.log.logObj('Control Calidad Externo','Administración','Programas','c',nuevaData,JSON.stringify(respuesta),200);

        }, (error) => {
          this.toastr.error(this.translate.instant(error.error));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Administración','Asignación de valores','c',nuevaData,error.message,error.status);
        });

      } else {

        this.programConfQceService.update(data, data.idProgramconf).subscribe(respuesta => {

          this.getProgramas();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
          this.log.logObj('Control Calidad Externo','Administración','Programas','a',nuevaData,JSON.stringify(respuesta),200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo','Administración','Asignación de valores','a',nuevaData,error.message,error.status);
        });

      }

    }

  }
  crearEditarGestionProgramasEdit() {

    let nomIdprogram = this.formularioEdit.get('idProgram').value
    let nuevaData = this.formularioEdit.value;
    let arrprogram = this.listprogramcreate.sort((a, b) => {
      a.desprogram = a.desprogram.charAt(0).toLowerCase() + a.desprogram.slice(1);
      b.desprogram = b.desprogram.charAt(0).toLowerCase() + b.desprogram.slice(1);

    })
    arrprogram.sort((a, b) => {
      if (a.desprogram < b.desprogram) return -1;
      if (a.desprogram > b.desprogram) return 1;
      return 0;
    })

    arrprogram.filter(result => {
      if (result.desprogram.toLowerCase() === nomIdprogram.toLowerCase()) {
        nuevaData.idProgram = result.idProgram;
        return
      }
      return
    })

    let nomIdanalyte = this.formularioEdit.get('idanalytes').value
    let arranalytes = this.listanalytecreate.sort((a, b) => {
      a.desanalytes = a.desanalytes.charAt(0).toLowerCase() + a.desanalytes.slice(1);
      b.desanalytes = b.desanalytes.charAt(0).toLowerCase() + b.desanalytes.slice(1);

    })
    arranalytes.sort((a, b) => {
      if (a.desanalytes < b.desanalytes) return -1;
      if (a.desanalytes > b.desanalytes) return 1;
      return 0;
    })

    arranalytes.filter(result => {
      if (result.desanalytes.toLowerCase() === nomIdanalyte.toLowerCase()) {
        nuevaData.idanalytes = result.idanalytes;
        return
      }
      return
    })

    let nomIdanalyzer = this.formularioEdit.get('idAnalyzer').value
    let arranalyzer = this.listAnalyzercreate.sort((a, b) => {
      a.nameAnalyzer = a.nameAnalyzer.charAt(0).toLowerCase() + a.nameAnalyzer.slice(1);
      b.nameAnalyzer = b.nameAnalyzer.charAt(0).toLowerCase() + b.nameAnalyzer.slice(1);

    })
    arranalyzer.sort((a, b) => {
      if (a.nameAnalyzer < b.nameAnalyzer) return -1;
      if (a.nameAnalyzer > b.nameAnalyzer) return 1;
      return 0;
    })

    arranalyzer.filter(result => {
      if (result.nameAnalyzer.toLowerCase() === nomIdanalyzer.toLowerCase()) {
        nuevaData.idAnalyzer = result.idAnalyzer;
        return
      }
      return
    })


    let nomIdreagent = this.formularioEdit.get('idReagents').value
    let arrReagents = this.listreagentscreate.sort((a, b) => {
      a.desreagents = a.desreagents.charAt(0).toLowerCase() + a.desreagents.slice(1);
      b.desreagents = b.desreagents.charAt(0).toLowerCase() + b.desreagents.slice(1);

    })
    arrReagents.sort((a, b) => {
      if (a.desreagents < b.desreagents) return -1;
      if (a.desreagents > b.desreagents) return 1;
      return 0;
    })

    arrReagents.filter(result => {
      if (result.desreagents.toLowerCase() === nomIdreagent.toLowerCase()) {
        nuevaData.idReagents = result.idreagents;
        return
      }
      return
    })


    let nomIdmethod = this.formularioEdit.get('idmethods').value
    let arrmethods = this.listmethodscreate.sort((a, b) => {
      a.desmethods = a.desmethods.charAt(0).toLowerCase() + a.desmethods.slice(1);
      b.desmethods = b.desmethods.charAt(0).toLowerCase() + b.desmethods.slice(1);

    })
    arrmethods.sort((a, b) => {
      if (a.desmethods < b.desmethods) return -1;
      if (a.desmethods > b.desmethods) return 1;
      return 0;
    })

    arrmethods.filter(result => {
      if (result.desmethods.toLowerCase() === nomIdmethod.toLowerCase()) {
        nuevaData.idmethods = result.idmethods;
        return
      }
      return
    })

    let nomIdunit = this.formularioEdit.get('idunits').value
    let arrunits = this.listunitscreate.sort((a, b) => {
      a.codunits = a.codunits.charAt(0).toLowerCase() + a.codunits.slice(1);
      b.codunits = b.codunits.charAt(0).toLowerCase() + b.codunits.slice(1);

    })
    arrunits.sort((a, b) => {
      if (a.codunits < b.codunits) return -1;
      if (a.codunits > b.codunits) return 1;
      return 0;
    })

    arrunits.filter(result => {
      if (result.codunits.toLowerCase() === nomIdunit.toLowerCase()) {
        nuevaData.idunits = result.idunits;
        return
      }
      return
    })

    if (this.formularioEdit.valid) {

      // const data = {

      //   idProgramconf: this.formularioEdit.get('idProgramconf').value,
      //   idanalytes: this.formulario.get('idanalytes').value,
      //   idAnalyzer: this.formulario.get('idAnalyzer').value,
      //   idmethods: this.formulario.get('idmethods').value,
      //   idunits: this.formulario.get('idunits').value,
      //   idProgram: this.formulario.get('idProgram').value,
      //   valueasign: this.formulario.get('valueasign').value,
      //   active: this.formulario.get('active').value,

      // }

      if (this.accion === 'Crear') {
        this.desactivar = true;
        this.programConfQceService.create(nuevaData).subscribe(respuesta => {

          this.getProgramas();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;
          this.formulario.reset({ idProgramconf: '', idanalytes: '', idAnalyzer: '',idReagents:'', idmethods: '', idunits: '', idProgram: '', active: false });
          this.log.logObj('Control Calidad Externo','Administración','Programas','c',nuevaData,JSON.stringify(respuesta),200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo','Administración','Asignación de valores','c',nuevaData,error.message,error.status);
        });

      } else {

        this.programConfQceService.update(nuevaData, nuevaData.idProgramconf).subscribe(respuesta => {

          this.getProgramas();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
          this.log.logObj('Control Calidad Externo','Administración','Programas','a',nuevaData,JSON.stringify(respuesta),200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo','Administración','Asignación de valores','a',nuevaData,error.message,error.status);
        });

      }

    }

  }

  actualizarEstadoGestionProgramas(datosGestion) {

    const estado = datosGestion.Active ? false : true;

    let datos = null;

    if (datosGestion.Valueasign != null) {

      this.isCuanti = true;
      datos = { idProgramconf: datosGestion.IdProgramconf, idanalytes: datosGestion.Idanalytes, idAnalyzer: datosGestion.IdAnalyzer,idReagents:datosGestion.IdReagents, idmethods: datosGestion.Idmethods, idunits: datosGestion.Idunits, idProgram: datosGestion.IdProgram, valueasign: datosGestion.Valueasign, active: estado }

    } else {

      this.isCuanti = false;
      datos = { idProgramconf: datosGestion.IdProgramconf, idanalytes: datosGestion.Idanalytes, idAnalyzer: datosGestion.IdAnalyzer,idReagents:datosGestion.IdReagents, idmethods: datosGestion.Idmethods, idunits: datosGestion.Idunits, idProgram: datosGestion.IdProgram, active: estado }

    }

    this.programConfQceService.update(datos, datosGestion.IdProgramconf).subscribe(respuesta => {

      this.getProgramas();

      this.accion = 'Editar';

    });

  }

  eliminarGestionProgramas(row: any) {
    this.programConfQceService.delete('Programas', row.IdProgramconf).subscribe(respuesta => {

      this.getProgramas();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
      this.log.logObj('Control Calidad Externo','Administración','Rondas','e',row,JSON.stringify(respuesta),200);
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);
        this.log.logObj('Control Calidad Externo','Administración','Rondas','e',row,this.messageError,err.status);
      });

  }

  titulosSwal() {

    this.translate.get('MODULES.SWAL.TITULO').subscribe(respuesta => this.titulo = respuesta);
    this.translate.get('MODULES.SWAL.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWAL.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWAL.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
    this.translate.get('MODULES.SWAL.TEXTERROR').subscribe(respuesta => this.textError = respuesta);
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);

  }

  closeVentana(): void {

    this.vantanaModal.hide();

  }

}


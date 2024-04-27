import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { PublicService } from '@app/services/public.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfiguracionMediaDSService } from '@app/services/configuracion/configuracion-media-ds.service';
import { AppConstants } from '@app/Constants/constants';
import { ReportesService } from '@app/services/configuracion/reportes.service';
import Swal from 'sweetalert2';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SedesService } from '../../../../../services/configuracion/sedes.service';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-configuracion-media-ds',
  templateUrl: './configuracion-media-ds.component.html',
  styleUrls: ['./configuracion-media-ds.component.css'],
  providers: [DatePipe]
})

export class ConfiguracionMediaDsComponent implements OnInit {

  displayedColumns: string[] = ['desanalytes', 'desunits', 'level', 'average', 'ds', 'cv', 'datatype', 'date', 'username', 'editar'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();
  formaBuscarDatos: FormGroup;
  formaRegistroConfiMedia: FormGroup;
  arrayTipo = [];
  ventanaModal: BsModalRef;
  accionEditar: boolean;
  ok: string;
  accion: string;
  tituloAccion: string;
  hidden;
  messageAlerta: string;
  desvestandar: any;
  coefvariacion: any;
  media: any;
  messageSinDatos: string;
  titulo: string = '';
  aceptar: string = '';
  test: number;
  text: string = '';
  ver: boolean = undefined;
  verBtn: boolean = false;
  lab: number;
  sec: number;
  mat: number;
  lote: number;

  sedes = [];
  sedesActive = [];
  secciones = [];
  seccionesActive = [];
  controlMaterial = [];
  controlMaterialActive = [];
  lotes = [];
  lotesActive = [];
  tests = [];
  sedeId:number = 0;
  habilitarSede:boolean = false;

  //predictivos
  filteredOptionsSections: Observable<string[]>;
  filteredOptionsControlmaterial: Observable<string[]>;
  filteredOptionsLots: Observable<string[]>;

  listsectionspr:any;
  idsectionspr:number;
  listcontrolmanterialpr:any;
  idcontrolmaterialpr:number;
  listlotspr:any;
  idlotspr:number;


  constructor(

    private fb: FormBuilder,
    private configuracionMediaDSService: ConfiguracionMediaDSService,
    private publicService: PublicService,
    private controlMaterialService: ControlMaterialService,
    private lotesService: LotesService,
    private seccionesService: SeccionesService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private ventanaService: VentanasModalesService,
    private translate: TranslateService,
    private reportesService: ReportesService,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private sedesService: SedesService,
  ) { }

  ngOnInit(): void {

    this.crearFormularioBuscarDatos();
  /*  this.cargarLotes();
    this.cargarControlMaterial();*/
    this.cargarSedes();
    this.cargarSecciones();
    this.titulosSwal();
    this.cargarSeccionesPre();
    //this.search();
    this.sharedService.customTextPaginator(this.paginator);

    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));

    if (this.sedeId > 0)

    {
     this.formaBuscarDatos.controls['numLaboratorio'].setValue(this.sedeId);
    this.habilitarSede =  true
    }
  }

  private _filterSections(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listsectionspr
              .filter(seccion => 
                seccion.namesection.toLowerCase().includes(filterValue)).filter(e=>e.Active == true)
     
  }

  private _filterControlMaterial(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listcontrolmanterialpr
              .filter(contmat => 
                contmat.descontmat.toLowerCase().includes(filterValue)).filter(e=>e.Active == true)
     
  }

  private _filterLots(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listlotspr
              .filter(lots => 
                lots.Numlot.toLowerCase().includes(filterValue)).filter(e=>e.Active == true)
     
  }

 
  async cargarSeccionesPre() {
    await this.seccionesService.getAllAsyncSecciones().then(data => {
      this.listsectionspr = data.filter(e => e.Active == true);
      
      
      this.listsectionspr.sort((a:any, b:any) => {
        a.namesection =   a.namesection.charAt(0) +  a.namesection.slice(1);
        b.namesection =  b.namesection.charAt(0) +  b.namesection.slice(1);
      })

      this.listsectionspr.sort((a:any, b:any) => {
        if(a.namesection < b.namesection) return -1;
        if(a.namesection > b.namesection) return  1;
        return 0;
      })
      
      this.filteredOptionsSections = this.formaBuscarDatos.get('seccion').valueChanges.pipe(
        startWith(''),
        map(value =>{
          
          return this._filterSections(value)
        }),
      );
    });
  }

  async cambiarSeccion(NombreSeccion: string,idsection?:number){
   
    var namesection0 = this.formaBuscarDatos.get('seccion').setValue(NombreSeccion.split('|')[1]);
    var idsection0 = NombreSeccion.split('|')[0];
    this.idsectionspr = Number(idsection0);

    this.formaBuscarDatos.controls['numMaterialControl'].setValue('');
    this.formaBuscarDatos.controls['numLote'].setValue('');
    
    await this.controlMaterialService.getAllAsyncControlMaterialxsedesec(this.idsectionspr,this.sedeId).then(data => {
      this.listcontrolmanterialpr = data.filter(e => e.Active == true);
      
      
      this.listcontrolmanterialpr.sort((a:any, b:any) => {
        a.descontmat =   a.descontmat.charAt(0) +  a.descontmat.slice(1);
        b.descontmat =  b.descontmat.charAt(0) +  b.descontmat.slice(1);
      })

      this.listcontrolmanterialpr.sort((a:any, b:any) => {
        if(a.descontmat < b.descontmat) return -1;
        if(a.descontmat > b.descontmat) return  1;
        return 0;
      })
      
      this.filteredOptionsControlmaterial = this.formaBuscarDatos.get('numMaterialControl').valueChanges.pipe(
        startWith(''),
        map(value =>{
          
          return this._filterControlMaterial(value)
        }),
      );
    });

  }

  async cambiarControlMaterial(NombreControlmaterial: string,idcontrolmaterial?:number){
   
    var descontmat001 = this.formaBuscarDatos.get('numMaterialControl').setValue(NombreControlmaterial.split('|')[1]);
    var idcontmat = NombreControlmaterial.split('|')[0];
    this.idcontrolmaterialpr = Number(idcontmat);
    
  if (idcontmat != '') {

    this.formaBuscarDatos.get('numLote').reset('');

    //let id: number = parseInt(idcontmat);
   
    await this.lotesService.getAllAsynclotsxsedecontm(this.idcontrolmaterialpr,this.sedeId).then(data => {
      this.listlotspr = data.filter(e => e.Active == true);
     
      this.listlotspr.sort((a:any, b:any) => {
        a.Numlot =   a.Numlot.charAt(0) +  a.Numlot.slice(1);
        b.Numlot =  b.Numlot.charAt(0) +  b.Numlot.slice(1);
      })

      this.listlotspr.sort((a:any, b:any) => {
        if(a.Numlot < b.Numlot) return -1;
        if(a.Numlot > b.Numlot) return  1;
        return 0;
      })
      
      this.filteredOptionsLots = this.formaBuscarDatos.get('numLote').valueChanges.pipe(
        startWith(''),
        map(value =>{
          return this._filterLots(value)
        }),
      );
    });
  } else {

    this.lotesActive = [];
    this.formaBuscarDatos.get('numLote').setValue('');

  }
   

  }

  async lotesPre(nombreLote: string)
  {
    
    var desnumlot = this.formaBuscarDatos.get('numLote').setValue(nombreLote.split('|')[1]);
    var idlot0 = nombreLote.split('|')[0];
    this.idlotspr = Number(idlot0);
   
    this.formaBuscarDatos.get('numLaboratorio').valueChanges.subscribe(data => {

      this.ver = false;
      this.tests = [];

      if (data != '') {

        this.seccionesActive = this.secciones.filter(e => e.active);

        this.formaBuscarDatos.get('seccion').reset('');
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');

      } else {

        this.seccionesActive = [];
        this.controlMaterialActive = [];
        this.lotesActive = [];

        this.formaBuscarDatos.get('seccion').reset('');
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');

      }

    });

    this.formaBuscarDatos.get('seccion').valueChanges.subscribe(data => {

      this.ver = false;
      this.tests = [];

      if (data != '') {

        this.controlMaterialActive = this.controlMaterial.filter(e => e.active);

        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');

      } else {

        this.controlMaterialActive = [];
        this.lotesActive = [];

        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');

      }

    });

    this.formaBuscarDatos.get('numMaterialControl').valueChanges.subscribe(data => {

      this.ver = false;
      this.tests = [];

      if (data != '') {

        this.lotesActive = this.lotes.filter(e => e.active);

        this.formaBuscarDatos.get('numLote').reset('');

      } else {

        this.lotesActive = [];

        this.formaBuscarDatos.get('numLote').reset('');

      }

    });

    this.configuracionMediaDSService.getTestFiltroMediaDS(this.sedeId, this.idsectionspr, this.idcontrolmaterialpr, this.idlotspr).subscribe(response => {

      this.tests = [];
      this.verBtn = false;
      this.tests = response;
      this.formaBuscarDatos.get('idtest').setValue('');

    }, error => {

      let arr = [];
      this.dataSource = new MatTableDataSource(arr);
      this.accion = 'noDatos';
      this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
    //  this.formaBuscarDatos.reset({ numLaboratorio: '', seccion: '', numMaterialControl: '', numLote: '' });
      this.tests = [];
      this.ver = false;

    });
    
  }



  openModal(descripcion) {
    const data = { descripcion, accion: this.accion };
    this.ventanaService.openModal(data);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async cargarSedes() {
    this.sedes = await this.publicService.obtenerSedes();
    this.sedesActive = this.sedes.filter(e => e.active == true);
  }

  async cargarSecciones() {
    this.secciones = await this.seccionesService.getAllAsync();
    this.seccionesActive = this.secciones.filter(e => e.active == true);
  }
/*
  async cargarControlMaterial() {
    this.controlMaterial = await this.controlMaterialService.getAllAsync();
  }

  async cargarLotes() {
    this.lotes = await this.lotesService.getAllAsync();

  }*/

  get numLaboratorioNoValido() {
    return this.formaBuscarDatos.get('numLaboratorio');
  }

  get seccionNoValido() {
    return this.formaBuscarDatos.get('seccion');
  }

  get numMaterialControlNoValido() {
    return this.formaBuscarDatos.get('numMaterialControl');
  }

  get numLoteNoValido() {
    return this.formaBuscarDatos.get('numLote');
  }

  crearFormularioBuscarDatos() {

    this.formaBuscarDatos = this.fb.group({

      numLaboratorio: ['', [Validators.required]],
      seccion: ['', [Validators.required]],
      numMaterialControl: ['', [Validators.required]],
      numLote: ['', [Validators.required]],
      idtest: ['']

    });

  }

  search() {

    this.formaBuscarDatos.get('numLaboratorio').valueChanges.subscribe(data => {
      if (data != '') {

        this.seccionesActive = this.secciones.filter(e => e.active);
        this.tests = [];
        this.ver = false;

        this.formaBuscarDatos.patchValue({ seccion: '', numMaterialControl: '', numLote: '' });

      } else {

        this.seccionesActive = [];
        this.controlMaterialActive = [];
        this.lotesActive = [];
        this.tests = [];
        this.ver = false;

        this.formaBuscarDatos.patchValue({ seccion: '', numMaterialControl: '', numLote: '' });

      }

    });

    this.formaBuscarDatos.get('seccion').valueChanges.subscribe(data => {
      if (data != '') {

        this.controlMaterialActive = this.controlMaterial.filter(e => e.active);
        this.tests = [];
        this.ver = false;

        this.formaBuscarDatos.patchValue({ numMaterialControl: '', numLote: '' });

      } else {

        this.controlMaterialActive = [];
        this.lotesActive = [];
        this.tests = [];
        this.ver = false;

        this.formaBuscarDatos.patchValue({ numMaterialControl: '', numLote: '' });

      }

    });

    this.formaBuscarDatos.get('numMaterialControl').valueChanges.subscribe(data => {

      if (data != '') {

        this.lotesActive = this.lotes.filter(e => e.active);
        this.tests = [];
        this.ver = false;

        this.formaBuscarDatos.patchValue({ numLote: '' });

      } else {

        this.lotesActive = [];
        this.tests = [];
        this.ver = false;

        this.formaBuscarDatos.patchValue({ numLote: '' });

      }

    });

    this.formaBuscarDatos.get('numLote').valueChanges.subscribe(data => {

      if (data != '') {

        this.ver = false;

        const { numLaboratorio, seccion, numMaterialControl } = this.formaBuscarDatos.value;

        this.lab = parseInt(numLaboratorio);
        this.sec = parseInt(seccion);
        this.mat = parseInt(numMaterialControl);
        this.lote = parseInt(data);

        this.configuracionMediaDSService.getTestFiltroMediaDS(this.lab, this.sec, this.mat, this.lote).subscribe(response => {

          this.tests = [];
          this.verBtn = false;
          this.tests = response;
          this.formaBuscarDatos.get('idtest').setValue('');

        }, error => {

          let arr = [];
          this.dataSource = new MatTableDataSource(arr);
          this.accion = 'noDatos';
          this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
        //  this.formaBuscarDatos.reset({ numLaboratorio: '', seccion: '', numMaterialControl: '', numLote: '' });
          this.tests = [];
          this.ver = false;

        });

      }

    });

  }

  setTest(test: any) {

    if (test !== '' || null || undefined) {

      this.test = parseInt(test);
      this.verBtn = true;

    } else {

      this.verBtn = false;

    }

  }

  loadData() {

    this.spinner.show();
    this.ver = false;

    this.configuracionMediaDSService.getBuscadorConfiMediaDS(this.test).then(respuesta => {

      this.arrayTipo = AppConstants.LISTATIPODATOS;
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      setTimeout(() => {

        this.spinner.hide();
        this.ver = true;

      }, 3000);

    }).catch(error => {

      this.ver = true;
      this.dataSource = new MatTableDataSource([]);
      this.accion = 'noDatos';
      this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
      this.spinner.hide();

    });

  }

  openModalConfiMedia(templateConfigMedia: TemplateRef<any>, datos: any) {

    if(datos.Datatype ==  "fecha"){

      this.hidden = true;
      
    }

    this.crearFormularioConfiMedia(datos);
    this.ventanaModal = this.modalService.show(templateConfigMedia,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.CONFIGMEDIADS.COLUMNS.EDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.CONFIGMEDIADS.COLUMNS.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
    // this.modalRef.setClass('modal-lg');
  }

  get datatypeNoValido() {
    return this.formaRegistroConfiMedia.get('datatype');
  }

  get averageNoValido() {
    return this.formaRegistroConfiMedia.get('average');
  }

  get dsNoValido() {
    return this.formaRegistroConfiMedia.get('ds');
  }

  get cvNoValido() {
    return this.formaRegistroConfiMedia.get('cv');
  }

  get fechaInicioNoValido() {
    return this.formaRegistroConfiMedia.get('fechaInicio');
  }

  get fechaFinNoValido() {
    return this.formaRegistroConfiMedia.get('fechaFin');
  }

  crearFormularioConfiMedia(datos: any) {

    this.formaRegistroConfiMedia = this.fb.group({

      idaverageds: [datos.Idaverageds ? datos.Idaverageds : ''],
      datatype: [datos.Datatype ? datos.Datatype : '', [Validators.required]],
      fechaInicio: [''],
      fechaFin: [''],
      date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
      average: [datos.Average, [Validators.required, Validators.min(0)]],
      ds: [datos.Ds, [Validators.required, Validators.min(0)]],
      cv: [datos.Cv, [Validators.required, Validators.min(0)]],
      userid: [datos.Userid ? datos.Userid : ''],
      idAnalyzer: [datos.IdAnalyzer ? datos.IdAnalyzer : ''],
      idAnalyte: [datos.Idanalytes ? datos.Idanalytes : ''],
      level: [datos.Level ? datos.Level : ''],
      idtest: [datos.IdTest ? datos.IdTest : this.test],
      active: [datos.Active ? datos.Active : false]

    });

  }

  changeValue() {

    if (this.datatypeNoValido.value == 'fecha') {

      this.hidden = true;

    } else {

      this.hidden = false;

    }

    if (this.hidden == true) {

      this.fechaInicioNoValido.setValidators([Validators.required]);
      this.fechaFinNoValido.setValidators([Validators.required]);

    }

  }

  async validarSeleccion() {
    if (this.datatypeNoValido.value === 'fecha') {

      if (!this.formaRegistroConfiMedia.invalid) {
        try {
          const mediaF = 'mediafija';
          this.media = await this.getVaribles(mediaF);
          if(this.media == undefined){
            this.closeVentana();
            this.media.media = null
          }
        } catch (err) {
          Swal.fire({
            text: `${this.messageAlerta}`,
            icon: 'info'
          });
          return;
        }
        try {
          const cvF = 'cvfija';
          this.coefvariacion = await this.getVaribles(cvF);
          if(this.coefvariacion == undefined){
            this.closeVentana();
            this.coefvariacion.coefvariacion = null
          }
        } catch (err) {
          Swal.fire({
            text: `${this.messageAlerta}`,
            icon: 'info'
          });
          return;
        }
        try {
          const dsF = 'dsfija';
          this.desvestandar = await this.getVaribles(dsF);
          if(this.desvestandar == undefined){
            this.closeVentana();
            this.desvestandar.desvestandar = null
          }
        } catch (err) {
          Swal.fire({
            text: `${this.messageAlerta}`,
            icon: 'info'
          });
          return;
        }
        const datos = {
          idaverageds: this.formaRegistroConfiMedia.value.idaverageds,
          idtest: this.formaRegistroConfiMedia.value.idtest,
          userid: this.formaRegistroConfiMedia.value.userid,
          level: this.formaRegistroConfiMedia.value.level,
          average: this.media.media,
          ds: this.desvestandar.desvestandar,
          cv: this.coefvariacion.coefvariacion,
          datatype: this.formaRegistroConfiMedia.value.datatype,
          date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          active: this.formaRegistroConfiMedia.value.active
        }
        
        this.crearEditarConfiMedia(datos);
      }
    } else {
      if (this.formaRegistroConfiMedia.valid) {
        const datos = {
          idaverageds: this.formaRegistroConfiMedia.value.idaverageds,
          idtest: this.formaRegistroConfiMedia.value.idtest,
          userid: this.formaRegistroConfiMedia.value.userid,
          level: this.formaRegistroConfiMedia.value.level,
          average: this.formaRegistroConfiMedia.value.average,
          ds: this.formaRegistroConfiMedia.value.ds,
          cv: this.formaRegistroConfiMedia.value.cv,
          datatype: this.formaRegistroConfiMedia.value.datatype,
          date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          active: this.formaRegistroConfiMedia.value.active
        }
        this.crearEditarConfiMedia(datos);
      }
    }
  }
  async getVaribles(variableString) {

    const data = {
      complemento: `Reportes/${variableString}`, fechaInicial: this.formaRegistroConfiMedia.value.fechaInicio,
      fechaFinal: this.formaRegistroConfiMedia.value.fechaFin, level: this.formaRegistroConfiMedia.value.level,
      idheadquaerters: this.formaBuscarDatos.value.numLaboratorio, idanalyzer: this.formaRegistroConfiMedia.value.idAnalyzer,
      idcontrolmaterial: this.idcontrolmaterialpr, idlot: this.idlotspr,
      idanalyte: this.formaRegistroConfiMedia.value.idAnalyte,
      idtest :this.test
    }

    return this.reportesService.getVaribles(data).toPromise();
  }

  crearEditarConfiMedia(datos) {

    this.configuracionMediaDSService.update(datos, datos.idaverageds).subscribe(respuesta => {
    this.closeVentana()
      this.loadData();
      this.accion = 'Editar';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Administración',
        Item:'Configuración Media y DS',
        Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
        Datos: JSON.stringify(datos),
        Respuesta: JSON.stringify(respuesta),
        TipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      };


      this.configuracionMediaDSService.createLogAsync(Loguser).then(respuesta => {

      });

    }, (error) => {

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Administración',
        Item:'Configuración Media y DS',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
        datos: JSON.stringify(datos),
        respuesta: error.message,
        tipoRespuesta: error.status,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      };
      this.configuracionMediaDSService.createLogAsync(Loguser).then(respuesta => {
      });
    });
  }
  titulosSwal() {
    this.translate.get('MODULES.SWAL.MENSAJEALERTA').subscribe(respuesta => this.messageAlerta = respuesta);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.ACEPTAR').subscribe(respuesta => this.aceptar = respuesta);
    this.translate.get('MODULES.SWAL.OK').subscribe(respuesta => this.ok = `<b>${respuesta}</b>`);

  }
  closeVentana(): void {
    this.ventanaModal.hide();
    this.hidden = false;
  }

  async materialControl(id:any)
  {
    this.formaBuscarDatos.controls['numMaterialControl'].setValue('');
    this.formaBuscarDatos.controls['numLote'].setValue('');

     (await this.sedesService.gebByIdSeccionMateriasSedeControl(id,this.sedeId)).subscribe((data:any) => {
      if (data.length > 0)
      {
         this.controlMaterialActive = data;
         this.controlMaterialActive = this.controlMaterialActive.filter(e => e.Active== true);
         this.lotesActive = [];

      }
     },(err:any)=>{
      this.controlMaterialActive = [];
     });
  }

  async lotesFun(id:any)
  {

    this.formaBuscarDatos.controls['numLote'].setValue('');
     (await this.sedesService.gebByIdMaterialSedeLote(id,this.sedeId)).subscribe((data:any) => {
     console.log("Lote", data)
      if (data.length > 0)
      {
         this.lotesActive = data;
         this.lotesActive = this.lotesActive.filter(e => e.Active== true);
      }
     },(err:any)=>{
      this.lotesActive = [];
     });
  }
}


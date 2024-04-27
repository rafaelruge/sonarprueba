import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { DatePipe } from '@angular/common';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { Unidadeservice } from '@app/services/configuracion/unidades.service';
import { FuentesService } from '@app/services/configuracion/fuentes.service';
import { PrecargaService } from '@app/services/post-analitico/precarga.service';

@Component({
  selector: 'app-gestion-analiticos',
  templateUrl: './gestion-analiticos.component.html',
  styleUrls: ['./gestion-analiticos.component.css'],
  providers: [DatePipe]
})
export class GestionAnaliticosComponent implements OnInit,OnDestroy{

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionAnaliticos: FormGroup;
  formulariologdatosant:FormGroup;
  formulariolog:FormGroup;

  filteredOptionsUnitsCreate: Observable<string[]>;
  filteredOptionsSourcesCreate: Observable<string[]>;

  accionEditar: any;
  accion: any;
  tituloAccion: any;
  ventanaModal: BsModalRef;
  ventanaError: BsModalRef;
  titulo: any;
  desactivar = false;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  sections = [];
  sectionsActive : any;
  secciones :any;
  seccionesActive = [];
  seccionesant :any;
  filteredOptionssectionsEdit: Observable<string[]>;
  idsectionpr: number;
  dessectionpr: any;
  listaSecciones: any;


  listunitscreate: any;
  unidadesActive: any;
  fuentesActive: any;
  listsourcescreate: any;
  


  //predictivos create
  filteredOptionsSectionCreate: Observable<string[]>;
  listsectionscreate: any;

  formaGestionAnaliticosEdit: FormGroup = this.fb.group({
    idanalytes: [],
    desanalytes: [, [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    nivels: [, [Validators.required, Validators.min(1), Validators.max(3), Validators.pattern(/^\d+$/)]],
    idsection: [, [Validators.required]],
    resulttype: [, [Validators.required]],
    active: []
  });
  
  listaTemporalPrecarga: any[]=[];
  headersPrecargar:string[]=['idsource','idunits','etmp','cvmp','sesgomp','editar','eliminar','active']
  
  displayedColumns: string[] = ['desAnalytes',  'seccion', 'resulttype', 'Precarga' , 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;
  
  // dataSourcePrecarga: MatTableDataSource<any>;
  
  @ViewChildren(MatPaginator) paginator: QueryList<MatPaginator>=new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  
  // Precarga
  dataSourcePrecarga = new MatTableDataSource<any>();
  miFormPrecarga: FormGroup = this.fb.group({
    idunits: [,[]], // cubierto
    nameUnit: [,[Validators.required]], // cubierto
    idsource: [,[]], // cubierto
    nameSource: [,[Validators.required]], // cubierto
    sesgomp: [,[Validators.required]], // cubierto
    etmp: [,[Validators.required]], // cubierto
    cvmp: [,[Validators.required]], // cubierto
    //leveltest: [,[Validators.required,Validators.pattern(/^[1-3]$/)]], // cubierto
    idSection: [,[Validators.required]], // cubierto
    idAnaytes: [,[Validators.required]], // cubierto
    idpreloadmetquality: [,[]],
    datemod: [,[]],
    active: [true,[]],  // cubierto
    idEliminar: [,[]],  // cubierto
  });
  flagEditar:boolean = false;


  constructor(private translate: TranslateService,
    private analitosService: AnalitosService,
    private seccionesService: SeccionesService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private unidadeservice: Unidadeservice,
    private fuentesService: FuentesService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private precargaService:PrecargaService,
    private cdRef: ChangeDetectorRef) { }

  ngOnDestroy(): void {
    if(this.ventanaError)this.ventanaError.hide();
    if(this.ventanaModal)this.ventanaModal.hide();
  }
  
  ngOnInit(): void {
    
    this.cargarGestionAnaliticos();
    this.sharedService.customTextPaginator(this.paginator.toArray()[0]);
    // this.sharedService.customTextPaginator(this.paginator.toArray()[1]);
    this.titulosSwal();
    this.getSections();
    this.unidades();
    this.fuente();
  }

  private _filterSectionEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.sectionsActive
      .filter(section => section.namesection.toLowerCase().includes(filterValue))

  }

  private _filterSectionsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.sectionsActive
      .filter(section =>
        section.namesection.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }


  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  cargarGestionAnaliticos() {
    this.analitosService.getDetailsAnalytes().subscribe((respuesta:any[]) => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator.toArray()[0];
      this.dataSource.sort = this.sort.toArray()[0];
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  async openModalGestionAnaliticos(templateGestionAnaliticos: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionAnaliticos(datos);

    await this.seccionesService.getAllAsync().then(data => {
      this.listsectionscreate = data.filter(e => e.active == true);

      this.listsectionscreate.sort((a: any, b: any) => {
        a.namesection = a.namesection.charAt(0) + a.namesection.slice(1);
        b.namesection = b.namesection.charAt(0) + b.namesection.slice(1);
      })

      this.listsectionscreate.sort((a: any, b: any) => {
        if (a.namesection < b.namesection) return -1;
        if (a.namesection > b.namesection) return 1;
        return 0;
      })

      this.filteredOptionsSectionCreate = this.formaGestionAnaliticos.get('idsection').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterSectionsCreate(value)
        }),
      );
    });

    this.ventanaModal = this.modalService.show(templateGestionAnaliticos, { backdrop: 'static', keyboard: false });
    this.ventanaModal.setClass('modal-lg');
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.GESTIONANALITICOS.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.GESTIONANALITICOS.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  openModalGestionAnaliticosEdit(formaGestionAnaliticosEdit: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionAnaliticosEdit(datos);

    this.ventanaModal = this.modalService.show(formaGestionAnaliticosEdit, { backdrop: 'static', keyboard: false });
    this.ventanaModal.setClass('modal-lg');
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.GESTIONANALITICOS.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.GESTIONANALITICOS.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  async getSections() {
    this.sections = await this.seccionesService.getAllAsync();
    this.sectionsActive = this.sections.filter(e => e.active);
  }

  get desAnalytesNoValido() {
    return this.formaGestionAnaliticos.get('desanalytes');
  }
  get nivelsNoValido() {
    return this.formaGestionAnaliticos.get('nivels');
  }
  get sectionNoValido() {
    return this.formaGestionAnaliticos.get('idsection');
  }
  get resulttypeNoValido() {
    return this.formaGestionAnaliticos.get('resulttype');
  }

  get desAnalytesNoValidoedit() {
    return this.formaGestionAnaliticosEdit.get('desanalytes');
  }
  get nivelsNoValidoedit() {
    return this.formaGestionAnaliticosEdit.get('nivels');
  }
  get sectionNoValidoedit() {
    return this.formaGestionAnaliticosEdit.get('idsection');
  }
  get resulttypeNoValidoedit() {
    return this.formaGestionAnaliticosEdit.get('resulttype');
  }

  crearFormularioGestionAnaliticos(datos: any) {

    this.formaGestionAnaliticos = this.fb.group({

      idanalytes: [datos.Idanalytes ? datos.Idanalytes : ''],
      desanalytes: [datos.Desanalytes ? datos.Desanalytes : '', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      nivels: [datos.Nivels ? datos.Nivels : '', [Validators.required, Validators.min(1), Validators.max(3), Validators.pattern(/^\d+$/)]],
      idsection: [datos.Idsection ? datos.Idsection : '', [Validators.required]],
      resulttype: [datos.Resulttype ? datos.Resulttype : '', [Validators.required]],
      active: [datos.Active ? datos.Active : false]

    });

    this.formulariologdatosant = this.fb.group({

      idanalytes: [datos.Idanalytes],
      desanalytes: [datos.Desanalytes],
      nivels: [datos.Nivels ],
      idsection: [datos.Idsection],
      resulttype: [datos.Resulttype],
      active: [datos.Active]
    });
  }

  async crearFormularioGestionAnaliticosEdit(datos: any) {

    await this.seccionesService.getByIdAsync(datos.Idsection).then((section: any) => {
      this.dessectionpr = section.namesection;
    });

    this.idsectionpr = datos.Idsection;

    this.formaGestionAnaliticosEdit.get('idanalytes').setValue(datos.Idanalytes ? datos.Idanalytes : '')
    this.formaGestionAnaliticosEdit.get('desanalytes').setValue(datos.Desanalytes ? datos.Desanalytes : '')
    this.formaGestionAnaliticosEdit.get('nivels').setValue(datos.Nivels ? datos.Nivels : '')
    this.formaGestionAnaliticosEdit.get('idsection').setValue(this.dessectionpr.toLowerCase() ? this.dessectionpr.toLowerCase() : '')
    this.formaGestionAnaliticosEdit.get('resulttype').setValue(datos.Resulttype ? datos.Resulttype : '')
    this.formaGestionAnaliticosEdit.get('active').setValue(datos.Active ? datos.Active : false)

    this.listaSecciones = await this.seccionesService.getAllAsync();
    this.sectionsActive = this.listaSecciones.filter(e => e.active == true);
    this.sectionsActive.sort((a, b) => {
      a.namesection = a.namesection.charAt(0).toLowerCase() + a.namesection.slice(1);
      b.namesection = b.namesection.charAt(0).toLowerCase() + b.namesection.slice(1);
    })
    this.sectionsActive.sort((a, b) => {
      if (a.namesection < b.namesection) return -1;
      if (a.namesection > b.namesection) return 1;
      return 0;
    })

    this.filteredOptionssectionsEdit = this.formaGestionAnaliticosEdit.get('idsection').valueChanges.pipe(
      startWith(''),
      map(value => {

        return this._filterSectionEdit(value)
      }),
    );

    // this.formaGestionAnaliticos = this.fb.group({

    //   idanalytes: [datos.Idanalytes ? datos.Idanalytes : ''],
    //   desanalytes: [datos.Desanalytes ? datos.Desanalytes : '', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    //   nivels: [datos.Nivels ? datos.Nivels : '', [Validators.required, Validators.min(1), Validators.max(3), Validators.pattern(/^\d+$/)]],
    //   idsection: [this.dessectionpr ? this.dessectionpr : '', [Validators.required]],
    //   resulttype: [datos.Resulttype ? datos.Resulttype : '', [Validators.required]],
    //   active: [datos.Active ? datos.Active : false]

    // });

    this.formulariologdatosant = this.fb.group({

      idanalytes: [datos.Idanalytes],
      desanalytes: [datos.Desanalytes],
      nivels: [datos.Nivels ],
      idsection: [datos.Idsection],
      resulttype: [datos.Resulttype],
      active: [datos.Active]
    });
  }

  crearEditarGestionAnaliticos() {

    let nomIdsection = this.formaGestionAnaliticos.get('idsection').value
    let nuevaData = this.formaGestionAnaliticos.value;
    let arrsections = this.sectionsActive.sort((a, b) => {
      a.namesection = a.namesection.charAt(0).toLowerCase() + a.namesection.slice(1);
      b.namesection = b.namesection.charAt(0).toLowerCase() + b.namesection.slice(1);

    })
    arrsections.sort((a, b) => {
      if (a.namesection < b.namesection) return -1;
      if (a.namesection > b.namesection) return 1;
      return 0;
    })

    arrsections.filter(result => {
      if (result.namesection.toLowerCase() === nomIdsection.toLowerCase()) {
        nuevaData.idsection = result.idsection;
        return
      }
      return
    })

    if (!this.formaGestionAnaliticos.invalid) {

      let idsection: number = parseInt(this.formaGestionAnaliticos.get('idsection').value);

      this.seccionesService.getByIdAsync(idsection).then((dataseccion: any) => {

        this.secciones = dataseccion.namesection;
        
      }).catch(error => {
  
      });

      const data = {

        idanalytes: this.formaGestionAnaliticos.get('idanalytes').value,
        desanalytes: this.formaGestionAnaliticos.get('desanalytes').value,
        nivels: this.formaGestionAnaliticos.get('nivels').value,
        resulttype: this.formaGestionAnaliticos.get('resulttype').value,
        idsection: idsection,
        active: this.formaGestionAnaliticos.get('active').value

      }

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.analitosService.create(nuevaData).subscribe(respuesta => {

          this.closeVentana();
          this.cargarGestionAnaliticos();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
          this.desactivar = false;

          
          if(data.resulttype == 'N'){

            data.resulttype = 'Cuantitativo';
  
          }else{
            data.resulttype = 'Cualitativo';
          }

          const Loguser = {

            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Analítos',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Analito: ' + data.desanalytes + '| ' + 'Nivel: ' +  data.nivels + '| ' + 'Sección: ' + nuevaData.idsection + '| ' + data.resulttype),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }


          this.analitosService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          var idsection = data.idsection;
          this.seccionesService.getByIdAsync(idsection).then((data: any) => {

            this.secciones = data.namesection;
          
          }).catch(error => {
      
          });
          if(data.resulttype == 'N'){

            data.resulttype = 'Cuantitativo';
  
          }else{
            data.resulttype = 'Cualitativo';
          }
          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Analítos',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
            Datos: ('Analito: ' + data.desanalytes + '| ' + 'Nivel: ' +  data.nivels + '| ' + 'Sección: '  + nuevaData.idsection + '| ' + data.resulttype),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.analitosService.createLogAsync(Loguser).then(respuesta => {
          });

        });

      } else {

        var antdesanalyte = this.formulariologdatosant.get('desanalytes').value;
        var antnivel = this.formulariologdatosant.get('nivels').value;
        var antresulttype = this.formulariologdatosant.get('resulttype').value;
        var antsection = this.formulariologdatosant.get('idsection').value;
        var idseccionnueva = parseInt(this.formaGestionAnaliticos.get('idsection').value);

        //seccion anterior
        var idsectionant = antsection;
        this.seccionesService.getByIdAsync(idsectionant).then((dataseccionant: any) => {

          this.seccionesant = dataseccionant.namesection;
        
        }).catch(error => {
    
        });

        //seccion nueva
        var idsectionnueva = idseccionnueva;
        this.seccionesService.getByIdAsync(idsectionnueva).then((dataseccionueva: any) => {

          this.secciones = dataseccionueva.namesection;
        
        }).catch(error => {
    
        });
       
        if(antresulttype == 'N'){

          antresulttype = 'Cuantitativo';

        }else{
          antresulttype = 'Cualitativo';
        }

        this.analitosService.update(data, data.idanalytes).subscribe(respuesta => {
          this.closeVentana();
          this.cargarGestionAnaliticos();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          if(data.resulttype == 'N'){

            data.resulttype = 'Cuantitativo';
  
          }else{
            data.resulttype = 'Cualitativo';
          }

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Analítos',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Analito: '+ data.desanalytes + '| ' + 'Nivel: ' +  data.nivels + '| ' + 'Sección: ' + this.secciones + '| ' + data.resulttype),
            DatosAnteriores: ('Analito: ' + antdesanalyte + '| '  + 'Nivel: ' + antnivel + '| '  + 'Sección: ' + this.seccionesant + '| ' + antresulttype),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.analitosService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          this.toastr.error(this.translate.instant('No es posible modificar el nivel del analito, Existe configuración de resultados'));
          
          var idsectionnueva = data.idsection;
          this.seccionesService.getByIdAsync(idsectionnueva).then((dataseccionnueva: any) => {

            this.secciones = dataseccionnueva.namesection;
            
          
          }).catch(error => {
      
          });

          //seccion anterior
        var idsectionant = antsection;
        this.seccionesService.getByIdAsync(idsectionant).then((dataseccionant: any) => {

          this.seccionesant = dataseccionant.namesection;
        
        }).catch(error => {
    
        });

        if(data.resulttype == 'N'){

          data.resulttype = 'Cuantitativo';

        }else{
          data.resulttype = 'Cualitativo';
        }

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Analítos',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Analito: ' + data.desanalytes + '| ' + 'Nivel: ' +  data.nivels + '| ' + 'Sección: ' + this.secciones + '| ' + data.resulttype),
            DatosAnteriores: ('Analito: ' + antdesanalyte + '| ' + 'Nivel: ' + antnivel + '| ' + 'Sección: ' + this.seccionesant + '| ' + antresulttype),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.analitosService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }
  }

  async crearEditarGestionAnaliticosEdit() {
    if (!this.formaGestionAnaliticosEdit.invalid) {

      let nomIdsection = this.formaGestionAnaliticosEdit.get('idsection').value
      let nuevaData = this.formaGestionAnaliticosEdit.value;

      let arrsections = this.sectionsActive.sort((a, b) => {
        a.namesection = a.namesection.charAt(0).toLowerCase() + a.namesection.slice(1);
        b.namesection = b.namesection.charAt(0).toLowerCase() + b.namesection.slice(1);
  
      })
      arrsections.sort((a, b) => {
        if (a.namesection < b.namesection) return -1;
        if (a.namesection > b.namesection) return 1;
        return 0;
      })
  
      arrsections.filter(result => {
        if (result.namesection.toLowerCase() === nomIdsection.toLowerCase()) {
          nuevaData.idsection = result.idsection;
          return
        }
        return
      })

      if (this.accion === 'Crear') {

      } else {

        var antdesanalyte = this.formulariologdatosant.get('desanalytes').value;
        var antnivel = this.formulariologdatosant.get('nivels').value;
        var antresulttype = this.formulariologdatosant.get('resulttype').value;
        var antsection = this.formulariologdatosant.get('idsection').value;
        var idseccionnueva = nuevaData.idsection

        //seccion anterior
        
        await this.seccionesService.getByIdAsync(this.idsectionpr).then((dataseccionant: any) => {
          this.seccionesant = dataseccionant.namesection;
        }).catch(error => {});

        //seccion nueva
        var idsectionnueva = idseccionnueva;
        await this.seccionesService.getByIdAsync(idsectionnueva).then((dataseccionueva: any) => {
          this.secciones = dataseccionueva.namesection;
        }).catch(error => {});
       
        if(antresulttype == 'N'){
          antresulttype = 'Cuantitativo';
        }else{
          antresulttype = 'Cualitativo';
        }

        this.analitosService.update(nuevaData, this.formaGestionAnaliticosEdit.value.idanalytes).subscribe(respuesta => {
          this.closeVentana();
          this.cargarGestionAnaliticos();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

          if(nuevaData.resulttype == 'N'){
            nuevaData.resulttype = 'Cuantitativo';
          }else{
            nuevaData.resulttype = 'Cualitativo';
          }

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Analítos',
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Analito: '+ nuevaData.desanalytes + '| ' + 'Nivel: ' +  nuevaData.nivels + '| ' + 'Sección: ' + this.secciones + '| ' + nuevaData.resulttype),
            DatosAnteriores: ('Analito: ' + antdesanalyte + '| '  + 'Nivel: ' + antnivel + '| '  + 'Sección: ' + this.seccionesant + '| ' + antresulttype),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          console.log(Loguser)
          this.analitosService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          this.toastr.error(this.translate.instant('No es posible modificar el nivel del analito, Existe configuración de resultados'));
          
          var idsectionnueva = nuevaData.idsection;
          this.seccionesService.getByIdAsync(idsectionnueva).then((dataseccionnueva: any) => {
            this.secciones = dataseccionnueva.namesection;
          }).catch(error => {
      
          });

          //seccion anterior
        var idsectionant = antsection;
        this.seccionesService.getByIdAsync(idsectionant).then((dataseccionant: any) => {
          this.seccionesant = dataseccionant.namesection;
        }).catch(error => {
        });

        if(nuevaData.resulttype == 'N'){
          nuevaData.resulttype = 'Cuantitativo';
        }else{
          nuevaData.resulttype = 'Cualitativo';
        }

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Control Calidad Interno',
            Submodulo: 'Configuración',
            Item:'Analítos',
            metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: ('Analito: ' + nuevaData.desanalytes + '| ' + 'Nivel: ' +  nuevaData.nivels + '| ' + 'Sección: ' + this.secciones + '| ' + nuevaData.resulttype),
            DatosAnteriores: ('Analito: ' + antdesanalyte + '| ' + 'Nivel: ' + antnivel + '| ' + 'Sección: ' + this.seccionesant + '| ' + antresulttype),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.analitosService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }
  }
  
  actualizarGestionAnaliticos(datosAnalitico) {
    const estado = datosAnalitico.Active ? false : true;
    const datos = { idanalytes: datosAnalitico.Idanalytes, desanalytes: datosAnalitico.Desanalytes, nivels: datosAnalitico.Nivels, idsection: datosAnalitico.Idsection, resulttype: datosAnalitico.Resulttype, active: estado }

    this.analitosService.update(datos, datosAnalitico.Idanalytes).subscribe(respuesta => {
      //this.cargarGestionAnaliticos();
      this.accion = 'Editar';
    });
  }

  eliminarGestionAnaliticos(id: any) {

    var idanalyte = id;
    var namedesanalyte = null;
    this.analitosService.getByIdAsync(idanalyte).then((datanalyte: any) => {

      namedesanalyte = datanalyte.desanalytes;
    
    });

    this.analitosService.delete('Analytes', id).subscribe(respuesta => {

      this.cargarGestionAnaliticos();
      this.accion = '';
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Configuración',
        Item:'Analítos',
        metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
        datos: (id + '| ' + 'Analito: ' + namedesanalyte),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.analitosService.createLogAsync(Loguser).then(respuesta => {
      });
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Analítos',
          metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          datos: (id + '| ' + namedesanalyte),
          respuesta: this.messageError,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.analitosService.createLogAsync(Loguser).then(respuesta => {
        });
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
    this.ventanaModal.hide();
  }

  async modalPrecarga(template: TemplateRef<any>,item:any) {  
    this.miFormPrecarga.reset();
    this.miFormPrecarga.get('idSection')?.setValue(item.Idsection);
    this.miFormPrecarga.get('idAnaytes')?.setValue(item.Idanalytes);
    this.miFormPrecarga.get('active')?.setValue(true);
    
    this.ventanaModal = this.modalService.show(template, { backdrop: 'static', keyboard: false });
    this.ventanaModal.setClass('modal-lg modal-dialog-centered');
    try {
      await this.taerPrecargaPorAnalito(item.Idanalytes)
                .then((sol:any[]) =>{
                  if(sol.length !== 0){
                    this.dataSourcePrecarga.data=[...sol]
                  }
                },e =>{
                  this.dataSourcePrecarga.data=[];
                })
      
    } catch (error) {
      this.dataSourcePrecarga.data=[];
    }    
  }

  modalError(template: TemplateRef<any>,item:any) {  
    this.ventanaError = this.modalService.show(template, { backdrop: 'static', keyboard: false });
    this.ventanaError.setClass('modal-sm modal-dialog-centered');
    this.miFormPrecarga.get('idEliminar')?.setValue(item.idpreloadmetquality);
  }

  unidades(){
    this.unidadeservice.getAllAsync().then(data => {
    
    this.listunitscreate = [...data.filter(e => e.active === true)];
    
    this.listunitscreate.sort((a: any, b: any) => {
      a.desunits = a.desunits.charAt(0) + a.desunits.slice(1);
      b.desunits = b.desunits.charAt(0) + b.desunits.slice(1);
    })

    this.listunitscreate.sort((a: any, b: any) => {
      if (a.desunits < b.desunits) return -1;
      if (a.desunits > b.desunits) return 1;
      return 0;
    })
    this.filteredOptionsUnitsCreate = this.miFormPrecarga.get('nameUnit')?.valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterUnitsCreate(value)
      }),
    );
  });
  }

  fuente(){
    this.fuentesService.getAllAsync().then(data => {
    this.listsourcescreate =[ ...data.filter(e => e.active === true)];

    this.listsourcescreate.sort((a: any, b: any) => {
      a.dessource = a.dessource.charAt(0) + a.dessource.slice(1);
      b.dessource = b.dessource.charAt(0) + b.dessource.slice(1);
    })

    this.listsourcescreate.sort((a: any, b: any) => {
      if (a.dessource < b.dessource) return -1;
      if (a.dessource > b.dessource) return 1;
      return 0;
    })
    this.filteredOptionsSourcesCreate = this.miFormPrecarga.get('nameSource')?.valueChanges
        .pipe(
          startWith(''),
          map(value => {
            return this._filterSourcesCreate(value)
          }),
        );
  });
  }

  private _filterUnitsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listunitscreate
      .filter((units:any) =>units.desunits.toLowerCase().includes(filterValue)).filter(e => e.active === true)
  }

  private _filterSourcesCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listsourcescreate
      .filter((source:any) => source.dessource.toLowerCase().includes(filterValue.split(',')[0])).filter(e => e.active === true)
  }

  limpiarCamposPrecarga(){
    this.miFormPrecarga.get('nameUnit').reset('');
    this.miFormPrecarga.get('nameSource').reset('');
    this.miFormPrecarga.get('idunits').reset('');
    this.miFormPrecarga.get('idsource').reset('');
    this.miFormPrecarga.get('sesgomp').reset();
    this.miFormPrecarga.get('etmp').reset();
    this.miFormPrecarga.get('cvmp').reset();
    //this.miFormPrecarga.get('leveltest').reset();
    this.miFormPrecarga.get('active').reset(true);
  }

  guardarTemporalPrecarga(){
    if(this.miFormPrecarga.invalid){
      this.miFormPrecarga.markAllAsTouched();
      return
    }   
    let fechaActual = new Date();
    let dia = ('0' + fechaActual.getDate()).slice(-2);
    let mes = ('0' + (fechaActual.getMonth() + 1)).slice(-2);
    let anio = fechaActual.getFullYear();
    let fechaActualString = `${anio}/${mes}/${dia}`;
    let id1 = this.listunitscreate.filter(x=>String(x.desunits).toLocaleLowerCase() === String(this.miFormPrecarga.get('nameUnit')?.value).toLocaleLowerCase())
    let id2 = this.listsourcescreate.filter(x=>String(x.dessource).toLocaleLowerCase() === String(this.miFormPrecarga.get('nameSource')?.value).toLocaleLowerCase())

    this.miFormPrecarga.get('datemod')?.setValue(new Date(fechaActualString));
    this.miFormPrecarga.get('idpreloadmetquality').setValue(null);
    this.miFormPrecarga.get('idunits').setValue(id1[0].idunits);
    this.miFormPrecarga.get('idsource').setValue(id2[0].idsource);

    this.precargaService.guardarPrecarga(this.miFormPrecarga.value).subscribe((x:any)=>{
      this.miFormPrecarga.get('idpreloadmetquality').setValue(x.idpreloadmetquality);
      this.listaTemporalPrecarga.push(this.miFormPrecarga.value);
      this.dataSourcePrecarga.data=[...this.listaTemporalPrecarga];
      this.limpiarCamposPrecarga();
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
    },err =>{
      console.log(err);
      this.toastr.error('Error al crear el registro, recuerde que no puede existir dos fuentes iguales');
    })

  }

  eliminarPrecarga(){
    const idPrecarga = this.miFormPrecarga.get('idEliminar')?.value;
    this.precargaService.eliminarPrecarga(idPrecarga)
        .subscribe(x =>{
          this.listaTemporalPrecarga =[...this.listaTemporalPrecarga.filter(z => z.idpreloadmetquality !== idPrecarga)];
          this.dataSourcePrecarga.data=[...this.listaTemporalPrecarga];
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
          this.ventanaError.hide();
        },err => console.log(err))
  }

  prepararEdicion(item:any){
    this.flagEditar = !this.flagEditar;
    let fechaActual = new Date();
    let dia = ('0' + fechaActual.getDate()).slice(-2);
    let mes = ('0' + (fechaActual.getMonth() + 1)).slice(-2);
    let anio = fechaActual.getFullYear();
    let fechaActualString = `${anio}/${mes}/${dia}`;
    item.idEliminar = null;
    this.miFormPrecarga.setValue(item)
    this.miFormPrecarga.get('datemod')?.setValue(new Date(fechaActualString));
  }

  editarPrecarga(){
    if(this.miFormPrecarga.invalid){
      this.miFormPrecarga.markAllAsTouched();
      return
    }   
    const idPrecarga = this.miFormPrecarga.get('idpreloadmetquality')?.value;
    this.precargaService.actualizarPrecarga(idPrecarga,this.miFormPrecarga.value)
      .subscribe(x =>{
          const index = this.listaTemporalPrecarga.findIndex((x)=>x.idpreloadmetquality === idPrecarga);   
          this.listaTemporalPrecarga[index] = this.miFormPrecarga.value;
          this.dataSourcePrecarga.data=[...this.listaTemporalPrecarga];
          this.flagEditar = !this.flagEditar;
          this.limpiarCamposPrecarga();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
        },err =>{
          console.log(err);
          this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALACTUALIZAR'));
        })
    }

  editarEstado(item:any){
    item.active = !item.active ;
    this.precargaService.actualizarPrecarga(item.idpreloadmetquality,item)
    .subscribe(x =>{
        const index = this.listaTemporalPrecarga.findIndex((x)=>x.idpreloadmetquality === item.idpreloadmetquality);   
        this.listaTemporalPrecarga[index] = item;
        this.dataSourcePrecarga.data=[...this.listaTemporalPrecarga];
        this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
      },err =>{
        console.log(err);
        this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALACTUALIZAR'));
      })
  }

  taerPrecargaPorAnalito(idAnalito:number){
      return new Promise((res,e)=>{
        this.precargaService.obtenerPrecargaPorAnalito(idAnalito)
            .subscribe((x:any[]) =>{
              if(x.length !== 0){
                this.listaTemporalPrecarga = [];
                x.map(z =>{
                  this.listaTemporalPrecarga.push({
                    idunits:z.IdUnits,    
                    nameUnit:z.Desunits,
                    idsource:z.IdSource,
                    nameSource:z.Dessource,
                    sesgomp:z.Sesgomp,
                    etmp:z.Etmp,
                    cvmp:z.Cvmp ,
                    //leveltest:z.Leveltest,
                    idSection:z.IdSection,
                    idAnaytes:z.IdAnaytes,
                    idpreloadmetquality:z.Idpreloadmetquality,
                    datemod:z.Datemod,
                    active:z.Active
                  })
                })
              }
              res(this.listaTemporalPrecarga);
            },e =>this.listaTemporalPrecarga = [])
      })
    }

}
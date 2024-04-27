import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AsociacionesService } from '@app/services/configuracion/accionescorrectivas.service';

@Component({
  selector: 'app-gestion-asociaciones-mc',
  templateUrl: './gestion-asociaciones-mc.component.html',
  styleUrls: ['./gestion-asociaciones-mc.component.css']
})
export class GestionAsociacionesMcComponent implements OnInit {
  formaGestionAsociaciones: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  constructor(private translate: TranslateService, private asociacionesService: AsociacionesService, private fb: FormBuilder, private modalService: BsModalService, private toastr: ToastrService,
    private sharedService: SharedService) { }

    displayedColumns: string[] = ['nombrematerial', 'numerolote', 'nombreanalito', 'nombreinstrumento', 'nombrereactivo', 'nombremetodo', 'unidadesmedida', 'nivelescontrol', 'decimales', 'active', 'editar', 'borrar'];
    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionAsociaciones();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  cargarGestionAsociaciones() {
    this.asociacionesService.getAll('Headquarters').subscribe(respuesta => {
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
  openModalGestionAsociaciones(templateGestionAsociaciones: TemplateRef<any>, datos: any){
    this.crearFormularioGestionAsociaciones(datos);

    this.vantanaModal = this.modalService.show(templateGestionAsociaciones,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.GESTIONASOCIACIONES.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta ): this.translate.get('MODULES.GESTIONASOCIACIONES.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta );

  }
  get nombreMaterialNoValido() {
    return this.formaGestionAsociaciones.get('nombrematerial');
  }
  get numeroLoteNoValido() {
    return this.formaGestionAsociaciones.get('numerolote');
  }
  get nombreAnalitoNoValido() {
    return this.formaGestionAsociaciones.get('nombreanalito');
  }
  get nombreInstrumentoNoValido() {
    return this.formaGestionAsociaciones.get('nombreinstrumento');
  }
  get nombreReactivoNoValido() {
    return this.formaGestionAsociaciones.get('nombrereactivo');
  }
  get nombreMetodoNoValido() {
    return this.formaGestionAsociaciones.get('nombremetodo');
  }
  get unidadesMedidaNoValido() {
    return this.formaGestionAsociaciones.get('unidadesmedida');
  }
  get nivelescontrolNoValido() {
    return this.formaGestionAsociaciones.get('nivelescontrol');
  }
  get decimalesNoValido() {
    return this.formaGestionAsociaciones.get('decimales');
  }

  crearFormularioGestionAsociaciones(datos: any) {
    this.formaGestionAsociaciones = this.fb.group({
      id: [datos.id ? datos.id : ''],
      nombrematerial: [datos.nombrematerial ? datos.nombrematerial : '',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      numerolote: [datos.numerolote ? datos.numerolote : '',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      nombreanalito: [datos.nombreanalito ? datos.nombreanalito : '',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      nombreinstrumento: [datos.nombreinstrumento ? datos.nombreinstrumento : '',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      nombrereactivo: [datos.nombrereactivo ? datos.nombrereactivo : '',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      nombremetodo: [datos.nombremetodo ? datos.nombremetodo : '',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      unidadesmedida: [datos.unidadesmedida ? datos.unidadesmedida : '',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      nivelescontrol: [datos.nivelescontrol ? datos.nivelescontrol : '',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      decimales: [datos.decimales ? datos.decimales : '',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      active: [datos.active ? datos.active : false]
    });
  }
  crearEditarGestionAsociaciones(){}
  actualizarEstadoGestionAsociaciones(event, row){}
  eliminarGestionAsociaciones(id){}
  titulosSwal(){
    this.translate.get('MODULES.SWAL.TITULO').subscribe(respuesta => this.titulo = respuesta );
    this.translate.get('MODULES.SWAL.TEXT').subscribe(respuesta => this.text = respuesta );
    this.translate.get('MODULES.SWAL.CANCEL').subscribe(respuesta => this.cancelar = respuesta );
    this.translate.get('MODULES.SWAL.CONFIRM').subscribe(respuesta => this.confirmar = respuesta );
    this.translate.get('MODULES.SWAL.TEXTERROR').subscribe(respuesta => this.textError = respuesta );
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta );
  }
  closeVentana(): void {
    this.vantanaModal.hide();
  }
}

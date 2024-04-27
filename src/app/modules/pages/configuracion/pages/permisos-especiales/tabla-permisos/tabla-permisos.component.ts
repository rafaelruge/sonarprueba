import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from "@angular/core";
import { DatePipe, NgStyle } from '@angular/common';
import { ConfiguracionObjetivosAnalitoService } from '@app/services/configuracion/configuracion-objetivos-analito.service';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from "@angular/material/paginator";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import {
  AccessPermission,
  PermisosData,
} from "@app/interfaces/permisos.interface";
import { PermisosEspecialesService } from "../../../../../../services/configuracion/permisos-especiales.service";
import { RolService } from '@app/services/configuracion/rol.service';
import { Subject, Observable } from "rxjs";
import { DoCheck } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import dayjs from 'dayjs';
import { HttpErrorResponse } from "@angular/common/http";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-tabla-permisos",
  templateUrl: "./tabla-permisos.component.html",
  styleUrls: ["./tabla-permisos.component.css"],
})
export class TablaPermisosComponent
  implements OnInit, AfterViewInit, OnDestroy, DoCheck
{
  modifiedData:AccessPermission[];
  deleteRow(_t16: any) {
    throw new Error("Method not implemented.");
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  cardVisibleAceptar = false;
  cardVisibleCancelar = false;
  originalData: PermisosData[];
  detectChanges: boolean;
  hasDataChanged: boolean = false;
  displayedColumns: string[] = [
    "Modulo",
    "Rol",
    "Crear",
    "Editar",
    "Eliminar",
    "Acciones",
  ];
  dataSource: MatTableDataSource<PermisosData>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<PermisosData>; 
  private readonly onDestroy$ = new Subject<void>();
  isLoading: boolean = false;
  username:any;
  rolid:any;
  namerol:any;
  crearant:any;
  editant:any;
  eliminarant:any;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    private datePipe: DatePipe,
    private readonly permisosEspecialesService: PermisosEspecialesService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private configuracionObjetivosAnalitoService: ConfiguracionObjetivosAnalitoService,
    private translate: TranslateService,
    private RolService: RolService,
    private toastr: ToastrService
  ) {}

  ngDoCheck(): void {
    if (this.dataSource) {
      this.hasDataChanged =
        JSON.stringify(this.originalData) !==
        JSON.stringify(this.dataSource.data);
    }
  }

  ngOnInit(): void {
    // this.username = JSON.parse(sessionStorage.getItem('asistente'));
    this.getRolUser();
    this.permisosEspecialesService.PermisosData.subscribe(
      (data: PermisosData[]) => {
        this.originalData = JSON.parse(JSON.stringify(data));
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    );
  }

  getRolUser(){
    this.rolid = JSON.parse(sessionStorage.getItem('rolid'));
    this.RolService.getByIdAsync(this.rolid).then((datarol:any)=>{
      this.namerol = datarol.namerol;
    })
    
  }
  updatePermisosData(): void {
    this.permisosEspecialesService.updatePermisosData();
  }
  deletePermisoData(id: number) {
    this.permisosEspecialesService.DeletePermisoById(id);
  }

  ngOnDestroy(): void {
    (this.detectChanges = false),
      this.permisosEspecialesService.resfreh$.unsubscribe();
  }

  async toggleCard(card: string) {
    if (card === "aceptar") {
      this.modifiedData = this.getModifiedData()

      if (this.modifiedData.length > 0) {
        // Solo se hace la petición PUT si hay datos modificados
        for (const permisoData of this.modifiedData) {

          await this.permisosEspecialesService.getByIdAsync(permisoData.idpermission).then((data:any)=>{        
            this.crearant=data.crear;
            this.editant=data.editar;;
            this.eliminarant = data.eliminar;
          })
      
          this.permisosEspecialesService.update(permisoData,permisoData.idpermission).subscribe(respuesta => {
            
            this.permisosEspecialesService.updatePermisosData();
            
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Configuración',
              Submodulo: 'Usuarios',
              Item: 'Permisos especiales',
              Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
              Datos: ('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol +  '|Crear: '+ permisoData.crear + '|Editar: ' + permisoData.editar + '|Eliminar: ' + permisoData.eliminar ),
              DatosAnteriores:('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol +  '|Crear: '+ this.crearant + '|Editar: ' + this.editant  + '|Eliminar: ' + this.eliminarant ),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.permisosEspecialesService.createLogAsync(Loguser).then(respuesta => { });
  
          }, (error) => {
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Configuración',
              Submodulo: 'Usuarios',
              Item: 'Permisos especiales',
              Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
              Datos: ('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol +  '|Crear: '+ permisoData.crear + '|Editar: ' + permisoData.editar + '|Eliminar: ' + permisoData.eliminar ),
              DatosAnteriores:('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol +  '|Crear: '+ this.crearant + '|Editar: ' + this.editant  + '|Eliminar: ' + this.eliminarant ),
              Respuesta: JSON.stringify(error),
              TipoRespuesta: error.message,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.permisosEspecialesService.createLogAsync(Loguser).then(() => {
            });
          });
        }
        this.cardVisibleAceptar = !this.cardVisibleAceptar;
      }
    } else if (card === "cancelar") {
      this.cardVisibleCancelar = true;
    }
    this.changeDetectorRef.detectChanges();
  }

  async resetData() {
    this.dataSource.data = JSON.parse(JSON.stringify(this.originalData));
    this.cardVisibleCancelar = !this.cardVisibleCancelar;
  }

  private getModifiedData(): AccessPermission[] {
    return this.dataSource.filteredData.reduce((acc, element) => {
      const originalElement = this.originalData.find(
        (originElmenet) => originElmenet.idpermission === element.idpermission
      );
  
      if (
        originalElement.Crear !== element.Crear ||
        originalElement.Editar !== element.Editar ||
        originalElement.Eliminar !== element.Eliminar
      ) {
        const dto: AccessPermission = {
          idpermission: element.idpermission,
          idmoduleaccess: element.idmoduleaccess,
          userid: null,
          crear: element.Crear,
          editar: element.Editar,
          eliminar: element.Eliminar,
          rolid: element.rolid,
        };
     
        acc.push(dto);
      }
      return acc;
    }, []);
  }


  async deleteElement(id: any) {

    await this.permisosEspecialesService.getByIdAsync(id).then((data:any)=>{
        
      this.crearant=data.crear;
      this.editant=data.editar;;
      this.eliminarant = data.eliminar;
    })
    this.permisosEspecialesService.delete('CA', id).subscribe(respuesta => {
      this.permisosEspecialesService.updatePermisosData();
      
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));

      const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Configuración',
          Submodulo: 'Usuarios',
          Item: 'Permisos especiales',
          Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          Datos: ('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol + '|Crear: '+ this.crearant + '|Editar: ' + this.editant + '|Eliminar: ' + this.eliminarant ),
          Respuesta: JSON.stringify(respuesta),
          TipoRespuesta: 200,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
      this.permisosEspecialesService.createLogAsync(Loguser).then(() => {
      });
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(err.error);
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Configuración',
          Submodulo: 'Usuarios',
          Item: 'Permisos especiales',
          Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGELIMINACION'),
          Datos: ('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol + '|Crear: '+ this.crearant + '|Editar: ' + this.editant + '|Eliminar: ' + this.eliminarant ),
          Respuesta: JSON.stringify(err.message),
          TipoRespuesta: err.error,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
        this.permisosEspecialesService.createLogAsync(Loguser).then(() => {});
      });
  }
}

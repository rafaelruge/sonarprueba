import { Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SidebarService } from '@app/services/general/sidebar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AnyObject } from 'chart.js/types/basic';
import { SendEmailmtoService } from '../../../services/mantenimiento-calibradores/send-mail.service';
import { MantenimientoPreventivoService } from '../../../services/mantenimiento-calibradores/mto-preventive.service';
import { filter, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';


interface mtoPreventive {
  idpreventive_mto:number;
  serial: string;
  description: string;
  datepro: string;
  hourpro: string;
  dateexe: string;
  hourexe: string;
  maintenanceissue: string;
  active: boolean;
  serialDetalle:any; 
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit,OnDestroy {

  foto: string;
  username: any;
  formEditPerfil: FormGroup;
  spin: boolean = false;
  vantanaModal: BsModalRef;
  ventanaModalSesion: BsModalRef;
  nombreRol = '';
  mostrarModal: boolean = false;
  urltrazabilidad:any;
  time:any;
  time2:any;
  respuestaInactividadFlag:boolean=true;
  //vueltas = new Array(5);
  mantenimientosPorSerialProg: mtoPreventive[] = [];

  constructor(public sidebarservice: SidebarService,
              private fb: FormBuilder,
              private usuariosService: UsuariosService,
              private toastr: ToastrService,
              private translate: TranslateService,
              private sendEmailmtoService: SendEmailmtoService,
              private mantenimientoPreventivoService: MantenimientoPreventivoService,
              private router: Router,
              private modalService: BsModalService,
              private dialog: MatDialog) { }
  @ViewChild('inactividadModal') inactividadModal :TemplateRef<any>;

  @HostListener('document:mousemove')
  @HostListener('document:keypress')
  @HostListener('document:click')
  @HostListener('document:wheel')
  inactividad() {
    if(this.router.url.includes('panel')){
      this.respuestaInactividadFlag = true;
      clearTimeout(this.time);
      this.time = setTimeout(() => {
        if(this.ventanaModalSesion === undefined){
          this.ventanaModalSesion = this.modalService.show(this.inactividadModal, { backdrop: 'static', keyboard: false });
          clearTimeout(this.time2);
          this.time2 = setTimeout(() => {
            this.modalService.hide();
            this.ventanaModalSesion.hide();
            this.modalService.hide();
            this.usuariosService.alerta();
          }, 3000000);
        }
      }, 3000000);
    }
    
  }

  ngOnDestroy(): void {
    clearTimeout(this.time);
    clearTimeout(this.time2);
  }
  
  cerrarSesion(){
    this.ventanaModalSesion.hide();
    this.usuariosService.alerta();
  }
  continuarSesion(){
    this.ventanaModalSesion.hide();
    this.ventanaModalSesion = undefined;
    clearTimeout(this.time);
    clearTimeout(this.time2);
  }
  
  ngOnInit(): void {
    this.getDataUser();
    this.EditFormularioPerfil('');
    this.foto = sessionStorage.getItem('imagenuser') || '';
    this.urltrazabilidad = this.sidebarservice.apiURL ;
    this.cargarNotificaciones();
    this.inactividad();
    // this.usuariosService.RenovationToken();
  }

  toggleSidebar() {
    this.sidebarservice.setSidebarState(!this.sidebarservice.getSidebarState());
  }
  toggleBackgroundImage() {
    this.sidebarservice.hasBackgroundImage = !this.sidebarservice.hasBackgroundImage;
  }
  getSideBarState() {
    return this.sidebarservice.getSidebarState();
  }
  hideSidebar() {
    this.sidebarservice.setSidebarState(true);
  }


  async cargarNotificaciones(){

  const notifications: any[] =  await this.sendEmailmtoService.getAllAsync().then(res => res).catch(err => []); 
  const serials = [... new Set(notifications.map(item => item.serial))];
  let mantenimientos = [];
  serials.forEach(element => {
      this.mantenimientoPreventivoService.getInfoPreventivo(element)                                        
                                          .subscribe((mtosPreventivos: mtoPreventive[]) => {                         
                                  
                                            mtosPreventivos.forEach(item => {
                                              mantenimientos.push(item);
                                            });                                           
                        
                                            this.mantenimientosPorSerialProg = mantenimientos.filter(item => new Date(item.datepro).getTime() > new Date().getTime());                                               
                                                            
                                          });      
    });

  }


  getDataUser(){

    let idUser: number = parseInt( sessionStorage.getItem('userid') );

    this.usuariosService.getUser( idUser ).then((user: any) => {

      this.EditFormularioPerfil( user );

    })

  }

  getFoto(foto: File) {

    if( foto != undefined ){

      this.spin = true;
      var reader = new FileReader();
      var base64: any;
      reader.readAsDataURL(foto);
      reader.onload = function () {

        base64 = reader.result;

      };

      setTimeout( () => {

        this.spin = false;
        this.foto = base64.substr(base64.indexOf(',') + 1);

      }, 3000)

    }

  }

  EditFormularioPerfil(datos: any) {

    datos.rolid == 1 ? this.nombreRol = 'Administrador' : datos.rolid == 2 ? this.nombreRol = 'Coordinador' : datos.rolid == 3 ? this.nombreRol = 'Bacteriologo' : this.nombreRol = 'Cliente';

    this.formEditPerfil = this.fb.group({

      userid       : [datos.userid],
      typeid       : [datos.typeid],
      name         : [datos.name, [Validators.required]],
      lastname     : [datos.lastname],
      username     : [datos.username],
      pass         : [''],
      idparametro  : [datos.idparametro],
      nrodoc       : [datos.nrodoc],
      phone        : [datos.phone, [Validators.required]],
      birthdate    : [datos.birthdate],
      tarprof      : [datos.tarprof],
      email        : [datos.email, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      rolid        : [datos.rolid],
      active       : [datos.active],
      superusersede: [datos.superusersede],
      datecreate   : [datos.datecreate],
      dateexp      : [datos.dateexp],
      ativeexp     : [datos.ativeexp],

    });

  }

  EditarPerfilUsuario() {

    if (this.formEditPerfil.valid) {

      var data = this.formEditPerfil.value;

      const imagen = {
        imagenuser: this.foto
      }

      const datos = Object.assign(data, imagen);

      this.usuariosService.updateAsync(datos, this.formEditPerfil.value.userid).then(_ => {

        sessionStorage.removeItem('imagenuser');
        sessionStorage.setItem('imagenuser', this.foto);
        window.location.reload();

      });

      this.username = this.formEditPerfil.value.name + this.formEditPerfil.value.lastname;
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.USUARIO_ACTUALIZADO'));

    }

  }
verModal(){
  setTimeout(()=>{
    this.mostrarModal ? this.mostrarModal = false : this.mostrarModal= true;  
  }, 100);
}
hideModal(){
  this.mostrarModal = false;
}
  closeVentana(): void {
    this.vantanaModal.hide();
  }

}

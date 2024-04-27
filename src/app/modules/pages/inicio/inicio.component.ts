import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportesService } from '@app/services/general/reportes.service';
import { UsuariosService } from '@app/services/usuarios/usuarios.service';


@Component({
    selector: 'app-inicio',
    templateUrl: './inicio.component.html',
    styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
    totales: any;
    welcome = false;
    urlSelected: string;
    constructor(public router: Router,private reportesService: ReportesService, private usuariosService: UsuariosService) { }

    ngOnInit(): void {

        this.usuariosService.sentEmail().subscribe();

        this.cargarReportes();

        this.welcome = true;

        setTimeout( () => {

            this.welcome = false;

        }, 3000 )

    }
    cargarReportes() {
        this.reportesService.getAll('').subscribe(respuesta => {
            this.totales = respuesta;
        });
    }
    public navigate(url: string): void {
      if (url !== '#') {
        this.router.navigate(['/panel/' + url]);
        this.urlSelected = url;
      }
    }
}

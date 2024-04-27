import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '@app/services/shared.service';
import { UsuariosService } from '@app/services/usuarios/usuarios.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-olvidocontrasena',
  templateUrl: './olvidocontrasena.component.html',
  styleUrls: ['./olvidocontrasena.component.css']
})

export class OlvidocontrasenaComponent implements OnInit {

  listaSedes: any;
  formulario: FormGroup;
  mostrarformulario = true;

  constructor(
    private router: Router,
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private userService: UsuariosService,
    private toastr: ToastrService,
    private translate: TranslateService,

  ) {

  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      username: ['', [Validators.required]]
    });
  }
  get usernameNoValido() {
    return this.formulario.get('username').invalid && this.formulario.get('username').touched;
  }

  ingresar() {
    if (!this.formulario.invalid) {
    this.sharedService.showLoader(true);
    this.userService.recuperacionContrasena(this.formulario.controls.username.value)
      .pipe(
        finalize(() => this.formulario.reset()),
      )
      .subscribe(data => {
        console.log(data);
        this.toastr.success(data.mensaje);
        this.sharedService.showLoader(false);
        localStorage.setItem("user", this.formulario.value.username);

        this.router.navigate(['/login/restaurarcontrasena']);
        window.open('#/', '_self');
      }, (error:any)=>{
        this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.REGISFALLIDO'));
      })
}
  }
}

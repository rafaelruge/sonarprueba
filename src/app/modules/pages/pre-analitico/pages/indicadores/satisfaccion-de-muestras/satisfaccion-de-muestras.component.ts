import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { PrePatientidaccuracyService } from '@app/services/pre-analitico/pre-patientidaccuracy.service';
import { SatisfaccionDeMuestrasService } from '@app/services/pre-analitico/satisfaccion-de-muestras.service';

import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { async } from '@angular/core/testing';


interface IndPatient {
  idpatientaccuracy: number;
  illegibleorder: number;
  months: number;
  ordererror: number;
  ordertotal: number;
  requestirrelevantevidence: number;
  requestmissinfo: number;
  transcriptionerrorsample: number;
  userid: number;
  years: number;
  }

@Component({
  selector: 'app-satisfaccion-de-muestras',
  templateUrl: './satisfaccion-de-muestras.component.html',
  styleUrls: ['./satisfaccion-de-muestras.component.css']
})
export class SatisfaccionDeMuestrasComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  indPatient: any = null;
  formulario: FormGroup;
  valItem1: number;
  valItem2: number;
  valItem3: number;
  disabledUp: boolean = true;
  graficaProgreso:boolean = false
  idsamplesoutpatients:number = 0;
  totalOrdenes: number = 0;
  totalOrdPB: any = 0;
  totalOrdPB_Tmp: number = 0;
  //progress bar
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 0;
  alert: boolean = false;
  isDisabled: boolean = true;
  enableGuardar:boolean = true;
  txtInput1: boolean = false;
  txtInput2: boolean = false;
  txtInput3: boolean = false;
  txtInput4: boolean = false;
  txtInput5: boolean = false;
  year: number = new Date().getFullYear();
  anios = [];
  meses = [
    {mes:'Enero', idmes: 1},
    {mes:'Febrero', idmes: 2},
    {mes:'Marzo', idmes: 3},
    {mes:'Abril', idmes: 4},
    {mes:'Mayo', idmes: 5},
    {mes:'Junio', idmes: 6},
    {mes:'Julio', idmes: 7},
    {mes:'Agosto', idmes: 8},
    {mes:'Septiembre', idmes: 9},
    {mes:'Octubre', idmes: 10},
    {mes:'Noviembre', idmes: 11},
    {mes:'DIciembre', idmes: 12},
  ];

  constructor(
    private fb: FormBuilder,
    private prePatientidaccuracyService: PrePatientidaccuracyService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private prePati : SatisfaccionDeMuestrasService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.anios = [
      this.year,
      this.year - 1,
      this.year - 2,
      this.year - 3,
    ];
    this.crearFormulario();
  }

  getFiltro(){
    console.log(this.formulario.value);
    this.disabledUp = false
    this.txtInput3 = false;
    this.alert = false;
    this.enableGuardar = true;


   this.prePatientidaccuracyService.getByMonthYearSatisfaccion(this.formulario.get('mes').value, this.formulario.get('anio').value).subscribe((res:any)=>{
  console.log(res)
  this.graficaProgreso = true
  if(res.length > 0){
    //this.valItem1 = res[0].satisfcollecsample
    this.valItem2 = res[0].totalsurveys
    this.valItem3 = res[0].totalsuccessfulsurveys
    this.isDisabled = false
    this.indPatient = res[0].idsamplesoutpatients
  //  this.totalOrdPB  = res[0].idsamplesoutpatients
  
    this.setTotalProgressBar()
  }
   },(err:any)=>{
     if(err){
  this.graficaProgreso = true
     console.log(err.error)
      this.indPatient = 0
      this.isDisabled = false
      this.valItem1 = 0
      this.valItem2 = 0
      this.valItem3 = 0
      this.totalOrdPB = 0
      console.log("total", this.totalOrdPB)
      this.value = (0) ;
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NO_DATOS'));
    this.totalOrdPB  = 0
     }
   })
  }

    //----------formulario------------

    get mesNoValido() {
      return this.formulario.get('mes');
    }

    get anioNoValido() {
      return this.formulario.get('anio');
    }

    crearFormulario() {
      this.formulario = this.fb.group({
        mes: ['', [Validators.required]],
        anio: ['', [Validators.required]],
      });
    }

    // --------crear editar--------
    crearEditar(){
      console.log(this.indPatient);
      if(this.indPatient){
        console.log('Editar');
        let indJson = {
          months: this.formulario.get('mes').value,
          years: this.formulario.get('anio').value,
          satisfcollecsample : this.valItem1,
          totalsurveys : this.valItem2,
          totalsuccessfulsurveys: this.valItem3,
          idsamplesoutpatients : this.indPatient
         }
        this.prePati.update(indJson, this.indPatient).subscribe(respuesta => {
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formulario.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }
          console.log(Loguser);
          this.prePati.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
          //this.spinner.hide();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
          console.log(respuesta)
        }, (error) => {
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
            Datos: JSON.stringify(this.formulario.value),
            Respuesta:   error.status,
            TipoRespuesta: status
          }
          console.log(Loguser);
          this.prePati.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
          this.toastr.error('Server Error');
      });
      }else{
        console.log('Crear');
        if (!this.formulario.valid || this.formulario.get('mes').value == '--' || this.formulario.get('anio').value == '--') {
          this.toastr.error('Seleccione Mes/Año');
          return;
        }
        let indJson = {
          months: this.formulario.get('mes').value,
          years: this.formulario.get('anio').value,
          satisfcollecsample : this.valItem1,
          totalsurveys : this.valItem2,
          totalsuccessfulsurveys: this.valItem3
      }

      //console.log(indJson);

      this.prePati.create(indJson).subscribe((res:any)=>{
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.dateNowISO,
          Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
          Datos: JSON.stringify(indJson),
          Respuesta: JSON.stringify(res),
          TipoRespuesta: status
        }
        console.log(Loguser);
        this.prePati.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });
        console.log("Respues", res)
          this.indPatient = res.idsamplesoutpatients
            //this.spinner.hide();
            this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
      }, error => {
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.dateNowISO,
          Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGACTUALIZACION'),
          Datos: JSON.stringify(this.formulario.value),
          Respuesta:   error.status,
          TipoRespuesta: status
        }
        console.log(Loguser);
        this.prePati.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });
      })

      }
    }
   async setTotalProgressBar(itemTres?){
      
      console.log(this.valItem2, this.valItem3);

      this.totalOrdPB_Tmp;
      this.totalOrdenes = 100
      if( this.valItem2 != 0 && this.valItem3 != 0)
      {
      //  let res =  this.valItem3 / this.valItem2
      let res =  this.valItem3  * 100 / this.valItem2
        this.totalOrdPB_Tmp = Math.round( (res));
        this.enableGuardar = false
      }else{
         this.enableGuardar = true
      }
        this.totalOrdPB = this.totalOrdPB_Tmp;
      console.log("total", this.totalOrdPB)
      this.value = (this.totalOrdPB_Tmp) ;
     
      if(this.valItem2 < this.valItem3){
        this.txtInput3 = true;
        this.alert = true;     
        this.enableGuardar = true;  
       
      } else {
        this.txtInput3 = false;
        this.alert = false;
        this.enableGuardar = false;
      }
    }

    reset(){
      this.value = 0;
      this.formulario.get('mes').setValue('--');
      this.formulario.get('anio').setValue('--');
      this.valItem1 = null;
      this.valItem2 = null;
      this.valItem3 = null;
      this.totalOrdenes = null;
      this.totalOrdPB_Tmp = 0;
      this.totalOrdPB = 0 ;
      this.isDisabled = true;
      this.alert = false;
      this.valItem2 = null
      this.valItem3 = null
    }
   

   /* switchInputs(input){

      //console.log(input);


      switch (input) {
        case 'input1':
          this.txtInput1 = true;
          break;
          case 'input2':
            this.txtInput2 = true;
            break;
          case 'input3':
            this.txtInput3 = true;
            break;
          case 'input4':
            this.txtInput4 = true;
            break;
          case 'input5':
            this.txtInput5 = true;
            break;
        default:
          this.txtInput1 = false;
          this.txtInput2 = false;
          this.txtInput3 = false;
          this.txtInput4 = false;
          this.txtInput5 = false;
          break;
      }

    }*/


}

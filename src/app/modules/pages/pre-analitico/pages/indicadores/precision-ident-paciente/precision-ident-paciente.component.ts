import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { PrePatientidaccuracyService } from '@app/services/pre-analitico/pre-patientidaccuracy.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';


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
  selector: 'app-precision-ident-paciente',
  templateUrl: './precision-ident-paciente.component.html',
  styleUrls: ['./precision-ident-paciente.component.css']
})
export class PrecisionIdentPacienteComponent implements OnInit {

  indPatient: any = null;

  formulario: FormGroup;
  valItem1: number;
  valItem2: number;
  valItem3: number;
  valItem4: number;
  valItem5: number;
  disabledUp: boolean = true;
  totalOrdenes: number = 0;
  totalOrdPB: number = 0;
  totalOrdPB_Tmp: number = 0;

  //progress bar
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 0;

  alert: boolean = false;

  isDisabled: boolean = true;
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

    this.prePatientidaccuracyService.getByMonthYear(this.formulario.get('mes').value, this.formulario.get('anio').value).subscribe((resp: IndPatient[]) => {

                                                                                 console.log('Indicador: ', resp);
                                                                                 this.indPatient = resp[0];

                                                                                 this.isDisabled = false;
                                                                                 this.totalOrdPB = 0;

                                                                                 this.totalOrdenes = resp[0].ordertotal; // Total
                                                                                 this.valItem1 = resp[0].illegibleorder;
                                                                                 this.valItem2 = resp[0].ordererror;
                                                                                 this.valItem3 = resp[0].requestmissinfo;
                                                                                 this.valItem4 = resp[0].requestirrelevantevidence;
                                                                                 this.valItem5 = resp[0].transcriptionerrorsample;
                                                                                 this.totalOrdPB = this.valItem1 + this.valItem2 + this.valItem3 + this.valItem4 + this.valItem5;
                                                                                

                                                                            }, err =>{

                                                                              this.indPatient = null;


                                                                              this.valItem1 = null;
                                                                              this.valItem2 = null;
                                                                              this.valItem3 = null;
                                                                              this.valItem4 = null;
                                                                              this.valItem5 = null;

                                                                            });



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


        this.indPatient.ordertotal = this.totalOrdenes;
        this.indPatient.illegibleorder = this.valItem1;
        this.indPatient.ordererror = this.valItem2;
        this.indPatient.requestirrelevantevidence = this.valItem4;
        this.indPatient.requestmissinfo = this.valItem3;
        this.indPatient.transcriptionerrorsample = this.valItem5;
        this.indPatient.months = this.formulario.get('mes').value;
        this.indPatient.years = this.formulario.get('anio').value;
        this.indPatient.userid = sessionStorage.getItem('userid');



        this.prePatientidaccuracyService.update(this.indPatient, this.indPatient.idpatientaccuracy).subscribe(respuesta => {

          //this.spinner.hide();
          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

        }, (error) => {

          this.toastr.error('Server Error');


        });



      }else{
        console.log('Crear');


        if (!this.formulario.valid || this.formulario.get('mes').value == '--' || this.formulario.get('anio').value == '--') {

          this.toastr.error('Seleccione Mes/Año');
          return;

        }


        let indJson = {

            //idpatientaccuracy: '',
            ordertotal: this.totalOrdenes,
            illegibleorder: this.valItem1,
            ordererror: this.valItem2,
            requestirrelevantevidence: this.valItem4,
            requestmissinfo: this.valItem3,
            transcriptionerrorsample: this.valItem5,
            months: this.formulario.get('mes').value,
            years: this.formulario.get('anio').value,
            userid: sessionStorage.getItem('userid'),

        }

        console.log(indJson);


        this.prePatientidaccuracyService.create(indJson).subscribe(resp =>{

          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));

          this.indPatient = resp;

        }, err =>{

          this.indPatient = null;
          this.toastr.error('Server Error');


        });

      }

    }




    setTotalProgressBar(element?){

      //console.log(element);


      //this.totalOrdPB_Tmp = this.totalOrdPB_Tmp + element.value;
      console.log(this.valItem1);

      this.totalOrdPB_Tmp =  this.valItem1 + this.valItem2 + this.valItem3 + this.valItem4 + this.valItem5;

      if (element.value > this.totalOrdenes) {

        this.alert = true;

        element.control.setValue(this.totalOrdenes);
        element.control.setErrors({'max': true});
        return;

      }


      if (this.totalOrdPB_Tmp > this.totalOrdenes) {

        console.log('Aqui', this.totalOrdPB_Tmp);


        this.alert = true;

        this.switchInputs(element.name);
        // element.control.setValue(0);
        //element.control.setErrors({'max': true});
        return;
      }


      if (element.value > this.totalOrdenes) {

        this.alert = true;

        element.control.setValue(this.totalOrdenes);
        element.control.setErrors({'max': true});
        return;

      }


      this.totalOrdPB = this.totalOrdPB_Tmp;
      this.value = (this.totalOrdPB * 100) / this.totalOrdenes;
      this.switchInputs('');
      this.alert = false;

    }




    setTotalOrdenes(){

      if (this.totalOrdenes > 0) {

        this.isDisabled = false;

        this.valItem1 = 0;
        this.valItem2 = 0;
        this.valItem3 = 0;
        this.valItem4 = 0;
        this.valItem5 = 0;

      }




    }


    reset(){

      this.value = 0;

      this.formulario.get('mes').setValue('--');
      this.formulario.get('anio').setValue('--');
      this.valItem1 = null;
      this.valItem2 = null;
      this.valItem3 = null;
      this.valItem4 = null;
      this.valItem5 = null;

      this.totalOrdenes = null;
      this.totalOrdPB_Tmp = 0;
      this.totalOrdPB = 0;
      this.isDisabled = true;
      this.alert = false;

      this.switchInputs('');

    }


    switchInputs(input){

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

    }



}

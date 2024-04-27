import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
  name: 'NombreAnalito'
})
export class NombreAnalitoPipe implements PipeTransform {

  transform(value: string): unknown {
   
    return value.split('|')[1]
  }

}
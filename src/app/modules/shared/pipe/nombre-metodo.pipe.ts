import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
  name: 'NombreMetodo'
})
export class NombreMetodoPipe implements PipeTransform {

  transform(value: string): unknown {
   
    return value.split('|')[1]
  }

}
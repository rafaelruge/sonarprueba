import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
  name: 'NombreUnidad'
})
export class NombreUnidadPipe implements PipeTransform {

  transform(value: string): unknown {
   
    return value.split('|')[1]
  }

}
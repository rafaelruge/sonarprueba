import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
  name: 'NombreControlmaterial'
})
export class NombreControlmaterialPipe implements PipeTransform {

  transform(value: string): unknown {
    return value.split('|')[1]
  }

}
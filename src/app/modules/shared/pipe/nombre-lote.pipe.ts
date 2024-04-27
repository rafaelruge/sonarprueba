import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
  name: 'nombreLote'
})
export class NombreLotePipe implements PipeTransform {

  transform(value: string): unknown {
    return value.split('|')[1]
  }

}

import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
  name: 'NombreSede'
})
export class NombreSedePipe implements PipeTransform {

  transform(value: string): unknown {
    return value.split('|')[1]
  }

}
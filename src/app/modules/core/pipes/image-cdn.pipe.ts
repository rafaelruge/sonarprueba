import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageCdn'
})
export class ImageCdnPipe implements PipeTransform {

  transform(value: string): string {
    if (!!value) {
      return './assets/imagenes/'.concat(value);
    }
  }

}

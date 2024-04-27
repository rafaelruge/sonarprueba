import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'matchSubmenu'
})
export class MatchSubmenuPipe implements PipeTransform {

  transform(value: { items: any[] }, urlSelected: string): boolean {
    return value.items.find((i: any) => i.Url === urlSelected);
  }

}

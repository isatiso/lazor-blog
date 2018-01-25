import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'urlescape' })
export class URLEscapePipe implements PipeTransform {

    transform(value: string, exponent: string): string {
        return value.split('/').join('%2F');
    }

}

import { DataServiceGetOptions } from './data.service.util';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';
import { map } from 'rxjs/operators';

export function buildUrl(options: DataServiceOptions) {
    const base = `${environment.apiUrl}/${options.endpoint}`;
    const { id } = <DataServiceGetOptions>options;
    if (id) { return `${base}/${id}`; }
    return base;
}

export function cast<T> () {
    return map(entity => <T>entity);
}

/**
 * Interfaces
 */
export interface DataServiceOptions {
    endpoint: string;
}

export interface DataServiceGetOptions extends DataServiceOptions {
    id?: number | string;
}

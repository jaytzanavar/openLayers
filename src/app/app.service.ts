import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Coordinances } from '../app/coordiances';
import { Observable } from 'rxjs';


@Injectable()
export class CoordinancesService {
    constructor(protected httpClient: HttpClient) { }


    getCoors(): Observable<Coordinances[]> {
        return this.httpClient
            .get<Coordinances[]>(`../assets/coordinances.json`);
    }
}

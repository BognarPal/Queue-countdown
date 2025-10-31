import { EventEmitter, Injectable } from '@angular/core';
import { TeamModel } from './models/team.model';

@Injectable({
  providedIn: 'root',
})
export class CommService {
  refresh = new EventEmitter<TeamModel[]>();
  secondsOfRound = 180;
}

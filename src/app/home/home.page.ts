import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TeamModel } from '../models/team.model';
import { CommService } from '../comm';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  seconds = 180;

  running = false;
  private timer: any;

  teams: TeamModel[] = [
    // { countryCode: 'hu', countryName: 'Hungary', name: 'Team Hungary' },
    // { countryCode: 'cz', countryName: 'Czech Republic', name: 'Team Czech' },
    // { countryCode: 'ro', countryName: 'Romania', name: 'Team Romania' },
    // { countryCode: 'bg', countryName: 'Bulgaria', name: 'Team Bulgaria' },
    // { countryCode: 'rs', countryName: 'Serbia', name: 'Team Serbia' },
    // { countryCode: 'at', countryName: 'Austria', name: 'Team Austria' },
    // { countryCode: 'de', countryName: 'Germany', name: 'Team Germany' }
  ]

  constructor(
    private storage: Storage,
    private commService: CommService) {}

  async ngOnInit() {
    await this.storage.create();
    //  await this.storage.set('teams', this.teams);
    await this.loadSettings();
    this.commService.refresh.subscribe((teams) => {
      this.teams = teams;
      this.stop();
    });
  }

  async loadSettings() {
    this.teams = await this.storage.get('teams') || [];
    this.commService.secondsOfRound = await this.storage.get('seconds') || 180;
    this.seconds = this.commService.secondsOfRound;
  }

  enQueueTeam(team: TeamModel) {
    if (team.state) return;
    team.state = `queue-${this.teamsInQueue.length + 1}`;
  }

  deQueueTeam(team: TeamModel) {
    if (!team.state?.startsWith('queue')) return;
    this.recount(team);
    team.state = undefined;
  }

  start() {
    if (this.currentTeam) return;
    if (this.teamsInQueue.length === 0) return;
    var team = this.teamsInQueue[0];
    this.recount(team);
    team.state = 'current';
    this.seconds = this.commService.secondsOfRound;
    this.running = true;
    this.timer = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
      } else {
        this.stop();
      }
    }, 1000);
  }

  nextTeam() {
    const team = this.currentTeam;
    if (!team) return;
    team.state = undefined;
    this.stop();
    this.seconds = this.commService.secondsOfRound;
    this.start();
  }


  recount(team: TeamModel) {
    const queueNumber = parseInt(team.state!.split('-')[1]);
    this.teamsInQueue.forEach(t => {
      const tQueueNumber = parseInt(t.state!.split('-')[1]);
      if (tQueueNumber > queueNumber) {
        t.state = `queue-${tQueueNumber - 1}`;
      }
    });
  }

  stop() {
    this.running = false;
    this.seconds = this.commService.secondsOfRound;
    clearInterval(this.timer);
  }


  public get secondsToScreen() {
    const minutes = Math.floor(this.seconds / 60);
    const seconds = this.seconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  public get currentTeam(): TeamModel | null {
    if (this.teams.filter(t => t.state === 'current').length > 0) {
      return this.teams.find(t => t.state === 'current') || null;
    }
    return null;
  }

  public get teamsInQueue(): TeamModel[] {
    var queue = this.teams.filter(t => t.state?.startsWith('queue'));
    if (queue.length > 0) {
      return queue.sort((a, b) => {
        const aNum = parseInt(a.state!.split('-')[1]);
        const bNum = parseInt(b.state!.split('-')[1]);
        return aNum - bNum;
      })
    }
    return [];
  }

  public get teamsNotInQueue(): TeamModel[] {
    return this.teams.filter(t => !t.state);
  }
}

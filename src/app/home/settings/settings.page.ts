import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { CommService } from 'src/app/comm';
import { TeamModel } from 'src/app/models/team.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit {

  teams: TeamModel[] = [];
  countries: {code: string, name: string}[] = [];
  newTeam: TeamModel = { countryCode: '', countryName: '', name: '' };
  seconds: number = 180;

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private commService: CommService) { }

  async ngOnInit() {
    await this.storage.create();

    this.http.get<{code: string, name: string}[]>('assets/flags/countries.json').subscribe({
      next: (data) => {
        this.countries = data.sort((a, b) => {
          const aNum = parseInt(a.name);
          const bNum = parseInt(b.name);
          return aNum - bNum;
        });
      },
      error: (err) => console.error('Hiba a JSON beolvasásakor:', err),
    });
    this.teams = await this.storage.get('teams') || [];
    this.seconds = await this.storage.get('seconds') || 180;
  }

  removeTeam(team: TeamModel) {
    this.teams = this.teams.filter(t => t !== team);
    this.storage.set('teams', this.teams);
    this.commService.refresh.emit(this.teams);
  }

  addTeam() {
    if (this.newTeam.countryCode) {
      this.newTeam.countryName = this.countries.find(c => c.code === this.newTeam.countryCode)?.name || '';
      this.newTeam.countryCode = this.newTeam.countryCode.toLowerCase();
      this.teams.push({ ...this.newTeam });
      this.storage.set('teams', this.teams);
      this.newTeam = { countryCode: '', countryName: '', name: '' };
      this.commService.refresh.emit(this.teams);
    }
  }

  updateTimerSettings() {
    this.commService.secondsOfRound = this.seconds;
    this.storage.set('seconds', this.seconds);
    this.commService.refresh.emit(this.teams);
  }
}

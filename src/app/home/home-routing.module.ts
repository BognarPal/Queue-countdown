import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
import { SettingsPage } from './settings/settings.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'settings',
    component: SettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}

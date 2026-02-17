import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SidebarComponent } from '@root/layout/broker/shared/sidebar/sidebar.component';
import { SiniestroModule } from './component/siniestro.module';


const routes: Routes = [
    {
      path: '',
      component: SiniestroModule,
    },   
    {
      path: '**',
      redirectTo: '',
      pathMatch: 'full',
    },
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
  })

  export class SiniestroRoutingModule {}
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from './inicio.component';
// import { RegistSiniestroSoatComponent } from '../siniestro/component/regist-siniestro-soat/regist-siniestro-soat.component';

const routes: Routes = [
    { path: '', component: InicioComponent },
    // { path: 'siniestrosoat', component: RegistSiniestroSoatComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class InicioRoutingModule { }

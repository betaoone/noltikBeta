import { RouterModule, Routes } from '@angular/router';
import { IngresarComponent } from './components/ingresar/ingresar.component';
import { AltausuarioComponent } from './components/usuario/altausuario/altausuario.component';
import { AltapacienteComponent } from './components/paciente/altapaciente/altapaciente.component';
import { MedicosComponent } from './components/medico/medicos/medicos.component';
import { UsuariosComponent } from './components/usuario/usuarios/usuarios.component';
import { PacientesComponent } from './components/paciente/pacientes/pacientes.component';
import { AltamedicoComponent } from './components/medico/altamedico/altamedico.component';
import { AnalisisComponent } from './components/analisis/analisis/analisis.component';
import { EstudiosComponent } from './components/estudio/estudios/estudios.component';
import { EstudioComponent } from './components/estudio/estudio/estudio.component';
import { ImprimirComponent } from './components/imprimir/imprimir.component';
import { EnviarComponent } from './components/enviar/enviar.component';
import { UnanalisisComponent } from './components/analisis/unanalisis/unanalisis.component';

import { AuthGuard } from './services/auth/auth.guard';
import { RegistroComponent } from './components/registro/registro.component';
import { ConfirmarComponent } from './components/confirmar/confirmar.component';
import { HomeComponent } from './components/home/home.component';
import { ContrasenaComponent } from './components/contrasena/contrasena.component';
import { ConfirmarUserComponent } from './components/confirmar-user/confirmar-user.component';
import { MensajeComponent } from './components/mensaje/mensaje.component';
import { LaboratoriosComponent } from './components/laboratorio/laboratorios/laboratorios.component';
import { EnviaMailComponent } from './components/envia-mail/envia-mail.component';
import { ReenvioTokenComponent } from './components/reenvio-token/reenvio-token.component';

const APP_ROUTES: Routes = [
    //{ path: 'registro', component: IngresarComponent },
    { path: 'registrar', component: RegistroComponent },
    { path: 'confirma/:token', component: ConfirmarComponent },
    { path: 'ingresar', component: IngresarComponent },
    { path: 'recuperar-cuenta', component: ConfirmarUserComponent },
    { path: 'reenvio-token', component: ReenvioTokenComponent },
    { path: 'pass-restablecida', component: MensajeComponent },
    { path: 'enviar-mail', component: EnviaMailComponent },
    { path: 'laboratorio', component: LaboratoriosComponent, canActivate: [AuthGuard] },
    { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard] },
    { path: 'usuarios/:id', component: AltausuarioComponent, canActivate: [AuthGuard] },
    { path: 'pacientes', component: PacientesComponent, canActivate: [AuthGuard] },
    { path: 'pacientes/:id', component: AltapacienteComponent, canActivate: [AuthGuard] },
    { path: 'pacientes/:id/analisis', component: AnalisisComponent, canActivate: [AuthGuard] },
    { path: 'pacientes/:id/analisis/:ia', component: UnanalisisComponent, canActivate: [AuthGuard] },
    { path: 'reset-pass/:token', component: ContrasenaComponent },
    { path: 'medicos', component: MedicosComponent, canActivate: [AuthGuard] },
    { path: 'medicos/:id', component: AltamedicoComponent, canActivate: [AuthGuard] },
    { path: 'estudios', component: EstudiosComponent, canActivate: [AuthGuard] },
    { path: 'estudios/:id', component: EstudioComponent, canActivate: [AuthGuard] },
    { path: 'pacientes/:id/analisis/imprimir/:an', component: ImprimirComponent, canActivate: [AuthGuard] },
    { path: 'pacientes/:id/analisis/enviar/:an', component: EnviarComponent, canActivate: [AuthGuard] },

    { path: 'home', component: HomeComponent },
    //Ruta por defecto
    { path: '**', pathMatch: 'full', redirectTo: 'home' }
];


export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES, { relativeLinkResolution: 'legacy' });
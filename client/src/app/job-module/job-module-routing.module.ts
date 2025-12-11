import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobDashboardComponent } from './job-dashboard/job-dashboard.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { CvGeneratorComponent } from './cv-generator/cv-generator.component';
import { ApplyJobComponent } from './apply-job/apply-job.component';

const routes: Routes = [
  { path: '', component: JobDashboardComponent },
  { path: 'chatbot', component: ChatbotComponent },
  { path: 'cv-generator', component: CvGeneratorComponent },
  { path: 'apply', component: ApplyJobComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobModuleRoutingModule { }

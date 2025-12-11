import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { JobModuleRoutingModule } from './job-module-routing.module';
import { JobDashboardComponent } from './job-dashboard/job-dashboard.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { CvGeneratorComponent } from './cv-generator/cv-generator.component';
import { ApplyJobComponent } from './apply-job/apply-job.component';


@NgModule({
  declarations: [
    JobDashboardComponent,
    ChatbotComponent,
    CvGeneratorComponent,
    ApplyJobComponent
  ],
  imports: [
    CommonModule,
    JobModuleRoutingModule,
    FormsModule,
    SharedModule
  ]
})
export class JobModuleModule { }

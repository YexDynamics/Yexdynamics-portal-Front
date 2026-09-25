import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-landing-template',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-template.html',
  styleUrl: './landing-template.css'
})
export class LandingTemplateComponent {}

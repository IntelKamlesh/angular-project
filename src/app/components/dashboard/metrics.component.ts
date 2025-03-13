import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observation } from '../../models/observation.model';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss']
})
export class MetricsComponent implements OnChanges {
  @Input() observations: Observation[] = [];
  
  // Metrics
  totalObservationsCount: number = 0;
  openObservationsCount: number = 0;
  compliedObservationsCount: number = 0;
  complianceRatePercentage: number = 0;
  
  // Previous metrics (for showing change)
  prevTotalObservationsCount: number = 0;
  prevOpenObservationsCount: number = 0;
  prevCompliedObservationsCount: number = 0;
  prevComplianceRatePercentage: number = 0;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['observations']) {
      this.calculateMetrics();
    }
  }
  
  private calculateMetrics(): void {
    // Store previous values
    this.prevTotalObservationsCount = this.totalObservationsCount;
    this.prevOpenObservationsCount = this.openObservationsCount;
    this.prevCompliedObservationsCount = this.compliedObservationsCount;
    this.prevComplianceRatePercentage = this.complianceRatePercentage;
    
    // Calculate new values
    this.totalObservationsCount = this.observations.length;
    this.openObservationsCount = this.observations.filter(obs => obs.status === 'Open').length;
    this.compliedObservationsCount = this.observations.filter(obs => obs.status === 'Complied').length;
    
    // Calculate compliance rate
    this.complianceRatePercentage = this.totalObservationsCount > 0 
      ? (this.compliedObservationsCount / this.totalObservationsCount) * 100 
      : 0;
  }
  
  // Calculate percentage change
  calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
  
  // Determine if a change is positive (true) or negative (false)
  isPositiveChange(metric: string, change: number): boolean {
    // For compliance rate and complied observations, higher is better
    if (metric === 'compliance' || metric === 'complied') {
      return change >= 0;
    }
    // For open observations, lower is better
    else if (metric === 'open') {
      return change <= 0;
    }
    // For total observations, we'll consider higher as positive
    return change >= 0;
  }
}
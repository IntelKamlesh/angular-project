import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { format, parseISO } from 'date-fns';
import { Observation, MonthlyCount } from '../../models/observation.model';

@Component({
  selector: 'app-status-trend',
  templateUrl: './status-trend.component.html',
  styleUrls: ['./status-trend.component.scss']
})
export class StatusTrendComponent implements OnChanges {
  @Input() observations: Observation[] = [];
  
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Number of Observations'
        },
        min: 0
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Monthly Observation Trends by Status'
      }
    }
  };
  
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['observations']) {
      this.updateChartData();
    }
  }
  
  private updateChartData(): void {
    // Group observations by month and status
    const monthlyData = new Map<string, Map<string, number>>();
    const statusColors = {
      'Open': '#FF6B6B',
      'Complied': '#4CAF50'
    };
    
    // Ensure we have all observations sorted by date
    const sortedObservations = [...this.observations].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Process all observations
    sortedObservations.forEach(obs => {
      const date = parseISO(obs.date);
      const monthKey = format(date, 'yyyy-MM');
      const displayMonth = format(date, 'MMM yyyy');
      
      // Initialize month if not exists
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, new Map<string, number>([
          ['Open', 0],
          ['Complied', 0],
          ['displayMonth', displayMonth] as any
        ]));
      }
      
      // Increment the counter for this status
      const monthMap = monthlyData.get(monthKey)!;
      const currentValue = monthMap.get(obs.status) || 0;
      monthMap.set(obs.status, currentValue + 1);
    });
    
    // Convert to arrays for Chart.js
    const sortedMonths = Array.from(monthlyData.keys()).sort();
    const displayLabels = sortedMonths.map(month => monthlyData.get(month)!.get('displayMonth' as any));
    
    // Create dataset for each status
    const datasets = Object.keys(statusColors).map(status => {
      return {
        label: status,
        data: sortedMonths.map(month => monthlyData.get(month)!.get(status) || 0),
        backgroundColor: statusColors[status as keyof typeof statusColors],
        borderColor: statusColors[status as keyof typeof statusColors],
        tension: 0.2
      };
    });
    
    // Update the chart data
    this.lineChartData = {
      labels: displayLabels,
      datasets: datasets
    };
  }
}
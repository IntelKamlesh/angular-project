import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { Observation } from '../../models/observation.model';

@Component({
  selector: 'app-chapter-distribution',
  templateUrl: './chapter-distribution.component.html',
  styleUrls: ['./chapter-distribution.component.scss']
})
export class ChapterDistributionComponent implements OnChanges {
  @Input() observations: Observation[] = [];
  
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Chapter'
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
        text: 'Distribution of Observations by Chapter'
      }
    }
  };
  
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['observations']) {
      this.updateChartData();
    }
  }
  
  private updateChartData(): void {
    // Group observations by chapter and status
    const chapterMap = new Map<string, { open: number, complied: number, total: number }>();
    
    // Get unique chapters and count observations
    this.observations.forEach(obs => {
      if (!chapterMap.has(obs.chapter)) {
        chapterMap.set(obs.chapter, { open: 0, complied: 0, total: 0 });
      }
      
      const counts = chapterMap.get(obs.chapter)!;
      counts.total += 1;
      
      if (obs.status === 'Open') {
        counts.open += 1;
      } else if (obs.status === 'Complied') {
        counts.complied += 1;
      }
    });
    
    // Get chapters sorted by total count
    const sortedChapters = Array.from(chapterMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .map(([chapter]) => chapter);
    
    // Prepare data for chart
    this.barChartData = {
      labels: sortedChapters,
      datasets: [
        {
          label: 'Open',
          data: sortedChapters.map(chapter => chapterMap.get(chapter)!.open),
          backgroundColor: '#FF6B6B',
          hoverBackgroundColor: '#FF8C8C'
        },
        {
          label: 'Complied',
          data: sortedChapters.map(chapter => chapterMap.get(chapter)!.complied),
          backgroundColor: '#4CAF50',
          hoverBackgroundColor: '#6FBF71'
        }
      ]
    };
  }
}
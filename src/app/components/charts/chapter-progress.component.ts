import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { Observation, ChapterStats } from '../../models/observation.model';

@Component({
  selector: 'app-chapter-progress',
  templateUrl: './chapter-progress.component.html',
  styleUrls: ['./chapter-progress.component.scss']
})
export class ChapterProgressComponent implements OnChanges {
  @Input() observations: Observation[] = [];
  
  public progressData: ChapterStats[] = [];
  
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Horizontal bar chart
    scales: {
      x: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Compliance Rate (%)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Chapter'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Chapter Compliance Progress'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const chapter = this.progressData[context.dataIndex];
            return [
              `Compliance Rate: ${chapter.complianceRate.toFixed(1)}%`,
              `Total Observations: ${chapter.total}`,
              `Open: ${chapter.open}`,
              `Complied: ${chapter.complied}`
            ];
          }
        }
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
    // Calculate compliance metrics by chapter
    const chapterMap = new Map<string, ChapterStats>();
    
    this.observations.forEach(obs => {
      if (!chapterMap.has(obs.chapter)) {
        chapterMap.set(obs.chapter, {
          chapter: obs.chapter,
          total: 0,
          open: 0,
          complied: 0,
          complianceRate: 0
        });
      }
      
      const stats = chapterMap.get(obs.chapter)!;
      stats.total += 1;
      
      if (obs.status === 'Open') {
        stats.open += 1;
      } else {
        stats.complied += 1;
      }
      
      stats.complianceRate = (stats.complied / stats.total) * 100;
    });
    
    // Convert to array and sort by compliance rate
    this.progressData = Array.from(chapterMap.values())
      .sort((a, b) => a.complianceRate - b.complianceRate);
    
    // Create gradient colors based on compliance rate
    const bgColors = this.progressData.map(item => this.getColorForRate(item.complianceRate));
    
    // Update chart data
    this.barChartData = {
      labels: this.progressData.map(item => item.chapter),
      datasets: [
        {
          data: this.progressData.map(item => item.complianceRate),
          backgroundColor: bgColors,
          hoverBackgroundColor: bgColors.map(color => this.lightenColor(color, 10))
        }
      ]
    };
  }
  
  // Determine color based on compliance rate
  private getColorForRate(rate: number): string {
    if (rate < 50) return '#FF6B6B'; // Red for low compliance
    if (rate < 80) return '#FFC107'; // Yellow for medium compliance
    return '#4CAF50'; // Green for high compliance
  }
  
  // Helper to lighten a color for hover effect
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (
      0x1000000 + 
      (R < 255 ? R : 255) * 0x10000 + 
      (G < 255 ? G : 255) * 0x100 + 
      (B < 255 ? B : 255)
    ).toString(16).slice(1);
  }
}
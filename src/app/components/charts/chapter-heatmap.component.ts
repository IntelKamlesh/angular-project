import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { Observation, ChapterSeverityMatrix } from '../../models/observation.model';

@Component({
  selector: 'app-chapter-heatmap',
  templateUrl: './chapter-heatmap.component.html',
  styleUrls: ['./chapter-heatmap.component.scss']
})
export class ChapterHeatmapComponent implements OnChanges {
  @Input() observations: Observation[] = [];
  
  public heatmapData: ChapterSeverityMatrix[] = [];
  public chapters: string[] = [];
  public severities: string[] = ['Low', 'Medium', 'High'];
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['observations']) {
      this.prepareHeatmapData();
    }
  }
  
  private prepareHeatmapData(): void {
    // Create a map for chapter-severity matrix
    const chapterMap = new Map<string, ChapterSeverityMatrix>();
    
    // Get unique chapters
    this.chapters = [...new Set(this.observations.map(obs => obs.chapter))].sort();
    
    // Initialize the matrix with zeros
    this.chapters.forEach(chapter => {
      chapterMap.set(chapter, {
        chapter,
        Low: 0,
        Medium: 0,
        High: 0
      });
    });
    
    // Fill in the data
    this.observations.forEach(obs => {
      const matrix = chapterMap.get(obs.chapter)!;
      matrix[obs.severity]++;
    });
    
    // Convert to array
    this.heatmapData = Array.from(chapterMap.values());
  }
  
  // Get cell color based on count
  getCellColor(count: number): string {
    if (count === 0) return '#f8f9fa'; // Light gray for zero
    
    const intensity = Math.min(1, count / 10); // Scale to max of 10 for full intensity
    const r = Math.floor(255 * intensity);
    const g = Math.floor(100 * (1 - intensity));
    const b = Math.floor(71 * (1 - intensity));
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  // Get text color based on background
  getTextColor(count: number): string {
    if (count === 0) return '#212529'; // Dark text for light background
    const intensity = Math.min(1, count / 10);
    
    // Return white text if background is dark enough
    return intensity > 0.5 ? '#ffffff' : '#212529';
  }
}
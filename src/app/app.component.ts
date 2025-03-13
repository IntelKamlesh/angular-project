import { Component, OnInit } from '@angular/core';
import { Observation } from './models/observation.model';
import { DataService } from './services/data.service';
import { parseISO } from 'date-fns';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Audit Management Dashboard';
  currentYear = new Date().getFullYear();
  
  // Data state
  observations: Observation[] = [];
  filteredObservations: Observation[] = [];
  isLoading = true;
  error: string | null = null;
  
  constructor(private dataService: DataService) { }
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    this.isLoading = true;
    this.error = null;
    
    this.dataService.getObservations().subscribe({
      next: (data) => {
        this.observations = data;
        this.filteredObservations = [...data]; // Initial state is unfiltered
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching observations:', err);
        this.error = 'Failed to load audit data. Please try again later.';
        this.isLoading = false;
      }
    });
  }
  
  handleFilterChange(filters: any): void {
    if (!this.observations.length) return;
    
    const { startDate, endDate, selectedChapters, onlyOpenObservations } = filters;
    
    // Filter by date range
    this.filteredObservations = this.observations.filter(obs => {
      const date = parseISO(obs.date);
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      return date >= start && date <= end;
    });
    
    // Filter by chapters
    if (selectedChapters && selectedChapters.length > 0) {
      this.filteredObservations = this.filteredObservations.filter(obs => 
        selectedChapters.includes(obs.chapter)
      );
    }
    
    // Filter by status
    if (onlyOpenObservations) {
      this.filteredObservations = this.filteredObservations.filter(obs => 
        obs.status === 'Open'
      );
    }
  }
}
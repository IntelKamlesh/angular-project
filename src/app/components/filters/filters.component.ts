import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { formatISO, subMonths } from 'date-fns';
import { Observation } from '../../models/observation.model';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit, OnChanges {
  @Input() observations: Observation[] = [];
  @Output() filtersChanged = new EventEmitter<any>();
  
  filterForm: FormGroup;
  chapters: string[] = [];
  
  constructor(private fb: FormBuilder) {
    // Set default filter values (last 6 months, all chapters, include all observations)
    const today = new Date();
    const sixMonthsAgo = subMonths(today, 6);
    
    this.filterForm = this.fb.group({
      startDate: [formatISO(sixMonthsAgo, { representation: 'date' })],
      endDate: [formatISO(today, { representation: 'date' })],
      selectedChapters: [[]],
      onlyOpenObservations: [false]
    });
    
    // Subscribe to form changes
    this.filterForm.valueChanges.subscribe(values => {
      this.filtersChanged.emit(values);
    });
  }
  
  ngOnInit(): void {
    this.extractChapters();
    // Emit initial filters
    this.filtersChanged.emit(this.filterForm.value);
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['observations']) {
      this.extractChapters();
    }
  }
  
  private extractChapters(): void {
    // Extract unique chapters from observations
    this.chapters = [...new Set(this.observations.map(obs => obs.chapter))].sort();
    
    // Update form control with all chapters by default
    this.filterForm.get('selectedChapters')?.setValue(this.chapters);
  }
  
  resetFilters(): void {
    const today = new Date();
    const sixMonthsAgo = subMonths(today, 6);
    
    this.filterForm.setValue({
      startDate: formatISO(sixMonthsAgo, { representation: 'date' }),
      endDate: formatISO(today, { representation: 'date' }),
      selectedChapters: this.chapters,
      onlyOpenObservations: false
    });
  }
}
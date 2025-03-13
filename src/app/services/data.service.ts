import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  Observation, 
  ChapterStats, 
  MonthlyCount, 
  ChapterSeverityMatrix,
  ChapterMonthlyData
} from '../models/observation.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  /**
   * Get all observations from the server
   */
  getObservations(): Observable<Observation[]> {
    return this.http.get<Observation[]>(`${this.apiUrl}/observations`).pipe(
      catchError(error => {
        console.error('Error fetching observations:', error);
        return throwError(() => new Error('Failed to load observations. Please try again later.'));
      })
    );
  }

  /**
   * Get available chapters from the server
   */
  getChapters(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/chapters`).pipe(
      catchError(error => {
        console.error('Error fetching chapters:', error);
        return throwError(() => new Error('Failed to load chapters. Please try again later.'));
      })
    );
  }

  /**
   * Filter observations based on criteria
   */
  filterObservationsLocal(
    observations: Observation[],
    dateRange?: [Date, Date],
    chapters?: string[],
    onlyOpen?: boolean
  ): Observation[] {
    let filtered = [...observations];

    // Filter by date range
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(obs => {
        const date = new Date(obs.date);
        return date >= startDate && date <= endDate;
      });
    }

    // Filter by chapters
    if (chapters && chapters.length > 0) {
      filtered = filtered.filter(obs => chapters.includes(obs.chapter));
    }

    // Filter by status
    if (onlyOpen) {
      filtered = filtered.filter(obs => obs.status === 'Open');
    }

    return filtered;
  }
  
  /**
   * Filter observations from server API
   */
  filterObservations(
    dateRange?: [Date, Date],
    chapters?: string[],
    onlyOpen?: boolean
  ): Observable<Observation[]> {
    // Build query parameters
    let params = new HttpParams();
    
    if (dateRange && dateRange.length === 2) {
      params = params.set('start_date', dateRange[0].toISOString().split('T')[0]);
      params = params.set('end_date', dateRange[1].toISOString().split('T')[0]);
    }
    
    if (chapters && chapters.length > 0) {
      params = params.set('chapters', chapters.join(','));
    }
    
    if (onlyOpen) {
      params = params.set('only_open', 'true');
    }
    
    // Call filtered endpoint
    return this.http.get<Observation[]>(`${this.apiUrl}/observations/filtered`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching filtered observations:', error);
        return throwError(() => new Error('Failed to load filtered observations. Please try again later.'));
      })
    );
  }

  /**
   * Calculate compliance metrics by chapter
   */
  getComplianceByChapter(observations: Observation[]): ChapterStats[] {
    const chapterMap = new Map<string, ChapterStats>();

    // Initialize chapters
    observations.forEach(obs => {
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
      } else if (obs.status === 'Complied') {
        stats.complied += 1;
      }
    });

    // Calculate compliance rates
    chapterMap.forEach(stats => {
      stats.complianceRate = stats.total > 0 
        ? (stats.complied / stats.total) * 100 
        : 0;
    });

    return Array.from(chapterMap.values());
  }

  /**
   * Prepare data for trend analysis
   */
  getTrendData(observations: Observation[]): MonthlyCount[] {
    const monthlyData: MonthlyCount[] = [];
    const monthMap = new Map<string, Map<string, number>>();

    // Sort observations by date
    const sortedObservations = [...observations].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group by month and status
    sortedObservations.forEach(obs => {
      const date = new Date(obs.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthDisplay = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, new Map([
          ['month', monthDisplay],
          ['Open', 0],
          ['Complied', 0]
        ] as [string, any][]));
      }

      const statusCount = monthMap.get(monthKey)!.get(obs.status) || 0;
      monthMap.get(monthKey)!.set(obs.status, statusCount + 1);
    });

    // Convert to array format
    Array.from(monthMap.entries()).forEach(([monthKey, data]) => {
      ['Open', 'Complied'].forEach(status => {
        monthlyData.push({
          month: String(data.get('month')),
          status: status,
          count: data.get(status) || 0
        });
      });
    });

    return monthlyData;
  }

  /**
   * Create a matrix of chapter vs severity for heatmap
   */
  getChapterSeverityMatrix(observations: Observation[]): ChapterSeverityMatrix[] {
    const chapterMap = new Map<string, ChapterSeverityMatrix>();

    // Get unique chapters
    const chapters = [...new Set(observations.map(obs => obs.chapter))];

    // Initialize the matrix with zeros
    chapters.forEach(chapter => {
      chapterMap.set(chapter, {
        chapter,
        Low: 0,
        Medium: 0,
        High: 0
      });
    });

    // Fill in the data
    observations.forEach(obs => {
      const matrix = chapterMap.get(obs.chapter)!;
      // Handle the severity as a key
      if (obs.severity === 'Low') matrix.Low += 1;
      else if (obs.severity === 'Medium') matrix.Medium += 1;
      else if (obs.severity === 'High') matrix.High += 1;
    });

    return Array.from(chapterMap.values());
  }

  /**
   * Prepare monthly trend data by chapter
   */
  getChapterMonthlyData(observations: Observation[]): ChapterMonthlyData[] {
    const result: ChapterMonthlyData[] = [];
    const monthChapterMap = new Map<string, Map<string, number>>();

    // Sort observations by date
    const sortedObservations = [...observations].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group by month and chapter
    sortedObservations.forEach(obs => {
      const date = new Date(obs.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthDisplay = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);

      if (!monthChapterMap.has(monthKey)) {
        monthChapterMap.set(monthKey, new Map([['month', monthDisplay]] as [string, any][]));
      }

      const chapterMap = monthChapterMap.get(monthKey)!;
      const chapterCount = chapterMap.get(obs.chapter) || 0;
      chapterMap.set(obs.chapter, chapterCount + 1);
    });

    // Convert to array format
    Array.from(monthChapterMap.entries()).forEach(([monthKey, data]) => {
      const month = String(data.get('month'));
      
      // For each chapter in this month
      data.forEach((count, key) => {
        if (key !== 'month') {
          result.push({
            month,
            chapter: key,
            count
          });
        }
      });
    });

    return result;
  }
}
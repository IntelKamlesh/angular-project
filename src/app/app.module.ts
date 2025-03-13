import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
// Updated import for ng2-charts
import { NgChartsModule as ng2ChartsModule } from 'ng2-charts';

// Component imports
import { AppComponent } from './app.component';
import { MetricsComponent } from './components/dashboard/metrics.component';
import { FiltersComponent } from './components/filters/filters.component';
import { ChapterDistributionComponent } from './components/charts/chapter-distribution.component';
import { StatusTrendComponent } from './components/charts/status-trend.component';
import { ChapterHeatmapComponent } from './components/charts/chapter-heatmap.component';
import { ChapterProgressComponent } from './components/charts/chapter-progress.component';

// Service imports
import { DataService } from './services/data.service';

@NgModule({
  declarations: [
    AppComponent,
    MetricsComponent,
    FiltersComponent,
    ChapterDistributionComponent,
    StatusTrendComponent,
    ChapterHeatmapComponent,
    ChapterProgressComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    ng2ChartsModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
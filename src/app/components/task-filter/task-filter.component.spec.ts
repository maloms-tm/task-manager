import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TaskFilterComponent } from './task-filter.component';
import { TaskPriority, TaskStatus } from '../../models/task.model';

describe('TaskFilterComponent', () => {
  let component: TaskFilterComponent;
  let fixture: ComponentFixture<TaskFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskFilterComponent ],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        NoopAnimationsModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default filter values', () => {
    expect(component.filterForm.get('priority')?.value).toBe('all');
    expect(component.filterForm.get('status')?.value).toBe('all');
    expect(component.filterForm.get('searchTerm')?.value).toBe('');
  });

  it('should emit filter change when priority changes', fakeAsync(() => {
    let emittedFilter: any;
    component.filterChange.subscribe(filter => emittedFilter = filter);

    component.filterForm.patchValue({ priority: TaskPriority.HIGH });
    tick(300); // Wait for debounce

    expect(emittedFilter.priority).toBe(TaskPriority.HIGH);
  }));

  it('should emit filter change when status changes', fakeAsync(() => {
    let emittedFilter: any;
    component.filterChange.subscribe(filter => emittedFilter = filter);

    component.filterForm.patchValue({ status: TaskStatus.COMPLETED });
    tick(300);

    expect(emittedFilter.status).toBe(TaskStatus.COMPLETED);
  }));

  it('should emit filter change when search term changes', fakeAsync(() => {
    let emittedFilter: any;
    component.filterChange.subscribe(filter => emittedFilter = filter);

    component.filterForm.patchValue({ searchTerm: 'test search' });
    tick(300);

    expect(emittedFilter.searchTerm).toBe('test search');
  }));

  it('should clear all filters', () => {
    component.filterForm.patchValue({
      priority: TaskPriority.HIGH,
      status: TaskStatus.COMPLETED,
      searchTerm: 'test'
    });

    component.clearFilters();

    expect(component.filterForm.get('priority')?.value).toBe('all');
    expect(component.filterForm.get('status')?.value).toBe('all');
    expect(component.filterForm.get('searchTerm')?.value).toBe('');
  });

  it('should detect active filters correctly', () => {
    expect(component.hasActiveFilters()).toBe(false);

    component.filterForm.patchValue({ priority: TaskPriority.HIGH });
    expect(component.hasActiveFilters()).toBe(true);

    component.filterForm.patchValue({ priority: 'all', status: TaskStatus.PENDING });
    expect(component.hasActiveFilters()).toBe(true);

    component.filterForm.patchValue({ status: 'all', searchTerm: 'test' });
    expect(component.hasActiveFilters()).toBe(true);

    component.filterForm.patchValue({ searchTerm: '' });
    expect(component.hasActiveFilters()).toBe(false);
  });

  it('should not emit undefined values when filter is "all"', fakeAsync(() => {
    let emittedFilter: any;
    component.filterChange.subscribe(filter => emittedFilter = filter);

    component.filterForm.patchValue({
      priority: 'all',
      status: 'all',
      searchTerm: ''
    });
    tick(300);

    expect(emittedFilter.priority).toBeUndefined();
    expect(emittedFilter.status).toBeUndefined();
    expect(emittedFilter.searchTerm).toBeUndefined();
  }));
});

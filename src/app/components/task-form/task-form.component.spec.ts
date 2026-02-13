import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TaskFormComponent } from './task-form.component';
import { TaskPriority, TaskStatus } from '../../models/task.model';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<TaskFormComponent>>;

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [ TaskFormComponent ],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'create' } }
      ]
    })
    .compileComponents();

    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<TaskFormComponent>>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values in create mode', () => {
    expect(component.taskForm.get('title')?.value).toBe('');
    expect(component.taskForm.get('description')?.value).toBe('');
    expect(component.taskForm.get('priority')?.value).toBe(TaskPriority.MEDIUM);
    expect(component.taskForm.get('status')?.value).toBe(TaskStatus.PENDING);
  });

  it('should populate form in edit mode', () => {
    const testTask = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      dueDate: new Date('2024-12-31'),
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.data = { mode: 'edit', task: testTask };
    component.ngOnInit();

    expect(component.taskForm.get('title')?.value).toBe('Test Task');
    expect(component.taskForm.get('description')?.value).toBe('Test Description');
    expect(component.taskForm.get('priority')?.value).toBe(TaskPriority.HIGH);
    expect(component.taskForm.get('status')?.value).toBe(TaskStatus.IN_PROGRESS);
  });

  it('should validate required fields', () => {
    const titleControl = component.taskForm.get('title');
    const descriptionControl = component.taskForm.get('description');
    const dueDateControl = component.taskForm.get('dueDate');

    expect(titleControl?.valid).toBeFalsy();
    expect(descriptionControl?.valid).toBeFalsy();
    expect(dueDateControl?.valid).toBeFalsy();

    titleControl?.setValue('Test Task');
    descriptionControl?.setValue('Test Description with enough length');
    dueDateControl?.setValue(new Date());

    expect(titleControl?.valid).toBeTruthy();
    expect(descriptionControl?.valid).toBeTruthy();
    expect(dueDateControl?.valid).toBeTruthy();
  });

  it('should validate minimum length for title', () => {
    const titleControl = component.taskForm.get('title');
    
    titleControl?.setValue('ab');
    expect(titleControl?.hasError('minlength')).toBeTruthy();

    titleControl?.setValue('abc');
    expect(titleControl?.hasError('minlength')).toBeFalsy();
  });

  it('should validate minimum length for description', () => {
    const descriptionControl = component.taskForm.get('description');
    
    descriptionControl?.setValue('short');
    expect(descriptionControl?.hasError('minlength')).toBeTruthy();

    descriptionControl?.setValue('This is a long enough description');
    expect(descriptionControl?.hasError('minlength')).toBeFalsy();
  });

  it('should close dialog with form data on valid submit', () => {
    component.taskForm.patchValue({
      title: 'Test Task',
      description: 'Test Description with enough characters',
      dueDate: new Date(),
      priority: TaskPriority.HIGH,
      status: TaskStatus.PENDING
    });

    component.onSubmit();

    expect(dialogRef.close).toHaveBeenCalled();
    const closeArg = dialogRef.close.calls.mostRecent().args[0];
    expect(closeArg.title).toBe('Test Task');
    expect(closeArg.dueDate).toBeInstanceOf(Date);
  });

  it('should not submit if form is invalid', () => {
    component.taskForm.patchValue({
      title: '', // Invalid - required
      description: 'Test',
      dueDate: new Date(),
      priority: TaskPriority.HIGH,
      status: TaskStatus.PENDING
    });

    component.onSubmit();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog without data on cancel', () => {
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith();
  });
});

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';


export interface TaskFormData {
  mode: 'add' | 'edit';
  task?: Task;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  isEditMode = false;
  
  priorityOptions = ['Low', 'Medium', 'High'];
  statusOptions = ['Pending', 'In Progress', 'Completed'];

  // Set up the component with needed services
  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    public dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskFormData
  ) {}

  // Set up the form when the component first loads
  ngOnInit(): void {
    this.isEditMode = this.data.mode === 'edit';
    this.createForm();
    
    if (this.isEditMode && this.data.task) {
      this.populateForm(this.data.task);
    }
  }

  // Build the form with all fields and validation rules
  private createForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [
        Validators.required,           // Field cannot be empty
        Validators.minLength(3),       // At least 3 characters
        Validators.maxLength(100)      // At most 100 characters
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),      // At least 10 characters
        Validators.maxLength(500)      // At most 500 characters
      ]],
      dueDate: [this.getTodayDate(), Validators.required],
      priority: ['Medium', Validators.required],
      status: ['Pending', Validators.required]
    });
  }

  // Fill the form with existing task data when editing
  private populateForm(task: Task): void {
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      priority: task.priority,
      status: task.status
    });
  }

  // Save the form - either create new task or update existing one
  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.value;

    if (this.isEditMode && this.data.task) {
      this.taskService.updateTask(this.data.task.id, formValue);
    } else {
      this.taskService.addTask(formValue);
    }

    this.dialogRef.close(formValue);
  }

  // Close the dialog without saving any changes
  onCancel(): void {
    this.dialogRef.close();
  }

  // Get user-friendly error message for a form field
  getErrorMessage(fieldName: string): string {
    const control = this.taskForm.get(fieldName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }
    
    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} cannot exceed ${maxLength} characters`;
    }

    return 'Invalid input';
  }

  // Convert field name to nice-looking label for error messages
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'title': 'Title',
      'description': 'Description',
      'dueDate': 'Due Date',
      'priority': 'Priority',
      'status': 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  // Check if a form field has validation errors
  hasError(fieldName: string): boolean {
    const control = this.taskForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  // Get today's date for the date picker (minimum allowed date)
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}


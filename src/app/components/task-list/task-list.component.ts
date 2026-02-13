import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskFilterComponent } from '../task-filter/task-filter.component';


@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    TaskFilterComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  
  filteredTasks: Task[] = [];
  
  private taskSubscription?: Subscription;

  // Set up the component with services it needs
  constructor(
    private taskService: TaskService,
    private dialog: MatDialog
  ) {}

  // Component initialization - load tasks and set up listeners
  ngOnInit(): void {
    this.taskSubscription = this.taskService.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.filteredTasks = tasks; // Initially show all tasks
    });
  }

  // Clean up when component is destroyed to prevent memory leaks
  ngOnDestroy(): void {
    this.taskSubscription?.unsubscribe();
  }

  // Open the form dialog to create a new task
  openAddTaskDialog(): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Task added:', result);
      }
    });
  }

  // Open the form dialog to edit an existing task
  openEditTaskDialog(task: Task): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: { mode: 'edit', task: task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Task updated:', result);
      }
    });
  }

  // Remove a task after asking for confirmation
  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      const success = this.taskService.deleteTask(taskId);
      
      if (success) {
        console.log('Task deleted successfully');
      } else {
        console.error('Failed to delete task');
      }
    }
  }

  // Update the task list when filters are changed
  onFilterChange(filters: { priority: string; status: string }): void {
    this.filteredTasks = this.taskService.filterTasks(
      filters.priority,
      filters.status
    );
  }

  // Get the right CSS class for priority colors
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  }

  // Get the right CSS class for status colors
  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-in-progress';
      case 'Pending': return 'status-pending';
      default: return '';
    }
  }

  // Make dates look nice for display
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Check if a task is past its due date
  isOverdue(task: Task): boolean {
    return new Date(task.dueDate) < new Date() && task.status !== 'Completed';
  }

  // Count tasks by status for the summary
  getCompletedCount(): number {
    return this.tasks.filter(t => t.status === 'Completed').length;
  }

  getInProgressCount(): number {
    return this.tasks.filter(t => t.status === 'In Progress').length;
  }

  getPendingCount(): number {
    return this.tasks.filter(t => t.status === 'Pending').length;
  }
}


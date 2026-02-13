import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.css']
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();

  onEdit(): void {
    this.edit.emit(this.task);
  }

  onDelete(): void {
    this.delete.emit(this.task);
  }

  getPriorityClass(): string {
    return `priority-${this.task.priority.toLowerCase()}`;
  }

  getStatusClass(): string {
    return `status-${this.task.status.toLowerCase().replace(' ', '-')}`;
  }

  isOverdue(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && this.task.status !== 'Completed';
  }
}

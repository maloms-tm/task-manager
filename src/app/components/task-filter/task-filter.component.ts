import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: "app-task-filter",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
  ],
  templateUrl: "./task-filter.component.html",
  styleUrls: ["./task-filter.component.css"],
})
export class TaskFilterComponent {
  @Output() filterChange = new EventEmitter<{
    priority: string;
    status: string;
  }>();

  selectedPriority = "All";
  selectedStatus = "All";

  priorityOptions = ["All", "Low", "Medium", "High"];
  statusOptions = ["All", "Pending", "In Progress", "Completed"];

  onPriorityChange(): void {
    this.emitFilterChange();
  }

  onStatusChange(): void {
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    this.filterChange.emit({
      priority: this.selectedPriority,
      status: this.selectedStatus,
    });
  }

  resetFilters(): void {
    this.selectedPriority = "All";
    this.selectedStatus = "All";
    this.emitFilterChange();
  }
}

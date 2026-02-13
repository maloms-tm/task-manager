import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs";

import { TaskListComponent } from "./task-list.component";
import { TaskService } from "../../services/task.service";
import { Task } from "../../models/task.model";

describe("TaskListComponent", () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  // Mock task data for testing
  const mockTasks: Task[] = [
    {
      id: "1",
      title: "Test Task 1",
      description: "Description 1",
      dueDate: new Date("2025-12-31"),
      priority: "High",
      status: "Pending",
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Test Task 2",
      description: "Description 2",
      dueDate: new Date("2025-11-30"),
      priority: "Low",
      status: "Completed",
      createdAt: new Date(),
    },
  ];

  /**
   * Setup before each test
   * Creates spies (mock objects) for dependencies
   */
  beforeEach(async () => {
    // Create spy objects for services
    const taskServiceSpy = jasmine.createSpyObj(
      "TaskService",
      ["getTasks", "deleteTask", "filterTasks"],
      {
        tasks$: of(mockTasks), // Mock the observable
      },
    );

    const dialogSpy = jasmine.createSpyObj("MatDialog", ["open"]);

    // Configure testing module
    await TestBed.configureTestingModule({
      imports: [TaskListComponent, BrowserAnimationsModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    // Get service spies
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    // Create component
    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test: Should load tasks on initialization
   */
  it("should load tasks on init", () => {
    // Act
    fixture.detectChanges(); // Trigger ngOnInit

    // Assert
    expect(component.tasks).toEqual(mockTasks);
    expect(component.filteredTasks).toEqual(mockTasks);
  });

  /**
   * Test: Should open add task dialog
   */
  it("should open add task dialog", () => {
    // Arrange
    const dialogRef = jasmine.createSpyObj("MatDialogRef", ["afterClosed"]);
    dialogRef.afterClosed.and.returnValue(of({}));
    dialog.open.and.returnValue(dialogRef);

    // Act
    component.openAddTaskDialog();

    // Assert
    expect(dialog.open).toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        width: "600px",
        data: { mode: "add" },
      }),
    );
  });

  /**
    Test: Should open edit task dialog with task data
   */
  it("should open edit task dialog", () => {
    // Arrange
    const dialogRef = jasmine.createSpyObj("MatDialogRef", ["afterClosed"]);
    dialogRef.afterClosed.and.returnValue(of({}));
    dialog.open.and.returnValue(dialogRef);

    // Act
    component.openEditTaskDialog(mockTasks[0]);

    // Assert
    expect(dialog.open).toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        width: "600px",
        data: { mode: "edit", task: mockTasks[0] },
      }),
    );
  });

  /**
   * Test: Should delete task with confirmation
   */
  it("should delete task when confirmed", () => {
    // Arrange
    spyOn(window, "confirm").and.returnValue(true);
    taskService.deleteTask.and.returnValue(true);

    // Act
    component.deleteTask("1");

    // Assert
    expect(window.confirm).toHaveBeenCalled();
    expect(taskService.deleteTask).toHaveBeenCalledWith("1");
  });

  /**
   * Test: Should not delete task when cancelled
   */
  it("should not delete task when cancelled", () => {
    // Arrange
    spyOn(window, "confirm").and.returnValue(false);

    // Act
    component.deleteTask("1");

    // Assert
    expect(window.confirm).toHaveBeenCalled();
    expect(taskService.deleteTask).not.toHaveBeenCalled();
  });

  /**
   * Test: Should filter tasks based on criteria
   */
  it("should filter tasks", () => {
    // Arrange
    const filteredResult = [mockTasks[0]];
    taskService.filterTasks.and.returnValue(filteredResult);

    // Act
    component.onFilterChange({ priority: "High", status: "All" });

    // Assert
    expect(taskService.filterTasks).toHaveBeenCalledWith("High", "All");
    expect(component.filteredTasks).toEqual(filteredResult);
  });

  /**
   * Test: Should return correct priority CSS class
   */
  it("should return correct priority class", () => {
    expect(component.getPriorityClass("High")).toBe("priority-high");
    expect(component.getPriorityClass("Medium")).toBe("priority-medium");
    expect(component.getPriorityClass("Low")).toBe("priority-low");
  });

  /**
   * Test: Should return correct status CSS class
   */
  it("should return correct status class", () => {
    expect(component.getStatusClass("Completed")).toBe("status-completed");
    expect(component.getStatusClass("In Progress")).toBe("status-in-progress");
    expect(component.getStatusClass("Pending")).toBe("status-pending");
  });

  /**
   * Test: Should detect overdue tasks
   */
  it("should detect overdue tasks", () => {
    const pastTask: Task = {
      ...mockTasks[0],
      dueDate: new Date("2020-01-01"),
      status: "Pending",
    };

    const futureTask: Task = {
      ...mockTasks[0],
      dueDate: new Date("2030-12-31"),
      status: "Pending",
    };

    const completedPastTask: Task = {
      ...mockTasks[0],
      dueDate: new Date("2020-01-01"),
      status: "Completed",
    };

    // Assert
    expect(component.isOverdue(pastTask)).toBe(true);
    expect(component.isOverdue(futureTask)).toBe(false);
    expect(component.isOverdue(completedPastTask)).toBe(false);
  });

  /**
   * Test: Should format date correctly
   */
  it("should format date", () => {
    const date = new Date("2025-12-25");
    const formatted = component.formatDate(date);
    expect(formatted).toContain("Dec");
    expect(formatted).toContain("25");
    expect(formatted).toContain("2025");
  });

  /**
   * Test: Should unsubscribe on destroy
   */
  it("should unsubscribe on destroy", () => {
    // Arrange
    fixture.detectChanges();
    const unsubscribeSpy = spyOn(component["taskSubscription"]!, "unsubscribe");

    // Act
    component.ngOnDestroy();

    // Assert
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});

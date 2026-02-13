import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';

// Test suite for TaskService - makes sure our task logic works

describe('TaskService', () => {
  let service: TaskService;

  // Set up a clean environment before each test
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Configure the testing module
    TestBed.configureTestingModule({});
    
    // Get an instance of the service
    service = TestBed.inject(TaskService);
  });

  // Clean up after each test run
  afterEach(() => {
    localStorage.clear();
  });

  // Basic test - make sure the service can be created
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Should start with no tasks
  it('should return empty tasks array initially', () => {
    const tasks = service.getTasks();
    expect(tasks).toEqual([]);
    expect(tasks.length).toBe(0);
  });

  /**
   * Test: addTask should create a new task
   */
  it('should add a new task', () => {
    // Arrange: Create task data
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task',
      dueDate: new Date('2025-12-31'),
      priority: 'High' as const,
      status: 'Pending' as const
    };

    // Act: Add the task
    const newTask = service.addTask(taskData);

    // Assert: Verify the task was created correctly
    expect(newTask).toBeDefined();
    expect(newTask.id).toBeDefined();
    expect(newTask.title).toBe('Test Task');
    expect(newTask.priority).toBe('High');
    
    // Verify it's in the tasks list
    const tasks = service.getTasks();
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe(newTask.id);
  });

  /**
   * Test: updateTask should modify an existing task
   */
  it('should update an existing task', () => {
    // Arrange: Create a task first
    const task = service.addTask({
      title: 'Original Title',
      description: 'Original Description',
      dueDate: new Date(),
      priority: 'Low' as const,
      status: 'Pending' as const
    });

    // Act: Update the task
    const updated = service.updateTask(task.id, {
      title: 'Updated Title',
      priority: 'High' as const
    });

    // Assert: Verify the update was successful
    expect(updated).toBe(true);
    
    const updatedTask = service.getTaskById(task.id);
    expect(updatedTask?.title).toBe('Updated Title');
    expect(updatedTask?.priority).toBe('High');
    // Description should remain unchanged
    expect(updatedTask?.description).toBe('Original Description');
  });

  /**
   * Test: updateTask should return false for non-existent task
   */
  it('should return false when updating non-existent task', () => {
    const result = service.updateTask('fake-id', { title: 'New Title' });
    expect(result).toBe(false);
  });

  /**
   * Test: deleteTask should remove a task
   */
  it('should delete a task', () => {
    // Arrange: Create two tasks
    const task1 = service.addTask({
      title: 'Task 1',
      description: 'Description 1',
      dueDate: new Date(),
      priority: 'Low' as const,
      status: 'Pending' as const
    });
    
    const task2 = service.addTask({
      title: 'Task 2',
      description: 'Description 2',
      dueDate: new Date(),
      priority: 'Medium' as const,
      status: 'Pending' as const
    });

    // Act: Delete the first task
    const deleted = service.deleteTask(task1.id);

    // Assert: Verify deletion was successful
    expect(deleted).toBe(true);
    
    const tasks = service.getTasks();
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe(task2.id);
    expect(service.getTaskById(task1.id)).toBeUndefined();
  });

  /**
   * Test: deleteTask should return false for non-existent task
   */
  it('should return false when deleting non-existent task', () => {
    const result = service.deleteTask('fake-id');
    expect(result).toBe(false);
  });

  /**
   * Test: filterTasks should filter by priority
   */
  it('should filter tasks by priority', () => {
    // Arrange: Create tasks with different priorities
    service.addTask({
      title: 'High Priority Task',
      description: 'Description',
      dueDate: new Date(),
      priority: 'High' as const,
      status: 'Pending' as const
    });
    
    service.addTask({
      title: 'Low Priority Task',
      description: 'Description',
      dueDate: new Date(),
      priority: 'Low' as const,
      status: 'Pending' as const
    });

    // Act: Filter by High priority
    const highPriorityTasks = service.filterTasks('High', undefined);

    // Assert: Should only return high priority tasks
    expect(highPriorityTasks.length).toBe(1);
    expect(highPriorityTasks[0].priority).toBe('High');
  });

  /**
   * Test: filterTasks should filter by status
   */
  it('should filter tasks by status', () => {
    // Arrange: Create tasks with different statuses
    service.addTask({
      title: 'Completed Task',
      description: 'Description',
      dueDate: new Date(),
      priority: 'Medium' as const,
      status: 'Completed' as const
    });
    
    service.addTask({
      title: 'Pending Task',
      description: 'Description',
      dueDate: new Date(),
      priority: 'Medium' as const,
      status: 'Pending' as const
    });

    // Act: Filter by Completed status
    const completedTasks = service.filterTasks(undefined, 'Completed');

    // Assert: Should only return completed tasks
    expect(completedTasks.length).toBe(1);
    expect(completedTasks[0].status).toBe('Completed');
  });

  /**
   * Test: filterTasks should filter by both priority and status
   */
  it('should filter tasks by both priority and status', () => {
    // Arrange: Create various tasks
    service.addTask({
      title: 'Task 1',
      description: 'Description',
      dueDate: new Date(),
      priority: 'High' as const,
      status: 'Completed' as const
    });
    
    service.addTask({
      title: 'Task 2',
      description: 'Description',
      dueDate: new Date(),
      priority: 'High' as const,
      status: 'Pending' as const
    });
    
    service.addTask({
      title: 'Task 3',
      description: 'Description',
      dueDate: new Date(),
      priority: 'Low' as const,
      status: 'Completed' as const
    });

    // Act: Filter by High priority AND Completed status
    const filtered = service.filterTasks('High', 'Completed');

    // Assert: Should only return tasks matching both criteria
    expect(filtered.length).toBe(1);
    expect(filtered[0].priority).toBe('High');
    expect(filtered[0].status).toBe('Completed');
  });

  /**
   * Test: Tasks should persist in localStorage
   */
  it('should persist tasks in localStorage', () => {
    // Arrange & Act: Add a task
    service.addTask({
      title: 'Persistent Task',
      description: 'This should be saved',
      dueDate: new Date(),
      priority: 'Medium' as const,
      status: 'Pending' as const
    });

    // Assert: Check localStorage
    const storedData = localStorage.getItem('task_manager_tasks');
    expect(storedData).toBeTruthy();
    
    const storedTasks = JSON.parse(storedData!);
    expect(storedTasks.length).toBe(1);
    expect(storedTasks[0].title).toBe('Persistent Task');
  });

  /**
   * Test: Service should load tasks from localStorage on initialization
   */
  it('should load tasks from localStorage on initialization', () => {
    // Arrange: Put tasks in localStorage manually
    const existingTasks = [{
      id: 'test-123',
      title: 'Existing Task',
      description: 'From storage',
      dueDate: new Date().toISOString(),
      priority: 'Low',
      status: 'Pending',
      createdAt: new Date().toISOString()
    }];
    localStorage.setItem('task_manager_tasks', JSON.stringify(existingTasks));

    // Act: Create a new service instance
    const newService = new TaskService();

    // Assert: Should load the existing task
    const tasks = newService.getTasks();
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('Existing Task');
  });
});


import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Task } from "../models/task.model";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  private readonly STORAGE_KEY = "task_manager_tasks";

  private tasksSubject = new BehaviorSubject<Task[]>(
    this.loadTasksFromStorage(),
  );

  public tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  constructor() {
    // Initialize with any existing tasks from browser storage
  }

  // Returns all current tasks from memory
  getTasks(): Task[] {
    return this.tasksSubject.value;
  }

  // Find a specific task by its unique ID
  getTaskById(id: string): Task | undefined {
    return this.tasksSubject.value.find((task) => task.id === id);
  }

  // Create a new task and add it to the list
  addTask(taskData: Omit<Task, "id" | "createdAt">): Task {
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date(),
    };

    const updatedTasks = [...this.tasksSubject.value, newTask];

    this.updateTasks(updatedTasks);

    return newTask;
  }

  // Update an existing task with new information
  updateTask(id: string, updates: Partial<Task>): boolean {
    const tasks = this.tasksSubject.value;
    const index = tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      return false;
    }

    const updatedTask = { ...tasks[index], ...updates };

    const updatedTasks = [
      ...tasks.slice(0, index),
      updatedTask,
      ...tasks.slice(index + 1),
    ];

    this.updateTasks(updatedTasks);
    return true;
  }

  // Remove a task from the list permanently
  deleteTask(id: string): boolean {
    const tasks = this.tasksSubject.value;
    const filteredTasks = tasks.filter((task) => task.id !== id);

    if (filteredTasks.length === tasks.length) {
      return false;
    }

    this.updateTasks(filteredTasks);
    return true;
  }

  // Filter tasks based on priority level and current status
  filterTasks(priority?: string, status?: string): Task[] {
    let filtered = this.tasksSubject.value;

    if (priority && priority !== "All") {
      filtered = filtered.filter((task) => task.priority === priority);
    }

    if (status && status !== "All") {
      filtered = filtered.filter((task) => task.status === status);
    }

    return filtered;
  }

  // === HELPER METHODS ===

  // Create a unique ID using timestamp + random string
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Update both memory and browser storage with new task list
  private updateTasks(tasks: Task[]): void {
    this.tasksSubject.next(tasks);

    this.saveTasksToStorage(tasks);
  }

  // Save the current task list to browser's local storage
  private saveTasksToStorage(tasks: Task[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
      console.log("Tasks saved to storage:", tasks.length);
    } catch (error) {
      console.error("Error saving tasks to storage:", error);
    }
  }

  // Load tasks from browser storage and convert dates back to Date objects
  private loadTasksFromStorage(): Task[] {
    try {
      const storedTasks = localStorage.getItem(this.STORAGE_KEY);

      if (!storedTasks) {
        return [];
      }

      const parsedTasks = JSON.parse(storedTasks);

      return parsedTasks.map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate),
        createdAt: new Date(task.createdAt),
      }));
    } catch (error) {
      console.error("Error loading tasks from storage:", error);
      return [];
    }
  }
}

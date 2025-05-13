import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TodoService } from '../todo.service';
import { Todo } from '../todo.model';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
})
export class TodoComponent implements OnInit {
  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  newTodoTitle = '';
  searchTerm = '';
  editingTodo: Todo | null = null;

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.todoService.getTodos().subscribe((data) => {
      this.todos = data.slice(0, 10);
      this.filteredTodos = [...this.todos];
    });
  }

  addTodo() {
    if (!this.newTodoTitle.trim()) return;

    const todo: Partial<Todo> = {
      userId: 1,
      title: this.newTodoTitle,
      completed: false,
    };

    this.todoService.addTodo(todo).subscribe((created) => {
      this.todos.unshift(created);
      this.filteredTodos = [...this.todos];
      this.newTodoTitle = '';
    });
  }

  updateTodo(todo: Todo) {
    this.todoService.updateTodo(todo.id, todo).subscribe();
  }

  deleteTodo(id: number) {
    this.todoService.deleteTodo(id).subscribe(() => {
      this.todos = this.todos.filter((t) => t.id !== id);
      this.filteredTodos = this.filteredTodos.filter((t) => t.id !== id);
    });
  }

  filterTodos() {
    if (!this.searchTerm.trim()) {
      this.filteredTodos = [...this.todos];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredTodos = this.todos.filter(todo => 
      todo.title.toLowerCase().includes(term)
    );
  }

  startEditing(todo: Todo) {
    // Create a copy to avoid direct mutation
    this.editingTodo = { ...todo };
  }

  saveEdit() {
    if (!this.editingTodo) return;
    
    const index = this.todos.findIndex(t => t.id === this.editingTodo!.id);
    if (index !== -1) {
      this.todoService.updateTodo(this.editingTodo.id, this.editingTodo).subscribe(() => {
        this.todos[index] = { ...this.editingTodo! };
        this.filterTodos(); // Refresh filtered list
        this.editingTodo = null;
      });
    }
  }

  cancelEdit() {
    this.editingTodo = null;
  }
}
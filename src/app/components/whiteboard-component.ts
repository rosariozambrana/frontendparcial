import { Component, signal, computed, effect, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="app-container" [class.dark-theme]="isDarkTheme()">
      <header class="header">
        <h1>{{ title() }}</h1>
        <button class="theme-toggle" (click)="toggleTheme()">
          {{ isDarkTheme() ? 'Light Mode' : 'Dark Mode' }}
        </button>
      </header>

      <main class="main-content">
        <section class="card">
          <h2 class="card-title">Interactive Whiteboard</h2>
          <p class="description">This is a fully functional Angular 17+ component with Signals and new Control Flow.</p>
          
          <div class="stats-container">
            @for (stat of stats(); track stat.id) {
              <div class="stat-card" [class.highlight]="stat.value > 50">
                <h3>{{ stat.label }}</h3>
                <div class="stat-value">{{ stat.value }}</div>
                <div class="progress-bar">
                  <div class="progress" [style.width.%]="stat.value"></div>
                </div>
              </div>
            }
          </div>
          
          <div class="actions">
            <button class="btn btn-primary" (click)="addRandomStat()">Add Stat</button>
            <button class="btn btn-secondary" (click)="resetStats()">Reset</button>
          </div>
        </section>
        
        <section class="card">
          <h2 class="card-title">User Form</h2>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="name">Name</label>
              <input 
                type="text" 
                id="name" 
                class="form-control" 
                placeholder="Enter your name"
                formControlName="name"
              >
              @if (isFieldInvalid('name')) {
                <div class="error-message">
                  Name is required
                </div>
              }
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                class="form-control" 
                placeholder="Enter your email"
                formControlName="email"
              >
              @if (isFieldInvalid('email')) {
                <div class="error-message">
                  Please enter a valid email
                </div>
              }
            </div>
            
            <div class="form-group">
              <label for="role">Role</label>
              <select 
                id="role" 
                class="form-control"
                formControlName="role"
              >
                <option value="">Select a role</option>
                @for (option of roleOptions(); track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
              @if (isFieldInvalid('role')) {
                <div class="error-message">
                  Please select a role
                </div>
              }
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSubmitting()">
                @if (isSubmitting()) {
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span class="sr-only">Loading...</span>
                } @else {
                  Submit
                }
              </button>
              <button type="button" class="btn btn-secondary" (click)="resetForm()">Reset</button>
            </div>
          </form>
        </section>
        
        @if (submissions().length > 0) {
          <section class="card">
            <h2 class="card-title">Submissions</h2>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of submissions(); track item.id) {
                    <tr>
                      <td>{{ item.name }}</td>
                      <td>{{ item.email }}</td>
                      <td>{{ item.role }}</td>
                      <td class="actions">
                        <button class="btn btn-sm btn-danger" (click)="deleteSubmission(item.id)">Delete</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }
      </main>

      <footer class="footer">
        <p>&copy; {{ currentYear() }} Whiteboard Component</p>
        <p>
          <small>Built with Angular 17+ features: Standalone Components, Signals, and Control Flow</small>
        </p>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Roboto', sans-serif;
    }
    
    .app-container {
      width: 100%;
      min-height: 100vh;
      background-color: #f8f9fa;
      color: #212529;
      transition: background-color 0.3s, color 0.3s;
      display: flex;
      flex-direction: column;
    }
    
    .dark-theme {
      background-color: #121212;
      color: #e0e0e0;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background-color: #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .dark-theme .header {
      background-color: #1e1e1e;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .header h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    
    .theme-toggle {
      padding: 0.5rem 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .theme-toggle:hover {
      background-color: #0069d9;
    }
    
    .main-content {
      flex: 1;
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    
    .card {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
      overflow: hidden;
    }
    
    .dark-theme .card {
      background-color: #2d2d2d;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }
    
    .card-title {
      padding: 1.25rem;
      margin: 0;
      border-bottom: 1px solid #eee;
      font-size: 1.25rem;
    }
    
    .dark-theme .card-title {
      border-bottom: 1px solid #444;
    }
    
    .description {
      padding: 1.25rem;
      margin: 0;
    }
    
    .stats-container {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1rem;
      padding: 0 1.25rem 1.25rem;
    }
    
    .stat-card {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .dark-theme .stat-card {
      background-color: #333;
    }
    
    .stat-card.highlight {
      border-left: 4px solid #28a745;
    }
    
    .stat-card h3 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .progress-bar {
      height: 8px;
      background-color: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .dark-theme .progress-bar {
      background-color: #444;
    }
    
    .progress {
      height: 100%;
      background-color: #007bff;
      border-radius: 4px;
    }
    
    .actions {
      display: flex;
      gap: 0.5rem;
      padding: 0 1.25rem 1.25rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
      padding: 0 1.25rem;
    }
    
    .form-control {
      display: block;
      width: 100%;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      color: #495057;
      background-color: #fff;
      border: 1px solid #ced4da;
      border-radius: 0.25rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }
    
    .dark-theme .form-control {
      color: #e0e0e0;
      background-color: #333;
      border-color: #555;
    }
    
    .form-control:focus {
      border-color: #80bdff;
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .error-message {
      display: block;
      width: 100%;
      margin-top: 0.25rem;
      font-size: 80%;
      color: #dc3545;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 2rem;
      padding: 0 1.25rem 1.25rem;
    }
    
    .btn {
      display: inline-block;
      font-weight: 400;
      text-align: center;
      white-space: nowrap;
      vertical-align: middle;
      user-select: none;
      border: 1px solid transparent;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      line-height: 1.5;
      border-radius: 0.25rem;
      transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      cursor: pointer;
    }
    
    .btn:focus, .btn:hover {
      text-decoration: none;
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    
    .btn-primary {
      color: #fff;
      background-color: #007bff;
      border-color: #007bff;
    }
    
    .btn-primary:hover:not(:disabled) {
      color: #fff;
      background-color: #0069d9;
      border-color: #0062cc;
    }
    
    .dark-theme .btn-primary {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }
    
    .btn-secondary {
      color: #fff;
      background-color: #6c757d;
      border-color: #6c757d;
    }
    
    .btn-secondary:hover:not(:disabled) {
      color: #fff;
      background-color: #5a6268;
      border-color: #545b62;
    }
    
    .btn-danger {
      color: #fff;
      background-color: #dc3545;
      border-color: #dc3545;
    }
    
    .btn-danger:hover:not(:disabled) {
      color: #fff;
      background-color: #c82333;
      border-color: #bd2130;
    }
    
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
      border-radius: 0.2rem;
    }
    
    .spinner-border {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      vertical-align: text-bottom;
      border: 0.2em solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spinner-border 0.75s linear infinite;
    }
    
    @keyframes spinner-border {
      to { transform: rotate(360deg); }
    }
    
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    .table-responsive {
      display: block;
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      padding: 0 1.25rem 1.25rem;
    }
    
    .table {
      width: 100%;
      margin-bottom: 0;
      color: #212529;
      border-collapse: collapse;
    }
    
    .dark-theme .table {
      color: #e0e0e0;
    }
    
    .table th,
    .table td {
      padding: 0.75rem;
      vertical-align: middle;
      border-top: 1px solid #dee2e6;
    }
    
    .dark-theme .table th,
    .dark-theme .table td {
      border-top: 1px solid #444;
    }
    
    .table thead th {
      vertical-align: bottom;
      border-bottom: 2px solid #dee2e6;
      background-color: #f8f9fa;
      font-weight: 600;
    }
    
    .dark-theme .table thead th {
      border-bottom: 2px solid #444;
      background-color: #333;
    }
    
    .table tbody tr:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }
    
    .dark-theme .table tbody tr:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
    
    .actions {
      white-space: nowrap;
      text-align: right;
    }
    
    .footer {
      padding: 1.5rem;
      text-align: center;
      background-color: #f8f9fa;
      border-top: 1px solid #e9ecef;
      margin-top: 2rem;
    }
    
    .dark-theme .footer {
      background-color: #1e1e1e;
      border-top: 1px solid #333;
      color: #adb5bd;
    }
    
    /* Responsive styles */
    @media (min-width: 640px) {
      .stats-container {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .header h1 {
        font-size: 1.75rem;
      }
    }
    
    @media (min-width: 768px) {
      .main-content {
        padding: 2rem;
      }
      
      .header {
        padding: 1.5rem;
      }
    }
    
    @media (min-width: 1024px) {
      .stats-container {
        grid-template-columns: repeat(4, 1fr);
      }
      
      .header h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class WhiteboardComponent {
  // Signals for reactive state
  isDarkTheme = signal(false);
  title = signal('Whiteboard Component');
  isSubmitting = signal(false);
  
  // Stats data
  stats = signal([
    { id: 1, label: 'Users', value: 75 },
    { id: 2, label: 'Sessions', value: 63 },
    { id: 3, label: 'Conversion', value: 49 },
    { id: 4, label: 'Bounce Rate', value: 25 }
  ]);
  
  // Form data
  roleOptions = signal([
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'Regular User' },
    { value: 'guest', label: 'Guest' }
  ]);
  
  // Form handling
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl('', Validators.required)
  });
  
  // Submissions
  submissions = signal<any[]>([]);
  
  // Computed values
  currentYear = computed(() => new Date().getFullYear());
  
  constructor() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme.set(true);
    }
    
    // Setup effect for theme changes
    effect(() => {
      const theme = this.isDarkTheme();
      localStorage.setItem('theme', theme ? 'dark' : 'light');
    });
  }
  
  // Theme toggle
  toggleTheme(): void {
    this.isDarkTheme.update(current => !current);
  }
  
  // Stats actions
  addRandomStat(): void {
    const labels = ['Revenue', 'Clicks', 'Impressions', 'Engagement', 'Retention'];
    const randomLabel = labels[Math.floor(Math.random() * labels.length)];
    const randomValue = Math.floor(Math.random() * 100);
    const newId = Math.max(0, ...this.stats().map(s => s.id)) + 1;
    
    this.stats.update(current => [
      ...current,
      { id: newId, label: randomLabel, value: randomValue }
    ]);
  }
  
  resetStats(): void {
    this.stats.set([
      { id: 1, label: 'Users', value: 75 },
      { id: 2, label: 'Sessions', value: 63 },
      { id: 3, label: 'Conversion', value: 49 },
      { id: 4, label: 'Bounce Rate', value: 25 }
    ]);
  }
  
  // Form validation
  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
  
  // Form submission
  onSubmit(): void {
    if (this.form.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting.set(true);
    
    // Simulate API call
    setTimeout(() => {
      const formValue = this.form.value;
      const newSubmission = {
        id: Date.now(),
        name: formValue.name,
        email: formValue.email,
        role: formValue.role
      };
      
      this.submissions.update(current => [newSubmission, ...current]);
      this.isSubmitting.set(false);
      this.resetForm();
    }, 1500);
  }
  
  resetForm(): void {
    this.form.reset();
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsUntouched();
    });
  }
  
  // Submission actions
  deleteSubmission(id: number): void {
    this.submissions.update(current => current.filter(item => item.id !== id));
  }
}
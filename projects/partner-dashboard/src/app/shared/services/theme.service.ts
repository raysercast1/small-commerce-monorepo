import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentThemeSignal: WritableSignal<string> = signal('light'); // Default theme

  constructor() {
    // Optional: Load theme from local storage on initialization
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.applyTheme('light'); // Apply default if no theme saved
    }
  }

  /**
   * Get the current theme.
   */
  getCurrentTheme(): string {
    return this.currentThemeSignal();
  }

  /**
   * Set the current theme.
   * @param theme The theme name (e.g., 'light', 'dark').
   */
  setTheme(theme: string): void {
    this.currentThemeSignal.set(theme);
    this.applyTheme(theme);
    // Optional: Save theme to local storage
    localStorage.setItem('theme', theme);
  }

  /**
   * Apply the selected theme by adding CSS classes to the body.
   * @param theme The theme name.
   */
  private applyTheme(theme: string): void {
    const body = document.body;
    // Remove any existing theme classes
    body.classList.remove('light-theme', 'dark-theme'); // Add other themes as needed
    // Add the new theme class
    body.classList.add(`${theme}-theme`);
    // Alternatively, you could set CSS variables here
    // document.documentElement.style.setProperty('--primary-color', themeConfig[theme].primaryColor);
  }
}
import { Component, computed, effect, input, output, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

// Minimal form expected by the search bar for any content type (wine, food pairings, etc.).
// Each screen using this component provides its own adaptation function.
export interface SearchableItem {
  id: string;
  label: string;
  subtitle?: string;
  tag?: string;
  keywords: (string | undefined)[];
  placementCount?: number;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, IonicModule, TranslocoPipe],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnDestroy {
  items = input.required<SearchableItem[]>();
  placeholder = input('Rechercher…');
  matchedIds = output<Set<string>>();

  query = signal('');
  private debounceTimer?: ReturnType<typeof setTimeout>;

  ngOnDestroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  results = computed<SearchableItem[]>(() => {
    const q = this.normalize(this.query());
    if (!q) return [];
    const searchTerms = q.split(/\s+/).filter((term) => term.length > 0);

    return this.items().filter((item) => {
      const haystack = this.normalize(
        [item.label, item.subtitle, item.tag, ...item.keywords].filter(Boolean).join(' ')
      );

      return searchTerms.some((term) => haystack.includes(term));
    });
  });

  hasQuery = computed(() => this.query().trim().length > 0);

  constructor() {
    effect(() => {
      const matchedIds = new Set(this.results().map((item) => item.id));
      this.matchedIds.emit(matchedIds);
    });
  }

  onInput(event: Event): void {
    const value = (event as CustomEvent).detail.value ?? '';

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.query.set(value);
    }, 500);
  }

  clear(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.query.set('');
  }

  allResultTags(): string {
    return this.results()
      .map((item) => item.tag)
      .filter(Boolean)
      .join(', ');
  }

  totalPlacementCount(): number {
    return this.results().reduce((total, item) => total + (item.placementCount || 1), 0);
  }

  private normalize(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}

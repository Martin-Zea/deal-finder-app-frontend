import { Component, signal } from '@angular/core';
import { Card } from '../../shared/components/card/card';
import { SearchBar } from '../../shared/components/search-bar/search-bar';

@Component({
  selector: 'app-components-page',
  imports: [Card, SearchBar],
  templateUrl: './components.html',
  styleUrl: './components.scss',
})
export class ComponentsPage {
  protected readonly lastSearch = signal<string | null>(null);

  protected onSearch(term: string): void {
    this.lastSearch.set(term);
  }
}

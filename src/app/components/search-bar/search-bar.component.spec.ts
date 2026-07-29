import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent, SearchableItem } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  const WINES: SearchableItem[] = [
    {
      id: '1',
      label: 'Chablis 1er Cru',
      subtitle: 'Domaine Laroche · 2021',
      tag: 'A1',
      keywords: ['Bourgogne', 'white', 'Chardonnay'],
    },
    {
      id: '2',
      label: 'Château Margaux',
      subtitle: 'Château Margaux · 2017',
      tag: 'B2',
      keywords: ['Bordeaux', 'red', 'Cabernet Sauvignon'],
    },
    {
      id: '3',
      label: 'Sancerre Les Belles Dames',
      subtitle: 'Domaine Vacheron · 2022',
      tag: 'C3',
      keywords: ['Loire', 'white', 'Sauvignon Blanc'],
    },
    {
      id: '4',
      label: 'Domaine Tempier',
      subtitle: 'Domaine Tempier · 2022',
      tag: 'D4',
      keywords: ['Provence', 'rose', 'Mourvèdre'],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', WINES);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have no results and hasQuery=false when the query is empty', () => {
    expect(component.hasQuery()).toBeFalse();
    expect(component.results()).toEqual([]);
  });

  it('should match on a partial substring, not only a full word', () => {
    // Bug corrigé : "cha" doit matcher "Chablis" ET "Château Margaux"
    // dès la 3e lettre tapée, sans attendre le mot entier.
    component.query.set('cha');
    const results = component.results();

    expect(results.length).toBe(2);
    expect(results.map((r) => r.id).sort()).toEqual(['1', '2']);
  });

  it('should match a full word exactly', () => {
    component.query.set('margaux');
    const results = component.results();

    expect(results.length).toBe(1);
    expect(results[0].id).toBe('2');
  });

  it('should be case-insensitive', () => {
    component.query.set('CHABLIS');
    expect(component.results().map((r) => r.id)).toEqual(['1']);
  });

  it('should be accent-insensitive', () => {
    // "Mourvèdre" contient un accent, la recherche sans accent doit quand même matcher
    component.query.set('mourvedre');
    expect(component.results().map((r) => r.id)).toEqual(['4']);
  });

  it('should require every whitespace-separated term to match (AND) across fields', () => {
    // "margaux" est dans le label, "2017" est dans le subtitle : les deux vins concordants
    component.query.set('margaux 2017');
    expect(component.results().map((r) => r.id)).toEqual(['2']);

    // "margaux 2022" ne doit rien retourner : aucun vin ne combine les deux
    component.query.set('margaux 2022');
    expect(component.results()).toEqual([]);
  });

  it('should match on the tag (emplacement)', () => {
    component.query.set('b2');
    expect(component.results().map((r) => r.id)).toEqual(['2']);
  });

  it('should return no results for a query that matches nothing', () => {
    component.query.set('riesling');
    expect(component.hasQuery()).toBeTrue();
    expect(component.results()).toEqual([]);
  });

  it('should reset the query and results on clear()', () => {
    component.query.set('chablis');
    expect(component.results().length).toBe(1);

    component.clear();

    expect(component.query()).toBe('');
    expect(component.hasQuery()).toBeFalse();
    expect(component.results()).toEqual([]);
  });

  it('should join all matching tags in allResultTags()', () => {
    component.query.set('white');
    // "Chablis" (A1) et "Sancerre" (C3) sont tous deux blancs
    expect(component.allResultTags()).toBe('A1, C3');
  });

  it('should emit matchedIds with the correct set of ids when the query changes', (done) => {
    component.matchedIds.subscribe((ids: Set<string>) => {
      expect(ids).toEqual(new Set(['1', '2']));
      done();
    });

    component.query.set('cha');
    fixture.detectChanges();
  });

  it('should emit an empty set when the query is cleared', (done) => {
    component.query.set('chablis');
    fixture.detectChanges();

    let callCount = 0;
    component.matchedIds.subscribe((ids: Set<string>) => {
      callCount++;
      if (callCount === 1) {
        // premier flush suite au clear()
        expect(ids.size).toBe(0);
        done();
      }
    });

    component.clear();
    fixture.detectChanges();
  });
});
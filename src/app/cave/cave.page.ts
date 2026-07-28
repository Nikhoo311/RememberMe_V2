import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Observable, map, retry } from 'rxjs';
import { CaveService, CaveSlot } from '../core/services/cave.service';
import { CellarCellComponent } from '../components/cellar-cell/cellar-cell.component';
import { UserWine } from '../core/models/wine.model';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user.model';
import { WineSheetModalComponent } from '../components/wine-sheet-modal/wine-sheet-modal.component';
import { WINE_TYPE_CONFIG, WineType } from '../core/types/WineType';

@Component({
  selector: 'app-cave',
  standalone: true,
  templateUrl: './cave.page.html',
  styleUrls: ['./cave.page.scss'],
  imports: [
    CommonModule,
    IonicModule,
    CellarCellComponent,
    WineSheetModalComponent
  ],
})
export class CavePage implements OnInit {
  grid$!: Observable<CaveSlot[]>;
  isSheetOpen = false;
  wine: UserWine | null = null;
  coords: { row: number; col: number } | null = null;
  readonly WINE_TYPE_CONFIG = WINE_TYPE_CONFIG;

  constructor(public caveService: CaveService, private auth: AuthService) {}

  ngOnInit() {
    this.grid$ = this.caveService.grid$;
  }

  get occupiedCount() {
    return this.caveService.occupiedCount;
  }

  get totalCapacity() {
    return this.caveService.totalCapacity;
  }

  get user() {
    return this.auth.currentUser;
  }

  get caveConfig() {
    return this.caveService.caveConfig;
  }

  onCellTap(slot: CaveSlot): void {
    if (slot.wine) {
      this.wine = slot.wine;
      this.coords = { row: slot.row, col: slot.col };
      this.isSheetOpen = true;
    } else {
     this.addWine(slot.row, slot.col)
    }
  }

  formatCoords(slot: CaveSlot): string {
    return this.caveService.formatPlacementCoords({ row: slot.row, col: slot.col })
  }

  addWine(x: number, y: number) {
    const wine = {
      name: "Test vin Rouge",
      domain: "Domaine Jean-Louis Chave",
      region: "Rhône",
      appellation: "Tavel",
      type: "red",
      grapeVariety: "Roussanne",
      vintage: 2025,
      description:"Robe jaune or aux reflets dorés. Bouquet complexe de fruits à chair blanche, de miel et de pain grillé. Bouche riche et ample, belle longueur.",

      foodPairing: [
          "Carpaccio de saint-jacques",
          "Huîtres",
          "Sushi"
        ],
        isCustom: true,
        rating: 5,
        unitPrice: 500,
        ownerId: this.user?.id,
        placements: [ {col: y, row: x}]
    } as UserWine;
      this.caveService.addWine(wine)
  }
}

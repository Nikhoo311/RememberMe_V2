import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../core/services/auth.service';
import { CAVE_MAX, WINE_TYPE_CONFIG } from '../core/types/WineType';
import { DarkModeSetting, PreferencesService } from '../core/services/preferences.service';
import { Observable, map } from 'rxjs';
import { LANGUAGE_CONFIG } from '../core/types/LanguageConfig';
import { CaveView } from '../core/models/user.model';
import { CustomModalComponent } from '../components/custom-modal/custom-modal.component';
import { StepperComponent } from '../components/stepper/stepper.component';
import { ToastService } from '../core/services/toast.service';
import { CaveService } from '../core/services/cave.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [
    CommonModule,
    IonicModule,
    TranslocoModule,
    ReactiveFormsModule,
    CustomModalComponent,
    StepperComponent,
  ],
})
export class SettingsPage implements OnInit {
  readonly WINE_TYPE_CONFIG = WINE_TYPE_CONFIG;
  readonly maxEmplacements = CAVE_MAX;

  isDarkMode$!: Observable<boolean>;
  notificationsEnabled$!: Observable<boolean>;
  selectedView: CaveView = 'grid';

  isDispositionModalOpen = false;
  isViewChangePending = false;
  dispositionForm: FormGroup = this.fb.group({
    rows: [this.caveConfig?.rows],
    cols: [this.caveConfig?.cols],
  });

  constructor(
    private router: Router,
    private auth: AuthService,
    private caveService: CaveService,
    private prefs: PreferencesService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private transloco: TranslocoService
  ) {}

  get user() {
    return this.auth.currentUser;
  }

  get caveConfig() {
    return this.user?.caveConfig;
  }

  get maxSlots(): number {
    return (this.caveConfig?.cols ?? 0) * (this.caveConfig?.rows ?? 0);
  }

  get favoriteWineLabelKey(): string {
    const type = this.user?.favoriteWineType;
    return type ? WINE_TYPE_CONFIG[type]?.label ?? '' : '';
  }

  get selectedLangague(): string {
    return LANGUAGE_CONFIG[this.prefs.current.language].nativeName;
  }

  get isDarkMode(): boolean {
    return this.prefs.current.darkMode === 'dark';
  }

  get maxRows(): number {
    return Math.floor(this.maxEmplacements / (this.dispositionForm.get('cols')?.value || 1));
  }

  get maxCols(): number {
    return Math.floor(this.maxEmplacements / (this.dispositionForm.get('rows')?.value || 1));
  }

  get dispositionTotal(): number {
    return (this.dispositionForm.get('rows')?.value || 0) * (this.dispositionForm.get('cols')?.value || 0);
  }

  ngOnInit() {
    this.isDarkMode$ = this.prefs.preferences$.pipe(map((p) => p.darkMode === 'dark'));
    this.notificationsEnabled$ = this.prefs.preferences$.pipe(map((p) => p.notificationsEnabled));
    this.selectedView = this.auth.currentUser?.caveConfig?.viewMode ?? 'grid';
  }

  openDispositionSheet() {
    this.dispositionForm.patchValue(
      { rows: this.caveConfig?.rows ?? 5, cols: this.caveConfig?.cols ?? 3 },
      { emitEvent: false }
    );
    this.isDispositionModalOpen = true;
  }

  closeDispositionModal() {
    this.isDispositionModalOpen = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async saveDisposition(): Promise<void> {
    const rows = this.dispositionForm.get('rows')?.value;
    const cols = this.dispositionForm.get('cols')?.value;

    await this.caveService.pruneOutOfBoundsPlacements(rows, cols)
      .then(() => this.auth.updateCaveConfig({ rows, cols }))
      .then(() => {
        this.toastService.success(
          this.transloco.translate('SETTINGS.CAVE.DISPOSITION.MODAL.SAVE_SUCCESS')
        );
        this.closeDispositionModal();
      })
      .catch(() => {
        this.toastService.error(
          this.transloco.translate('SETTINGS.CAVE.DISPOSITION.MODAL.SAVE_ERROR')
        );
      });
  }

  async onViewChange(event: CustomEvent): Promise<void> {
    if (this.isViewChangePending) return;

    const previousView = this.selectedView;
    const newView = event.detail.value as CaveView;

    if (newView === previousView) return;

    this.selectedView = newView;
    this.isViewChangePending = true;

    await this.auth.updateCaveConfig({ viewMode: newView })
      .then(async () => {
        await this.delay(2000);
        this.toastService.success(
          this.transloco.translate('SETTINGS.CAVE.DISPLAY.UPDATE_SUCCESS', { view: this.transloco.translate(`SETTINGS.CAVE.DISPLAY.${newView.toUpperCase()}`) })
        );
      })
      .catch((error) => {
        this.selectedView = previousView;
        this.toastService.error(
          this.transloco.translate('SETTINGS.CAVE.DISPLAY.UPDATE_ERROR', { error: error.message })
        );
      })
      .finally(() => {
        this.isViewChangePending = false;
      });
  }

  onNotificationsToggle(event: CustomEvent) {
    const isEnabled = event.detail.checked as boolean;
    this.prefs.setNotificationsEnabled(isEnabled);
  }

  goToInfoPerso() {
    this.router.navigate(['/settings/personal-information']);
  }

  goToVinPrefere() {
    this.router.navigate(['/settings/favorite-wine'], { state: { favoriteWine: this.auth.currentUser?.favoriteWineType } });
  }

  goToLanguage() {
    this.router.navigate(['/settings/language']);
  }

  async onDarkModeToggle(event: CustomEvent): Promise<void> {
    const isDark = event.detail.checked as boolean;
    const value: DarkModeSetting = isDark ? 'dark' : 'light';
    await this.prefs.setDarkMode(value);
  }
}
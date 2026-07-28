# Vinum - Application de Gestion de Cave à Vin

## 📋 Description

Vinum est une application mobile hybride (Ionic + Angular) permettant de gérer sa cave à vin personnelle. L'application permet d'ajouter, modifier et supprimer des bouteilles de vin, de visualiser sa cave sous forme de grille, et de suivre ses statistiques de consommation.

## 🚀 Stack Technique

### Frontend
- **Angular 20.0.0** - Framework frontend
- **Ionic 8.0.0** - Framework UI mobile
- **TypeScript 5.8.3** - Langage de développement
- **RxJS 7.8.0** - Programmation réactive

### Backend & Services
- **Firebase 11.10.0** - Backend as a Service
  - Authentication (Email/Password, Google OAuth)
  - Firestore (Base de données NoSQL)
- **@angular/fire 20.0.1** - Intégration Firebase pour Angular

### Mobile
- **Capacitor 8.0.0** - Bridge pour applications natives
  - Android support
  - Haptics (vibrations)
  - Keyboard
  - Status Bar
  - Preferences (stockage local)
  - Firebase Authentication

### Internationalisation
- **@jsverse/transloco 8.1.0** - Gestion des traductions
- **@jsverse/transloco-messageformat 8.4.0** - Formatage des messages

### Outils de développement
- **ESLint 9.16.0** - Linting
- **Karma 6.4.0** - Tests unitaires
- **Jasmine 5.1.0** - Framework de tests

## 📁 Architecture du Projet

```
src/
├── app/
│   ├── auth/                    # Page d'authentification
│   ├── cave/                    # Page de visualisation de la cave
│   ├── components/              # Composants réutilisables
│   │   ├── cellar-cell/        # Cellule de la cave
│   │   ├── custom-modal/       # Modal personnalisé
│   │   ├── form-error/         # Erreur de formulaire
│   │   ├── input/              # Input personnalisé
│   │   ├── login-form/         # Formulaire de connexion
│   │   ├── register-form/      # Formulaire d'inscription
│   │   ├── stepper/            # Stepper pour onboarding
│   │   ├── utils/              # Utilitaires
│   │   ├── wine-sheet-modal/   # Modal de détails de vin
│   │   └── wines-radio-group/  # Groupe radio pour types de vin
│   ├── core/                    # Cœur de l'application
│   │   ├── models/            # Modèles de données
│   │   ├── services/          # Services métier
│   │   └── types/             # Types TypeScript
│   ├── guards/                  # Guards de route
│   ├── home/                    # Page d'accueil
│   ├── preference/              # Page de préférences (onboarding)
│   ├── settings/                # Page des paramètres
│   └── tabs/                    # Navigation par onglets
├── assets/                      # Assets statiques
├── environments/                # Configurations d'environnement
├── global.scss                  # Styles globaux
└── theme/                       # Thème de l'application
```

## 🔧 Services

### AuthService
Gère l'authentification des utilisateurs et les données utilisateur.

**Méthodes principales :**
- `register(email, password)` - Inscription d'un nouvel utilisateur
- `login(email, password)` - Connexion par email/mot de passe
- `loginWithGoogle()` - Connexion via Google OAuth
- `logout()` - Déconnexion
- `sendPasswordResetEmail(email)` - Réinitialisation du mot de passe
- `updatePersonalInfo(data, currentPassword)` - Mise à jour des infos personnelles
- `updatePassword(oldPassword, newPassword)` - Changement de mot de passe
- `updateFavoriteWine(selectedType)` - Mise à jour du vin préféré
- `updateCaveConfig(config)` - Mise à jour de la configuration de la cave
- `deleteAccount(password)` - Suppression du compte

**Observables :**
- `currentUser$` - Observable de l'utilisateur actuel

### CaveService
Gère les données de la cave à vin.

**Méthodes principales :**
- `addWine(wine)` - Ajoute un vin (ajoute un placement si le vin existe déjà)
- `updateWine(wine)` - Met à jour un vin existant
- `deleteWine(wineId)` - Supprime un vin
- `removeBottle(wineId, placementToRemove)` - Supprime une bouteille (supprime le vin si 0 placement)
- `pruneOutOfBoundsPlacements(rows, cols)` - Nettoie les placements hors limites lors d'un redimensionnement
- `getWines()` - Récupère tous les vins
- `getWineAt(row, col)` - Récupère le vin à une position donnée

**Observables :**
- `grid$` - Observable de la grille de la cave (réactif aux changements de config et de vins)

**Getters :**
- `cave` - Liste des vins de la cave
- `caveConfig` - Configuration de la cave
- `grid` - Grille statique de la cave
- `totalCapacity` - Capacité totale de la cave
- `occupiedCount` - Nombre d'emplacements occupés
- `totalBottles` - Nombre total de bouteilles
- `starWine` - Vin le plus cher
- `totalValue` - Valeur totale de la cave
- `uniqueRegionsCount` - Nombre de régions différentes
- `averageRating` - Note moyenne des vins
- `winesSortedByRatingDesc` - Vins triés par note décroissante

### PreferencesService
Gère les préférences utilisateur (stockage local via Capacitor Preferences).

**Méthodes principales :**
- `init()` - Initialisation des préférences
- `setDarkMode(value)` - Change le mode sombre/clair
- `setLanguage(value)` - Change la langue
- `setNotificationsEnabled(value)` - Active/désactive les notifications

**Observables :**
- `preferences$` - Observable des préférences utilisateur

**Getters :**
- `current` - Préférences actuelles

### ToastService
Gère l'affichage des notifications toast.

**Méthodes principales :**
- `success(message)` - Affiche un toast de succès
- `error(message)` - Affiche un toast d'erreur
- `warning(message)` - Affiche un toast d'avertissement
- `info(message)` - Affiche un toast d'information

## 📊 Modèles de Données

### User
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  favoriteWineType: WineType | null;
  provider: 'google' | 'password';
  createdAt: Date;
  caveConfig: {
    rows: number;
    cols: number;
    viewMode: 'grid' | 'list';
  };
}
```

### UserWine
```typescript
interface UserWine {
  id?: string;
  ownerId: string;
  wineCatalogueId?: string;
  isCustom: boolean;
  name: string;
  domain: string;
  region: string;
  vintage: number;
  type: WineType;
  appellation?: string;
  grapeVariety?: string;
  unitPrice: number;
  rating?: number;
  description: string;
  foodPairing: string[];
  placements: CellPlacement[];
}
```

### CellPlacement
```typescript
interface CellPlacement {
  row: number;
  col: number;
}
```

### CaveSlot
```typescript
interface CaveSlot {
  row: number;
  col: number;
  wine: UserWine | null;
}
```

## 🧩 Types

### WineType
Types de vin disponibles :
- `red` - Vin rouge
- `white` - Vin blanc
- `rose` - Vin rosé
- `champagne` - Champagne

**Configuration :**
```typescript
WINE_TYPE_CONFIG: Record<WineType, WineTypeConfig>
```
Contient l'icône, le label et la couleur de gradient pour chaque type.

**Constantes :**
- `CAVE_MAX = 24` - Nombre maximum d'emplacements (version gratuite)
- `CAVE_MAX_PRENIUM = 240` - Nombre maximum d'emplacements (version premium)

### AuthTypeEnum
- `LOGIN` - Mode connexion
- `REGISTER` - Mode inscription

### DarkModeSetting
- `light` - Mode clair
- `dark` - Mode sombre
- `system` - Mode système

## 🎨 Composants

### CellarCellComponent
Composant représentant une cellule de la cave.

**Inputs :**
- `positionLabel` - Label de position (ex: "A1")
- `wineType` - Type de vin présent dans la cellule

**Outputs :**
- `cellTap` - Événement émis lors d'un clic sur la cellule

### CustomModalComponent
Modal personnalisé avec breakpoints.

**Inputs :**
- `isOpen` - État d'ouverture du modal
- `initialBreakpoint` - Breakpoint initial (défaut: 0.95)
- `breakpoints` - Liste des breakpoints (défaut: [0, 0.5, 0.7, 0.95])
- `background` - Couleur de fond personnalisée
- `showCloseButton` - Afficher le bouton de fermeture

**Outputs :**
- `didDismiss` - Événement émis à la fermeture du modal

### WineSheetModalComponent
Modal affichant les détails d'un vin.

**Inputs :**
- `isOpen` - État d'ouverture du modal
- `wine` - Vin à afficher
- `coords` - Coordonnées du placement
- `canRemoveBottle` - Autoriser la suppression de bouteille

**Outputs :**
- `isOpenChange` - Changement de l'état d'ouverture

### InputComponent
Input personnalisé avec gestion des erreurs.

### FormErrorComponent
Affichage des erreurs de formulaire.

### StepperComponent
Composant stepper pour les formulaires multi-étapes.

### LoginFormComponent / RegisterFormComponent
Formulaires d'authentification.

### WinesRadioGroupComponent
Groupe de boutons radio pour sélectionner un type de vin.

## 🛣️ Pages et Routes

### Routes principales
- `/` - Page d'accueil (Tabs) - **AuthGuard**
- `/auth` - Page d'authentification - **GuestGuard**
- `/preference` - Page de préférences (onboarding) - **AuthGuard**
- `/home` - Page d'accueil
- `/cave` - Page de la cave
- `/settings` - Page des paramètres
- `/settings/personal-information` - Informations personnelles
- `/settings/favorite-wine` - Vin préféré
- `/settings/language` - Langue

### Guards

#### AuthGuard
Protège les routes nécessitant une authentification. Redirige vers `/auth` si non connecté.

#### GuestGuard
Protège les routes accessibles uniquement aux utilisateurs non connectés. Redirige vers `/home` si connecté.

## 🔐 Sécurité

### Firebase Authentication
- Authentification par email/mot de passe
- Authentification via Google OAuth
- Réinitialisation du mot de passe par email
- Re-authentification requise pour les actions sensibles (changement d'email, suppression de compte)

### Firestore
- Données structurées par utilisateur (`users/{uid}/wine`)
- Règles de sécurité à configurer dans Firebase Console

## 🌐 Internationalisation

L'application utilise Transloco pour la gestion des traductions.

**Langues supportées :**
- Français (fr)
- Anglais (en)

**Configuration :** `transloco.config.ts`

## 📱 Fonctionnalités

### Onboarding
L'application guide l'utilisateur à travers un processus d'onboarding en 3 étapes :
1. Informations personnelles (nom, prénom)
2. Sélection du vin préféré
3. Configuration de la cave (dimensions)

### Gestion de la Cave
- Visualisation en grille interactive
- Ajout de bouteilles (avec détection de vins existants)
- Suppression de bouteilles (avec suppression automatique du vin si 0 placement)
- Redimensionnement de la cave avec nettoyage automatique des placements hors limites
- Changement de vue (grille/liste)

### Statistiques
- Nombre total de bouteilles
- Valeur totale de la cave
- Vin le plus cher (star wine)
- Distribution par type de vin
- Taux de remplissage de la cave
- Note moyenne des vins
- Nombre de régions différentes

### Paramètres
- Mode sombre/clair/système
- Changement de langue
- Gestion des notifications
- Modification des informations personnelles
- Changement du vin préféré
- Redimensionnement de la cave

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou yarn
- Capacitor CLI (pour builds mobiles)

### Installation
```bash
npm install
```

### Développement
```bash
# Serveur de développement web
npm start

# Build pour développement
npm run build

# Build pour production
npm run build --configuration production
```

### Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Build Mobile (Android)
```bash
# Ajouter la plateforme Android
npx cap add android

# Build l'application
npm run build

# Sync avec Capacitor
npx cap sync android

# Ouvrir dans Android Studio
npx cap open android
```

## 🔧 Configuration Firebase

Pour utiliser l'application, vous devez configurer Firebase :

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com/)
2. Activez l'authentification (Email/Password et Google)
3. Créez une base de données Firestore
4. Ajoutez votre configuration dans `src/environments/environment.ts` et `src/environments/environment.prod.ts`

## 📝 Structure des Données Firestore

### Users Collection
```
users/
  {uid}/
    email: string
    firstName: string
    lastName: string
    favoriteWineType: WineType
    provider: 'google' | 'password'
    createdAt: timestamp
    caveConfig: {
      rows: number
      cols: number
      viewMode: 'grid' | 'list'
    }
```

### Wine Subcollection
```
users/
  {uid}/
    wine/
      {wineId}/
        ownerId: string
        wineCatalogueId?: string
        isCustom: boolean
        name: string
        domain: string
        region: string
        vintage: number
        type: WineType
        appellation?: string
        grapeVariety?: string
        unitPrice: number
        rating?: number
        description: string
        foodPairing: string[]
        placements: [
          { row: number, col: number }
        ]
```

## 🎯 Roadmap

- [ ] Version Premium (240 emplacements)
- [ ] Statistiques avancées
- [ ] Export/Import de la cave
- [ ] Partage de cave
- [ ] Scan de code-barres
- [ ] Suggestions d'accords mets-vins
- [ ] iOS support

## 📄 Licence

Ce projet est privé et confidentiel.

## 👥 Auteurs

- Développé avec Ionic Framework

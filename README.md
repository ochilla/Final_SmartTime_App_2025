# Smartime (React Native / Expo)

Zeit­erfassung für Reinigungsunternehmen: Liegenschaften verwalten und Arbeitszeiten pro Liegenschaft per Check-in/Check-out protokollieren – lokal mit AsyncStorage. Fokus: klares MVP, konsistentes UI, robuste Kernabläufe.

## Inhalte
- [Features](#features)
- [Tech-Stack](#tech-stack)
- [Projektstruktur](#projektstruktur)
- [Setup & Scripts](#setup--scripts)
- [Architektur & State](#architektur--state)
- [UI/UX-Guidelines](#uiux-guidelines)
- [Validierung & Edge-Cases](#validierung--edge-cases)
- [Screenshots / GIF](#screenshots--gif)
- [Bekannte Issues / Grenzen](#bekannte-issues--grenzen)
- [Roadmap / Nice-to-have](#roadmap--nice-to-have)
- [Lizenz](#lizenz)

## Features
- **Liegenschaften verwalten**
  - Erfassen: Name, Strasse, Hausnummer, Ort
  - Loeschen einzelner Liegenschaften **mit Bestaetigung**
  - **Sperre gegen Loeschen bei aktivem Check-in** (mindestens ein Zeiteintrag mit `endTime === null`)
- **Zeiterfassung pro Liegenschaft**
  - Check-in / Check-out mit lesbaren Zeiten (z. B. `09:15 Uhr`)
  - Mehrere Eintraege pro Tag moeglich
  - **Parallele Check-ins** auf verschiedenen Liegenschaften moeglich
  - Sortierung der Uebersichten nach Aktivitaet (aktive zuerst), sonst nach letzter Aktivitaet
- **Monitoring & Navigation**
  - **MainMenu**: Monitoring-Liste aller Liegenschaften (ohne Cards), Ampel-Status:
    - Gruen = aktiv (Timer laeuft)
    - Grau = inaktiv
    - Summen Heute / Woche / Monat
  - **BottomBar** auf allen Screens:
    - **Links**: Home (MainMenu)
    - **Mitte**: Zeiten/Reports (hervorgehoben, wenn aktiv)
    - **Rechts**: Neue (AddProperty)
  - **TopBar**: Konsistentes Header-Design mit optionalem Zurueck-Button
- **Reports (Dashboard-Screen)**
  - Zeitraumwahl **Monat** oder **Jahr** (Navigation mit ‹/›)
  - **PDF-Export Summen (alle Liegenschaften)**
  - **PDF-Export pro Liegenschaft** (Detailtabelle + Summe fuer den Zeitraum)

## Tech-Stack
- **React Native** (Expo, TypeScript)
- **Navigation**: `@react-navigation/native` + `@react-navigation/native-stack` (+ BottomBar-Komponente)
- **Storage**: `@react-native-async-storage/async-storage`
- **PDF / Teilen**: `expo-print`, `expo-sharing`
- **Fonts**: Rajdhani (`@expo-google-fonts/rajdhani`, `expo-font`)
- **Icons**: `@expo/vector-icons`

## Design-Tokens

- **App-Hintergrund**: `#f5f5f5`
- **TopBar & BottomBar**: `#0f1c2e`
- **Akzent in Bars / Primaer-Button**: `#00D4FF` (Border: `#00BDE3`)
- **Schrift**: Rajdhani (`400 Regular`, `600 SemiBold`)
- **Buttons (primaer)**: Text `#0f1c2e`, Radius 10, Border 1

##Abhaengigkeiten##

npm install

# Expo-Module (PDF, Teilen, Fonts)
npx expo install expo-print expo-sharing expo-font @expo-google-fonts/rajdhani

# React Native Basics (falls frisch geklont)
npx expo install @react-native-async-storage/async-storage react-native-screens react-native-safe-area-context

# Navigation & Icons
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @expo/vector-icons

## Projektstruktur
src/
components/
TopBar.tsx
BottomBar.tsx
navigation/
AppNavigator.tsx
screens/
MainMenuScreen.tsx
DashboardScreen.tsx
AddPropertyScreen.tsx
PropertyDetailScreen.tsx
storage/
propertyStorage.ts
types/
property.ts
App.tsx


## Setup & Scripts
```bash
npm install
npm run android   # oder: npm run web
npm start         # Expo DevTools

Architektur & State
- UI-Komponenten: TopBar, BottomBar.
- Navigation: AppNavigator (Native Stack).
- Datenhaltung: propertyStorage.ts (AsyncStorage) mit get/save/add/update/delete.

Datenmodell:
interface TimeEntry {
  startTime: string;   // ISO
  endTime: string|null;
  duration: number|null; // Minuten
  date: string;        // YYYY-MM-DD (vom Start)
}
interface Property {
  id: string;
  name: string;
  street: string;
  houseNumber: string;
  city: string;
  timeEntries: TimeEntry[];
}

Aktiv-Status: Offener Eintrag (endTime=null) pro Liegenschaft – erlaubt parallele Check-ins zwischen Properties.

UI/UX-Guidelines:
- Hintergrund: #f5f5f5
- Top/Bottom Bar: #0f1c2e, Akzent: #00D4FF
- Schrift: Rajdhani (Semibold/Regular)
- BottomBar: Home (links), Zeiten (zentral, aktiv hervorgehoben auf Dashboard), Neue (rechts)
- Leere Zustände & Ladezustände vorhanden.

Validierung & Edge-Cases

- Pflichtfelder im AddProperty-Form – Button disabled bei ungültigem Status.
- Empfohlen (erledigt/teilweise):
- trim() auf allen Feldern
- Mindestlängen (z. B. name ≥ 2)
- houseNumber: einfacher Regex (z. B. /^[0-9]+[a-zA-Z0-9\-]*$/)
- Inline-Feedback bei Fehlern
- Check-in doppelt in derselben Liegenschaft verhindert; zwischen Liegenschaften parallel erlaubt.

Screenshots / GIF

- Main Menu: assets/screen_mainmenu.png
- Dashboard: assets/screen_dashboard.png
- Add Property: assets/screen_addproperty.png
- Property Detail (Check-in/out): assets/screen_detail.png

Kurz-GIF (optional): assets/demo.gif

Bekannte Issues / Grenzen

- Keine Server-Sync/Accounts (lokal/offline only).
- Keine Summen/Reports pro Tag/Woche (siehe Roadmap).
- Simple Validierung (bewusst MVP).

Roadmap / Nice-to-have

- Tages-/Wochensummen pro Liegenschaft + Gesamt (Dashboard-Card).
- Filter/Sort der Einträge (Datum absteigend, nur offene etc.).
- Export (CSV/PDF) – lokal generiert.
- UX: Toasts bei Speichern/Löschen, Pull-to-Refresh auf Dashboard.
- A11y: Labels/AccessibilityRoles für Buttons.
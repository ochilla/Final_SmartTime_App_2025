# Smartime – Zeiterfassung für Reinigungsunternehmen

**Smartime** ist eine mobile App zur Zeiterfassung von Arbeitszeiten pro Liegenschaft – speziell für Reinigungsfirmen mit mehreren Objekten und Mitarbeitenden.  
Die App funktioniert **offline**, speichert Daten **lokal** via AsyncStorage und bietet eine intuitive Benutzeroberfläche für Android und Web (via Expo Go).

---

## Features (Stand: MVP)

- 🏠 Liegenschaften erfassen (Name, Straße, Nr., Ort)
- ⏱ Zeiterfassung per Check-in / Check-out
- 🔁 Persistente Timer: laufen weiter beim Screenwechsel
- 🗂 Dashboard-Übersicht aller Liegenschaften
- 📋 Liste aller Zeiteinträge pro Objekt
- 🧭 Navigation via React Navigation (native-stack)
- 🧠 Kein Login, kein Backend – Daten bleiben lokal

---

## Screens

| Screen                | Beschreibung                       |
|----------------------|------------------------------------|
| **Main Menu**        | Kachelmenü zur Auswahl der Views   |
| **Add Property**     | Liegenschaft erfassen              |
| **Dashboard**        | Liste aller Objekte (Touch = Detail) |
| **Property Detail**  | Check-in/out, Zeiterfassungs-Log   |

---

## Tech Stack

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- TypeScript
- AsyncStorage (`@react-native-async-storage`)
- Navigation: `@react-navigation/native-stack`
- Icons: `@expo/vector-icons`
- Fonts: [@expo-google-fonts/rajdhani](https://fonts.google.com/specimen/Rajdhani)

---

## Installation

```bash
git clone https://github.com/dein-user/smartime-app.git
cd smartime-app
npm install
npx expo start
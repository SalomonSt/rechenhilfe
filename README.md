# Donauvista Bestellung

Moderne, mobile-first Web-App fuer den Wuerstelstand **Donauvista**.

Die App dient als schnelle Bestell-, Rechen- und Wechselgeldhilfe fuer den Alltag am Stand.

## Wichtiger Hinweis

Diese Anwendung ist **keine** gesetzliche Registrierkasse und ersetzt keine fiskalische Kassenpflicht.

- Es werden keine Bestellungen oder Umsaetze als Kassenjournal gespeichert.
- Bestelldaten werden nach Abschluss zurueckgesetzt.
- Kundendaten werden nicht erhoben.

PWA-Caching wird nur fuer Programmdaten (App-Dateien) verwendet, nicht fuer abgeschlossene Bestellungen.

## Neu: Admin Panel mit Login

In der App gibt es jetzt die Umschaltung **Kasse / Admin**.

- Im Bereich **Admin** kannst du Produkte, Preise, Kategorien und Bildpfade pflegen.
- Login und Kontoanlage laufen ueber **Supabase Auth**.
- Ein neu angelegtes Konto ist zuerst inaktiv und muss in der Datenbank aktiviert werden.

## Technologien

- React
- TypeScript
- Vite
- Modernes CSS (mobile-first)
- Vite PWA Plugin (installierbare PWA + Offline fuer App-Dateien)
- Supabase (Auth + Datenbank fuer Admin/Produkte)
- Vitest

## Installation

```bash
npm install
```

## Entwicklung starten

```bash
npm run dev
```

## Produktions-Build

```bash
npm run build
```

## Produktionsvorschau

```bash
npm run preview
```

## Tests ausfuehren

```bash
npm run test
```

## PWA installieren

1. App im Browser oeffnen.
2. Installationshinweis (oder Browser-Menue) nutzen.
3. App kann danach direkt vom Geraet gestartet werden.

Nach dem ersten Laden kann die App auch offline geoeffnet werden, solange die benoetigten App-Dateien im Cache vorhanden sind.

## Produkte und Preise anpassen

Produkte und Preise koennen direkt im **Admin Panel** gepflegt werden.

Wenn Supabase nicht konfiguriert ist, nutzt die App die lokalen Fallback-Produkte aus `src/data/products.ts`.

- `priceCents` verwendet Cent-Werte (z. B. `550` fuer 5,50 EUR)
- Kategorien: `essen`, `alkoholfrei`, `bier-spritzer`, `longdrinks`

## Projektstruktur (Auszug)

```text
docs/
  supabase.sql
src/
  components/
    AdminPanel.tsx
  data/
  lib/
    supabase.ts
  services/
    productStore.ts
  state/
  test/
  types/
  utils/
  App.tsx
  main.tsx
  styles.css
```

## Verhalten der App

- Produkte zur aktuellen Bestellung hinzufuegen
- Mengen per Plus/Minus verwalten
- Positionen entfernen
- Gesamtbetrag in Cent berechnen (ohne Gleitkommafehler)
- Gegebenen Barbetrag mit Komma oder Punkt verarbeiten
- Fehlbetrag oder Wechselgeld sofort anzeigen
- Bestellung abschliessen und vollstaendig zuruecksetzen
- Bestellung manuell mit Sicherheitsabfrage loeschen

## Supabase einrichten (fuer Admin + DB)

1. In Supabase ein neues Projekt erstellen.
2. Im SQL Editor die Datei `docs/supabase.sql` ausfuehren.
3. In `Authentication > Providers` E-Mail/Passwort aktivieren.
4. In `Project Settings > API` folgende Werte kopieren:
  - `Project URL`
  - `anon public key`

## Netlify aktivieren

In Netlify fuer deine Site unter `Site configuration > Environment variables` setzen:

- `VITE_SUPABASE_URL` = deine Supabase Project URL
- `VITE_SUPABASE_ANON_KEY` = deine Supabase anon public key

Danach neu deployen.

## Konto anlegen und in DB aktivieren

1. In der App auf **Admin** wechseln.
2. **Konto anlegen** mit E-Mail/Passwort.
3. In Supabase SQL Editor den Benutzer aktivieren:

```sql
update public.user_profiles
set is_active = true,
   is_admin = true
where user_id = 'USER_UUID_AUS_AUTH_USERS';
```

Die `USER_UUID` findest du in der Tabelle `auth.users`.

4. Danach im Admin-Panel mit dem Konto einloggen.

## Root-Admin salislp

Der Benutzername `salislp` ist als Root-Admin vorgesehen.

- `salislp` kann im Admin-Panel andere Benutzer aktivieren.
- `salislp` kann dort auch Admin-Rechte an weitere Konten vergeben oder entziehen.
- Alle anderen Konten muessen weiterhin zuerst einmal in der Datenbank fuer den ersten Zugriff freigeschaltet werden, bis `salislp` aktiv ist.

### Erster Root-Admin-Start

1. Konto mit Benutzername `salislp` anlegen.
2. Einmalig in Supabase in `public.user_profiles` fuer dieses Konto setzen:

```sql
update public.user_profiles
set is_active = true,
    is_admin = true
where username = 'salislp';
```

3. Danach kann `salislp` weitere Benutzer direkt im Admin-Panel freischalten.

## Sicherheit

- Schreibrechte auf Produkte sind per RLS nur fuer aktive Admin-Profile erlaubt.
- Lesen der Produkte ist fuer die App erlaubt, damit die Kasse immer laeuft.

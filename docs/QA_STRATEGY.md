# QA stratégia

## Rozsah a predpoklady

Tento dokument pokrýva plánovač v React/Vite aplikácii Planora. Testujeme používateľské scenáre, regresiu a build; produkčný kód ani testovacie dáta sa do repozitára touto zmenou nepridávajú. Ak sa názvy ovládacích prvkov zmenia, aktualizujú sa selektory a checklist, nie očakávané správanie.

## Test matrix

| Oblasť | Desktop (Chrome/Firefox/Edge, 1280 px+) | Mobile (Chrome Android/Safari iOS, 360–430 px) | Kritérium úspechu |
|---|---|---|---|
| Layout a navigácia | Sidebar/header, kalendár a formuláre bez pretečenia | Jednostĺpcové rozloženie, dotykové ovládanie, žiadny horizontálny scroll | Obsah je čitateľný a všetky akcie dostupné |
| CRUD poznámok | Vytvoriť, zobraziť, upraviť, vymazať poznámku; potvrdenie zmazania | To isté dotykom, formulár sa nezakrýva klávesnicou | Zmena sa okamžite zobrazí a pretrvá po refreshi |
| CRUD úloh | Vytvoriť/upraviť/vymazať úlohu, prepínať stav hotová, filtrovať | To isté bez náhodných aktivácií pri scrollovaní | Stav a obsah sú konzistentné v zozname aj kalendári |
| Dátumy a kalendár | Prepínanie mesiac/týždeň/deň, dnes, navigácia cez hranice mesiaca | Čitateľné bunky, scroll/gestá bez straty výberu | Správny deň, časové pásmo a zvýraznenie vybraného dátumu |
| Persistence | Refresh, nová karta, zavretie/otvorenie prehliadača | To isté v mobilnom prehliadači | Dáta a nastavenia sa obnovia z `localStorage` |
| Témy | Svetlá/tmavá téma, kontrast a refresh | To isté; rešpektovať systémovú tému, ak ju appka podporuje | Žiadny nečitateľný text ani bliknutie kritického UI |
| Klávesnica a a11y | Tab poradie, Enter/Space, Escape, focus, screen reader | Fyzická/Bluetooth klávesnica a zoom 200 % | Všetky akcie bez myši, správne role/name/state |

Odporúčané minimálne kombinácie: Chrome na Windows/macOS (desktop), Firefox na desktopovú regresiu, Safari iOS a Chrome Android na mobile. Overiť šírky 360, 390 a 430 px a desktop 1280 a 1440 px.

## Funkčné scenáre

### Poznámky a úlohy (CRUD)

1. Vytvoriť položku s bežným názvom a obsahom; overiť zobrazenie v zozname a na príslušnom dátume.
2. Otvoriť položku, upraviť každý editovateľný údaj, uložiť a overiť, že stará hodnota nezostala v UI ani v `localStorage`.
3. Zrušiť úpravu/novú položku; overiť, že sa neuloží čiastočný obsah.
4. Vymazať položku; overiť potvrdenie, odstránenie zo všetkých pohľadov a persistence po refreshi.
5. Pri úlohe prepnúť nedokončená ↔ hotová, obnoviť stránku a overiť zachovanie stavu.
6. Skontrolovať duplicity pri dvojkliku na Uložiť, opakovanom Enteri a rýchlom refreshi.

### Dátumy a kalendár

- Vytvoriť položku dnes, v minulosti, v budúcnosti a bez dátumu; overiť správne zaradenie.
- Prejsť z 31. dňa na nasledujúci mesiac, február (vrátane priestupného roka), zmenu roka a návrat na „Dnes“.
- Overiť konzistentné formátovanie dátumu, lokálne časové pásmo, polnoc a prípadný čas začiatku/konca.
- Overiť klik/tap na deň, zobrazenie položiek v mesiaci aj detaile a že zmena dátumu sa uloží.
- Ak kalendár podporuje rozsah, odmietnuť koniec pred začiatkom a jasne zobraziť validačnú chybu.

### `localStorage` persistence

- Po každej CRUD operácii vykonať hard refresh; po zatvorení a opätovnom otvorení aplikácie overiť dáta, tému, filtre a posledný pohľad (ak sú perzistentné podľa návrhu).
- Skontrolovať izoláciu kľúčov medzi prostrediami a bezpečné správanie pri chýbajúcom, poškodenom alebo neparsovateľnom JSON.
- Nasimulovať plné/zakázané úložisko: aplikácia nesmie spadnúť; používateľ musí dostať zrozumiteľné upozornenie alebo bezpečný fallback.
- Overiť, že citlivé údaje sa do úložiska neukladajú a že starší formát dát nespôsobí stratu celej kolekcie bez hlásenia.

### Témy

Prepnúť svetlú/tmavú tému z desktopu aj mobilu, obnoviť stránku a otvoriť novú kartu. Overiť konzistentné pozadie, text, ikony, formuláre, modály, hover/focus/disabled stavy a kontrast aspoň 4,5:1 pre bežný text a 3:1 pre veľký text/UI indikátory.

### Klávesnica a accessibility

- Prejsť celú aplikáciu iba klávesnicou: Tab/Shift+Tab, Enter/Space, Escape a šípky v kalendári.
- Focus musí byť vždy viditeľný, logický a po zatvorení modalu sa vrátiť na spúšťací prvok; modal musí mať focus trap.
- Každé tlačidlo, input, checkbox, select a ikona má dostupný názov; dekoratívne ikony sú skryté pred screen readerom.
- Chyby validácie sú viazané na polia, oznámené asistenčnej technológii a nie sú komunikované iba farbou.
- Overiť heading hierarchiu, landmarky, `aria-pressed`/`aria-expanded` podľa stavu, zoom 200 % a reduced motion.
- Automatická kontrola axe/Lighthouse je doplnok; nenahrádza manuálny keyboard a screen-reader test.

## Edge cases

- Prázdny názov, iba medzery, veľmi dlhý názov/obsah, emoji, diakritika, apostrof, úvodzovky a HTML/skriptovací text.
- Duplicitné názvy, veľké množstvo položiek, žiadne výsledky filtra, rýchle opakované akcie a otvorenie tej istej položky vo viacerých kartách.
- Dátum na hranici dňa/mesiaca/roka, DST, neplatný dátum a zariadenie s iným locale.
- Obnovenie počas editácie, offline režim, zlyhanie zápisu/čítania `localStorage`, prvé spustenie bez dát a poškodené dáta.
- Mobilná klávesnica (focus, viewport, Enter/Done), otočenie obrazovky, safe-area, touch target minimálne približne 44 × 44 px.
- Rýchle prepínanie témy/pohľadu a súbežné otvorenie/zatvorenie menu alebo modalu.

## Smoke checklist

- [ ] Appka sa spustí a hlavný pohľad sa načíta bez konzolovej chyby.
- [ ] Vytvorenie poznámky a úlohy funguje; obe sa zobrazia na správnom mieste.
- [ ] Úprava, zmazanie a prepnutie úlohy na hotovú funguje.
- [ ] Kalendár otvorí dnešný deň a navigácia cez mesiac funguje.
- [ ] Refresh zachová dáta aj zvolenú tému.
- [ ] Svetlá/tmavá téma má čitateľný text a viditeľný focus.
- [ ] Základný flow prejde bez myši aspoň cez Tab, Enter/Space a Escape.
- [ ] Desktop 1280 px aj mobile 360 px sú použiteľné bez horizontálneho scrollu.

## Release gate

Release je povolený iba vtedy, keď prejde smoke checklist, CRUD/calendar/persistence regresia na podporovaných desktop a mobile kombináciách, neexistuje otvorený blocker/critical bug a a11y kontrola nemá nové critical/serious nálezy.

Príkazy spúšťajte z koreňa aplikácie (názvy scriptov musia zodpovedať `package.json`):

```bash
npm ci
npm run lint
npm run typecheck       # ak je v projekte nakonfigurovaný TypeScript
npm test -- --run       # unit/integration testy, podľa test runnera
npm run build
npm run preview         # manuálna smoke kontrola produkčného buildu
```

Ak sú nakonfigurované E2E a accessibility testy, release gate dopĺňa:

```bash
npm run test:e2e
npm run test:a11y
```

Pri chýbajúcom scripte sa príkaz nenahrádza ľubovoľným novým produkčným kódom: zaznamená sa ako chýbajúca kontrola a pred release sa doplní podľa skutočnej konfigurácie projektu.

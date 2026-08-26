# Planora — produktová špecifikácia MVP

**Stav:** návrh pre MVP  
**Dátum:** 26. 8. 2026  
**Jazyk rozhrania:** slovenčina (s pripravenou lokalizáciou textov)

## 1. Produktový cieľ

Planora je osobný pracovný priestor, v ktorom používateľ zachytí myšlienku ako
poznámku, premení ju na úlohu a naplánuje ju do kalendára. MVP má odstrániť
prepínanie medzi aplikáciou na poznámky, to-do listom a kalendárom. Základná
hodnota je rýchly prehľad: čo si chcem zapamätať, čo musím urobiť a kedy na
tom budem pracovať.

## 2. Persony

### P1 — Samostatný profesionál

Pracuje na viacerých projektoch, používa notebook aj mobil a potrebuje zachytiť
úlohu počas dňa. Meradlo úspechu: nový záznam vytvorí do 30 sekúnd a na
dashboarde vidí dnešné priority bez hľadania.

### P2 — Študent alebo knowledge worker

Zhromažďuje výpisky a termíny z viacerých predmetov/projektov. Potrebuje
vyhľadávanie, značky a kalendár s termínmi. Meradlo úspechu: nájde poznámku do
10 sekúnd a vie z nej vytvoriť úlohu bez prepisovania názvu.

### P3 — Používateľ, ktorý potrebuje jednoduchosť

Nechce nastavovať zložitý systém; očakáva jasné predvolené hodnoty a pokojné,
čitateľné rozhranie. Meradlo úspechu: vie aplikáciu používať bez návodu a
zmena témy sa zachová po obnovení stránky.

## 3. Hlavné user journeys

### Zachytenie a spracovanie myšlienky

1. Používateľ otvorí dashboard a zvolí **Nová poznámka**.
2. Zadá povinný názov a voliteľný obsah; uloženie potvrdí tlačidlom alebo
   `Ctrl/Cmd + Enter`.
3. V detaile poznámky zvolí **Vytvoriť úlohu**. Názov úlohy sa predvyplní
   názvom poznámky a zachová sa spätný odkaz.
4. Nastaví termín a prioritu; úloha sa zobrazí v zozname úloh aj v kalendári.

### Naplánovanie dňa

1. Používateľ na dashboarde vidí úlohy s termínom dnes a najbližšie udalosti.
2. Otvorí kalendár, prepne deň/týždeň a vyberie časový blok.
3. Vytvorí udalosť s názvom, dátumom, časom začiatku a konca.
4. Po uložení vidí udalosť v kalendári a pri príslušnom dni na dashboarde.

### Ranná kontrola a uzavretie dňa

1. Dashboard zobrazí počet otvorených úloh, dnešné úlohy a najbližšie udalosti.
2. Používateľ označí dokončené úlohy; stav sa zmení bez straty kontextu.
3. Kliknutím na úlohu otvorí detail, upraví termín alebo ju znovu otvorí.

## 4. Informačná architektúra

Globálna navigácia obsahuje: **Dashboard**, **Poznámky**, **Úlohy**,
**Kalendár** a **Nastavenia**. Na mobilnom šírkovom rozsahu sa zmení na
spodnú navigáciu alebo menu, pričom aktuálna sekcia je vždy zreteľná.

### Doménové objekty

- **Poznámka:** `id`, `title` (povinný), `content`, `tags[]`, `createdAt`,
  `updatedAt`, voliteľné `taskId`.
- **Úloha:** `id`, `title` (povinný), `description`, `status` (`open` alebo
  `done`), `priority` (`low`, `medium`, `high`), `dueDate` (voliteľný),
  `createdAt`, `updatedAt`, voliteľné `noteId`.
- **Udalosť:** `id`, `title` (povinný), `description`, `startAt`, `endAt`,
  `allDay`, `createdAt`, `updatedAt`.
- **Používateľské nastavenia:** `theme` (`light`, `dark`, `system`) a
  preferovaný prvý deň týždňa.

Zoznamy používajú stránkovanie alebo limit 50 položiek na načítanie, stabilné
zoradenie (najnovšie/upravené) a explicitný stav načítavania, prázdneho zoznamu
a chyby. Vyhľadávanie poznámok prehľadáva názov, obsah a značky; filter úloh
umožňuje stav, prioritu a termín.

## 5. MVP scope

- lokálne alebo serverové uloženie jedného používateľského pracovného priestoru;
- vytvorenie, zobrazenie, úprava a zmazanie poznámok vrátane značiek;
- vytvorenie, úprava, zmazanie, dokončenie a opätovné otvorenie úloh;
- priorita a voliteľný termín úlohy;
- mesačný/týždenný alebo denný kalendárový pohľad a CRUD udalostí;
- dashboard s dnešnými úlohami, najbližšími udalosťami a rýchlymi akciami;
- responzívne rozhranie pre mobil, tablet a desktop;
- svetlá, tmavá a systémová téma s trvalým nastavením;
- validácia formulárov, chybové hlášky a potvrdenie deštruktívnych akcií;
- základné klávesové ovládanie a prístupné popisky ovládacích prvkov.

## 6. Non-goals MVP

MVP neobsahuje tímové zdieľanie, komentáre ani role; synchronizáciu s Google/
Apple/Outlook kalendárom; opakované udalosti; pripomienky a push notifikácie;
prílohy, obrázky a rich-text editor; import/export; offline konfliktovú
synchronizáciu; automatické AI sumarizovanie alebo plánovanie; verejné stránky;
fakturáciu, multi-workspace a enterprise audit log.

## 7. Acceptance criteria

### Poznámky

- [ ] Používateľ vytvorí poznámku s názvom; bez názvu sa neuloží a pri poli sa
  zobrazí konkrétna chyba.
- [ ] Uloženie zobrazí poznámku v zozname bez manuálneho refreshu; po refreshi
  zostanú názov, obsah, značky a čas poslednej úpravy zachované.
- [ ] Úprava používa rovnaký formulár a pri nezmenenom obsahu nevytvorí
  duplicitný záznam.
- [ ] Zmazanie vyžaduje potvrdenie; po potvrdení položka zmizne zo zoznamu a
  súvisiaca úloha sa nezmaže automaticky.
- [ ] Vyhľadávanie ignoruje veľkosť písmen, nájde text v názve aj obsahu a pri
  nulovom výsledku zobrazí stav s možnosťou vymazať filter.

### Úlohy

- [ ] Úloha vyžaduje neprázdny názov; trimovanie odstráni iba okrajové medzery.
- [ ] Kliknutie na checkbox prepne `open`/`done`, zachová termín a zmena sa
  prejaví v dashboarde aj v kalendári.
- [ ] Priorita má presne tri hodnoty a je viditeľná aj bez otvorenia detailu.
- [ ] Termín akceptuje iba platný dátum; úloha bez termínu je v sekcii
  **Bez termínu** a nesmie sa zobraziť ako dnešná.
- [ ] Úprava a zmazanie sú dostupné z detailu; zmazanie vyžaduje potvrdenie.
- [ ] Prepojenie z poznámky predvyplní názov, ale používateľ ho môže zmeniť.

### Kalendár

- [ ] Používateľ vidí aktuálny deň a vie prejsť na predchádzajúci/nasledujúci
  deň, týždeň alebo mesiac a tlačidlom **Dnes** sa vráti na aktuálny dátum.
- [ ] Udalosť vyžaduje názov, začiatok je predvolený na zvolený deň a koniec
  musí byť po začiatku; chybný rozsah sa neuloží.
- [ ] Celodenná udalosť nemá povinný čas a zobrazí sa v oddelenej celodennej
  oblasti.
- [ ] Úprava udalosti zachová jej `id`; posun alebo zmena trvania sa prejaví
  po uložení bez duplicity.
- [ ] Úlohy s termínom sa zobrazia ako samostatný typ položky a nemožno ich
  upravovať cez formulár udalosti.

### Dashboard

- [ ] Po načítaní zobrazí rýchle akcie **Nová poznámka**, **Nová úloha** a
  **Nová udalosť**.
- [ ] Sekcia **Dnes** obsahuje otvorené aj dokončené dnešné úlohy s jasným
  stavom; dokončené sú vizuálne odlíšené.
- [ ] Sekcia najbližších udalostí je zoradená podľa začiatku a obsahuje aspoň
  najbližších sedem dní; prázdny stav obsahuje odkaz do kalendára.
- [ ] Po zmene položky v inej sekcii sa dashboard aktualizuje po návrate alebo
  po novom načítaní dát.
- [ ] Chyba jednej sekcie nezablokuje zobrazenie ostatných sekcií; používateľ
  dostane možnosť opakovať načítanie.

### Responzivita a prístupnosť

- [ ] Rozhranie je použiteľné pri šírkach 320 px, 768 px a 1440 px bez
  horizontálneho scrollu.
- [ ] Na mobiloch sa tabuľky/listy preusporiadajú do kariet alebo scrollovateľnej
  oblasti; primárna akcia ostane dostupná bez presného hoveru.
- [ ] Všetky funkcie sú ovládateľné klávesnicou; focus je viditeľný a poradie
  focusu kopíruje vizuálnu štruktúru.
- [ ] Formuláre používajú prepojené labely, chyby sú oznámené pri poli a
  interaktívne prvky majú zrozumiteľný názov pre čítačku obrazovky.
- [ ] Text a ovládacie prvky spĺňajú minimálne WCAG AA kontrastné požiadavky;
  informácia nie je sprostredkovaná iba farbou.

### Téma

- [ ] Používateľ prepne svetlú, tmavú alebo systémovú tému v nastaveniach.
- [ ] Téma sa aplikuje na všetky obrazovky a po reloadnutí zostane zachovaná.
- [ ] Systémová téma reaguje na zmenu preferencie OS, pokiaľ používateľ
  nevybral explicitne svetlú alebo tmavú.
- [ ] Prepínač má textový alebo ARIA stav a je ovládateľný klávesnicou.
- [ ] Žiadna obrazovka nemá nečitateľný text, neviditeľný focus ani rozbitý
  stav po prepnutí témy.

## 8. Edge cases a očakávané správanie

- Prázdny názov, iba medzery alebo neplatný dátum: uloženie je zablokované a
  chyba je pri konkrétnom poli.
- Dvojité kliknutie na **Uložiť**: vytvorí sa najviac jeden záznam; tlačidlo sa
  počas odosielania deaktivuje.
- Obnovenie stránky počas ukladania: používateľ dostane stav úspechu/chyby;
  aplikácia nesmie ticho tvrdiť, že dáta boli uložené.
- Konflikt úprav v dvoch kartách: pri uložení sa zobrazí upozornenie s voľbou
  načítať novšiu verziu alebo prepísať ju.
- Zmazanie poznámky s prepojenou úlohou: úloha zostane, odkaz na poznámku sa
  odstráni a používateľ to vidí v potvrdení.
- Letný/zimný čas: uložené časy sa prenášajú s časovým pásmom používateľa;
  koniec udalosti musí zostať po začiatku aj pri zmene času.
- Veľmi dlhý obsah/názov: formulár má limity a zrozumiteľnú chybu; zoznam
  text skráti iba vizuálne, nie v uložených dátach.
- Žiadne dáta: každá hlavná sekcia má užitočný empty state a odkaz na prvú
  akciu, nie prázdnu bielu plochu.
- Chyba siete: existujúce dáta ostanú čitateľné, zlyhaná mutácia je označená
  a možno ju opakovať bez vytvorenia duplicity.

## 9. Budúci roadmap

### Fáza 1 — spoľahlivosť po MVP

Pridanie účtu a bezpečnej synchronizácie medzi zariadeniami, automatické
ukladanie konceptov, undo po zmazaní, import/export Markdown/CSV a meranie
výkonu s cieľom interakcie do 100 ms pri bežných zoznamoch.

### Fáza 2 — plánovanie

Opakované úlohy a udalosti, pripomienky, časové blokovanie, drag-and-drop
plánovanie, filtre podľa projektu a integrácia s externými kalendármi.

### Fáza 3 — spolupráca

Zdieľané workspace, pozývanie členov, komentáre, priradenie úloh, história
zmien a jemne nastavené oprávnenia.

### Fáza 4 — inteligencia a ekosystém

Voliteľné AI návrhy (extrakcia úloh a termínov s potvrdením používateľa),
mobilné aplikácie, API, webhooky a rozšírenia pre e-mail/browser. Každá
automatická zmena musí byť vysvetliteľná, vratná a explicitne potvrdená.

## 10. Definition of done pre MVP

Každý bod acceptance criteria má automatizovaný alebo zdokumentovaný manuálny
test. Kritické CRUD toky fungujú po obnovení stránky, neexistujú blokujúce
chyby v desktopovom ani mobilnom rozložení, základné klávesové a screen-reader
scenáre sú overené a zmeny sú pokryté krátkym release checklistom.

# Bezpečnosť a súkromie

Tento dokument opisuje bezpečnostný model Planory: local-first aplikácie na poznámky, úlohy a kalendár bez účtu, servera a zdieľaného pracovného priestoru vo v1. Nie je náhradou za bezpečnostný audit. Predpokladáme, že zariadenie a používateľský účet operačného systému sú chránené.

## Rozsah a ciele

Planora má ukladať osobné dáta prednostne v zariadení, fungovať offline a používateľovi jasne ukázať, kde sa dáta nachádzajú. Ciele ochrany sú:

- dôvernosť poznámok, úloh, udalostí a exportov;
- integrita dát pri ukladaní, migrácii a importe;
- odolnosť voči bežným útokom v prehliadači a poškodeniu lokálneho úložiska;
- transparentnosť: žiadna tichá synchronizácia, analytika ani zdieľanie.

## Threat model

### Chránené aktíva

Obsah poznámok a checklistov, názvy a poznámky úloh, kalendárové udalosti a lokácie, tagy, väzby medzi položkami, časové pečiatky, nastavenia a JSON zálohy. Aj metadáta (napríklad čas vytvorenia a názvy) môžu byť citlivé.

### Predpokladaní útočníci

- **XSS alebo škodlivý obsah:** útočník vloží HTML/URL do poľa, alebo sa kompromituje závislosť či build.
- **Iná stránka v prehliadači:** pokúsi sa zneužiť cross-origin izoláciu; nemá dostať prístup k localStorage Planory.
- **Škodlivé rozšírenie, malware alebo osoba s prístupom k zariadeniu:** môže čítať pamäť, súbory alebo profil prehliadača. Local-first neznamená ochranu proti nim.
- **Chybný alebo zámerne upravený import:** pokúsi sa vyčerpať pamäť, prepísať dáta, vložiť neplatné ID alebo škodlivé hodnoty.
- **Supply-chain riziko:** napadnutý balík, transitive dependency alebo build pipeline zmení klientsky kód.

### Hranice modelu

Bez účtu a backendu nevie aplikácia spoľahlivo obnoviť dáta po vymazaní profilu, chrániť export pred človekom, ktorý má prístup k súboru, ani vynútiť odvolanie prístupu na inom zariadení. Šifrovaný disk, zámok zariadenia a bezpečné zálohovanie sú zodpovednosťou používateľa. Budúci backend musí tento model výslovne zmeniť a zdokumentovať.

## Riziká a požiadavky

### XSS a nebezpečné renderovanie

Obsah poznámok, názvov, lokácií, tagov a importovaných dát je nedôveryhodný. Renderujte ho ako text; nepoužívajte `innerHTML`, `dangerouslySetInnerHTML`, `eval`, `new Function` ani HTML parser bez striktnej sanitizácie. Markdown/rich text vo v1 radšej nepodporovať. URL validujte podľa povolených protokolov (`https:` a podľa potreby `mailto:`); odmietajte `javascript:`, `data:` a `vbscript:`.

React/Vue escaping nenahrádza bezpečné spracovanie atribútov, URL ani DOM API. Po každej zmene renderovania vykonať test s payloadmi ako `<img src=x onerror=alert(1)>`, úvodzovkami, SVG a URL. Service worker, cache a import nesmú obchádzať rovnaké pravidlá.

### localStorage v MVP a strata dát

Aktuálne MVP používa `localStorage` ako lokálne úložisko používateľských dát. Je synchronné, kapacitne obmedzené (často približne 5 MB, bez garancie) a zápis môže zlyhať napríklad pre kvótu, súkromný režim alebo nedostupnosť úložiska. Neuchovávajte tam tokeny; JSON export je používateľom spustený súbor a nemá sa ukladať späť do `localStorage`.

Každé čítanie aj zapisovanie musí byť v `try/catch` a musí bezpečne spracovať neplatný alebo poškodený obsah. Pred použitím dáta validujte voči verziovanej schéme; migrácie schémy majú byť explicitné, opakovateľné a odmietnuť neznámu alebo nebezpečnú verziu. Nastavte limity veľkosti uloženého payloadu, počtu záznamov a dĺžok polí, aby veľké alebo poškodené dáta nevyčerpali pamäť.

Pri zlyhaní zápisu zachovajte posledný platný stav a aktuálny koncept v pamäti, zabráňte čiastočnému prepísaniu, zobrazte zrozumiteľnú chybu a ponúknite export alebo obnovu. Ak sa úložisko nedá čítať, použite bezpečný read-only alebo prázdny stav s potvrdením používateľa; nikdy ticho neprepíšte existujúce dáta. UI musí jasne upozorniť, že údaje môžu byť citlivé a že vymazanie site data, súkromný režim, čistenie prehliadača alebo strata zariadenia môže spôsobiť ich nenávratnú stratu. Nikdy netvrďte „zálohované“ alebo „synchronizované“ iba preto, že zápis do prehliadača uspel.

Odporúčaná budúca migrácia je presun používateľských dát do `IndexedDB`, ak narastie objem dát alebo potreba robustnejších transakcií. Migrácia musí mať samostatný návrh, detekciu verzie, zálohu/export pred zmenou, atómový rollback a otestovanú obnovu; v aktuálnom MVP však IndexedDB ešte nie je kanonickým úložiskom.

### Súkromie a telemetria

Vo v1 neposielajte obsah ani identifikátory na server. Nepoužívajte trackery, reklamné SDK, session replay, vzdialené fonty ani externý obsah potrebný na jadro aplikácie. Service worker/cache nesmie nechtiac ukladať cudzie dáta. Ak sa neskôr pridá diagnostika, musí byť voliteľná, minimalizovaná, zdokumentovaná a bez obsahu poznámok.

UI má pri prvom použití a v nastaveniach uviesť: „Vaše dáta zostávajú v tomto zariadení.“ Export je používateľom spustený proces, nie automatická záloha.

### Export a import

JSON export obsahuje všetky dáta a preto sa považuje za citlivý súbor. Upozornite, že názov súboru, cloudový disk, e-mail, história sťahovania a automatické zálohy môžu vytvoriť ďalšie kópie. Export neukladajte do localStorage a neodosielajte na server; po použití odporučte bezpečné uloženie alebo vymazanie kópie.

Import spracujte ako nedôveryhodný vstup: overte MIME aj veľkosť, limity počtu záznamov a dĺžky polí, JSON parse, schema version, typy, UUID, dátumy, povolené enumy, referenčnú integritu a duplicity. Validujte celý súbor pred zápisom, zobrazte náhľad a konflikty a použite atómovú transakciu. Pri zlyhaní sa nesmie zmeniť žiadny existujúci záznam. Merge politika má byť deterministická (pri rovnakom ID novšia `updatedAt`) a odmietnuté záznamy majú mať lokálny report bez vykonania kódu.

## CSP a bezpečnostné hlavičky

Nasadiť CSP cez HTTP hlavičku (nonce/hash pre každý povolený inline prvok, ideálne bez inline skriptov), napríklad:

```http
Content-Security-Policy: default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; upgrade-insecure-requests
```

Politiku najprv overujte cez `Content-Security-Policy-Report-Only`, potom vynucujte a sledujte porušenia bez odosielania používateľského obsahu. Podľa hostingu pridajte `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` s vypnutými nepotrebnými API a `X-Content-Type-Options: nosniff`. `X-Frame-Options` používajte ako fallback. CSP nie je náhrada za escaping/sanitizáciu.

## Hygiena závislostí a buildov

- Commitujte lockfile a používajte reprodukovateľný, čistý production build.
- V CI spúšťajte `npm audit`/ekvivalent, kontrolu zastaraných balíkov a secret scanning; kritické zraniteľnosti opravte alebo zdokumentujte výnimku s termínom.
- Minimalizujte závislosti, preverujte maintainerov, licencie, transitive strom a release artefakty; neťahajte balíky z neoverených CDN.
- Aktualizácie robte pravidelne a testujte XSS, import, migrácie, offline režim a CSP. Pinujte action/tool verzie v CI a chráňte branch/build credentials.
- Do repozitára, logov, error reportov ani exportov nepridávajte tokeny, osobné dáta či celé poznámky.

## Budúci backend a autentifikácia

Backend nie je súčasťou v1. Pred jeho pridaním treba navrhnúť explicitný model účtov, obnovy účtu, vymazania dát, consentu, retencie, auditných logov, rate limitov a migrácie z lokálneho úložiska. Preferovať moderné passwordless/passkey alebo overený OIDC flow; heslá nikdy neukladať v klientovi ani v plain texte. Session cookies majú byť `Secure`, `HttpOnly`, `SameSite=Lax/Strict`, s CSRF ochranou; tokeny nedávať do localStorage.

Prenos musí byť cez TLS, server musí autorizovať každý objekt (nie iba overiť prihlásenie), validovať payloady a obmedziť export/sync endpointy. Zvážte end-to-end šifrovanie pre obsah, kľúč odvodený na zariadení a jasnú stratu obnoviteľnosti pri strate kľúča. Sync konflikty, zariadenia, odvolanie relácie a zmazanie účtu musia mať testovateľné pravidlá. Zmena v1 z „iba lokálne“ na cloud musí byť opt-in a viditeľná v UI aj dokumentácii.

## Security release checklist

Pred každým release odškrtnúť a uložiť dôkaz (CI log, test alebo link na review):

- [ ] Release branch/PR vychádza z aktuálneho `main`; žiadne priame pushovanie na `main` a review je schválené.
- [ ] Production build je reprodukovateľný, lockfile je aktuálny a v repozitári/artefaktoch nie sú secrets.
- [ ] Prešli lint, typecheck, unit/integration testy a accessibility testy; zlyhanie úložiska a offline reload sú otestované.
- [ ] XSS testy pokrývajú poznámky, úlohy, udalosti, tagy, URL, import a všetky DOM renderery; nebezpečné API sú zakázané alebo preskúmané.
- [ ] CSP je vynútená, bez neočakávaných porušení; hlavičky a HTTPS boli overené na stagingu.
- [ ] Neodosiela sa obsah, tracker ani vzdialený zdroj, ktorý nie je schválený a zdokumentovaný.
- [ ] `localStorage` čítanie a zápis sú chránené `try/catch`; testované sú quota error, nedostupnosť, poškodená/verziou nekompatibilná schéma, limity, bezpečný fallback, zachovanie konceptu a upozornenie na citlivosť a možnú stratu dát.
- [ ] IndexedDB migrácia nie je označená ako hotová: ak sa pripravuje, má samostatný návrh a testy exportu, rollbacku a obnovy; v MVP je kanonickým úložiskom `localStorage`.
- [ ] Export/import testuje veľký súbor, neplatný JSON/schema/ID/dátum, XSS payload, duplicity, referencie, konflikt a atómový rollback bez čiastočnej zmeny.
- [ ] Je overená kompatibilita service workera/cache a nehrozí servovanie zastaraného alebo zmiešaného buildu.
- [ ] `npm audit`/SCA a secret scan sú čisté alebo majú zdokumentované, časovo obmedzené výnimky s vlastníkom.
- [ ] Release notes uvádzajú local-first limity, riziká exportu a prípadné zmeny v spracovaní dát.
- [ ] Po nasadení je pripravený rollback, monitorovanie chýb nezhromažďuje obsah a je určený vlastník incident response.

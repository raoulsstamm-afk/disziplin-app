// Web-Test: spielt den ganzen Ablauf im unsichtbaren Chromium durch und fotografiert jeden Bildschirm (390 x 844).
// Aufruf: npx expo export --platform web && node werkzeuge/fotos.cjs
// In der Cloud: NODE_PATH=/opt/node22/lib/node_modules node werkzeuge/fotos.cjs
// Bilder landen in docs/screenshots/, Konsolenfehler werden am Ende gemeldet.
// Im Browser gibt es keine Kamera: Der Foto-Beweis läuft dort über "Test ohne Foto".
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const WURZEL = path.join(__dirname, '..');
const DIST = path.join(WURZEL, 'dist');
const AUS = path.join(WURZEL, 'docs', 'screenshots');
const PORT = 8766;
const SCHLUESSEL = 'disziplin-zustand-v1';
const TAG = 24 * 60 * 60 * 1000;

const TYPEN = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon' };

function server() {
  return http
    .createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      let datei = path.join(DIST, p);
      if (!datei.startsWith(DIST) || !fs.existsSync(datei) || fs.statSync(datei).isDirectory()) datei = path.join(DIST, 'index.html');
      res.writeHead(200, { 'Content-Type': TYPEN[path.extname(datei)] || 'application/octet-stream' });
      fs.createReadStream(datei).pipe(res);
    })
    .listen(PORT);
}

(async () => {
  fs.mkdirSync(AUS, { recursive: true });
  for (const f of fs.readdirSync(AUS)) if (f.endsWith('.png')) fs.unlinkSync(path.join(AUS, f));
  const s = server();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const fehler = [];
  page.on('console', (m) => m.type() === 'error' && fehler.push(m.text()));
  page.on('pageerror', (e) => fehler.push(String(e)));

  let nr = 0;
  const foto = async (name) => {
    await page.waitForTimeout(500);
    nr++;
    await page.screenshot({ path: path.join(AUS, `${String(nr).padStart(2, '0')}-${name}.png`) });
  };
  const runter = async (px) => {
    await page.mouse.move(195, 420);
    await page.mouse.wheel(0, px);
    await page.waitForTimeout(300);
  };
  const tippe = async (text) => {
    await page.getByText(text, { exact: true }).last().click();
    await page.waitForTimeout(250);
  };

  await page.goto(`http://localhost:${PORT}/`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(3800);
  await foto('start');
  await tippe("Los geht's");

  const antworten = [
    ['Lernen, Schule oder Uni', 'Regelmäßig Sport'],
    ['Lernen'],
    ['Abends, dann ist es zu spät'],
    ['Scrollen', 'Serien und YouTube'],
    ['2 bis 4 Stunden'],
    ['Schlechtes Gewissen im Hinterkopf'],
    ['Ich weiß nicht, wo ich anfangen soll'],
    ['30 bis 60 Minuten'],
    ['Drei Sachen am Tag'],
  ];
  for (let i = 0; i < antworten.length; i++) {
    for (const a of antworten[i]) await tippe(a);
    await foto(`frage-${String(i + 1).padStart(2, '0')}`);
    await tippe('Weiter');
  }
  await foto('auswertung');
  await tippe('Weiter');
  await foto('plan');
  await tippe('Weiter');
  await foto('erinnerung');
  await tippe('Erinnerung einschalten');
  await page.waitForTimeout(400);
  await foto('paywall');
  await tippe('Weiter (Test)');
  await page.waitForTimeout(800);
  await foto('heute-tag-0');

  // Erster Erfolg: Foto-Beweis (im Browser ohne Kamera)
  await tippe('Foto-Beweis machen');
  await page.waitForTimeout(600);
  await foto('beweis');
  await tippe('Test ohne Foto');
  await page.waitForTimeout(600);
  await foto('beweis-geprueft');
  await tippe('Weiter so');
  await page.waitForTimeout(500);
  await foto('heute-tag-1');

  // Lock-in starten
  await page.getByRole('tab', { name: 'Fokus' }).click();
  await foto('fokus');
  await tippe('25');
  await tippe('25 Minuten Lock-in starten');
  await page.waitForTimeout(1500);
  await foto('lockin');
  await tippe('Abbrechen');
  await foto('lockin-abbrechen');
  await tippe('Weitermachen');

  // Lock-in fast vorbei: Ende in 2 Sekunden, dann gibt es XP
  await page.evaluate(
    ({ SCHLUESSEL }) => {
      const z = JSON.parse(localStorage.getItem(SCHLUESSEL));
      const jetzt = Date.now();
      z.laufend = { start: jetzt - 25 * 60000 + 2000, ende: jetzt + 2000, minuten: 25 };
      localStorage.setItem(SCHLUESSEL, JSON.stringify(z));
    },
    { SCHLUESSEL },
  );
  await page.goto(`http://localhost:${PORT}/lockin`);
  await page.waitForTimeout(6000);
  await foto('lockin-geschafft');
  await tippe('Weiter so');

  // Zustand mit Vorgeschichte für aussagekräftige Bilder: 12 Tage am Stück, ein Joker, Lock-ins
  await page.evaluate(
    ({ SCHLUESSEL, TAG }) => {
      const z = JSON.parse(localStorage.getItem(SCHLUESSEL));
      const jetzt = Date.now();
      const tagKey = (ms) => {
        const d = new Date(ms);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };
      z.ersterStart = jetzt - 20 * TAG;
      const beweise = [];
      const fokus = [];
      for (let t = 20; t >= 1; t--) {
        // Lücke vor 13 Tagen (Serie gerissen), vor 5 Tagen rettet der Joker
        if (t === 13 || t === 14 || t === 5) continue;
        const zeit = jetzt - t * TAG;
        const anzahl = 1 + (t % 3);
        for (let k = 0; k < anzahl; k++) {
          const a = z.aufgaben[k % z.aufgaben.length];
          beweise.push({ id: `b${t}-${k}`, aufgabeId: a.id, text: a.text, tag: tagKey(zeit), zeit, foto: null });
        }
        if (t % 2 === 0) fokus.push({ tag: tagKey(zeit), zeit, minuten: t % 4 === 0 ? 90 : 50 });
      }
      z.beweise = beweise.concat(z.beweise.filter((b) => b.tag === tagKey(jetzt)));
      z.fokus = fokus.concat(z.fokus.filter((f) => f.tag === tagKey(jetzt)));
      localStorage.setItem(SCHLUESSEL, JSON.stringify(z));
    },
    { SCHLUESSEL, TAG },
  );
  await page.goto(`http://localhost:${PORT}/heute`);
  await page.waitForTimeout(3800);
  await foto('heute-tag-12');
  await runter(600);
  await foto('heute-unten');

  await page.getByRole('tab', { name: 'Fortschritt' }).click();
  await foto('fortschritt');
  await runter(600);
  await foto('fortschritt-beweise');
  await runter(900);
  await foto('fortschritt-level');

  await page.getByRole('tab', { name: 'Einstellungen' }).click();
  await foto('einstellungen');
  await runter(800);
  await tippe('Alle Daten löschen');
  await runter(400);
  await foto('einstellungen-loeschen');
  await tippe('Ja, alles löschen');
  await page.waitForTimeout(800);
  await foto('nach-loeschen-start');

  await browser.close();
  s.close();
  console.log(`${nr} Bilder in ${AUS}`);
  if (fehler.length) {
    console.log('Konsolenfehler:');
    for (const f of [...new Set(fehler)]) console.log(' -', f.slice(0, 300));
  } else console.log('Keine Konsolenfehler.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

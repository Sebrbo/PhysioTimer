# PhysioTimer

**Live app:** https://sebrbo.github.io/PhysioTimer/  
**Source repository:** https://github.com/Sebrbo/PhysioTimer

PhysioTimer is a free, installable and offline-capable workout interval timer,
for physiotherapy exercises, rehabilitation and sport. This is not a medical device
and does not provide diagnosis or treatment recommendations.

## Version v0.3.2 — Saisie MM:SS améliorée

Les réglages de durées proposent désormais deux zones indépendantes (minutes et secondes), séparées par un `:` fixe. Cliquer dans une zone sélectionne ses chiffres ; la durée est recalculée pendant la saisie. Les secondes sont limitées à 0–59 ; les préférences déjà enregistrées sont préservées.

## Version v0.3.1 — Charte graphique Physio

Palette partagée avec les applications PhysioTempo, PhysioReact et PhysioStroop : bleu nuit `#071426`, cyan `#18D7FF`, blanc `#F7FAFF`. La signification des phases est conservée par les libellés et des couleurs à fort contraste : ambre `#F0B35C` pour préparation, cyan électrique `#19D3EB` pour exercice, violet profond `#7045B5` pour repos et violet clair pour repos entre cycles.

## Fonctions (FR)

- **Tabata** : préparation, exercice, repos, rounds, cycles et repos entre cycles.
- **Rounds** : préparation, exercice, repos et nombre de rounds.
- **Chronomètre** : départ, pause, remise à zéro et tours.
- Affichage géant et couleurs : ambre (préparation), cyan électrique (effort), violet profond (repos).
- Durée totale restante, phase suivante, rounds et cycles restants.
- Démarrage, pause/reprise, réinitialisation, bip, compte à rebours sonore,
  guidage vocal facultatif, vibrations quand disponibles.
- Mode plein écran, Wake Lock (écran allumé, si navigateur compatible).
- Programmes enregistrés et paramètres conservés dans le navigateur (`localStorage`).
- Interface française et anglaise, sélection manuelle ou automatique.
- Aucun compte, serveur, suivi publicitaire ou donnée médicale personnelle.
- PWA hors ligne après la première visite et l'installation du cache.

**Calcul des intervalles :** pas de repos ordinaire après le dernier effort d'un
cycle ; entre deux cycles, seul le repos inter-cycle est inséré. Exemple :
5 s préparation + 12 x 10 s effort + 11 x 10 s repos = **3 min 55 s**.

## Publication GitHub Pages

1. Sur le compte GitHub **Sebrbo**, créer un dépôt **public** `PhysioTimer`.
   Ne pas cocher l'initialisation automatique (README/.gitignore/licence) si vous
   importez tout le contenu de ce dossier.
2. Importer **le contenu de ce dossier à la racine** du dépôt et valider sur `main`.
3. Ouvrir **Settings → Pages → Build and deployment**.
4. Choisir **Deploy from a branch**, `main`, `/ (root)` puis **Save**.
5. Une fois GitHub Pages activé, ouvrir https://sebrbo.github.io/PhysioTimer/.

Le dépôt et GitHub Pages sont désormais publiés. Pour mettre à jour, importer les fichiers modifiés à leur chemin existant sur la branche `main`, sans modifier les trois autres dépôts Physio.

## Développement et tests

Sans framework, npm ni bundler : HTML, CSS et JS natifs.
Pour un serveur local, depuis la racine du projet :

```bash
python3 -m http.server 8000
```

Ouvrir http://localhost:8000/ et tester les interactions. Pour tester
les calculs de séquences :

```bash
node --test tests/test-core.cjs
```

Quand un script ou une feuille de style change, incrémenter le numéro de version
`?v=5` dans `index.html`, le `CACHE_NAME` et les chemins de `APP_SHELL`
dans `service-worker.js` afin de diffuser la nouvelle version aux PWA installées.

## Limitations navigateur

- Safari iOS limite généralement les vibrations, certains usages de la synthèse
  vocale et le plein écran ; l'installation PWA via « Partager → Sur l'écran d'accueil »
  reste possible.
- Le navigateur peut suspendre les sons et l'affichage en arrière-plan ou quand
  le téléphone est verrouillé. Le calcul du temps est basé sur `performance.now()`
  pour reprendre correctement au retour au premier plan, sans garantir les alertes
  pendant la suspension.
- Pas de flash matériel ni de diminution du volume des applications musicales externes.
- Les programmes sont conservés uniquement sur l'appareil et dans ce navigateur.

## License / Licences

- **Code source : PolyForm Noncommercial License 1.0.0** (voir `LICENCE`).
- **Ressources non logicielles : CC BY-NC 4.0** (voir `LICENSE-CC-BY-NC-4.0`).
- Copyright © 2026 Sebrbo and contributors.

Le code est publiquement consultable, modifiable et partageable pour un usage non
commercial. Ces licences ne sont **pas** des licences open source approuvées par l'OSI.
Aucune utilisation commerciale, distribution sous forme de produit commercial ou
revente n'est autorisée sans permission complémentaire du titulaire des droits.

---

## EN — Overview

PhysioTimer is a dependency-free, mobile-friendly interval timer with Tabata,
Rounds, and Stopwatch modes. It supports preparation/work/rest intervals,
cycle breaks, audio and speech cues where supported, saved presets, offline PWA,
and a bilingual FR/EN interface. It is hosted as static content on GitHub Pages.

The code is available for **noncommercial use only**, under the PolyForm
Noncommercial 1.0.0 license. Non-code assets use CC BY-NC 4.0. This project is
**source-available**, rather than OSI-certified open source.

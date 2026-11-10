# PhysioTimer

**Minuteur d’intervalles pour la rééducation et l’entraînement.**  
**Interval timer for rehabilitation and training.**

[Utiliser PhysioTimer / Open PhysioTimer](https://sebrbo.github.io/PhysioTimer/) · [Code source / Source code](https://github.com/Sebrbo/PhysioTimer)

[Français](#français) · [English](#english)

---

## Français

PhysioTimer est une application web gratuite pour organiser des séances alternant effort et récupération. Conçue pour la kinésithérapie, la rééducation et la préparation physique, elle fonctionne sur ordinateur, tablette et smartphone, sans compte utilisateur.

### Fonctionnalités

- **Tabata** : durées de préparation, d’exercice et de repos, nombre de rounds et de cycles, repos entre cycles.
- **Rounds** : séquences effort/repos personnalisables.
- **Chronomètre** : démarrage, pause, remise à zéro et enregistrement des tours.
- **Affichage lisible** : grand compte à rebours, durée totale restante, phase suivante et progression. Les phases sont distinguées par des couleurs : ambre (préparation), cyan (effort), violet (repos).
- **Commandes et alertes** : pause/reprise, réinitialisation, plein écran, signaux sonores, annonces vocales et vibrations lorsque le navigateur le permet.
- **Programmes personnalisés** : sauvegarde locale des réglages pour retrouver ses séances.
- **Partage par QR code** : un lien transmet les paramètres de la séance, sans compte ni serveur.

### Utilisation

Ouvrez [l’application](https://sebrbo.github.io/PhysioTimer/), choisissez **Tabata**, **Rounds** ou **Chronomètre**, puis ajustez les paramètres et démarrez la séance. Les durées se règlent en minutes et secondes (`MM:SS`).

Pour partager une séance, configurez ses intervalles puis cliquez sur **Partager**. Le QR code s’affiche sur l’écran ; le patient peut le scanner pour ouvrir le programme et appuyer sur **Démarrer la séance**. Il est aussi possible de copier le lien ou de télécharger le QR code. Le lien ne contient que les paramètres temporels et les nombres de rounds/cycles : n’y ajoutez pas de données personnelles. Une séance reçue n’écrase pas les réglages locaux et n’est enregistrée que sur demande.

PhysioTimer est une **Progressive Web App (PWA)** : après un premier chargement, elle peut être installée sur un appareil compatible et utilisée hors connexion. Les programmes et préférences restent enregistrés dans le navigateur utilisé ; ils ne sont pas synchronisés entre appareils.

### À savoir

Les fonctions audio, vocales, de vibration, de plein écran et de maintien de l’écran allumé dépendent du navigateur et de l’appareil. Les alertes ne sont pas garanties lorsque l’application est en arrière-plan ou que l’écran est verrouillé.

PhysioTimer est un outil d’accompagnement des exercices. Il ne constitue pas un dispositif médical et ne remplace ni l’évaluation ni le jugement clinique d’un professionnel de santé.

---

## English

PhysioTimer is a free web app for structuring workouts with alternating work and recovery intervals. Designed for physiotherapy, rehabilitation and physical training, it runs on desktop, tablet and mobile devices without requiring an account.

### Features

- **Tabata**: configurable preparation, work and rest durations, rounds, cycles and rest between cycles.
- **Rounds**: customizable work/rest sequences.
- **Stopwatch**: start, pause, reset and lap recording.
- **Clear display**: large countdown, overall time remaining, upcoming phase and progress. Phases use distinct colors: amber (preparation), cyan (work) and purple (rest).
- **Controls and cues**: pause/resume, reset, fullscreen, audible signals, voice announcements and vibration where supported.
- **Saved presets**: store session settings locally for later use.
- **QR code sharing**: a short link transfers session settings without an account or server.

### Getting started

Open the [app](https://sebrbo.github.io/PhysioTimer/), select **Tabata**, **Rounds** or **Stopwatch**, adjust the settings and start your session. Durations are entered as minutes and seconds (`MM:SS`).

To share a session, configure its intervals and select **Share**. The QR code lets another person open the session on a phone and tap **Start session**. You can also copy the link or download the QR code. Links contain timing and round/cycle settings only; do not include personal information. Shared sessions do not overwrite or automatically save local settings.

PhysioTimer is a **Progressive Web App (PWA)**. After its first load, it can be installed on compatible devices and used offline. Presets and preferences are stored in the current browser and are not synchronized across devices.

### Important notes

Audio, speech, vibration, fullscreen and screen wake features depend on browser and device support. Alerts may not play while the app is in the background or the screen is locked.

PhysioTimer supports exercise sessions; it is not a medical device and does not replace professional assessment or clinical judgment.

---

## Développement / Development

Application statique en **HTML, CSS et JavaScript**, sans framework ni dépendance à installer. Hébergement via **GitHub Pages**.

Static **HTML, CSS and JavaScript** application, with no framework or required dependencies. Hosted on **GitHub Pages**.

Pour lancer un serveur local / To run a local server:

```bash
python3 -m http.server 8000
```

Pour exécuter les tests du moteur / To run the timer engine tests:

```bash
node --test tests/test-core.cjs
```

### Génération des QR codes / QR code generation

Les QR codes sont générés localement dans le navigateur, sans service externe. La bibliothèque QR utilisée est sous licence MIT (voir [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)).

QR codes are generated locally in the browser without contacting an external service. The embedded QR library is MIT-licensed (see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)).

## Licence / License

- **Code / Source code:** [PolyForm Noncommercial 1.0.0](LICENCE).
- **Ressources et contenus / Non-code assets and content:** [CC BY-NC 4.0](LICENSE-CC-BY-NC-4.0).

La consultation, la modification et le partage sont autorisés dans les limites des licences, **pour des usages non commerciaux uniquement**. Le projet est *source-available* et non « open source » au sens de l’OSI.

Viewing, modifying and sharing are permitted under the license terms, **for noncommercial purposes only**. This is a *source-available* project, not OSI-approved open source software.

© 2026 Sebrbo and contributors.

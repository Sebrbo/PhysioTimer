/* Copyright (c) 2026 Sebrbo and contributors. Code: PolyForm Noncommercial 1.0.0; see LICENCE. */
/* In-app FR/EN translations. No network calls or dependencies. */
(function (root) {
  'use strict';
  const strings = {
    fr: {
      qrAlt: 'QR code du programme',
      share: 'Partager', shareTitle: 'Partager une séance',
      shareInstructions: 'Le patient scanne ce code pour ouvrir la séance sur son téléphone.',
      shareLink: 'Lien du programme', copyLink: 'Copier le lien', downloadQr: 'Télécharger le QR code',
      sharePrivacy: "Le lien contient uniquement les durées et les rounds/cycles. Aucun nom ni donnée de santé n'est partagé.",
      linkCopied: 'Lien copié', manualCopy: 'Sélectionnez le lien et copiez-le manuellement.', shareError: 'Impossible de générer le QR code.',
      sharePreset: 'Partager {name}', shareMode: 'Mode', shareWork: 'Exercice', shareRest: 'Repos', shareRounds: 'Rounds', shareCycles: 'Cycles', shareTotal: 'Durée totale',
      sharedNotice: 'Séance partagée · non enregistrée sur cet appareil', saveShared: 'Enregistrer',
      receivedTitle: 'Programme reçu', receivedIntro: 'Voici la séance partagée avec vous. Vérifiez les paramètres avant de commencer.',
      receivedPrivacy: "Ce programme ne remplace pas vos réglages enregistrés.", viewTimer: 'Voir le minuteur', startSession: 'Démarrer la séance',
      invalidSharedLink: 'Lien de programme invalide', invalidSharedHelp: 'Ce lien ne contient pas de programme utilisable. Demandez un nouveau QR code.', close: 'Fermer',
      reset: '↻ Réinitialiser', configure: '⚙ Configurer', savePreset: '☆ Enregistrer',
      stopwatch: 'CHRONOMÈTRE', lap: 'Tour', resetStopwatch: 'Remettre à zéro', laps: 'Tours',
      myPresets: 'Mes programmes', myPresetsHint: 'Retrouve tes séances enregistrées sur cet appareil.',
      navStopwatch: 'CHRONO', navPresets: 'PROGRAMMES', cancel: 'Annuler', save: 'Enregistrer', done: 'Fait',
      configHint: 'Personnalise les intervalles de ta séance.',
      preparation: 'Préparation', exercise: 'Exercice', rest: 'Repos', rounds: 'Rounds', cycles: 'Cycles',
      restCycles: 'Repos entre cycles', cooldown: 'Récupération finale',
      prepHint: 'Compte à rebours avant de commencer', exerciseHint: "Durée d'un effort", restHint: 'Entre deux rounds',
      roundsHint: "Nombre d'exercices par cycle", cyclesHint: 'Nombre de séries de rounds',
      restCyclesHint: 'Seulement si plusieurs cycles', cooldownHint: 'Optionnelle, après le dernier effort',
      estimatedTotal: 'Durée totale estimée :', settings: 'PARAMÈTRES',
      sound: 'Effets sonores', soundHint: 'Bips au changement de phase',
      volume: 'Volume', soundType: 'Type de son', beep: 'Bip', bell: 'Cloche',
      countdown: 'Compte à rebours sonore', countdownHint: 'Bips pendant les 3 dernières secondes',
      voice: 'Guidage vocal', voiceHint: 'Annonce « Exercice » et « Repos » si le navigateur le permet',
      vibration: 'Vibrations', vibrationHint: 'Non disponible sur certains appareils, notamment iPhone',
      wakeLock: "Garder l'écran allumé", wakeLockHint: 'Si pris en charge par le navigateur',
      language: 'Langue / Language', langHint: "Langue de l'interface et du guidage vocal", auto: 'Auto (système)',
      settingsNote: 'PhysioTimer fonctionne sans compte. Tes paramètres et programmes restent sur cet appareil.',
      saveProgramTitle: 'Enregistrer le programme', programName: 'Nom du programme',
      phasePrepare: 'PRÉPARER', phaseWork: 'EXERCICE', phaseRest: 'REPOS',
      phaseCycleRest: 'REPOS ENTRE CYCLES', phaseCooldown: 'RÉCUPÉRATION', phaseDone: 'TERMINÉ !',
      roundCycle: 'ROUND {round} / {rounds} · CYCLE {cycle} / {cycles}',
      sessionFinished: 'Séance terminée', next: 'ENSUITE : ', endOfSession: 'FIN DE SÉANCE',
      roundsLeftCaption: 'ROUNDS<br>RESTANTS', cyclesLeftCaption: 'CYCLES<br>RESTANTS',
      pause: 'Pause', restart: 'Recommencer', resume: 'Reprendre', start: 'Commencer',
      voicePrepare: 'Préparez-vous', invalidConfig: 'Vérifiez les valeurs du programme.',
      presetSaved: 'Programme enregistré', emptyPresets: 'Aucun programme enregistré pour le moment. Configure un Tabata ou des Rounds, puis touche « Enregistrer ». ',
      load: 'Lancer', loadPreset: 'Charger {name}', deletePreset: 'Supprimer {name}',
      confirmDelete: 'Supprimer « {name} » ?', lapN: 'Tour {n}',
      fullscreenUnavailable: 'Mode plein écran indisponible sur cet appareil.',
      fullscreen: 'Mode plein écran', audioSettings: 'Réglages sonores'
    },
    en: {
      qrAlt: 'Session QR code',
      share: 'Share', shareTitle: 'Share a session',
      shareInstructions: 'Scan this QR code to open the session on a phone.',
      shareLink: 'Session link', copyLink: 'Copy link', downloadQr: 'Download QR code',
      sharePrivacy: 'The link contains only timing and round/cycle settings. No names or health information are included.',
      linkCopied: 'Link copied', manualCopy: 'Select and copy the link manually.', shareError: 'Unable to generate QR code.',
      sharePreset: 'Share {name}', shareMode: 'Mode', shareWork: 'Work', shareRest: 'Rest', shareRounds: 'Rounds', shareCycles: 'Cycles', shareTotal: 'Total duration',
      sharedNotice: 'Shared session · not saved on this device', saveShared: 'Save',
      receivedTitle: 'Shared session', receivedIntro: 'This session has been shared with you. Review its settings before starting.',
      receivedPrivacy: 'This session will not replace your saved settings.', viewTimer: 'View timer', startSession: 'Start session',
      invalidSharedLink: 'Invalid session link', invalidSharedHelp: 'This link does not contain a usable session. Please request a new QR code.', close: 'Close',
      reset: '↻ Reset', configure: '⚙ Configure', savePreset: '☆ Save preset',
      stopwatch: 'STOPWATCH', lap: 'Lap', resetStopwatch: 'Reset', laps: 'Laps',
      myPresets: 'My workouts', myPresetsHint: 'Your saved sessions on this device.',
      navStopwatch: 'STOPWATCH', navPresets: 'PRESETS', cancel: 'Cancel', save: 'Save', done: 'Done',
      configHint: 'Customize your workout intervals.',
      preparation: 'Preparation', exercise: 'Work', rest: 'Rest', rounds: 'Rounds', cycles: 'Cycles',
      restCycles: 'Rest between cycles', cooldown: 'Final recovery',
      prepHint: 'Countdown before starting', exerciseHint: 'Length of each work interval', restHint: 'Between rounds',
      roundsHint: 'Number of work intervals per cycle', cyclesHint: 'Number of round sets',
      restCyclesHint: 'Only when using multiple cycles', cooldownHint: 'Optional, after the last effort',
      estimatedTotal: 'Estimated total time:', settings: 'SETTINGS',
      sound: 'Sound effects', soundHint: 'Beep when the phase changes',
      volume: 'Volume', soundType: 'Sound type', beep: 'Beep', bell: 'Bell',
      countdown: 'Audio countdown', countdownHint: 'Beeps during the last 3 seconds',
      voice: 'Voice guidance', voiceHint: 'Announces “Work” and “Rest” when supported',
      vibration: 'Vibration', vibrationHint: 'Not available on some devices, including iPhone',
      wakeLock: 'Keep screen awake', wakeLockHint: 'When supported by the browser',
      language: 'Language / Langue', langHint: 'Interface and voice guidance language', auto: 'Auto (system)',
      settingsNote: 'PhysioTimer requires no account. Settings and presets stay on this device.',
      saveProgramTitle: 'Save workout', programName: 'Workout name',
      phasePrepare: 'GET READY', phaseWork: 'WORK', phaseRest: 'REST',
      phaseCycleRest: 'CYCLE BREAK', phaseCooldown: 'RECOVERY', phaseDone: 'FINISHED!',
      roundCycle: 'ROUND {round} / {rounds} · CYCLE {cycle} / {cycles}',
      sessionFinished: 'Workout finished', next: 'NEXT: ', endOfSession: 'END OF WORKOUT',
      roundsLeftCaption: 'ROUNDS<br>LEFT', cyclesLeftCaption: 'CYCLES<br>LEFT',
      pause: 'Pause', restart: 'Restart', resume: 'Resume', start: 'Start',
      voicePrepare: 'Get ready', invalidConfig: 'Please check the workout values.',
      presetSaved: 'Workout saved', emptyPresets: 'No saved workouts yet. Configure Tabata or Rounds and tap “Save preset”.',
      load: 'Load', loadPreset: 'Load {name}', deletePreset: 'Delete {name}',
      confirmDelete: 'Delete “{name}”?', lapN: 'Lap {n}',
      fullscreenUnavailable: 'Fullscreen is unavailable on this device.',
      fullscreen: 'Fullscreen', audioSettings: 'Sound settings'
    }
  };
  let lang = 'fr';
  function setLang(selection) {
    let forced = null;
    try { forced = new URLSearchParams(location.search).get('lang'); } catch {}
    lang = selection === 'fr' || selection === 'en' ? selection :
      forced === 'fr' || forced === 'en' ? forced :
      String(navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en';
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }
  function t(key, vars) {
    let value = strings[lang][key] ?? strings.fr[key] ?? key;
    if (vars) for (const [name, param] of Object.entries(vars)) value = value.replaceAll('{' + name + '}', String(param));
    return value;
  }
  function translatePage() {
    for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
    for (const el of document.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
    const fullscreen = document.getElementById('fullscreenButton');
    if (fullscreen) { fullscreen.title = t('fullscreen'); fullscreen.setAttribute('aria-label', t('fullscreen')); }
    const settings = document.getElementById('settingsButton');
    if (settings) { settings.title = t('audioSettings'); settings.setAttribute('aria-label', t('audioSettings')); }
  }
  root.PhysioTimerI18n = { t, setLang, translatePage, language: () => lang };
})(globalThis);

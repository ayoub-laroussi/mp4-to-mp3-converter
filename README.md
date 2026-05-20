<p align="center">
  <img src="icon.png" alt="MP4 to MP3 Converter" width="128" height="128" />
</p>

<h1 align="center">MP4 to MP3 Converter</h1>

<p align="center">
  <strong>Un convertisseur vidéo → audio simple, rapide et élégant.</strong><br/>
  Application de bureau construite avec Electron & FFmpeg.<br/>
  Fonctionne sur <strong>Windows</strong> et <strong>macOS</strong> (Intel & Apple Silicon).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.1.0-a855f7?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-6e5494?style=flat-square" alt="Platform" />
</p>

---

## ✨ Fonctionnalités

- 🎯 **Glisser-déposer** — Déposez vos fichiers directement dans l'application
- 📂 **Sélection multiple** — Convertissez plusieurs fichiers en une seule fois
- 🎚️ **Qualité audio configurable** — 128, 192, 256 ou 320 kbps
- 📁 **Dossier de sortie personnalisable** — Choisissez où sauvegarder vos MP3
- 📊 **Barre de progression** — Suivez la conversion en temps réel
- 🎨 **Interface moderne** — Design sombre adapté à chaque OS
- 🍎 **Support macOS natif** — Traffic lights natifs, dark mode, Apple Silicon (arm64)
- ⚡ **Rapide** — Propulsé par FFmpeg pour des conversions ultra-rapides
- 🛡️ **Anti-écrasement** — Renomme automatiquement si le fichier existe déjà

## 📦 Formats supportés

| Entrée (vidéo) | Sortie (audio) |
|----------------|----------------|
| `.mp4`         | `.mp3`         |
| `.mkv`         |                |
| `.avi`         |                |
| `.mov`         |                |
| `.webm`        |                |
| `.flv`         |                |
| `.wmv`         |                |

---

## 🚀 Lancer en local (développement)

### Prérequis

- [Node.js](https://nodejs.org/) ≥ 18
- npm (inclus avec Node.js)
- **macOS uniquement** : Xcode Command Line Tools → `xcode-select --install`

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/ayoub-laroussi/mp4-to-mp3-converter.git
cd mp4-to-mp3-converter

# 2. Installer les dépendances
npm install

# 3. Lancer l'application
npm start
```

> **Remarque macOS :** Si macOS affiche « impossible de vérifier le développeur » la première fois
> que vous lancez l'app buildée, faites un **clic droit → Ouvrir** sur le `.app`.

---

## 🛠️ Build

### macOS (DMG universel – Intel + Apple Silicon)

```bash
npm run build
# → dist/MP4 to MP3 Converter-1.1.0.dmg
```

### Windows (installateur NSIS)

```bash
npm run build:win
# → dist/MP4 to MP3 Converter Setup 1.1.0.exe
```

### Les deux plateformes en même temps

```bash
npm run build:all
```

> **Note Apple Silicon :** La cible `arm64` est incluse dans la config.
> Sur une machine Intel vous aurez besoin de Rosetta 2 pour tester le build arm64.
> Sur Apple Silicon les deux architectures sont construites nativement.

---

## 🧰 Stack technique

| Technologie | Rôle |
|---|---|
| [Electron](https://www.electronjs.org/) | Framework d'application de bureau |
| [FFmpeg](https://ffmpeg.org/) via `ffmpeg-static` | Moteur de conversion audio |
| [Fluent-FFmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) | Interface Node.js pour FFmpeg |
| [Electron Builder](https://www.electron.build/) | Packaging & distribution |

---

## 🤝 Comment contribuer (Pull Request pas à pas)

Voici comment proposer une modification au dépôt original, étape par étape.

### 1. Forker le dépôt

Sur la page GitHub du projet, cliquez sur le bouton **Fork** (en haut à droite).  
Cela crée une copie du projet dans **votre** compte GitHub.

### 2. Cloner votre fork

```bash
git clone https://github.com/VOTRE-PSEUDO/mp4-to-mp3-converter.git
cd mp4-to-mp3-converter
```

### 3. Créer une branche pour vos modifications

```bash
# Donnez un nom explicite à votre branche
git checkout -b feat/macos-support
```

### 4. Apporter vos modifications

Copiez les fichiers modifiés dans le dossier cloné, puis vérifiez que tout fonctionne :

```bash
npm install
npm start
```

### 5. Commiter vos changements

```bash
git add .
git commit -m "feat: add native macOS support (traffic lights, arm64 build, dark mode)"
```

### 6. Pousser la branche vers votre fork

```bash
git push origin feat/macos-support
```

### 7. Ouvrir une Pull Request

1. Allez sur la page GitHub de **votre fork**
2. Vous verrez une bannière jaune **« Compare & pull request »** — cliquez dessus
3. Remplissez le formulaire :
   - **Titre** : `feat: native macOS support (arm64, traffic lights, dark mode)`
   - **Description** : expliquez brièvement ce que vous avez changé et pourquoi
4. Cliquez sur **Create pull request**

L'auteur original recevra une notification et pourra réviser, commenter ou fusionner votre contribution. 🎉

---

## 📄 Licence

Ce projet est sous licence [ISC](LICENSE).

---

<p align="center">
  Fait avec ❤️ par <a href="https://github.com/ayoub-laroussi">Ayoub Laroussi</a><br/>
  Rendu compatible avec macOS intel/apple silicon par @caillou_airm4 sur Discord
</p>

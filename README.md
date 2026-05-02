<p align="center">
  <img src="icon.png" alt="MP4 to MP3 Converter" width="128" height="128" />
</p>

<h1 align="center">MP4 to MP3 Converter</h1>

<p align="center">
  <strong>Un convertisseur vidéo → audio simple, rapide et élégant.</strong><br/>
  Application de bureau construite avec Electron & FFmpeg.
</p>

<p align="center">
  <a href="https://github.com/ayoub-laroussi/mp4-to-mp3-converter/releases"><img src="https://img.shields.io/github/v/release/ayoub-laroussi/mp4-to-mp3-converter?style=flat-square&color=a855f7" alt="Release" /></a>
  <a href="https://github.com/ayoub-laroussi/mp4-to-mp3-converter/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License" /></a>
  <img src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square&logo=windows" alt="Platform" />
</p>

---

## ✨ Fonctionnalités

- 🎯 **Glisser-déposer** — Déposez vos fichiers directement dans l'application
- 📂 **Sélection multiple** — Convertissez plusieurs fichiers en une seule fois
- 🎚️ **Qualité audio configurable** — 128, 192, 256 ou 320 kbps
- 📁 **Dossier de sortie personnalisable** — Choisissez où sauvegarder vos fichiers MP3
- 📊 **Barre de progression** — Suivez la conversion en temps réel
- 🎨 **Interface moderne** — Design sombre avec un style glassmorphism
- ⚡ **Rapide** — Propulsé par FFmpeg pour des conversions ultra-rapides
- 🛡️ **Anti-écrasement** — Renomme automatiquement si le fichier existe déjà

## 📦 Formats supportés

| Entrée (vidéo) | Sortie (audio) |
|-----------------|----------------|
| `.mp4`          | `.mp3`         |
| `.mkv`          |                |
| `.avi`          |                |
| `.mov`          |                |
| `.webm`         |                |
| `.flv`          |                |
| `.wmv`          |                |

## 🚀 Installation

### Télécharger l'installateur

Rendez-vous dans la section [**Releases**](https://github.com/ayoub-laroussi/mp4-to-mp3-converter/releases) et téléchargez le fichier `.exe` pour Windows.

### Depuis les sources

```bash
# Cloner le dépôt
git clone https://github.com/ayoub-laroussi/mp4-to-mp3-converter.git
cd mp4-to-mp3-converter

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

## 🛠️ Build

Pour créer un installateur Windows :

```bash
npm run build
```

Le fichier `.exe` sera généré dans le dossier `dist/`.

## 🧰 Stack technique

| Technologie                                                      | Rôle                              |
|------------------------------------------------------------------|-----------------------------------|
| [Electron](https://www.electronjs.org/)                          | Framework d'application de bureau |
| [FFmpeg](https://ffmpeg.org/) (via `ffmpeg-static`)              | Moteur de conversion audio        |
| [Fluent-FFmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) | Interface Node.js pour FFmpeg     |
| [Electron Builder](https://www.electron.build/)                  | Packaging & distribution          |

## 📄 Licence

Ce projet est sous licence [ISC](LICENSE).

---

<p align="center">
  Fait avec ❤️ par <a href="https://github.com/ayoub-laroussi">Ayoub Laroussi</a>
</p>

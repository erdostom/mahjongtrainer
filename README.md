# Mahjong Trainer

An offline-first Progressive Web App for practicing Riichi Mahjong.

Live demo: https://erdostom.github.io/mahjongtrainer/

## Features

- **Efficiency trainer** — practice discarding the tile that maximizes ukeire (tile acceptance). The round continues, drawing new tiles, until the hand reaches tenpai.
- **Chinitsu waits trainer** — practice identifying the waits of single-suit tenpai hands.
- **Stats** — track your accuracy, chosen-vs-best ukeire ratio, and average solve time over time with simple SVG charts.
- **Offline PWA** — all assets are cached locally by a service worker, so the app works without an internet connection after the first visit.

## Development

```bash
npm install
npm run dev      # local development server
npm run build    # production build
npm run preview  # preview production build
```

## Credits

This project combines ideas and algorithms from two existing trainers:

- **Riichi-Trainer** by Euophrys (https://github.com/Euophrys/Riichi-Trainer), licensed under GPL-3.0.  
  The efficiency/ukeire engine and tile images are adapted from this project.

- **riichi-mahjong-trainer** by Dušan Juretić (https://github.com/djuretic/riichi-mahjong-trainer), licensed under MIT.  
  The chinitsu waits generation logic is adapted from this project.

## License

This project is licensed under the GNU General Public License v3.0 or later. See [LICENSE](LICENSE) and [ATTRIBUTION.md](ATTRIBUTION.md) for details.

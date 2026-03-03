
# Bowling Pro Manager

A comprehensive bowling league management system built with React, Vite, and Tailwind CSS. This app supports multi-league organizations, season tracking, automated scheduling, configurable rules, and advanced scoring. For full details on features, rules, and workflows, see the documentation links below.


## Documentation

- [Admin Dashboard Features](documentation/ADMIN_DASHBOARD.md)
- [Player Dashboard Features](documentation/PLAYER_DASHBOARD.md)
- [League Overview & Configuration](documentation/LEAGUE_OVERVIEW.md)
- [Season Overview & Management](documentation/SEASON_OVERVIEW.md)
- [Player Registry](documentation/PLAYER_REGISTRY.md)
- [Start of Day Routine](documentation/START_OF_DAY.md)
- [Testing & Tester Guide](documentation/TESTER_GUIDE.md)
- [Troubleshooting](documentation/TROUBLESHOOTING.md)

For detailed rules, scoring, and configuration options, see the League and Season Overview docs above.


## Scoring & Rules

See [League Overview](documentation/LEAGUE_OVERVIEW.md) and [Season Overview](documentation/SEASON_OVERVIEW.md) for full details on scoring, bonus rules, handicap, and configuration options.


## Getting Started

### Start of Day Routine
See [START_OF_DAY.md](documentation/START_OF_DAY.md) for daily health checks and project setup tips.

### Development Setup
```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)


# Build for production
npm run build

# Preview production build
npm run preview
```

### First-Time Setup
1. Start the dev server: `npm run dev`
2. Open browser to `http://localhost:5173/`
3. Login as admin (role: 'admin')
4. Create players in Player Registry (see documentation/PLAYER_REGISTRY.md)
5. Create a league (see documentation/LEAGUE_OVERVIEW.md)
6. Create a season and assign teams (see documentation/SEASON_OVERVIEW.md)
7. Generate schedule and start recording games
### Technology Stack
- **React 18** - UI framework
- **Vite 4.5** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first styling
- **PostCSS** - CSS processing
- **localStorage** - Data persistence (easily replaceable)


## Troubleshooting

For common issues and solutions, see [TROUBLESHOOTING.md](documentation/TROUBLESHOOTING.md).


## Contributing

See [TESTER_GUIDE.md](documentation/TESTER_GUIDE.md) and [TESTING.md](documentation/TESTING.md) for testing and contribution guidelines.


## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Last Updated**: January 2026  
**Version**: 2.0.0 - Multi-League System with Advanced Scheduling

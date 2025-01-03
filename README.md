# Dokkubase 

Modern and user-friendly admin panel for [Dokku](https://dokku.com/) that makes managing your apps a breeze. Built with Astro 5.0 and TypeScript for a snappy, real-time experience.

## Features 

- 🚀 Modern UI built with Astro 5.0
- ⚡️ Real-time updates via Server-Sent Events (SSE)
- 🔌 Full Dokku API support via SSH
- 💾 SQLite database with WAL mode for better performance
- 🔒 Type-safe API with TypeScript
- 🧪 Mock API for development and testing

## Support & Disclaimer

> **Note:** This is an unofficial GUI tool for Dokku. For the best experience:
> - Having issues with Dokkubase UI? [Open an issue here](https://github.com/screenfluent/dokkubase/issues)
> - Having issues with Dokku itself? Check [Dokku's documentation](https://dokku.com/docs/)

## Getting Started 

1. Install dependencies:
```bash
npm install
```

2. Setup database:
```bash
npm run db:setup
```

3. Start development server:
```bash
npm run dev
```

## Development 

### Project Structure

```
/
├── src/
│   ├── lib/
│   │   ├── mock-dokku/     # Mock Dokku API
│   │   └── db/             # Database layer
│   ├── pages/
│   │   └── api/           # API endpoints
│   └── types/             # TypeScript types
├── scripts/               # Utility scripts
└── docs/                 # Documentation
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:setup` | Setup database |
| `npm run db:migrate` | Run database migrations |
| `npm run test` | Run tests |

## Contributing 

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 

MIT License - see the [LICENSE](LICENSE) file for details

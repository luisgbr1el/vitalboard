# Vitalboard
<div align="center">
<img width="200" height="200" alt="icon" src="https://github.com/user-attachments/assets/5b9b1c54-ec88-4c8f-8185-97cd2e169026" />

[![GitHub forks](https://img.shields.io/github/forks/luisgbr1el/vitalboard?style=for-the-badge)](https://github.com/luisgbr1el/vitalboard/forks)
[![GitHub stars](https://img.shields.io/github/stars/luisgbr1el/vitalboard?style=for-the-badge)](https://github.com/luisgbr1el/vitalboard/stargazers)
[![GitHub license](https://img.shields.io/github/license/luisgbr1el/vitalboard?style=for-the-badge)](https://github.com/luisgbr1el/vitalboard/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/luisgbr1el/vitalboard?style=for-the-badge)](https://github.com/luisgbr1el/vitalboard/issues)

A modern character health management application built with React, Electron, and Express. Vitalboard provides a streamlined interface for tracking and managing character health points, perfect for tabletop RPGs, gaming sessions, or any scenario requiring real-time health tracking.
</div>

## Features

- **Real-time Character Management**: Create, edit, and delete characters with custom health pools
- **Multi-platform Support**: Available as both a web application and desktop application (Electron)
- **Image Upload**: Support for character avatars and icons
- **Internationalization**: Multi-language support (English, Portuguese)
- **Health Management**: Intuitive health bar visualization with healing and damage tracking
- **Settings Customization**: Configurable overlay options, fonts, and display preferences
- **Cross-platform**: Windows, Linux, and web browser support

## Tech Stack

### Frontend
- **React 19.2** - UI library
- **Vite** - Build tool and dev server
- **React Icons** - Icon library
- **CSS3** - Styling

### Backend
- **Express 5.1** - Web server framework
- **Socket.IO** - Real-time communication
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Desktop
- **Electron 39** - Desktop application framework
- **Electron Builder** - Application packaging and distribution

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/luisgbr1el/vitalboard.git
cd vitalboard
```

2. Install dependencies:
```bash
npm install
```

## Development

### Running the Web Application

To run the application in web mode with both the frontend and backend server:

```bash
npm run dev
```

This command starts:
- **Backend server** on `http://localhost:3000` (or next available port)
- **Vite dev server** on `http://localhost:5173`

The application will automatically open in your default browser.

#### Running Components Separately

If you need to run the frontend or backend independently:

**Backend server only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

### Running the Electron Desktop Application

To run the application as a desktop app in development mode:

```bash
npm run electron:dev
```

This command:
1. Starts the Vite dev server
2. Waits for the server to be ready
3. Launches the Electron application

**Alternative - Electron only (requires pre-built frontend):**
```bash
npm run electron
```

## Building

### Building the Web Application

To create a production build of the web application:

```bash
npm run build
```

The built files will be output to the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

### Building the Desktop Application

#### Package Without Installer (for testing)

```bash
npm run electron:pack
```

This creates an unpacked application in the `release/win-unpacked` directory (or equivalent for your platform).

#### Build Complete Installer

To build the full desktop application with installer:

```bash
npm run electron:dist
```

**Output locations:**
- **Windows**: `release/Vitalboard Setup X.X.X.exe` (NSIS installer) and portable version
- **Linux**: `release/Vitalboard-X.X.X.AppImage` and `release/vitalboard_X.X.X_amd64.deb`

The build process:
1. Builds the web application (`npm run build`)
2. Packages the Electron app with electron-builder
3. Creates platform-specific installers

**Build configuration:**
- Windows: NSIS installer (with installation options) and portable executable
- Linux: AppImage (universal) and DEB package for Debian/Ubuntu-based distributions
- Output directory: `release/`

## Project Structure

```
vitalboard/
├── electron/              # Electron main process files
│   ├── main.js           # Main electron process
│   └── preload.cjs       # Preload script
├── server/               # Backend server
│   ├── server.js         # Express server setup
│   ├── data/             # Application data storage
│   ├── uploads/          # User uploaded files
│   └── utils/            # Server utilities
├── src/                  # Frontend source code
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # Internationalization
│   ├── pages/            # Page components
│   ├── styles/           # CSS stylesheets
│   └── utils/            # Frontend utilities
├── build/                # Build resources (icons, etc.)
├── dist/                 # Production build output
├── release/              # Electron build output
└── public/               # Public static assets
```

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Run full stack (server + client) in development mode |
| `npm run server` | Run backend server only |
| `npm run client` | Run Vite dev server only |
| `npm run build` | Build production web application |
| `npm run preview` | Preview production build |
| `npm run electron` | Run Electron app (requires built frontend) |
| `npm run electron:dev` | Run Electron app in development mode |
| `npm run electron:pack` | Package Electron app without installer |
| `npm run electron:dist` | Build complete Electron installer |
| `npm run lint` | Run ESLint on the codebase |

## Configuration

### Environment Variables

The application supports the following environment variables:

- `NODE_ENV` - Set to `development` or `production`
- `PORT` - Backend server port (default: 3000)
- `VITE_PORT` - Vite dev server port (default: 5173)

### Application Settings

User settings and character data are stored in:
- **Development**: `server/data/`
- **Production (Electron)**: `{userData}/app-data/data/`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**luisgbr1el**

## Repository

[https://github.com/luisgbr1el/vitalboard](https://github.com/luisgbr1el/vitalboard)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/luisgbr1el/vitalboard/issues) page.

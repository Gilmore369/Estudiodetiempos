# Standard Time Pro

Professional time study application with Google Sheets integration.

## Features

- **Google Sheets Integration**: Real-time synchronization with Google Sheets
- **Time Studies**: Complete time study workflow with Westinghouse evaluation
- **PWA Support**: Works offline and can be installed as a native app
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **DAP Diagrams**: Process analysis diagrams with visual flow representation

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Build Tool**: Vite
- **PWA**: Workbox
- **API**: Google Sheets API v4

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google account for Sheets integration

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   ├── masters/        # Master data management
│   ├── study/          # Time study components
│   ├── evaluation/     # Performance evaluation
│   ├── results/        # Results and reporting
│   ├── dap/           # Process analysis diagrams
│   └── common/        # Shared components
├── services/           # API and external services
├── stores/            # State management
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Google Sheets Integration

The application integrates with Google Sheets to store:

- **Config_Estudios**: Study configurations and parameters
- **DB_Colaboradores**: Worker/collaborator database
- **DB_Procesos**: Process definitions
- **Tiempos_Observados**: Time observations and measurements
- **Calculo_y_Resultados**: Calculated results and standard times
- **DAP_Data**: Process analysis diagram data

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
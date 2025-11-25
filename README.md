# Offset Controller

A modern React-based dashboard for monitoring and visualizing temperature data from Tado heating systems and external sensors via InfluxDB. The application provides real-time insights into room temperatures, heating power, humidity, and offset values across multiple rooms.

## Overview

Offset Controller is a temperature monitoring system that displays data from:
- **Tado thermostats**: Temperature, target temperature, heating power, and offset values
- **External sensors** (Xiaomi): Temperature, humidity, battery level, and signal strength
- **Outside temperature**: For context and comparison

The application connects directly to InfluxDB to fetch and visualize historical and real-time data, with an intuitive interface for monitoring multiple rooms simultaneously.

## Features

### Core Functionality
- **Multi-room monitoring**: Track up to 6 rooms (Wohnzimmer, Arbeitszimmer, Schlafzimmer, Küche, Esszimmer, Badezimmer)
- **Real-time updates**: Auto-refresh every 5 seconds for latest values
- **Historical data visualization**: View data across multiple time ranges (30 minutes to 1 month)
- **Interactive charts**: Detailed temperature, humidity, and power graphs with hover tooltips
- **Outside temperature tracking**: 24-hour statistics (current, min, max)

### User Interface
- **Dark mode design**: Modern, clean interface optimized for monitoring
- **Room cards**: Quick overview of each room's current status
- **Expandable modals**: Detailed charts and statistics for each room
- **Responsive design**: Works on desktop and mobile devices
- **Splash screen**: Smooth loading experience

### Configuration
- **Secure credential management**: InfluxDB credentials stored in browser localStorage
- **Setup wizard**: First-time configuration with connection validation
- **Editable settings**: Update InfluxDB credentials from the sidebar
- **Data point configuration**: Adjustable chart resolution (default: 1440 points)

## Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **InfluxDB** instance (Cloud or self-hosted)
- **InfluxDB credentials**:
  - API Token (with read permissions)
  - Organization ID
  - Bucket name
  - InfluxDB URL

## Installation

1. **Clone the repository** (or download the project)

2. **Install dependencies**:
```bash
bun install
```
or
```bash
npm install
```

## Configuration

### First-Time Setup

When you first open the application, you'll be prompted to configure your InfluxDB connection:

1. **Enter InfluxDB URL**: Your InfluxDB instance URL
   - Example: `https://us-east-1-1.aws.cloud2.influxdata.com`

2. **Enter API Token**: Your InfluxDB API token with read permissions

3. **Enter Organization**: Your InfluxDB organization ID

4. **Enter Bucket**: The name of your InfluxDB bucket containing the data

5. **Click "Connect"**: The application will validate your credentials before proceeding

### Updating Credentials

You can update your InfluxDB credentials at any time:

1. Open the **Settings sidebar** (click the settings icon in the header)
2. Scroll to the **"InfluxDB Connection"** section
3. Edit any of the credential fields
4. Click **"Save Credentials"** to test and save the new configuration
5. The page will automatically refresh with the new settings

### Removing Credentials

To reset your configuration and return to the setup screen:

1. Open the **Settings sidebar**
2. Scroll to the **"InfluxDB Connection"** section
3. Click **"Remove Credentials"**
4. Confirm the action
5. The page will refresh and show the setup screen again

## Usage

### Viewing Room Data

- **Room Cards**: The main dashboard shows cards for each configured room
  - Current temperature (Tado and sensor)
  - Target temperature
  - Heating power indicator
  - Humidity level

- **Expand Room Details**: Click on any room card to open a detailed modal with:
  - Interactive temperature chart
  - Multiple time range options (30m, 1h, 6h, 12h, 1d, 3d, 1w, 2w, 1m)
  - Statistics panel showing current values
  - Outside temperature overlay

### Time Range Selection

When viewing a room's detailed chart, you can select different time ranges:
- **30 minutes**: Recent activity
- **1 hour**: Short-term trends
- **6 hours**: Half-day view
- **12 hours**: Daily patterns
- **1 day**: Full day overview
- **3 days**: Multi-day trends
- **1 week**: Weekly patterns
- **2 weeks**: Extended view
- **1 month**: Long-term analysis

### Outside Temperature

- Click the outside temperature display in the header to view:
  - Historical outside temperature chart
  - 24-hour statistics (current, minimum, maximum)

### Settings

Access settings via the settings icon in the header:

- **Data Points**: Adjust the number of data points displayed in charts (default: 1440)
  - Lower values = faster loading, less detail
  - Higher values = more detail, slower loading

- **InfluxDB Connection**: View and edit your database credentials

## Development

### Running the Development Server

```bash
bun run dev
```

This starts the Vite development server on `http://localhost:3000`

The server is configured to accept connections from your local network, making it accessible from other devices on the same network (useful for mobile testing).

### Project Structure

```
src/
├── components/          # React components
│   ├── Chart/          # Chart components (Temperature, Outside)
│   ├── Header/         # Header with stats and controls
│   ├── Modal/          # Room and Outside modals
│   ├── RoomCard/       # Room overview cards
│   ├── Setup/          # Initial setup/login component
│   ├── Sidebar/        # Settings sidebar
│   └── SplashScreen/   # Loading splash screen
├── config/             # Configuration files
│   └── influxdb.ts     # InfluxDB client configuration
├── constants/          # App constants (rooms, sensors, time ranges)
├── hooks/              # Custom React hooks
│   ├── useInfluxData.ts    # Data fetching hook
│   └── useLocalStorage.ts  # LocalStorage management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── dataProcessing.ts  # Chart data processing
│   └── roomHelpers.ts     # Room data helpers
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

### Key Components

- **App.tsx**: Main application logic, state management, and routing
- **useInfluxData**: Custom hook for fetching and managing InfluxDB data
- **Setup**: First-time configuration component with credential validation
- **Sidebar**: Settings panel for configuration management
- **RoomCard**: Individual room overview with expandable details
- **RoomModal**: Detailed room view with interactive charts

### Data Structure

The application expects InfluxDB data in the following format:

**Tado Sensor Data** (`tado_sensor` measurement):
- Fields: `temperature`, `rawTemperature`, `humidity`, `target`, `offset`, `power`
- Tags: `room`, `host`

**External Sensor Data** (`sensor_data` measurement):
- Fields: `temperature`, `humidity`, `rssi`, `battery`
- Tags: `sensor_id`, `host`

**Outside Temperature** (`outside` measurement):
- Fields: `temperature`
- Tags: `host`

## Build

### Production Build

```bash
bun run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
bun run preview
```

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Charts**: Recharts
- **Database Client**: @influxdata/influxdb-client
- **Styling**: CSS with CSS Variables for theming
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Storage**: Browser localStorage for credentials

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for various screen sizes

## Security Notes

- **Credentials Storage**: InfluxDB credentials are stored in browser localStorage
  - Never share your browser profile or export localStorage data
  - Use the "Remove Credentials" feature when using shared devices
  - Consider using a dedicated browser profile for this application

- **API Tokens**: Use InfluxDB tokens with minimal required permissions (read-only for this application)

## Troubleshooting

### Connection Issues

- **"Failed to connect to InfluxDB"**: 
  - Verify your credentials are correct
  - Check that your API token has read permissions
  - Ensure the InfluxDB URL is accessible from your network
  - Verify the bucket name is correct

### No Data Displayed

- Check that your InfluxDB bucket contains data with the expected measurement names
- Verify the `host` tag matches "Node_Tado" (or update the filter in the code)
- Ensure room names match the configured rooms in `constants/index.ts`

### Performance Issues

- Reduce the "Points per Timeframe" setting in the sidebar
- Use shorter time ranges when viewing charts
- Check your InfluxDB query performance

## License

This project is for personal/internal use.

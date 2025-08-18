# Weather Dashboard

This project is a modern and responsive weather dashboard built with Next.js, React, and TypeScript. It provides current weather conditions, a 7-day daily forecast, and a detailed hourly forecast for any searched city.

[Check Out Live](https://bachidev.github.io/weather)

## Technical Details

### Architecture & Design

The application follows a clean and modular architecture, emphasizing separation of concerns and reusability. Key architectural decisions include:

*   **Component-Based UI**: Built with React, leveraging functional components and hooks for state management and side effects.
*   **Custom Hooks**: Extensive use of custom hooks (`useSearch` and `useWeather`) to encapsulate complex logic, such as city search functionality, default city loading, and weather data fetching. This significantly improves code readability, reusability, and testability of the `page.tsx` component.
*   **API Layer Abstraction**: All external API calls are centralized in `api.ts`, abstracting the data fetching logic from the UI components. This file also utilizes base URLs for different API endpoints and helper functions for data transformation, ensuring a clean and maintainable API interaction layer.
*   **Type Safety**: Developed entirely in TypeScript, providing strong type checking throughout the application, which enhances code quality and reduces runtime errors.

### Key Features

*   **City Search**: Users can search for any city worldwide to get weather information.
*   **Current Weather**: Displays real-time temperature, apparent temperature, wind speed, humidity, and pressure.
*   **Daily Forecast**: Provides a 7-day forecast including daily maximum and minimum temperatures, sunrise, and sunset times.
*   **Hourly Forecast**: Offers detailed hourly temperature and weather conditions.
*   **Responsive Design**: Built with Material-UI (`@mui/material`) components to ensure a consistent and adaptive user experience across various devices.

### Technologies Used

*   **Framework**: Next.js (React framework for production)
*   **Language**: TypeScript
*   **UI Library**: Material-UI (MUI)
*   **HTTP Client**: Axios
*   **Weather API**: Open-Meteo API (for current, daily, and hourly weather data)
*   **Geocoding API**: Open-Meteo Geocoding API (for city search and location data)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

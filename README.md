# Sights - Accessible Vision App

Sights is a React Native mobile application designed to help sightless people understand their surroundings through image analysis and audio feedback.

## Features

- **Voice-Guided Tutorial**: Learn how to use the app with a comprehensive voice-guided tutorial.
- **Simple Camera Interface**: Take pictures with a simple tap anywhere on the screen.
- **AI-Powered Image Analysis**: Uses OpenAI's Vision API to generate detailed descriptions of captured images.
- **Accessible Controls**:
  - Adjust volume by swiping up/down on the left side of the screen
  - Control reading speed by swiping up/down on the right side of the screen
  - Take or retake photos with simple taps
  - Double-tap to return to camera from results view

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- iOS device/simulator or Android device/emulator

### Installation

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies:
```
npm install
```
4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your OpenAI API key: `OPENAI_API_KEY=your_openai_api_key_here`
   - This file is gitignored to keep your API key secure

### Running the App

```
npm start
```
Then, scan the QR code with the Expo Go app on your device, or press 'i' for iOS simulator or 'a' for Android emulator.

## Usage

1. **Tutorial**: Upon first launch, follow the voice-guided tutorial to learn how to use the app.
2. **Taking Photos**: Tap anywhere on the camera screen to take a photo.
3. **Hearing Results**: After analysis, the app will automatically read the description aloud.
4. **Adjusting Controls**:
   - Slide up/down on the screen to adjust reading speed
5. **Taking Another Photo**: Double tap on the results screen to return to the camera.

## Technology Stack

- React Native
- Expo
- TypeScript
- OpenAI API
- React Navigation
- Expo Camera
- Expo Speech

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenAI for their Vision API
- Expo team for the excellent tools and libraries 

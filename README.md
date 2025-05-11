# Sights - Accessible Vision App

Sights is a React Native mobile application designed to help sightless people understand their surroundings through image analysis and audio feedback.

## Features

- **Voice-Guided Tutorial**: Learn how to use the app with a comprehensive voice-guided tutorial.
- **Simple Camera Interface**: Take pictures with a simple tap anywhere on the screen.
- **AI-Powered Image Analysis**: Uses OpenAI's Vision API to generate detailed descriptions of captured images.
- **Accessible Controls**:
  - Auto-read feature when system screen reader is not enabled
  - Adjust reading speed by swiping up/down on the screen or using the speed button
  - Toggle auto-read on/off with a simple switch
  - Take or retake photos with either the retake button or double-tap gesture
  - Full screen reader support with optimized UI for accessibility

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
```bash
npm install
```
4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your API keys and configuration:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     QWEN_API_KEY=your_qwen_api_key_here
     POSTHOG_API_KEY=your_posthog_api_key_here
     ```
   - This file is gitignored to keep your API keys secure

### Running the App

```bash
npm start
```
Then, scan the QR code with the Expo Go app on your device, or press 'i' for iOS simulator or 'a' for Android emulator.

## Usage

1. **Tutorial**: Upon first launch, follow the voice-guided tutorial to learn how to use the app.
2. **Taking Photos**: Tap anywhere on the camera screen to take a photo.
3. **Hearing Results**: 
   - When system screen reader is not enabled, the app will automatically read the description
   - You can tap the screen to stop reading
   - Use the auto-read toggle to enable/disable automatic reading
4. **Adjusting Controls**:
   - When auto-read is enabled, slide up/down on the screen to adjust reading speed
   - Use the speed button to select from preset speeds
5. **Taking Another Photo**: 
   - Use the retake button for a clear, accessible option
   - Or double tap anywhere on the screen for quick retake

## Technology Stack

- React Native
- Expo
- TypeScript
- OpenAI API
- Qwen API
- React Navigation
- Expo Image Picker
- Expo Speech
- React Native Accessibility
- PostHog Analytics

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenAI for their Vision API
- Qwen for their Vision API
- Expo team for the excellent tools and libraries 

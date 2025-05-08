import { ComponentClass } from 'react';
import { ViewProps } from 'react-native';

declare module 'expo-camera' {
  export interface CameraCapturedPicture {
    uri: string;
    width: number;
    height: number;
    exif?: {
      [key: string]: any;
    };
    base64?: string;
  }

  export interface CameraProps extends ViewProps {
    type?: 'front' | 'back';
    flashMode?: 'on' | 'off' | 'auto' | 'torch';
    autoFocus?: 'on' | 'off';
    zoom?: number;
    whiteBalance?: 'auto' | 'sunny' | 'cloudy' | 'shadow' | 'fluorescent' | 'incandescent';
    ratio?: string;
    onCameraReady?: () => void;
    onMountError?: (error: Error) => void;
    onBarCodeScanned?: (scanningResult: { type: string; data: string }) => void;
    onFacesDetected?: (options: { faces: any[] }) => void;
    faceDetectorSettings?: {
      mode?: 'fast' | 'accurate';
      detectLandmarks?: 'all' | 'none';
      runClassifications?: 'all' | 'none';
      minDetectionInterval?: number;
      tracking?: boolean;
    };
    barCodeScannerSettings?: {
      barCodeTypes?: string[];
      interval?: number;
    };
  }

  export interface Camera {
    takePictureAsync(options?: {
      quality?: number;
      base64?: boolean;
      exif?: boolean;
      onPictureSaved?: (data: CameraCapturedPicture) => void;
      skipProcessing?: boolean;
    }): Promise<CameraCapturedPicture>;
  }

  export const Camera: ComponentClass<CameraProps>;

  export function requestCameraPermissionsAsync(): Promise<{ status: 'granted' | 'denied' }>;
} 
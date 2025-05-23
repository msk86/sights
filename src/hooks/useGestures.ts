import { useState, useEffect, useRef } from 'react';
import { PanResponder } from 'react-native';
import { getSpeechRate, setSpeechRate, getMaxSpeechRate } from '../services/speech';
import { trackSpeedPreference } from '../services/analytics';

// Speed control sensitivity - higher values = less sensitive
const RATE_SENSITIVITY = 100;

type GestureControlType = {
  rate: number;    // 0.5 to 10
};

export const useGestures = () => {
  const [controls, setControls] = useState<GestureControlType>({ rate: getSpeechRate() });
  const lastUpdateRef = useRef(0);
  
  // Load saved reading speed when component mounts
  useEffect(() => {
    const initializeRate = async () => {
      const savedRate = getSpeechRate();
      setControls({ rate: savedRate });
    };
    
    initializeRate();
  }, []);
  
  // Allow parent to set the rate directly
  const setRate = (rate: number) => {
    setControls({ rate });
    setSpeechRate(rate);
  };
  
  // Create the pan responder for controlling speed via vertical scrolling
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      // Throttle updates to every 100ms to prevent too frequent updates
      const now = Date.now();
      if (now - lastUpdateRef.current < 100) {
        return;
      }
      
      // Calculate the vertical movement (negative means up, positive means down)
      const { dy } = gestureState;
      
      // Update reading speed
      setControls(prev => {
        // Calculate new rate - moving up (negative dy) increases speed
        let newRate = prev.rate - dy / RATE_SENSITIVITY;
        
        // Clamp rate between 0.5 and the OS max
        const maxRate = getMaxSpeechRate();
        newRate = Math.max(0.5, Math.min(maxRate, newRate));
        
        // Update the speech service if there's a meaningful change
        if (Math.abs(newRate - prev.rate) > 0.1) {
          lastUpdateRef.current = now;
          setSpeechRate(newRate);
        }
        
        return {
          rate: newRate
        };
      });
    },
    onPanResponderRelease: () => {
      // Save final reading speed
      trackSpeedPreference(controls.rate, 'scroll');
      setSpeechRate(controls.rate);
    }
  });
  
  return {
    controls,
    panResponder,
    setRate
  };
}; 
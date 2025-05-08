import { useState, useEffect, useRef } from 'react';
import { PanResponder } from 'react-native';
import { getSpeechRate, setSpeechRate } from '../services/speech';

// Speed control sensitivity - higher values = less sensitive
const RATE_SENSITIVITY = 150;

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
        
        // Clamp rate between 0.5 and 10
        newRate = Math.max(0.5, Math.min(10, newRate));
        
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
      setSpeechRate(controls.rate);
    }
  });
  
  return {
    controls,
    panResponder
  };
}; 
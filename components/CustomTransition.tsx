import React from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CustomTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  animationType?: 'slide' | 'fade' | 'scale' | 'slideUp' | 'slideDown' | 'zoom' | 'flip' | 'bounce';
  duration?: number;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  easing?: 'linear' | 'ease' | 'bounce' | 'elastic';
  onAnimationComplete?: () => void;
  enableGesture?: boolean;
  gestureDirection?: 'horizontal' | 'vertical';
}

export default function CustomTransition({
  children,
  isVisible,
  animationType = 'slide',
  duration = 300,
  delay = 0,
  direction = 'right',
  easing = 'ease',
  onAnimationComplete,
  enableGesture = false,
  gestureDirection = 'horizontal',
}: CustomTransitionProps) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const panGesture = React.useRef(new Animated.Value(0)).current;
  const gestureState = React.useRef(new Animated.Value(State.UNDETERMINED)).current;

  React.useEffect(() => {
    const getEasing = () => {
      switch (easing) {
        case 'bounce':
          return Animated.bounce;
        case 'elastic':
          return Animated.elastic(1);
        case 'linear':
          return Animated.linear;
        default:
          return Animated.ease;
      }
    };

    const animation = Animated.timing(animatedValue, {
      toValue: isVisible ? 1 : 0,
      duration,
      delay,
      easing: getEasing(),
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete();
      }
    });

    return () => animation.stop();
  }, [isVisible, animatedValue, duration, delay, easing, onAnimationComplete]);

  const getAnimatedStyle = () => {
    const baseStyle = {
      opacity: animatedValue,
    };

    switch (animationType) {
      case 'slide':
        const slideDirection = {
          left: [screenWidth, 0],
          right: [-screenWidth, 0],
          up: [0, -screenHeight],
          down: [0, screenHeight],
        };
        return {
          ...baseStyle,
          transform: [
            {
              translateX: direction === 'up' || direction === 'down' 
                ? 0 
                : animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: slideDirection[direction],
                  }),
            },
            {
              translateY: direction === 'left' || direction === 'right'
                ? 0
                : animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: slideDirection[direction],
                  }),
            },
          ],
        };

      case 'fade':
        return baseStyle;

      case 'scale':
        return {
          ...baseStyle,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };

      case 'slideUp':
        return {
          ...baseStyle,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [screenHeight * 0.3, 0],
              }),
            },
          ],
        };

      case 'slideDown':
        return {
          ...baseStyle,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-screenHeight * 0.3, 0],
              }),
            },
          ],
        };

      case 'zoom':
        return {
          ...baseStyle,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ],
        };

      case 'flip':
        return {
          ...baseStyle,
          transform: [
            {
              rotateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['90deg', '0deg'],
              }),
            },
          ],
        };

      case 'bounce':
        return {
          ...baseStyle,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 1.1, 1],
              }),
            },
          ],
        };

      default:
        return {
          ...baseStyle,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [screenWidth, 0],
              }),
            },
          ],
        };
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: panGesture } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    gestureState.setValue(event.nativeEvent.state);
  };

  const gestureStyle = {
    transform: [
      {
        translateX: gestureDirection === 'horizontal' 
          ? panGesture 
          : 0,
      },
      {
        translateY: gestureDirection === 'vertical' 
          ? panGesture 
          : 0,
      },
    ],
  };

  const content = (
    <Animated.View style={[styles.container, getAnimatedStyle(), enableGesture ? gestureStyle : null]}>
      {children}
    </Animated.View>
  );

  if (enableGesture) {
    return (
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        {content}
      </PanGestureHandler>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 
/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#ff6b9d';
const tintColorDark = '#ff6b9d';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#ff6b9d',
    secondary: '#ffb3d1',
    accent: '#ff8fb3',
    surface: '#f8f9fa',
    card: '#ffffff',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#ff6b9d',
    secondary: '#ffb3d1',
    accent: '#ff8fb3',
    surface: '#2a2a2a',
    card: '#1e1e1e',
  },
};

import { Alert, Platform } from 'react-native';

type AlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

export function showAlert(
  title: string,
  message: string,
  buttons?: AlertButton[],
): void {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(`${title}\n${message}`);
      if (confirmed) {
        const action = buttons.find((b) => b.style !== 'cancel');
        action?.onPress?.();
      } else {
        const cancel = buttons.find((b) => b.style === 'cancel');
        cancel?.onPress?.();
      }
    } else {
      window.alert(`${title}\n${message}`);
      buttons?.[0]?.onPress?.();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
}

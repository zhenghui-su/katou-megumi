import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomAlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'success' | 'warning' | 'danger' | 'info';
}

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  type: 'success' | 'warning' | 'danger' | 'info';
}

let alertInstance: {
  showAlert: (state: Omit<AlertState, 'visible'>) => void;
} | null = null;

// Alert组件
export const AlertModal: React.FC = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    type: 'info',
  });

  useEffect(() => {
    alertInstance = {
      showAlert: (state) => {
        setAlertState({
          ...state,
          visible: true,
        });
      },
    };

    return () => {
      alertInstance = null;
    };
  }, []);

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, visible: false }));
  };

  const getTypeColor = () => {
    switch (alertState.type) {
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'danger':
        return '#F44336';
      case 'info':
      default:
        return '#007AFF';
    }
  };

  const handleButtonPress = (button: AlertButton) => {
    hideAlert();
    if (button.onPress) {
      // 延迟执行回调，确保模态框先关闭
      setTimeout(() => {
        button.onPress?.();
      }, 100);
    }
  };

  const renderButtons = () => {
    if (alertState.buttons.length === 0) {
      return (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.singleButton, { borderTopColor: getTypeColor() }]}
            onPress={hideAlert}
          >
            <Text style={[styles.buttonText, { color: getTypeColor() }]}>确定</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (alertState.buttons.length === 1) {
      const button = alertState.buttons[0];
      return (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.singleButton, { borderTopColor: getTypeColor() }]}
            onPress={() => handleButtonPress(button)}
          >
            <Text style={[styles.buttonText, { color: getTypeColor() }]}>
              {button.text}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        {alertState.buttons.map((button, index) => {
          const isDestructive = button.style === 'destructive';
          const isCancel = button.style === 'cancel';
          const textColor = isDestructive ? '#F44336' : isCancel ? '#666' : getTypeColor();
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.button,
                styles.multiButton,
                { borderTopColor: getTypeColor() },
                index > 0 && { borderLeftWidth: 0.5, borderLeftColor: '#E0E0E0' },
              ]}
              onPress={() => handleButtonPress(button)}
            >
              <Text style={[styles.buttonText, { color: textColor }]}>
                {button.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      transparent
      visible={alertState.visible}
      animationType="fade"
      onRequestClose={hideAlert}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>{alertState.title}</Text>
            {alertState.message && (
              <Text style={styles.message}>{alertState.message}</Text>
            )}
          </View>
          {renderButtons()}
        </View>
      </View>
    </Modal>
  );
};

class CustomAlert {
  static alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { type?: 'success' | 'warning' | 'danger' | 'info' }
  ) {
    if (!alertInstance) {
      console.warn('AlertModal not mounted. Please ensure AlertModal is rendered in your app.');
      return;
    }

    alertInstance.showAlert({
      title,
      message,
      buttons: buttons || [],
      type: options?.type || 'info',
    });
  }

  // 便捷方法
  static success(title: string, message?: string, buttons?: AlertButton[]) {
    this.alert(title, message, buttons, { type: 'success' });
  }

  static warning(title: string, message?: string, buttons?: AlertButton[]) {
    this.alert(title, message, buttons, { type: 'warning' });
  }

  static error(title: string, message?: string, buttons?: AlertButton[]) {
    this.alert(title, message, buttons, { type: 'danger' });
  }

  static info(title: string, message?: string, buttons?: AlertButton[]) {
    this.alert(title, message, buttons, { type: 'info' });
  }
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    minWidth: width * 0.7,
    maxWidth: width * 0.9,
    minHeight: 120,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    minHeight: 60,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 0.5,
    minHeight: 50,
  },
  singleButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  multiButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
});

export default CustomAlert;
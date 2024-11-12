import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
}

export function AuthButton({ title, ...props }: AuthButtonProps) {
  return (
    <TouchableOpacity style={styles.button} {...props}>
      <ThemedText style={styles.buttonText}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0a7ea4',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
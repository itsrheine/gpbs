import * as Speech from 'expo-speech';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {

  const speak = () => {
    Speech.speak("There’s an Italian restaurant nearby 🍝");
  };

  return (
    <View style={styles.container}>
      <View style={styles.fakeMap}>
        <Text style={styles.text}>🗺️ GPPS Map Loading...</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={speak}>
        <Text style={styles.buttonText}>Choose Voice</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fakeMap: {
    flex: 1,
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type VoiceOption = {
  id: string;
  label: string;
};

type PlaceStop = {
  id: string;
  type: 'italian' | 'coffee' | 'gas';
  name: string;
};

const VOICES: VoiceOption[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'funny', label: 'Funny' },
  { id: 'british', label: 'British' },
];

const ROUTE_STOPS: PlaceStop[] = [
  { id: '1', type: 'coffee', name: 'Morning Brew Cafe' },
  { id: '2', type: 'italian', name: 'Luigi’s Trattoria' },
  { id: '3', type: 'gas', name: 'QuickFuel Station' },
];

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICES[0]);
  const [isDriving, setIsDriving] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(-1);
  const [destination, setDestination] = useState('Downtown San Francisco');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getLineForPlace = (place: PlaceStop) => {
    if (selectedVoice.id === 'funny') {
      if (place.type === 'italian') return `Pasta temptation detected. ${place.name} is nearby.`;
      if (place.type === 'coffee') return `Caffeine alert. ${place.name} is coming up.`;
      return `Fuel check. ${place.name} is nearby if your tank is feeling dramatic.`;
    }

    if (selectedVoice.id === 'british') {
      if (place.type === 'italian') return `There’s a lovely Italian restaurant nearby: ${place.name}.`;
      if (place.type === 'coffee') return `Quite a nice coffee spot ahead: ${place.name}.`;
      return `There’s a petrol station nearby: ${place.name}.`;
    }

    if (place.type === 'italian') return `There is an Italian restaurant nearby: ${place.name}.`;
    if (place.type === 'coffee') return `There is a coffee shop nearby: ${place.name}.`;
    return `There is a gas station nearby: ${place.name}.`;
  };

  const speakPlace = (place: PlaceStop) => {
    Speech.speak(getLineForPlace(place));
  };

  const chooseVoice = (voice: VoiceOption) => {
    setSelectedVoice(voice);
    setModalVisible(false);
    Speech.speak(`${voice.label} voice selected.`);
  };

  const startDrive = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setIsDriving(true);
    setCurrentStopIndex(-1);
    Speech.speak(`Starting route to ${destination}.`);

    let index = 0;
    intervalRef.current = setInterval(() => {
      if (index >= ROUTE_STOPS.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsDriving(false);
        Speech.speak('Drive simulation complete.');
        return;
      }

      setCurrentStopIndex(index);
      speakPlace(ROUTE_STOPS[index]);
      index += 1;
    }, 5000);
  };

  const stopDrive = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsDriving(false);
    Speech.stop();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const currentPlace =
    currentStopIndex >= 0 ? ROUTE_STOPS[currentStopIndex] : null;

  return (
    <View style={styles.container}>
      <View style={styles.fakeMap}>
        <View style={styles.mapBlobTopLeft} />
        <View style={styles.mapBlobBottomRight} />
        <View style={styles.roadHorizontal} />
        <View style={styles.roadVertical} />
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={destination}
          onChangeText={setDestination}
          placeholder="Where to?"
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.topChips}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{selectedVoice.label}</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{isDriving ? 'Driving' : 'Preview'}</Text>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <Text style={styles.sheetHandle}>﹘</Text>
        <Text style={styles.routeTitle}>{destination}</Text>
        <Text style={styles.routeMeta}>18 min • 6.4 mi • light traffic</Text>

        {currentPlace ? (
          <View style={styles.placeCard}>
            <Text style={styles.placeTitle}>Passing now</Text>
            <Text style={styles.placeName}>{currentPlace.name}</Text>
            <Text style={styles.placeType}>Type: {currentPlace.type}</Text>
          </View>
        ) : (
          <View style={styles.placeCard}>
            <Text style={styles.placeTitle}>Next experience</Text>
            <Text style={styles.placeName}>Voice-guided place callouts</Text>
            <Text style={styles.placeType}>Coffee • Italian • Gas</Text>
          </View>
        )}

        <TouchableOpacity style={styles.voiceButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.voiceButtonText}>Choose Voice</Text>
        </TouchableOpacity>

        {!isDriving ? (
          <TouchableOpacity style={styles.startButton} onPress={startDrive}>
            <Text style={styles.startButtonText}>Start Drive</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopDrive}>
            <Text style={styles.stopButtonText}>Stop Drive</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Choose a Voice</Text>

            {VOICES.map((voice) => (
              <TouchableOpacity
                key={voice.id}
                style={styles.voiceOption}
                onPress={() => chooseVoice(voice)}
              >
                <Text style={styles.voiceOptionText}>{voice.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dfe7ef',
  },
  fakeMap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#dfe7ef',
  },
  mapBlobTopLeft: {
    position: 'absolute',
    top: 110,
    left: 20,
    width: 180,
    height: 120,
    backgroundColor: '#c9d7c1',
    borderRadius: 40,
    transform: [{ rotate: '-8deg' }],
  },
  mapBlobBottomRight: {
    position: 'absolute',
    right: 10,
    top: 280,
    width: 220,
    height: 150,
    backgroundColor: '#c9d7c1',
    borderRadius: 50,
    transform: [{ rotate: '12deg' }],
  },
  roadHorizontal: {
    position: 'absolute',
    top: 230,
    left: -20,
    right: -20,
    height: 20,
    backgroundColor: '#f7f2e7',
    borderRadius: 20,
    transform: [{ rotate: '-12deg' }],
  },
  roadVertical: {
    position: 'absolute',
    top: 120,
    left: 140,
    width: 22,
    height: 260,
    backgroundColor: '#f7f2e7',
    borderRadius: 20,
    transform: [{ rotate: '18deg' }],
  },
  searchBar: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffffee',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  searchIcon: {
    fontSize: 20,
    color: '#666',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  topChips: {
    position: 'absolute',
    top: 126,
    left: 16,
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    backgroundColor: '#ffffffdd',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  sheetHandle: {
    alignSelf: 'center',
    fontSize: 28,
    color: '#bbb',
    marginTop: -8,
    marginBottom: 4,
  },
  routeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  routeMeta: {
    marginTop: 6,
    fontSize: 15,
    color: '#666',
  },
  placeCard: {
    marginTop: 18,
    backgroundColor: '#f7f7f7',
    padding: 16,
    borderRadius: 20,
  },
  placeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  placeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  placeType: {
    marginTop: 6,
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  voiceButton: {
    marginTop: 16,
    backgroundColor: '#f2f2f2',
    paddingVertical: 16,
    borderRadius: 26,
  },
  voiceButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  startButton: {
    marginTop: 12,
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 26,
  },
  startButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stopButton: {
    marginTop: 12,
    backgroundColor: '#d92d20',
    paddingVertical: 16,
    borderRadius: 26,
  },
  stopButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  voiceOption: {
    backgroundColor: '#f6f6f6',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
  },
  voiceOptionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 4,
    padding: 14,
  },
  closeButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});
import { atomWithStorage as baseAtomWithStorage, createJSONStorage } from 'jotai/utils'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function atomWithStorage<T>(key: string, value: T) {
  const storage = { ...createJSONStorage<T>(() => AsyncStorage), delayInit: true };
  return baseAtomWithStorage<T>(key, value, storage);
}

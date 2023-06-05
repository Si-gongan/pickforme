import { View, Text } from '../Themed';
import Button from '../Button';
import { StyleSheet } from 'react-native';

export interface Props {
}

export const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    marginBottom: 33,
  },
  desc: {
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignContent: 'stretch',
    gap: 19,
  },
  buttonWrap: {
    flex: 1,
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 50,
    paddingHorizontal: 27,
  },
  button: {
    flex: 1,
  },
});


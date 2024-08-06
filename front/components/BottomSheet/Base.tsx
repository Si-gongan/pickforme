import { StyleSheet } from 'react-native';

export interface Props {
}

export const styles = StyleSheet.create({
  base: {
    justifyContent: "flex-end",
    margin: 0,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  desc: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
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


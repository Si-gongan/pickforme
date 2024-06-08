import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 34,
  },
  content: {
    paddingHorizontal: 27,
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 22,
  },
  subtitle: {
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 15,
  },
  desc: {
    fontSize: 12,
    lineHeight: 15,
  },
  section: {
    marginBottom: 34,
  },
  page: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 17,
  },
  link: {
    textDecorationLine: 'underline'
  },
  buttonWrap: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  buttonLeft: {
    justifyContent: 'flex-start',
  },
  buttonRight: {
    justifyContent: 'flex-end',
  },
  full: {
    flex: 1,
  },
  half: {
    flex: 0.5,
  },
});

export default styles;

import { colors, fontSize } from '../constants/tokens';
import { StyleSheet } from 'react-native'

export const defaultStyles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	text: {
		fontSize: fontSize.base,
		color: colors.text,
	},
	header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
})
export const homeStyles = StyleSheet.create({
	content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 50,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF5252',
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  card: {
    width: 130,
    marginRight: 15,
  },
  cardImage: {
    width: 130,
    height: 130,
    borderRadius: 12,
    backgroundColor: '#333',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  artistCard: {
    width: 100,
    marginRight: 20,
    alignItems: 'center',
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
})
export const utilsStyles = StyleSheet.create({
	centeredRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	slider: {
		height: 7,
		borderRadius: 16,
	},
	itemSeparator: {
		borderColor: colors.textMuted,
		borderWidth: StyleSheet.hairlineWidth,
		opacity: 0.3,
	},
	emptyContentText: {
		...defaultStyles.text,
		color: colors.textMuted,
		textAlign: 'center',
		marginTop: 20,
	},
	emptyContentImage: {
		width: 200,
		height: 200,
		alignSelf: 'center',
		marginTop: 40,
		opacity: 0.3,
	},
})



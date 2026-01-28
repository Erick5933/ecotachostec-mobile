import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // ========================================
  // LAYOUT & BACKGROUND
  // ========================================
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Espacio para scroll final
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  
  // ========================================
  // HEADER
  // ========================================
  header: {
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    backgroundColor: '#2D6A4F', // Fallback
  },
  headerGradient: {
    padding: 24,
    width: '100%',
  },
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  welcomeBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
    marginLeft: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userRole: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },

  // ========================================
  // STATS GRID
  // ========================================
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2, // 2 columnas con espacio
    marginBottom: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  statCardContent: {
    padding: 16,
    alignItems: 'flex-start',
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginRight: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statProgress: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  statProgressBar: {
    height: '100%',
    borderRadius: 2,
  },

  // ========================================
  // TABS
  // ========================================
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  tabBtnActive: {
    backgroundColor: '#E8F5E9', // Fallback ligero
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#2D6A4F',
    fontWeight: '700',
  },

  // ========================================
  // CARDS (Vista General/Listas)
  // ========================================
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    
  },
  liveBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  
  // ========================================
  // LIST ITEMS (Activity Timeline)
  // ========================================
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'flex-start',
  },
  timelineLine: {
    width: 2,
    backgroundColor: '#E2E8F0',
    position: 'absolute',
    left: 36, // Centrado con el dot
    top: 0,
    bottom: 0,
    zIndex: 0,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  classificationBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  classificationText: {
    fontSize: 10,
    fontWeight: '700',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    marginRight: 12,
  },

  // ========================================
  // QUICK ACTIONS
  // ========================================
  quickActionsGrid: {
    marginBottom: 24,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  quickActionDesc: {
    fontSize: 12,
    color: '#64748B',
  },

  // ========================================
  // SEARCH & FILTERS
  // ========================================
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 48,
    width: '100%',
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1E293B',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  primaryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  
  // ========================================
  // EMPTY STATES
  // ========================================
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSub: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },

  // ========================================
  // TABLE / LIST ROWS
  // ========================================
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowMainInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#64748B',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ========================================
  // MIS TACHOS - CARD LIST ITEMS
  // ========================================
  tachoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tachoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginRight: 8,
  },
  secondaryBtnText: {
    color: '#0369A1',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 6,
  },

  // Gradientes predefinidos para uso como prop colors
  greenGradient: ['#95D5B2', '#74C69D'],
  blueGradient: ['#A2D2FF', '#72BFFF'],
  purpleGradient: ['#C8B6FF', '#9D84FF'],
  orangeGradient: ['#FFB347', '#FFCC33'],
});

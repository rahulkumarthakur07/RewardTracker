import React, { useState, useContext } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Text,
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemeContext } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import ImageViewer from 'react-native-image-zoom-viewer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');



export default function EnhancedSplitViewScreen() {
    const { img1, img2, label1 = "Day 1", label2 = "Current", days = "Progress" } = useLocalSearchParams();
    const { dark } = useContext(ThemeContext);

    const [mode, setMode] = useState<'screenshot' | 'compare'>('compare');
    const [activeImage, setActiveImage] = useState<string | null>(null);


    const colors = {
        background: dark ? 'rgba(0,0,0,0.95)' : '#f8fafc',
        card: dark ? 'rgba(0,0,0,0.5)' : '#ffffff',
        text: dark ? '#f1f5f9' : '#0f172a',
        textSecondary: dark ? '#94a3b8' : '#64748b',
        accent: '#FF9800',
        accentLight: dark ? '#064e3b' : '#d1fae5',
        before: '#3b82f6',
        after: '#FF9800',
        border: dark ? '#334155' : '#e2e8f0',
    };

    return (
        <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        {mode === 'screenshot' ? 'Share Mode' : 'Zoom Mode'}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        {mode === 'screenshot' ? 'Beautiful layout for sharing' : 'Detailed comparison'}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.modeToggle, { backgroundColor: colors.accent }]}
                    onPress={() => setMode(mode === 'screenshot' ? 'compare' : 'screenshot')}
                >
                    <Ionicons
                        name={mode === 'screenshot' ? 'search' : 'share-social'}
                        size={20}
                        color="#fff"
                    />
                    <Text style={styles.modeText}>
                        {mode === 'screenshot' ? 'Compare' : 'Share'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* SCREENSHOT MODE - Gorgeous layout for sharing */}
            {mode === 'screenshot' && (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.screenshotContent}
                    showsVerticalScrollIndicator={false}
                >


                    {/* Elegant Timeline */}
                    <View style={styles.timelineContainer}>
                        <View style={[styles.timelineStep, { backgroundColor: colors.before }]}>
                            <Text style={styles.timelineStepLabel}>START</Text>
                            <Text style={styles.timelineStepDate}>{label1}</Text>
                        </View>

                        <View style={styles.timelineProgress}>
                            <View style={[styles.timelineLine, { backgroundColor: colors.before }]} />
                            <View style={[styles.timelineProgressBadge, { backgroundColor: colors.accent }]}>
                                <Text style={styles.timelineProgressText}>My Progress</Text>
                            </View>
                            <View style={[styles.timelineLine, { backgroundColor: colors.after }]} />
                        </View>

                        <View style={[styles.timelineStep, { backgroundColor: colors.after }]}>
                            <Text style={styles.timelineStepLabel}>NOW</Text>
                            <Text style={styles.timelineStepDate}>{label2}</Text>
                        </View>
                    </View>

                    {/* Images with elegant cards */}
                    <View style={styles.comparisonContainer}>
                        {/* Before Image Card */}
                        <View style={[styles.imageCard, {
                            borderLeftWidth: 4,
                            borderLeftColor: colors.before,
                            shadowColor: colors.before,
                        }]}>
                            <View style={[styles.cardHeader, { backgroundColor: colors.before }]}>
                                <Ionicons name="calendar" size={18} color="#fff" />
                                <Text style={styles.cardHeaderText}>BEFORE</Text>
                            </View>
                            <Image
                                source={{ uri: img1 as string }}
                                style={styles.beautifulImage}
                                resizeMode="cover"
                            />
                            <View style={[styles.cardFooter, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                                <Text style={[styles.cardDate, { color: colors.before }]}>{label1}</Text>
                            </View>
                        </View>

                        <View className='w-1' ></View>
                        {/* After Image Card */}
                        <View style={[styles.imageCard, {
                            borderRightWidth: 4,
                            borderRightColor: colors.after,
                            shadowColor: colors.after,
                        }]}>
                            <View style={[styles.cardHeader, { backgroundColor: colors.after }]}>
                                <Ionicons name="trophy" size={18} color="#fff" />
                                <Text style={styles.cardHeaderText}>AFTER</Text>
                            </View>
                            <Image
                                source={{ uri: img2 as string }}
                                style={styles.beautifulImage}
                                resizeMode="cover"
                            />
                            <View style={[styles.cardFooter, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                                <Text style={[styles.cardDate, { color: colors.after }]}>{label2}</Text>
                            </View>
                        </View>
                    </View>

                    {/* App Banner */}
                    <View style={[styles.appBanner, { backgroundColor: colors.accent }]}>
                        <Ionicons name="download" size={20} color="#fff" />
                        <Text style={styles.appBannerText}>Track your journey at progresstracker.app</Text>
                    </View>



                    {/* Share CTA */}
                    <View style={[styles.shareCta, { backgroundColor: colors.card }]}>
                        <Ionicons name="share-social" size={24} color={colors.accent} />
                        <Text style={[styles.shareTitle, { color: colors.text }]}>
                            Share Your Achievement!
                        </Text>
                        <Text style={[styles.shareText, { color: colors.textSecondary }]}>
                            Take a screenshot and share to inspire others
                        </Text>
                        <View style={styles.hashtagContainer}>
                            <Text style={[styles.hashtag, { color: colors.accent }]}>#ProgressTracker</Text>
                            <Text style={[styles.hashtag, { color: colors.accent }]}>#SelfDevelopmentJourney</Text>
                            <Text style={[styles.hashtag, { color: colors.accent }]}>#LevelupTracker</Text>
                        </View>
                    </View>

                </ScrollView>
            )}

            {/* COMPARE MODE - Stacked zoomable images */}
            {mode === 'compare' && (
                <ScrollView
                    style={styles.compareScrollView}
                    contentContainerStyle={styles.compareContent}
                    showsVerticalScrollIndicator={true}
                >
                    {/* Before Image - Full width */}
                    <View style={styles.compareSection}>
                        <View style={[styles.compareLabelContainer, { backgroundColor: colors.before }]}>
                            <Ionicons name="calendar" size={18} color="#fff" />
                            <Text style={styles.compareLabelText}>BEFORE: {label1}</Text>
                        </View>
                        <View style={styles.zoomContainer}>
                            <ImageViewer
                                imageUrls={[{ url: img1 as string }]}
                                enableSwipeDown={false}
                                saveToLocalByLongPress={false}
                                renderHeader={() => null}
                                backgroundColor="transparent"
                                style={styles.zoomViewer}
                                renderImage={(props) => (
                                    <Image
                                        {...props}
                                        style={styles.compareImage}
                                        resizeMode="contain"
                                    />
                                )}
                            />
                        </View>
                    </View>



                    {/* After Image - Full width */}
                    <View style={styles.compareSection}>
                        <View style={[styles.compareLabelContainer, { backgroundColor: colors.after }]}>
                            <Ionicons name="trophy" size={18} color="#fff" />
                            <Text style={styles.compareLabelText}>AFTER: {label2}</Text>
                        </View>
                        <View style={styles.zoomContainer}>
                            <ImageViewer
                                imageUrls={[{ url: img2 as string }]}
                                enableSwipeDown={false}
                                saveToLocalByLongPress={false}
                                renderHeader={() => null}
                                backgroundColor="transparent"
                                style={styles.zoomViewer}
                                renderImage={(props) => (
                                    <Image
                                        {...props}
                                        style={styles.compareImage}
                                        resizeMode="contain"
                                    />
                                )}
                            />
                        </View>
                    </View>

                    {/* Zoom Instructions */}
                    <View style={[styles.instructions, { backgroundColor: colors.card }]}>
                        <Ionicons name="information-circle" size={20} color={colors.accent} />
                        <Text style={[styles.instructionTitle, { color: colors.text }]}>
                            Zoom Controls
                        </Text>
                        <View style={styles.instructionRow}>
                            <View style={styles.instructionItem}>
                                <Ionicons name="hand-left" size={16} color={colors.textSecondary} />
                                <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                                    Pinch to zoom
                                </Text>
                            </View>
                            <View style={styles.instructionItem}>
                                <Ionicons name="move" size={16} color={colors.textSecondary} />
                                <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                                    Drag to pan
                                </Text>
                            </View>
                            <View style={styles.instructionItem}>
                                <Ionicons name="sync" size={16} color={colors.textSecondary} />
                                <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                                    Double tap reset
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            )}

            {/* Bottom Controls */}
            <View style={[styles.controls, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: colors.background }]}
                    onPress={() => {
                        if (mode === 'screenshot') {
                            alert('📸 Screenshot Guide:\n\n• iPhone: Power + Volume Up\n• Android: Power + Volume Down\n• Share on social media\n• Tag #ProgressTracker\n\nYour journey inspires others! 💪');
                        } else {
                            alert('🔍 Compare Mode:\n\n• Each image is zoomable independently\n• Pinch to zoom in/out\n• Drag to pan around\n• Double tap to reset zoom\n• Switch to Share Mode for beautiful layout');
                        }
                    }}
                >
                    <Ionicons name="help-circle" size={20} color={colors.text} />
                    <Text style={[styles.controlText, { color: colors.text }]}>Help</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, styles.primaryButton, { backgroundColor: colors.accent }]}
                    onPress={() => setMode(mode === 'screenshot' ? 'compare' : 'screenshot')}
                >
                    <Ionicons
                        name={mode === 'screenshot' ? 'search' : 'camera'}
                        size={20}
                        color="#fff"
                    />
                    <Text style={[styles.controlText, { color: '#fff' }]}>
                        {mode === 'screenshot' ? 'Switch to Compare' : 'Switch to Share'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Full Screen Image Modal */}
            {activeImage && (
                <View style={styles.fullScreenModal}>
                    <TouchableOpacity
                        style={styles.modalClose}
                        onPress={() => setActiveImage(null)}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>

                    <ImageViewer
                        imageUrls={[{ url: activeImage }]}
                        enableSwipeDown
                        onSwipeDown={() => setActiveImage(null)}
                        saveToLocalByLongPress={false}
                        backgroundColor="#000"
                        renderIndicator={() => null}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    backButton: {
        padding: 8,
    },
    headerCenter: {
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 12,
    },
    modeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    modeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    screenshotContent: {
        paddingBottom: 100,
    },
    // Premium Screenshot Mode Styles
    premiumHeader: {
        padding: 24,
        margin: 16,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
        alignItems: 'center',
    },
    premiumAppHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    premiumLogo: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    premiumAppName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    premiumTagline: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        marginTop: 2,
    },
    premiumTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 1,
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    premiumSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 16,
        fontWeight: '600',
    },
    timelineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginBottom: 24,
    },
    timelineStep: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    timelineStepLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    timelineStepDate: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 4,
    },
    timelineProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    timelineLine: {
        flex: 1,
        height: 3,
        borderRadius: 2,
    },
    timelineProgressBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    timelineProgressText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    comparisonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 24,

    },
    imageCard: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
        maxWidth: SCREEN_WIDTH / 2 - 8,


    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    cardHeaderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    beautifulImage: {
        width: '100%',
        height: SCREEN_WIDTH * 0.8,
    },
    cardFooter: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    cardDate: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    vsBadgeContainer: {
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vsBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    vsText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
        marginTop: 2,
        textAlign: 'center',
    },
    quoteCard: {
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderLeftWidth: 4,
    },
    quoteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
    },
    quoteTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    quoteText: {
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 26,
        textAlign: 'center',
        marginBottom: 16,
    },
    quoteAuthor: {
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    shareCta: {
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    shareTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 8,
        textAlign: 'center',
    },
    shareText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
    },
    hashtagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    hashtag: {
        fontSize: 12,
        fontWeight: '600',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    appBanner: {
        marginHorizontal: 16,
        marginBottom: 32,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    appBannerText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    // Compare Mode Styles
    compareScrollView: {
        flex: 1,
    },
    compareContent: {
        paddingBottom: 100,
    },
    compareSection: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    compareLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    compareLabelText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    zoomContainer: {
        height: SCREEN_HEIGHT * 0.35,
        width: '100%',
    },
    zoomViewer: {
        flex: 1,
    },
    compareImage: {
        width: '100%',
        height: '100%',
    },
    verticalDivider: {
        alignItems: 'center',
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    arrowLine: {
        width: 3,
        height: 40,
        borderRadius: 2,
    },
    arrowHead: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginVertical: 4,
    },
    arrowText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    instructions: {
        marginHorizontal: 16,
        marginTop: 16,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    instructionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 16,
    },
    instructionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    instructionItem: {
        alignItems: 'center',
        gap: 8,
    },
    instructionText: {
        fontSize: 12,
    },
    // Controls
    controls: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        gap: 12,
        alignItems: 'center',
    },
    controlButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
    },
    primaryButton: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    controlText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Full Screen Modal
    fullScreenModal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        zIndex: 1000,
    },
    modalClose: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 1001,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
});
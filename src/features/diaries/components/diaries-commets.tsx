import { useEffect, useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const API_BASE_URL = 'http://10.0.2.2:8080/api/v1';

// 점 3개 메뉴 아이콘 SVG (Vector.svg)
const MoreOptionsIcon = () => (
    <Svg width="4" height="16" viewBox="0 0 4 16" fill="none">
        <Circle cx="2" cy="2" r="1.5" fill="#1D1D1D" />
        <Circle cx="2" cy="8" r="1.5" fill="#1D1D1D" />
        <Circle cx="2" cy="14" r="1.5" fill="#1D1D1D" />
    </Svg>
);

// 쓰레기통 아이콘 SVG (clarity_trash-solid.svg)
const TrashIcon = () => (
    <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <Path
            d="M3 4.5H15M6.75 4.5V3C6.75 2.58579 7.08579 2.25 7.5 2.25H10.5C10.9142 2.25 11.25 2.58579 11.25 3V4.5M4.5 4.5V14.25C4.5 14.6642 4.83579 15 5.25 15H12.75C13.1642 15 13.5 14.6642 13.5 14.25V4.5"
            stroke="#FF0030"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

// 연필 수정 아이콘 SVG (ant-design_edit-filled.svg)
const EditIcon = () => (
    <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <Path
            d="M3 14.25H15M4.5 11.25L12 3.75L14.25 6L6.75 13.5H4.5V11.25Z"
            stroke="#1D1D1D"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export interface Comment {
    id: string;
    authorName: string;
    authorEmoji: string;
    createdAt: string;
    content: string;
}

export interface DiaryData {
    id: string;
    userName: string;
    userEmoji: string;
    time: string;
    content: string;
}

export interface DiaryDetailModalProps {
    visible: boolean;
    onClose: () => void;
    userToken?: string;
    diaryId?: string;
    onDeleteSuccess?: () => void;
    onEditPress?: () => void;
}

export default function DiaryDetailModal({
    visible,
    onClose,
    userToken = 'YOUR_JWT_TOKEN',
    diaryId = '1',
    onDeleteSuccess,
    onEditPress,
}: DiaryDetailModalProps) {
    const [diaryData, setDiaryData] = useState<DiaryData | null>({
        id: '1',
        userName: '엉뚱한 소금빵',
        userEmoji: '🥐',
        time: '15:00',
        content: '저는여 이렇게 생각합니다\n이만어 | 만ㄹㅇㄴ미어리멍ㄹ미 ㅓ ㅇ림ㅇㄹ',
    });
    const [comments, setComments] = useState<Comment[]>([
        { id: '2', authorName: '쫀득한 프레첼', authorEmoji: '🥨', createdAt: '1시간 전', content: '어쩌라고' },
        { id: '1', authorName: '쫀득한 카스테라', authorEmoji: '🍞', createdAt: '2시간 전', content: '정병 ㄴㄴ' },
    ]);

    const [commentInput, setCommentInput] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    useEffect(() => {
        if (visible) {
            setIsMenuOpen(false);
            setCommentInput('');
        }
    }, [visible]);

    const handleDeleteDiary = () => {
        setIsMenuOpen(false);
        Alert.alert('일기 삭제', '정말 이 일기를 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                style: 'destructive',
                onPress: () => {
                    if (onDeleteSuccess) onDeleteSuccess();
                    onClose();
                },
            },
        ]);
    };

    const handleEditDiary = () => {
        setIsMenuOpen(false);
        if (onEditPress) onEditPress();
    };

    const handleSendComment = async () => {
        if (!commentInput.trim()) return;
        const newComment: Comment = {
            id: Date.now().toString(),
            authorName: '나',
            authorEmoji: '🥐',
            createdAt: '방금 전',
            content: commentInput.trim(),
        };
        setComments((prev) => [newComment, ...prev]);
        setCommentInput('');
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setIsMenuOpen(false); }}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardContainer}
                    >
                        <View style={styles.contentWrapper}>

                            {/* 팝업 메뉴 (일기 카드 위 우상단에 위치하며 카드와 9px 차이) */}
                            {isMenuOpen && (
                                <View style={styles.actionMenuPopup}>
                                    {/* 삭제 버튼 - 눌렀을 때만 회색(#D9D9D9) 변환 */}
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.menuItem,
                                            pressed && styles.menuItemPressed,
                                        ]}
                                        onPress={handleDeleteDiary}
                                    >
                                        <TrashIcon />
                                        <Text style={styles.menuText}>삭제</Text>
                                    </Pressable>

                                    {/* 수정 버튼 - 눌렀을 때만 회색(#D9D9D9) 변환 */}
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.menuItem,
                                            pressed && styles.menuItemPressed,
                                        ]}
                                        onPress={handleEditDiary}
                                    >
                                        <EditIcon />
                                        <Text style={styles.menuText}>수정</Text>
                                    </Pressable>
                                </View>
                            )}

                            {/* 1. 일기 카드 */}
                            <View style={styles.diaryCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.profileRow}>
                                        <Text style={styles.emoji}>{diaryData?.userEmoji || '🥐'}</Text>
                                        <Text style={styles.userName}>{diaryData?.userName || ''}</Text>
                                    </View>

                                    {/* ⋮ 메뉴 토글 버튼 */}
                                    <TouchableOpacity
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        onPress={() => setIsMenuOpen((prev) => !prev)}
                                    >
                                        <MoreOptionsIcon />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.cardBody}>
                                    <Text style={styles.timeText}>{diaryData?.time || ''}</Text>
                                    <Text style={styles.contentText}>{diaryData?.content || ''}</Text>
                                </View>

                                <View style={styles.reactionSlot} />
                            </View>

                            {/* 2. 댓글 작성 인풋 */}
                            <View style={styles.commentInputRow}>
                                <View style={styles.commentInputBox}>
                                    <TextInput
                                        style={styles.commentInput}
                                        value={commentInput}
                                        onChangeText={setCommentInput}
                                        placeholder="댓글을 남겨주세요"
                                        placeholderTextColor="#647F8B"
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.sendButton}
                                    onPress={handleSendComment}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.sendButtonText}>전송</Text>
                                </TouchableOpacity>
                            </View>

                            {/* 3. 댓글 목록 */}
                            <View style={styles.commentListContainer}>
                                <ScrollView
                                    nestedScrollEnabled
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.commentListContent}
                                >
                                    {comments.map((item) => (
                                        <View key={item.id} style={styles.commentCard}>
                                            <View style={styles.commentHeader}>
                                                <Text style={styles.commentEmoji}>{item.authorEmoji}</Text>
                                                <View style={styles.commentAuthorGroup}>
                                                    <Text style={styles.commentAuthor}>{item.authorName}</Text>
                                                    <Text style={styles.commentTime}>{item.createdAt}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.commentContent}>{item.content}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>

                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        alignItems: 'center',
    },
    keyboardContainer: {
        flex: 1,
        alignItems: 'center',
    },
    contentWrapper: {
        width: 336,
        marginTop: 262,
        position: 'relative',
    },
    /* 일기 카드 오른쪽 위 팝업 (카드 상단과 9px 간격 차이) */
    actionMenuPopup: {
        position: 'absolute',
        top: -79, // 메뉴 높이(70px) + 간격(9px) = -79px 띄움
        right: 0,
        width: 113,
        height: 70,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 100,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#FFFFFF', // 디폴트는 회색이 아닌 흰색
    },
    menuItemPressed: {
        backgroundColor: '#D9D9D9', // 눌렀을 때만 회색으로 변환
    },
    menuText: {
        fontFamily: 'Yde street',
        fontWeight: '300',
        fontSize: 12,
        color: '#1D1D1D',
        lineHeight: 19.2,
    },
    diaryCard: {
        width: 336,
        backgroundColor: '#FFF6F8',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    emoji: { fontSize: 16 },
    userName: {
        fontFamily: 'Yde street',
        fontWeight: '300',
        fontSize: 12,
        color: '#1D1D1D',
        lineHeight: 19.2,
    },
    cardBody: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    timeText: {
        fontFamily: 'Yde street',
        fontWeight: '700',
        fontSize: 20,
        color: '#1D1D1D',
        lineHeight: 32,
    },
    contentText: {
        fontFamily: 'Yde street',
        fontWeight: '300',
        fontSize: 12,
        color: '#1D1D1D',
        lineHeight: 19.2,
        textAlign: 'center',
    },
    reactionSlot: {
        width: '100%',
        height: 28,
    },
    commentInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        width: '100%',
        marginBottom: 10,
    },
    commentInputBox: {
        flex: 1,
        height: 38,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    commentInput: {
        fontFamily: 'Yde street',
        fontWeight: '300',
        fontSize: 12,
        color: '#1D1D1D',
        padding: 0,
    },
    sendButton: {
        width: 48,
        height: 38,
        backgroundColor: '#FFF9E1',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonText: {
        fontFamily: 'Yde street',
        fontWeight: '300',
        fontSize: 12,
        color: '#1D1D1D',
        lineHeight: 19.2,
    },
    commentListContainer: {
        width: '100%',
        maxHeight: 148,
    },
    commentListContent: {
        gap: 8,
    },
    commentCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        padding: 10,
        gap: 8,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    commentEmoji: { fontSize: 14 },
    commentAuthorGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    commentAuthor: {
        fontFamily: 'Yde street',
        fontWeight: '300',
        fontSize: 10,
        color: '#1D1D1D',
        lineHeight: 16,
    },
    commentTime: {
        fontFamily: 'Yde street',
        fontWeight: '300',
        fontSize: 10,
        color: '#647F8B',
        lineHeight: 16,
    },
    commentContent: {
        fontFamily: 'Yde street',
        fontWeight: '300',
        fontSize: 12,
        color: '#1D1D1D',
        lineHeight: 19.2,
    },
});
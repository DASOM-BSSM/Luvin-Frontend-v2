import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const API_BASE_URL = 'http://10.0.2.2:8080/api/v1';

interface WriteDiaryModalProps {
    visible: boolean;
    onClose: () => void;
    userToken?: string;
    userName?: string;
    lastWrittenAt?: string | null; // 최근 작성 일시
    onSuccess?: () => void;
}

export default function WriteDiaryModal({
    visible,
    onClose,
    userToken = 'YOUR_JWT_TOKEN',
    userName = '쫀득한 소금빵',
    lastWrittenAt = null,
    onSuccess,
}: WriteDiaryModalProps) {
    const [content, setContent] = useState<string>('');
    const [currentTime, setCurrentTime] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [remainingTime, setRemainingTime] = useState<number>(0);

    useEffect(() => {
        if (!visible) return;

        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        setCurrentTime(`${hours}:${minutes}`);
        setContent('');

        if (lastWrittenAt) {
            const lastTime = new Date(lastWrittenAt).getTime();
            const diffSec = Math.floor((now.getTime() - lastTime) / 1000);
            const cooldownSec = 3600; // 1시간 = 3600초

            if (diffSec < cooldownSec) {
                setRemainingTime(cooldownSec - diffSec);
            } else {
                setRemainingTime(0);
            }
        } else {
            setRemainingTime(0);
        }
    }, [visible, lastWrittenAt]);

    // 카운트다운 타이머
    useEffect(() => {
        if (remainingTime <= 0) return;

        const timer = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [remainingTime]);

    const formatRemainingTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}분 ${String(s).padStart(2, '0')}초 후 가능`;
    };

    const handleSubmitDiary = async () => {
        if (remainingTime > 0) return;

        if (!content.trim()) {
            Alert.alert('알림', '당신의 생각을 적어주세요!');
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch(`${API_BASE_URL}/diaries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    content: content.trim(),
                    time: currentTime,
                }),
            });

            if (response.status === 429) {
                throw new Error('1시간에 한 번만 일기를 올릴 수 있습니다.');
            }

            if (!response.ok) throw new Error('일기 등록에 실패했습니다.');

            Alert.alert('성공', '일기가 등록되었습니다.');
            if (onSuccess) onSuccess();
            onClose(); // 성공 시 모달 닫기
        } catch (error: any) {
            Alert.alert('오류', error.message || '네트워크 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const isButtonDisabled = remainingTime > 0 || submitting;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardContainer}
                    >
                        <View style={styles.contentWrapper}>
                            <View style={styles.cardFrame}>
                                <View style={styles.profileHeader}>
                                    <Text style={styles.emoji}>🥐</Text>
                                    <Text style={styles.profileName}>{userName}</Text>
                                </View>

                                <View style={styles.centerInputContainer}>
                                    <Text style={styles.timeText}>{currentTime || '15:00'}</Text>
                                    <TextInput
                                        style={styles.diaryInput}
                                        value={content}
                                        onChangeText={setContent}
                                        placeholder={
                                            remainingTime > 0
                                                ? '다음 작성 시간까지 기다려주세요'
                                                : '당신의 생각을 적어주세요'
                                        }
                                        placeholderTextColor="#647F8B"
                                        multiline
                                        textAlign="center"
                                        maxLength={200}
                                        editable={remainingTime === 0}
                                    />
                                </View>

                                <View style={styles.bottomSpacer} />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    isButtonDisabled && styles.disabledButton,
                                ]}
                                onPress={handleSubmitDiary}
                                disabled={isButtonDisabled}
                                activeOpacity={0.8}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="#1D1D1D" />
                                ) : (
                                    <Text
                                        style={[
                                            styles.submitButtonText,
                                            isButtonDisabled && styles.disabledButtonText,
                                        ]}
                                    >
                                        {remainingTime > 0
                                            ? formatRemainingTime(remainingTime)
                                            : '일기 올리기'}
                                    </Text>
                                )}
                            </TouchableOpacity>
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
        justifyContent: 'flex-start',
    },
    keyboardContainer: {
        width: '100%',
        alignItems: 'center',
    },
    contentWrapper: {
        width: 336,
        alignItems: 'center',
        marginTop: 253,
        marginBottom: 108,
    },
    cardFrame: {
        width: 336,
        height: 162,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    profileHeader: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    emoji: { fontSize: 16 },
    profileName: {
        fontFamily: 'Yde street',
        fontWeight: '300',
        fontSize: 12,
        color: '#1D1D1D',
        lineHeight: 19.2,
    },
    centerInputContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    timeText: {
        fontFamily: 'Yde street',
        fontWeight: '700',
        fontSize: 20,
        color: '#1D1D1D',
        lineHeight: 32,
        textAlign: 'center',
    },
    diaryInput: {
        width: '100%',
        fontFamily: 'Yde street',
        fontWeight: '300',
        fontSize: 12,
        color: '#1D1D1D',
        lineHeight: 19.2,
        padding: 0,
        textAlign: 'center',
    },
    bottomSpacer: { width: '100%', height: 18 },
    submitButton: {
        width: 336,
        height: 38,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#FFF9E1',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    disabledButton: {
        backgroundColor: '#E0E0E0',
    },
    submitButtonText: {
        fontFamily: 'Yde street',
        fontWeight: '300',
        fontSize: 14,
        color: '#1D1D1D',
        lineHeight: 22.4,
    },
    disabledButtonText: {
        color: '#888888',
    },
});
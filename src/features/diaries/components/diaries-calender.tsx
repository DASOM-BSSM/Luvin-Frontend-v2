import Text from '@/src/components/ui/text';
import { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import Svg, { Circle, Path } from 'react-native-svg';

const WrittenIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke="#FF8EA3" strokeWidth="2" />
        <Circle cx="9" cy="10" r="1.25" fill="#FF8EA3" />
        <Circle cx="15" cy="10" r="1.25" fill="#FF8EA3" />
        <Path
            d="M8 14C8 14 9.5 17 12 17C14.5 17 16 14 16 14"
            stroke="#FF8EA3"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </Svg>
);

const UnwrittenIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke="#D9D9D9" />
        <Circle cx="9" cy="10" r="1.25" fill="#D9D9D9" />
        <Circle cx="15" cy="10" r="1.25" fill="#D9D9D9" />
        <Path
            d="M8 14C8 14 9.5 17 12 17C14.5 17 16 14 16 14"
            stroke="#D9D9D9"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </Svg>
);

interface DiariesCalendarModalProps {
    visible: boolean;
    onClose: () => void;
    writtenDates?: string[];
    onSelectDate?: (date: string) => void;
}

export default function DiariesCalendarModal({
    visible,
    onClose,
    writtenDates = [
        '2026-09-01', '2026-09-03', '2026-09-04', '2026-09-05',
        '2026-09-06', '2026-09-07', '2026-09-08', '2026-09-09',
        '2026-09-10', '2026-09-11'
    ],
    onSelectDate,
}: DiariesCalendarModalProps) {
    const [selectedDate, setSelectedDate] = useState('2026-09-12');
    const [currentMonth, setCurrentMonth] = useState('2026-09-01');

    const handleDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
        if (onSelectDate) onSelectDate(day.dateString);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={styles.sheetContainer}>
                    <View style={styles.handleWrapper}>
                        <View style={styles.handleBar} />
                    </View>

                    <View style={styles.calendarWrapper}>
                        <Calendar
                            key={currentMonth}
                            current={currentMonth}
                            onDayPress={handleDayPress}
                            monthFormat={'yyyy년 M월'}
                            onMonthChange={(month) => setCurrentMonth(month.dateString)}
                            theme={{
                                calendarBackground: '#ffffff',
                                textSectionTitleColor: '#1D1D1D',
                                monthTextColor: '#1D1D1D',
                                arrowColor: '#1D1D1D',
                                'stylesheet.calendar.header': {
                                    header: {
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 12,
                                    },
                                    monthText: {
                                        fontSize: 12,
                                        fontFamily: 'Yde street',
                                        fontWeight: '300',
                                        lineHeight: 19.2,
                                        color: '#1D1D1D',
                                        textAlign: 'center',
                                    },
                                    week: {
                                        flexDirection: 'row',
                                        justifyContent: 'space-around',
                                        marginBottom: 12,
                                    },
                                    dayHeader: {
                                        fontSize: 10,
                                        fontFamily: 'Yde street',
                                        fontWeight: '300',
                                        lineHeight: 16,
                                        color: '#1D1D1D',
                                        textAlign: 'center',
                                    },
                                },
                            } as any}
                            dayComponent={({ date, state }) => {
                                if (!date) return null;
                                const dateStr = date.dateString;
                                const isSelected = dateStr === selectedDate;
                                const isDisabled = state === 'disabled';
                                const hasWritten = writtenDates.includes(dateStr);

                                return (
                                    <TouchableOpacity
                                        onPress={() => handleDayPress(date)}
                                        style={styles.dayCell}
                                        activeOpacity={0.7}
                                    >
                                        <View style={{ marginBottom: 2, opacity: isDisabled ? 0.3 : 1 }}>
                                            {hasWritten ? <WrittenIcon /> : <UnwrittenIcon />}
                                        </View>

                                        <View style={[styles.dayNumberBadge, isSelected && styles.selectedBadge]}>
                                            <Text
                                                style={[
                                                    styles.dayNumberText,
                                                    isSelected && styles.selectedDayNumberText,
                                                    isDisabled && styles.disabledText,
                                                ]}
                                            >
                                                {String(date.day).padStart(2, '0')}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    sheetContainer: {
        width: '100%',
        maxWidth: 402,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 20,
    },
    handleWrapper: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 12,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#D9D9D9',
        borderRadius: 2,
    },
    calendarWrapper: {
        paddingHorizontal: 20,
    },
    dayCell: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 44,
    },
    dayNumberBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedBadge: {
        backgroundColor: '#1D1D1D',
    },
    // [날짜 텍스트 스펙]
    dayNumberText: {
        color: '#1D1D1D',
        fontSize: 10,
        fontFamily: 'Yde street',
        fontWeight: '300',
        lineHeight: 16,
        textAlign: 'center',
    },
    selectedDayNumberText: {
        color: '#FFFFFF',
        fontWeight: '300',
    },
    disabledText: {
        opacity: 0.3,
    },
});
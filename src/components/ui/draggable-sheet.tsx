import { type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useDraggableSheet from '@/src/hooks/use-draggable-sheet';

interface DraggableSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * 아래에서 올라오는 흰 시트(Figma "일기 모아보기" 시트 모양). 위쪽 손잡이 선을 끌 수 있다 —
 * 위로 끌면 늘어나고, 아래로 끌어 놓으면 닫힌다. 바깥(어두운 배경)을 눌러도 닫힌다.
 *
 * Modal 안은 앱 루트의 GestureHandlerRootView 밖이라(Android) 여기서 다시 감싼다.
 */
export default function DraggableSheet({ visible, onClose, children }: DraggableSheetProps) {
  return (
    // animationType="slide" 는 어두운 배경까지 같이 밀어 올린다 — 배경은 fade, 흰 시트만 아래에서 올린다.
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <Pressable className="flex-1 justify-end bg-default-black/30" onPress={onClose}>
          <SheetBody onClose={onClose}>{children}</SheetBody>
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
}

/** Modal 이 열릴 때마다 새로 마운트돼서, 끈 위치가 매번 원래대로 시작한다. */
function SheetBody({ onClose, children }: Omit<DraggableSheetProps, 'visible'>) {
  const { gesture, sheetStyle, handleSheetLayout } = useDraggableSheet(onClose);
  const { bottom: bottomInset } = useSafeAreaInsets();

  return (
    <Animated.View style={sheetStyle} onLayout={handleSheetLayout}>
      {/* 안쪽을 눌렀을 때 닫히지 않도록 이벤트를 여기서 멈춘다. 늘어난 빈 곳까지 채운다(grow — flex-1 은 높이 0 으로 접힌다). */}
      <Pressable className="w-full grow flex-col items-start gap-[12px] rounded-t-[8px] bg-default-white px-[20px] pb-[20px] pt-[10px]">
        <GestureDetector gesture={gesture}>
          <View className="w-full items-center">
            <View className="h-[2px] w-[60px] rounded-full bg-text-muted" />
          </View>
        </GestureDetector>
        {children}
        {/* Modal 은 Android 내비 바 뒤까지 그려서, 마지막 줄이 가리지 않게 그 높이만큼 띄운다. */}
        {bottomInset > 0 ? <View style={{ height: bottomInset }} /> : null}
      </Pressable>
    </Animated.View>
  );
}

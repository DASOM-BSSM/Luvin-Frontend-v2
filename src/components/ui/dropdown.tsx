import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import ChevronDownIcon from '@/src/assets/icons/ChevronDownIcon';
import Text from '@/src/components/ui/text';

/** 고를 수 있는 항목 하나. */
export interface DropdownOption {
  /** 고른 것을 가리키는 키. */
  id: string;
  /** 목록과 필드에 보이는 글자. */
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  /** 아직 고르지 않았으면 undefined. */
  selectedId?: string;
  /** 고르기 전에 필드에 흐리게 보이는 글자. */
  placeholder: string;
  /** 펼친 목록 맨 위에 흐리게 보이는 안내. 없으면 목록만 보인다. */
  title?: string;
  onSelect: (optionId: string) => void;
}

interface DropdownOptionRowProps {
  option: DropdownOption;
  /** 목록에서 몇 번째인지(1부터). 줄 앞에 번호로 보인다. */
  number: number;
  selected: boolean;
  /** 마지막 줄이면 아래 구분선을 긋지 않는다. */
  isLast: boolean;
  /** 누른 항목의 id 를 돌려준다. 목록에서 익명 함수를 만들지 않으려고 여기서 감싼다(§16). */
  onPress: (optionId: string) => void;
}

/**
 * 목록의 한 줄. 앞에 번호, 뒤에 말이 온다(C안 번호 목록 — 펼친 목록은 시안이 없어서 사용자가 시안
 * 세 개 중 골랐다). 고른 줄은 바탕이 연분홍(pink/100)이고 번호가 진해진다(pink/600). 줄 사이는 구분선.
 *
 * 말이 길어도 자르지 않고 끝까지 줄바꿈한다 — 잘리면 어떤 대화인지 보고 고를 수 없어서다(사용자 결정).
 * 말은 flex-1 이라 남는 폭(600 - 좌우 40 - 번호 20 - 간격 16 = 524)을 넘으면 다음 줄로 넘어간다.
 * 목록은 높이 제한(280) 안에서 스크롤되므로 줄이 길어져도 괜찮다. 줄 위아래 12 는 사용자가 고른 값이다(16 은 넓다고 했다).
 * 글자는 말 body-s, 번호 heading-h5 로 닫힌 필드(body-m)보다 한 단계 작다(사용자 결정).
 *
 * 낭독기가 번호를 따로 읽지 않도록 말을 그대로 접근성 이름으로 준다.
 */
function DropdownOptionRow({ option, number, selected, isLast, onPress }: DropdownOptionRowProps) {
  function handlePress() {
    onPress(option.id);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={option.label}
      className={`w-full flex-row items-start gap-[16px] px-[20px] py-[12px] ${selected ? 'bg-pink-100' : ''} ${isLast ? '' : 'border-b border-pink-300'}`}
      onPress={handlePress}
    >
      <Text variant="heading-h5" className={`w-[20px] ${selected ? 'text-pink-600' : 'text-pink-400'}`}>
        {number}
      </Text>
      <Text variant="body-s" className="flex-1 text-text-primary">
        {option.label}
      </Text>
    </Pressable>
  );
}

/**
 * 목록에서 하나를 고르는 필드. Figma `Dropdown` (5482:1894) — 닫힌 필드(높이 50)만 시안에 있다.
 *
 * NOTE: 펼친 목록은 시안이 없고, 필드 아래에 붙이는 보통의 드롭다운으로는 만들 수 없었다.
 * 이 필드가 놓이는 러빈지옥 쪽지가 낮아서(300) 필드 아래 남는 자리가 110 남짓이라, 목록을
 * 흐름에 넣으면 쪽지 밖으로 제목과 버튼이 밀려 나가고, 띄워도 쪽지(overflow-hidden)가
 * 목록을 잘라 먹는다 — 둘 다 실기기에서 확인했다. 그래서 목록만 모달로 띄워 쪽지 밖으로
 * 꺼낸다. 시안이 생기면 이 부분만 맞추면 된다.
 *
 * 모달에는 supportedOrientations 를 꼭 넘긴다 — 가로로 잠긴 화면에서 빠뜨리면 iOS 가 죽는다
 * (InfernoNoteModal 주석 참고).
 */
export default function Dropdown({ options, selectedId, placeholder, title, onSelect }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = options.find(({ id }) => id === selectedId);

  function handleFieldPress() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleOptionPress(optionId: string) {
    setIsOpen(false);
    onSelect(optionId);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={selected?.label ?? placeholder}
        className="h-[50px] w-[295px] flex-row items-center gap-[8px] overflow-hidden rounded-[12px] border border-pink-300 px-[16px]"
        onPress={handleFieldPress}
      >
        <Text
          variant="body-m"
          numberOfLines={1}
          className={`flex-1 ${selected ? 'text-text-primary' : 'text-text-muted'}`}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDownIcon />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={handleClose}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${placeholder} 닫기`}
          className="flex-1 items-center justify-center bg-default-black/30"
          onPress={handleClose}
        >
          {/*
            안쪽을 눌렀을 때 닫히지 않도록 이벤트를 여기서 멈춘다. 상자는 C안(번호 목록) — 펼친 목록은 시안이
            없어서 사용자가 시안 세 개 중 골랐다. 필드(295)보다 넓은 600 의 가로로 긴 직사각형이고, 모서리는 필드와 같은 12 다.
          */}
          <Pressable className="max-h-[280px] w-[600px] overflow-hidden rounded-[12px] border border-pink-300 bg-default-white">
            {/*
              위·아래 여백(16)은 스크롤 밖에 둬야 항상 보인다 — 안에 두면 아래 여백은 끝까지 스크롤해야만
              보여서, 평소엔 마지막 줄이 아래 테두리에 붙어 보였다(§16 스페이서). ScrollView 는 shrink 를 줘야
              높이 제한(280) 안에서 줄어든다 — RN 은 flexShrink 기본값이 0 이라 없으면 상자를 넘쳐서 아래
              여백이 잘린다.
            */}
            <View className="h-[16px]" />
            {title ? (
              <>
                <View className="px-[20px]">
                  <Text variant="body-xs" className="text-text-muted">
                    {title}
                  </Text>
                </View>
                <View className="h-[8px]" />
              </>
            ) : null}
            <ScrollView className="shrink">
              {options.map((option, index) => (
                <DropdownOptionRow
                  key={option.id}
                  option={option}
                  number={index + 1}
                  selected={option.id === selectedId}
                  isLast={index === options.length - 1}
                  onPress={handleOptionPress}
                />
              ))}
            </ScrollView>
            <View className="h-[16px]" />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

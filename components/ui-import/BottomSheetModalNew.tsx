// 09/04/26: Creates reusable slide-up bottom sheet.
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

// 09/04/26: Defines visibility and close behavior.
type BottomSheetModalNewProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

// 09/04/26: Renders dark backdrop and content panel.
export default function BottomSheetModalNew({
  visible,
  onClose,
  children,
}: BottomSheetModalNewProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>{children}</View>
    </Modal>
  );
}

// 09/04/26: Styles modal backdrop and sheet panel.
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#171717',
    borderTopWidth: 1,
    borderColor: '#3f3f46',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
});

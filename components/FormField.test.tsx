/* eslint-disable @typescript-eslint/no-require-imports, import/first */
// 19/04/26: FormField render input test.
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@/app/_layout', () => ({
  // 19/04/26: Mock HabitContext only.
  HabitContext: require('react').createContext(null),
}));

import FormField from './FormField';

describe('FormField', () => {
  it('renders label and placeholder and fires onChangeText', () => {
    const onChangeText = jest.fn();

    const screen = render(
      <FormField
        label="Habit Name"
        placeholder="e.g. Walk"
        value=""
        onChangeText={onChangeText}
      />
    );

    // 19/04/26: Label placeholder visible.
    expect(screen.getByText('Habit Name')).toBeTruthy();
    const input = screen.getByPlaceholderText('e.g. Walk');
    expect(input).toBeTruthy();

    // 19/04/26: User text change fires.
    fireEvent.changeText(input, 'Read 20 pages');
    expect(onChangeText).toHaveBeenCalledWith('Read 20 pages');
  });
});

import React from 'react';
import { render } from '@testing-library/react-native';
import { HomeScreen } from './HomeScreen';

const mockNavigation = {
  navigate: jest.fn(),
} as any;

describe('HomeScreen', () => {
  it('renders welcome text', () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('Welcome to MiniProj')).toBeTruthy();
  });

  it('renders View Users button', () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('View Users')).toBeTruthy();
  });
});

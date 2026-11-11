import { Redirect } from 'expo-router';
import { useStore } from '@/state/store';

export default function Start() {
  const { z } = useStore();
  return <Redirect href={z.onboardingFertig ? '/heute' : '/onboarding'} />;
}

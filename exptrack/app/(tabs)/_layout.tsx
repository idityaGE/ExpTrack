import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  return <NativeTabs>
    <NativeTabs.Trigger name="(home)">
      <Label>Home</Label>
      <Icon src={<VectorIcon family={MaterialCommunityIcons} name="home" />} />
    </NativeTabs.Trigger>

    <NativeTabs.Trigger name="expenses">
      <Label>Expenses</Label>
      <Icon src={<VectorIcon family={MaterialCommunityIcons} name="format-list-bulleted" />} />
    </NativeTabs.Trigger>

    <NativeTabs.Trigger name="budget">
      <Label>Budget</Label>
      <Icon src={<VectorIcon family={MaterialCommunityIcons} name="wallet" />} />
    </NativeTabs.Trigger>
  </NativeTabs>
}
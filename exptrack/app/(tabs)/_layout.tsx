import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return <NativeTabs>
    <NativeTabs.Trigger name="index">
      <Label>Home</Label>
      <Icon sf="house.fill" drawable="ic_dialog_alert" />
    </NativeTabs.Trigger>

    <NativeTabs.Trigger name="expenses">
      <Label>Expenses</Label>
      <Icon sf="list.bullet" drawable="ic_menu_edit" />
    </NativeTabs.Trigger>

    <NativeTabs.Trigger name="budget">
      <Label>Budget</Label>
      <Icon sf="l.circle" drawable="ic_menu_save" />
    </NativeTabs.Trigger>
  </NativeTabs>
}
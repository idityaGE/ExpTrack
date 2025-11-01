import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';
import { View, RefreshControl, ScrollView, Dimensions, Pressable } from 'react-native';
import { LineChart } from "react-native-gifted-charts";
import { useQuery } from '@tanstack/react-query';
import { getAllExpense } from '@/api/expense';
import { useMemo, useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ui/icon';
import { Settings2Icon } from 'lucide-react-native';

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [tempCount, setTempCount] = useState('20');
  const [labelFrequency, setLabelFrequency] = useState(5);
  const screenWidth = Dimensions.get('window').width;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['expenses', 'all'],
    queryFn: getAllExpense
  })

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const { ptData, maxValue, totalExpenses, totalAmount, visibleData, visibleTotal } = useMemo(() => {
    if (!data?.expenses) return {
      ptData: [],
      maxValue: 0,
      totalExpenses: 0,
      totalAmount: 0,
      visibleData: [],
      visibleTotal: 0
    };

    let calculatedMaxValue = 0;
    let sumTotal = 0;

    const processedData = data.expenses.map((item, index) => {
      const value = item.amount / 100;
      sumTotal += value;

      if (calculatedMaxValue < value) {
        calculatedMaxValue = value;
      }

      const dateObj = new Date(item.date);
      const formattedDate = dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const shouldAddLabel = (index + 1) % labelFrequency === 0;

      return {
        value,
        date: formattedDate,
        ...(shouldAddLabel && {
          label: dateObj.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short'
          }),
          labelTextStyle: { color: 'lightgray', width: 60 }
        })
      };
    });

    const visible = processedData.slice(-visibleCount);
    const visibleSum = visible.reduce((sum, item) => sum + item.value, 0);

    return {
      ptData: processedData,
      maxValue: calculatedMaxValue + 100,
      totalExpenses: data.expenses.length,
      totalAmount: sumTotal,
      visibleData: visible,
      visibleTotal: visibleSum
    };
  }, [data?.expenses, visibleCount, labelFrequency]);

  const handleApplyRange = () => {
    const count = parseInt(tempCount);
    if (!isNaN(count) && count > 0 && count <= totalExpenses) {
      setVisibleCount(count);
    }
  };

  const isDark = colorScheme === 'dark';

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? '#00ff83' : '#14695'}
        />
      }
    >
      <View className="flex-1 items-center justify-start px-4 py-6">
        {isLoading ? (
          <Text className="text-gray-500">Loading...</Text>
        ) : error ? (
          <Text className="text-red-500">Error loading expenses</Text>
        ) : ptData.length === 0 ? (
          <Text className="text-gray-500">No expenses to display</Text>
        ) : (
          <View className="w-full gap-4">
            {/* Stats Cards */}
            <View className="flex-row gap-3">
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardDescription>Total Expenses</CardDescription>
                  <CardTitle className="text-2xl">{totalExpenses}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardDescription>Total Amount</CardDescription>
                  <CardTitle className="text-2xl">₹{totalAmount.toFixed(2)}</CardTitle>
                </CardHeader>
              </Card>
            </View>

            <Card className="w-full pb-12 px-1">
              <CardHeader className="flex-row items-center justify-between">
                <View>
                  <CardTitle>Spending Chart</CardTitle>
                  <CardDescription>Last {visibleCount} expenses</CardDescription>
                </View>

                <Popover>
                  <PopoverTrigger asChild>
                    <Pressable className="p-2 rounded-lg bg-muted active:opacity-70">
                      <Icon as={Settings2Icon} size={20} className="text-foreground" />
                    </Pressable>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 mr-14">
                    <View className="gap-4">
                      <View className="gap-2">
                        <Text className="font-semibold text-base">Adjust Visible Range</Text>
                        <Text className="text-sm text-muted-foreground">
                          Show last N expenses (1-{totalExpenses})
                        </Text>
                      </View>

                      <View className="gap-2">
                        <Label nativeID="range">Number of expenses</Label>
                        <Input
                          placeholder="Enter number"
                          keyboardType="numeric"
                          value={tempCount}
                          onChangeText={(val) => {
                            setTempCount(val.toString());
                            setVisibleCount(parseInt(val));
                          }}
                          className="h-11"
                        />
                      </View>

                      <View className="gap-1 pt-2 border-t border-border">
                        <Text className="text-xs text-muted-foreground">Quick options:</Text>
                        <View className="flex-row gap-2 flex-wrap">
                          {[10, 20, 30, 50].filter(n => n <= totalExpenses).map((num) => (
                            <Pressable
                              key={num}
                              onPress={() => {
                                setTempCount(num.toString());
                                setVisibleCount(num);
                              }}
                              className="px-3 py-1.5 bg-muted rounded-md active:opacity-70"
                            >
                              <Text className="text-sm">{num}</Text>
                            </Pressable>
                          ))}
                          <Pressable
                            onPress={() => {
                              setTempCount(totalExpenses.toString());
                              setVisibleCount(totalExpenses);
                            }}
                            className="px-3 py-1.5 bg-muted rounded-md active:opacity-70"
                          >
                            <Text className="text-sm">All</Text>
                          </Pressable>
                        </View>
                      </View>

                      <View className="gap-2 pt-4 border-t border-border">
                        <Label nativeID="labelFreq">Label frequency (every Nth point)</Label>
                        <View className="flex-row gap-2 flex-wrap">
                          {[3, 5, 10, 15].map((freq) => (
                            <Pressable
                              key={freq}
                              onPress={() => setLabelFrequency(freq)}
                              className={`px-3 py-1.5 rounded-md active:opacity-70 ${labelFrequency === freq ? 'bg-primary' : 'bg-muted'
                                }`}
                            >
                              <Text className={`text-sm ${labelFrequency === freq ? 'text-primary-foreground' : ''
                                }`}>{freq}</Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    </View>
                  </PopoverContent>
                </Popover>
              </CardHeader>

              <LineChart
                areaChart
                data={visibleData}
                width={screenWidth - 100}
                rotateLabel
                hideDataPoints
                spacing={Math.max(5, Math.floor((screenWidth - 90) / visibleData.length))}
                color="#00ff83"
                thickness={2}
                startFillColor="rgba(20,105,81,0.3)"
                endFillColor="rgba(20,85,81,0.01)"
                startOpacity={0.9}
                endOpacity={0.2}
                initialSpacing={0}
                noOfSections={5}
                maxValue={maxValue}
                yAxisColor={isDark ? 'white' : '#333'}
                yAxisThickness={0}
                rulesType="dotted"
                rulesColor={isDark ? 'gray' : '#ccc'}
                yAxisTextStyle={{ color: isDark ? 'gray' : '#666' }}
                yAxisSide={0}
                xAxisColor={isDark ? 'lightgray' : '#999'}
                pointerConfig={{
                  pointerStripHeight: 130,
                  pointerStripColor: isDark ? 'lightgray' : '#666',
                  pointerStripWidth: 2,
                  pointerColor: isDark ? 'lightgray' : '#666',
                  radius: 6,
                  pointerLabelWidth: 100,
                  pointerLabelHeight: 90,
                  activatePointersOnLongPress: true,
                  autoAdjustPointerLabelPosition: false,
                  pointerLabelComponent: (items: any) => {
                    return (
                      <View
                        style={{
                          height: 90,
                          width: 100,
                          justifyContent: 'center',
                          marginTop: -30,
                          marginLeft: -40,
                        }}>
                        <Text
                          style={{
                            color: isDark ? 'white' : '#333',
                            fontSize: 14,
                            marginBottom: 6,
                            textAlign: 'center'
                          }}
                        >
                          {items[0].date}
                        </Text>

                        <View
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderRadius: 16,
                            backgroundColor: isDark ? 'white' : '#f0f0f0',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3,
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: 'bold',
                              textAlign: 'center',
                              color: '#333'
                            }}
                          >
                            {'₹' + items[0].value}
                          </Text>
                        </View>
                      </View>
                    );
                  },
                }}
              />
            </Card>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
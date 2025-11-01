import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/store/auth-context';
import { Link, Stack } from 'expo-router';
import { StarIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';
import { LineChart } from "react-native-gifted-charts";
import { useQuery } from '@tanstack/react-query';
import { getAllExpense } from '@/api/expense';
import { useMemo } from 'react';

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function Screen() {
  const { colorScheme } = useColorScheme();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', 'all'],
    queryFn: getAllExpense
  })

  const ptData = useMemo(() => {
    if (!data?.expenses) return [];

    return data.expenses.map((item, index) => {
      const value = item.amount / 100;

      const dateObj = new Date(item.date);
      const formattedDate = dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const shouldAddLabel = (index + 1) % 10 === 0;

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
  }, [data])

  return (
    <>
      <View className="flex-1 items-center justify-start gap-8 p-4">
        <View
          style={{
            paddingVertical: 100,
            paddingLeft: 20,
            backgroundColor: '#1C1C1C',
          }}>
          <LineChart
            areaChart
            data={ptData}
            rotateLabel
            width={300}
            hideDataPoints
            spacing={10}
            color="#00ff83"
            thickness={2}
            startFillColor="rgba(20,105,81,0.3)"
            endFillColor="rgba(20,85,81,0.01)"
            startOpacity={0.9}
            endOpacity={0.2}
            initialSpacing={0}
            noOfSections={6}
            maxValue={600}
            yAxisColor="white"
            yAxisThickness={0}
            rulesType="solid"
            rulesColor="gray"
            yAxisTextStyle={{ color: 'gray' }}
            yAxisSide={0}
            xAxisColor="lightgray"
            pointerConfig={{
              pointerStripHeight: 130,
              pointerStripColor: 'lightgray',
              pointerStripWidth: 2,
              pointerColor: 'lightgray',
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
                    <Text style={{ color: 'white', fontSize: 14, marginBottom: 6, textAlign: 'center' }}>
                      {items[0].date}
                    </Text>

                    <View style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: 'white' }}>
                      <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>
                        {'₹' + items[0].value}
                      </Text>
                    </View>
                  </View>
                );
              },
            }}
          />
        </View>
      </View>
    </>
  );
}

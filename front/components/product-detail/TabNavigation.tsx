import React from 'react';
import { StyleSheet } from 'react-native';
import { Button_old as Button, View } from '@components';
import { TABS, tabName } from '../../utils/common';
import useColorScheme from '../../hooks/useColorScheme';
import { Colors } from '@constants';

interface TabNavigationProps {
    tab: TABS;
    handlePressTab: (tab: TABS) => void;
    isLocal: boolean;
    /** 'all' = 전체(기본), 'left' = 활성 탭 포함 왼쪽, 'right' = 활성 이후 오른쪽 */
    group?: 'all' | 'left' | 'right';
    type?: 'hidden' | 'visible';
}

const TabNavigation: React.FC<TabNavigationProps> = ({
    tab,
    handlePressTab,
    isLocal,
    group = 'all',
    type = 'visible'
}) => {
    const colorScheme = useColorScheme();
    const styles = useStyles(colorScheme);

    // 1) 전체 탭 목록
    const allTabs = Object.values(TABS).filter(TAB => !(isLocal && TAB === TABS.QUESTION));
    // 2) 활성 index
    const activeIndex = Math.max(
        0,
        allTabs.findIndex(TAB => TAB === tab)
    );
    // 3) group에 따라 보여줄 탭 선택
    const visibleTabs =
        group === 'left'
            ? allTabs.slice(0, activeIndex + 1)
            : group === 'right'
            ? allTabs.slice(activeIndex + 1)
            : allTabs;

    return (
        <View style={styles.tabWrap}>
            {visibleTabs.map(TAB => (
                <View style={styles.tab} key={`Requests-Tab-${TAB}`}>
                    <Button
                        style={
                            type === 'visible' ? [styles.tabButton, tab === TAB && styles.tabButtonActive] : undefined
                        }
                        textStyle={
                            type === 'visible'
                                ? [styles.tabButtonText, tab === TAB && styles.tabButtonTextActive]
                                : undefined
                        }
                        variant="text"
                        title={tabName[TAB]}
                        size="medium"
                        color={tab === TAB ? 'primary' : 'tertiary'}
                        onPress={() => {
                            handlePressTab(TAB);
                        }}
                        accessible
                        accessibilityLabel={`${tabName[TAB]} 탭`}
                        accessibilityRole="tab"
                        selected={tab === TAB}
                    />
                </View>
            ))}
        </View>
    );
};

const useStyles = (colorScheme: 'light' | 'dark') =>
    StyleSheet.create({
        tabWrap: {
            flexDirection: 'row',
            alignContent: 'stretch',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: Colors[colorScheme].background.primary
        },
        tab: {
            flex: 1
        },
        tabButton: {
            paddingVertical: 16,
            flex: 1,
            flexDirection: 'row',
            borderRadius: 0,
            borderBottomWidth: 1,
            borderColor: Colors[colorScheme].border.third
        },
        tabButtonActive: {
            borderBottomColor: Colors[colorScheme].text.primary,
            borderBottomWidth: 2
        },
        tabButtonText: {
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 17,
            color: Colors[colorScheme].text.primary
        },
        tabButtonTextActive: {
            fontWeight: '700',
            color: Colors[colorScheme].text.primary
        }
    });

export default TabNavigation;

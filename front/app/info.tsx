/**
 * 내 정보 수정하기
 */
import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAtom } from 'jotai';

import { settingAtom } from '@stores';
import { Button, InfoForm, BackHeader, Footer } from '@components';

import type { ISetting } from '@types';

export default function InfoScreen() {
    const style = useStyle();
    const [setting, onSetting] = useAtom(settingAtom);

    const [payload, onPayload] = useState<ISetting>(setting || {});

    useEffect(
        function () {
            onPayload(function (prev) {
                return {
                    ...prev,
                    name: setting?.name,
                    vision: setting?.vision
                };
            });
        },
        [setting]
    );

    useEffect(() => {
        console.log('현재 payload 상태:', payload);
    }, [payload]);

    const onSubmit = useCallback(
        function () {
            console.log('(info)제출된 정보:', payload);

            onSetting(payload);
        },
        [payload, onSetting]
    );

    return (
        <View style={style.InfoScreenContainer}>
            <BackHeader />
            <View style={style.InfoScreenContent}>
                <InfoForm value={payload} onChange={onPayload} />
            </View>
            <Footer>
                <Button title="확인" onPress={onSubmit} />
            </Footer>
        </View>
    );
}

function useStyle() {
    return StyleSheet.create({
        InfoScreenContainer: {
            flex: 1,
            backgroundColor: '#fff'
        },
        InfoScreenContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }
    });
}

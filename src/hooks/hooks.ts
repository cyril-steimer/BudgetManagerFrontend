import {useNavigation} from 'react-router-dom';

export function useIsNavigating(): boolean {
    return useNavigation().state !== 'idle';
}

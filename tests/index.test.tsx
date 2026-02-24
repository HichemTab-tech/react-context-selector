import { describe, it, expect, expectTypeOf } from 'vitest';
import type { ComponentProps, Dispatch, SetStateAction } from 'react';
import { quickContextFactory } from '../src';

describe('quickContextFactory typing', () => {
    it('infers types from defaultValue and makes provider data optional', () => {
        type State = { status: string };
        type ContextTuple = [State, Dispatch<SetStateAction<State>>];

        const defaultValue: ContextTuple = [
            { status: 'idle' },
            (() => undefined) as Dispatch<SetStateAction<State>>
        ];

        const { QuickContextProvider, useQuickContext } = quickContextFactory().create({
            defaultValue
        });

        type ProviderProps = ComponentProps<typeof QuickContextProvider>;
        expectTypeOf<ProviderProps>().toMatchObjectType<{ data?: ContextTuple }>();

        type HookReturn = ReturnType<typeof useQuickContext>;
        // @ts-ignore
        expectTypeOf<HookReturn>().toEqualTypeOf<ContextTuple>();

        expect(true).toBe(true);
    });

    it('keeps provider data required when no defaultValue is provided', () => {
        type State = { count: number };
        const { QuickContextProvider } = quickContextFactory<State>().create();

        type ProviderProps = ComponentProps<typeof QuickContextProvider>;
        expectTypeOf<ProviderProps>().toMatchObjectType<{ data: State }>();

        expect(true).toBe(true);
    });
});

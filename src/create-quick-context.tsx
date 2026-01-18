import {createContext, type MyContextType as Context, useContextSelector} from "./context-selector";
import type {PropsWithChildren} from "react";

interface QuickContextProviderProps<ContextDataType> {
    data: ContextDataType
}

export function createQuickContext<ContextDataType>(options?: {
    name?: string
}) {

    if (typeof options?.name !== "undefined" && typeof options?.name !== "string") throw new Error(
        `createQuickContext: name must be a string`
    )

    let name = options?.name ?? 'QuickContext';
    name = name.charAt(0).toUpperCase() + name.slice(1);

    const QuickContext = createContext<ContextDataType>(undefined!);
    const QuickContextProvider = ({children, data}: PropsWithChildren<QuickContextProviderProps<ContextDataType>>) => {
        return (
            <QuickContext.Provider value={data}>
                {children}
            </QuickContext.Provider>
        );
    }

    function useQuickContext<T>(
        selector?: (value: ContextDataType) => T
    ): T extends ContextDataType ? ContextDataType : T {
        const context = useContextSelector<ContextDataType, T>(
            QuickContext as unknown as Context<ContextDataType>,
            selector ?? ((value) => value as unknown as T),
            undefined,
            () => {
                throw new Error(`use${name} must be used within a ${name}Provider`);
            }
        );
        return context as T extends ContextDataType ? ContextDataType : T;
    }

    return {QuickContext, QuickContextProvider, useQuickContext} as const;
}

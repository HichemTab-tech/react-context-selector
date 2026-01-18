import {createContext, type MyContextType as Context, useContextSelector} from "./context-selector";
import {type PropsWithChildren, type FC} from "react";

export interface QuickContextProviderProps<ContextDataType> {
    data: ContextDataType
}

export type DefaultResult<ContextDataType> = {
    QuickContext: Context<ContextDataType>,
    QuickContextProvider: (props: PropsWithChildren<QuickContextProviderProps<ContextDataType>>) => FC<PropsWithChildren<QuickContextProviderProps<ContextDataType>>>,
    useQuickContext: <T>(selector?: (value: ContextDataType) => T) => T extends ContextDataType ? ContextDataType : T
}

export type NamedResult<ContextDataType, Name extends string> = {
    [K in `${Capitalize<Name>}Context`]: Context<ContextDataType>
} & {
    [K in `${Capitalize<Name>}ContextProvider`]: FC<PropsWithChildren<QuickContextProviderProps<ContextDataType>>>
} & {
    [K in `use${Capitalize<Name>}Context`]: <T>(selector?: (value: ContextDataType) => T) => T extends ContextDataType ? ContextDataType : T
};

export interface Options<Name extends string>{
    name?: Name
}

export type QuickContextFactoryType<ContextDataType> = {
    create<Name extends string>(options: Options<Name>): NamedResult<ContextDataType, Name>;
    create(): DefaultResult<ContextDataType>;
    create<Name extends string>(options?: Options<Name>): DefaultResult<ContextDataType> | NamedResult<ContextDataType, Name>;
}

export function quickContextFactory<ContextDataType>() {

    return {
        create<Name extends string>(options?: Options<Name>): DefaultResult<ContextDataType> | NamedResult<ContextDataType, Name> {
            const name = options?.name ?? 'Quick';

            // noinspection SuspiciousTypeOfGuard
            if (typeof name !== "string") {
                throw new Error(`createQuickContext: name must be a string`);
            }

            const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

            return createQuickContext<ContextDataType, typeof capitalizedName>(capitalizedName);
        }
    } as QuickContextFactoryType<ContextDataType>
}

function createQuickContext<ContextDataType, Name extends string>(name: Name) {

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
                throw new Error(`use${name}Context must be used within a ${name}ContextProvider`);
            }
        );
        return context as T extends ContextDataType ? ContextDataType : T;
    }

    const result = {
        [`${name}Context`]: QuickContext,
        [`${name}ContextProvider`]: QuickContextProvider,
        [`use${name}Context`]: useQuickContext,
    };

    return result as any;
}

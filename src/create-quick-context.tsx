import {createContext, type MyContextType as Context, useContextSelector} from "./context-selector";
import {type PropsWithChildren} from "react";

interface QuickContextProviderProps<ContextDataType> {
    data: ContextDataType
}

type OptionNameContexted<T extends string> = `${T}Context`;
type OptionName<T extends string> = T extends `${string}Context` ? never : OptionNameContexted<T>;

interface Options<Name extends string>{
    name?: Name
}

export function quickContextFactory<ContextDataType>() {
    return {
        create: function <Name extends string>(options?: Options<Capitalize<OptionName<Name>>>) {
            // noinspection SuspiciousTypeOfGuard
            if (typeof options?.name !== "undefined" && typeof options?.name !== "string") throw new Error(
                `createQuickContext: name must be a string`
            )

            const name = (options?.name ?? 'Quick')+"Context";

            return createQuickContext<ContextDataType, Capitalize<Name>>({
                ...(options??{}),
                name: name.charAt(0).toUpperCase() + name.slice(1) as Capitalize<Name>
            });
        }
    }
}

function createQuickContext<ContextDataType, Name extends string>(options: Required<Options<Name>>) {

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
                throw new Error(`use${options.name} must be used within a ${options.name}Provider`);
            }
        );
        return context as T extends ContextDataType ? ContextDataType : T;
    }

    return {
        [options.name]: QuickContext as Context<ContextDataType>,
        [options.name+"Provider"]: QuickContextProvider,
        ["use"+options.name]: useQuickContext
    } as {
        [K in Name]: typeof QuickContext
    } & {
        [K in `${Name}Provider`]: typeof QuickContextProvider
    } & {
        [K in `use${Name}`]: typeof useQuickContext
    };
}

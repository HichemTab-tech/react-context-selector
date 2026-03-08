import {
    createContext,
    type MyContextType as Context,
    useContextSelector,
    useContextStore as useCtxStore
} from "./context-selector";
import {type PropsWithChildren, type FC, type ComponentProps} from "react";
import type {StoreType} from "./context-selector";

type ProviderDataProp<ContextDataType, RequiresData extends boolean> = RequiresData extends true
    ? {data: NonNullable<ContextDataType>}
    : {data?: NonNullable<ContextDataType>};

type QuickContextProviderProps<ContextDataType, RequiresData extends boolean = true> =
    Omit<ComponentProps<ReturnType<typeof createContext<ContextDataType>>['Provider']>, "value"> &
    ProviderDataProp<ContextDataType, RequiresData>;

export type DefaultResult<ContextDataType, RequiresData extends boolean = true> = {
    QuickContext: Context<ContextDataType>,
    QuickContextProvider: FC<PropsWithChildren<QuickContextProviderProps<ContextDataType, RequiresData>>>,
    useQuickContext: <T = ContextDataType>(selector?: (value: ContextDataType) => T) => T extends ContextDataType ? ContextDataType : T,
    useQuickContextStore: () => StoreType<ContextDataType>
}

export type NamedResult<ContextDataType, Name extends string, RequiresData extends boolean = true> = {
    [K in `${Capitalize<Name>}Context`]: Context<ContextDataType>
} & {
    [K in `${Capitalize<Name>}ContextProvider`]: FC<PropsWithChildren<QuickContextProviderProps<ContextDataType, RequiresData>>>
} & {
    [K in `use${Capitalize<Name>}Context`]: <T = ContextDataType>(selector?: (value: ContextDataType) => T) => T extends ContextDataType ? ContextDataType : T
} & {
    [K in `use${Capitalize<Name>}ContextStore`]: () => StoreType<ContextDataType>
};

export interface Options<Name extends string, ContextDataType = unknown> {
    name?: Name,
    compareUsing?: ((a: any, b: any) => boolean)|"isObject",
    defaultValue?: ContextDataType
}


type StripName<T> = Omit<T, 'name'>;

type InternalOptions<ContextDataType> = {
    compareUsing?: ((a: any, b: any) => boolean)|"isObject",
    defaultValue?: ContextDataType
};

type OptionsWithDefault<Name extends string, ContextDataType> = Omit<Options<Name, ContextDataType>, 'defaultValue'> & {defaultValue: ContextDataType};
type OptionsWithoutDefault<Name extends string, ContextDataType> = Omit<Options<Name, ContextDataType>, 'defaultValue'> & {defaultValue?: undefined};

type NamedOptionsWithDefault<Name extends string, ContextDataType> = OptionsWithDefault<Name, ContextDataType> & {name: Name};
type NamedOptionsWithoutDefault<Name extends string, ContextDataType> = OptionsWithoutDefault<Name, ContextDataType> & {name: Name};

const DEFAULT_CONTEXT_NAME = 'Quick' as const;
type DefaultContextName = typeof DEFAULT_CONTEXT_NAME;

function omitName<T extends {name?: string}>(opts: T): Omit<T, 'name'> {
    const {name: _ignored, ...rest} = opts;
    return rest;
}

export type QuickContextFactoryType<ContextDataType = never> = {
    create<TContext = ContextDataType>(options: OptionsWithDefault<DefaultContextName, TContext>): DefaultResult<TContext, false>;
    create<TContext = ContextDataType>(options?: OptionsWithoutDefault<DefaultContextName, TContext>): DefaultResult<TContext>;
    create<Name extends string, TContext = ContextDataType>(options: NamedOptionsWithDefault<Name, TContext>): NamedResult<TContext, Name, false>;
    create<Name extends string, TContext = ContextDataType>(options: NamedOptionsWithoutDefault<Name, TContext>): NamedResult<TContext, Name>;
}

// noinspection JSUnusedGlobalSymbols
export function quickContextFactory<ContextDataType = never>() {

    function create<TContext = ContextDataType>(options: OptionsWithDefault<DefaultContextName, TContext>): DefaultResult<TContext, false>;
    function create<TContext = ContextDataType>(options?: OptionsWithoutDefault<DefaultContextName, TContext>): DefaultResult<TContext>;
    function create<Name extends string, TContext = ContextDataType>(options: NamedOptionsWithDefault<Name, TContext>): NamedResult<TContext, Name, false>;
    function create<Name extends string, TContext = ContextDataType>(options: NamedOptionsWithoutDefault<Name, TContext>): NamedResult<TContext, Name>;
    function create<Name extends string = DefaultContextName, TContext = ContextDataType, TOptions extends Options<Name, TContext> = OptionsWithoutDefault<Name, TContext>>(options?: TOptions) {
        const name = options?.name ?? DEFAULT_CONTEXT_NAME;

        // noinspection SuspiciousTypeOfGuard
        if (typeof name !== "string") {
            throw new Error(`createQuickContext: name must be a string`);
        }

        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        const sanitizedOptions: StripName<TOptions> = options ? omitName(options) : {} as StripName<TOptions>;

        type ProviderRequiresData = StripName<TOptions> extends {defaultValue: TContext} ? false : true;

        return createQuickContext<TContext, Capitalize<Name>, StripName<TOptions>, ProviderRequiresData>(
            capitalizedName as Capitalize<Name>,
            sanitizedOptions
        );
    }

    return {create} as QuickContextFactoryType<ContextDataType>
}

function createQuickContext<ContextDataType, Name extends string, OptionsType extends InternalOptions<ContextDataType>, RequiresData extends boolean>(
    name: Name,
    options: OptionsType
) {

    const QuickContext = createContext<ContextDataType>((options.defaultValue ?? undefined) as any);
    const QuickContextProvider = ({data, ...props}: PropsWithChildren<QuickContextProviderProps<ContextDataType, RequiresData>>) => {
        const value = (data !== undefined ? data : options.defaultValue) as ContextDataType;
        return (
            <QuickContext.Provider value={value} {...props}/>
        );
    }

    function useQuickContext<T>(
        selector?: (value: ContextDataType) => T,
        compareUsing?: (a: T, b: T) => boolean
    ): T extends ContextDataType ? ContextDataType : T {
        let cu: ((a: T, b: T) => boolean)|undefined = undefined;
        if (typeof options.compareUsing === "function") {
            cu = options.compareUsing;
        }
        else if (options.compareUsing === "isObject") {
            cu = (a, b) => Object.is(a, b);
        }
        const context = useContextSelector<ContextDataType, T>(
            QuickContext as unknown as Context<ContextDataType>,
            selector ?? ((value) => value as unknown as T),
            compareUsing??cu,
            () => {
                throw new Error(`use${name}Context must be used within a ${name}ContextProvider`);
            }
        );
        return context as T extends ContextDataType ? ContextDataType : T;
    }

    function useQuickContextStore(): StoreType<ContextDataType> {
        return useCtxStore(QuickContext as unknown as Context<ContextDataType>, () => {
            throw new Error(`use${name}ContextStore must be used within a ${name}ContextProvider`);
        });
    }

    const result = {
        [`${name}Context`]: QuickContext,
        [`${name}ContextProvider`]: QuickContextProvider,
        [`use${name}Context`]: useQuickContext,
        [`use${name}ContextStore`]: useQuickContextStore,
    };

    return result as any;
}

import React, {
    type ComponentProps,
    type Context as C,
    createContext as cC, type PropsWithChildren, type ReactNode, useCallback,
    useEffect,
    useMemo, useRef,
    useSyncExternalStore
} from "react";
import isEqual from "react-fast-compare";

type ValueOrSetter<T> = T | ((prev: T) => T);

type StoreType<T> = ReturnType<typeof createContextStore<T>>;

function createContextStore<T>(initialValue: T) {
    let value = initialValue;
    let listeners = new Set<() => void>();
    return {
        get: () => value,
        set: (newValue: ValueOrSetter<T>) => {
            if (typeof newValue === 'function') value = (newValue as (prev: T) => T)(value);
            else value = newValue;
            listeners.forEach(l => l());
        },
        subscribe: (callback: () => void) => {
            listeners.add(callback);
            return () => listeners.delete(callback);
        },
        clear: () => listeners.clear(),
        listeners
    } as const;
}

export type MyContextType<V> = {
    Provider: (props: PropsWithChildren<{value: V}>) => ReactNode;
    MyContext: C<StoreType<V>>;
}

const err = {
    error: "Value can't be a function",
} as const;

// noinspection JSUnusedGlobalSymbols
export function createContext<V>(initialValue: V extends Function ? typeof err: V): MyContextType<V> {
    const MyContext = cC<StoreType<V>>(undefined as unknown as StoreType<V>);
    const Context = cC<V>(initialValue as V);

    return {
        Provider: function Provider({children, value}: Omit<ComponentProps<typeof Context.Provider>, 'value'> & {value: V}) {
            const store = useMemo(() => {
                return createContextStore(value);
            }, []);

            useEffect(() => {
                store.set(value);
            }, [value, store]);

            return <MyContext.Provider value={store}>{children}</MyContext.Provider>
        },
        MyContext,
    } as const;
}

export type NoContextCallback = () => void;

// noinspection JSUnusedGlobalSymbols
export function useContext<V>(context: MyContextType<V>, noContextCallback?: NoContextCallback) {
    return useContextSelector(context, undefined, isEqual, noContextCallback);
}

export function useContextSelector<V, T = V>(
    context: MyContextType<V>,
    selector?: (value: V) => T,
    compareUsing: (a: T, b: T) => boolean = isEqual,
    noContextCallback?: NoContextCallback
): T {
    const myContext = React.useContext(context.MyContext);
    if (!noContextCallback) {
        noContextCallback = () => {
            throw new Error("useContextSelector must be used inside Context.Provider")
        };
    }
    if (!myContext) {
        noContextCallback();
    }
    if (!selector) selector = ((x) => x as unknown as T);
    const cachedValue = useRef<T>(selector(myContext.get()));
    const getter = () => {
        const value = myContext.get();
        if (compareUsing(selector(value), cachedValue.current)) return cachedValue.current;
        cachedValue.current = selector(value);

        return cachedValue.current;
    };
    const serverGetter = useCallback(() => cachedValue.current, []);
    return useSyncExternalStore(myContext.subscribe, getter, serverGetter)
}

export function useContextStore<V>(
    context: MyContextType<V>,
    noContextCallback?: NoContextCallback
): StoreType<V> {
    const myContext = React.useContext(context.MyContext);
    if (!noContextCallback) {
        noContextCallback = () => {
            throw new Error("useContextStore must be used inside Context.Provider")
        };
    }
    if (!myContext) {
        noContextCallback();
    }

    return myContext;
}

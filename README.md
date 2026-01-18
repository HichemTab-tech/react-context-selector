# React Context Selector

*A lightweight React utility that provides a real context selector hook. Unlike useContext, it lets components subscribe to only the part of context they need, avoiding unnecessary re-renders for better performance.*

**Why choose this over use-context-selector?** This package provides true re-render prevention by using deep equality comparison (react-fast-compare) instead of Object.is, ensuring components only re-render when their selected data actually changes.

## Getting Started

Start by installing the package via your preferred package manager:

```sh
npm install react-ctx-selector
```

or, if using pnpm:

```sh
pnpm add react-ctx-selector
```

## ☕ 60-Second TL;DR

Show a minimal but practical example that someone can copy-paste to immediately see results:

```javascript
import { createContext, useContextSelector } from 'react-ctx-selector';

const MyContext = createContext({ name: 'John', age: 25 });

export default function Demo() {
  // Only re-renders when 'name' changes, not when 'age' changes
  const name = useContextSelector(MyContext, (state) => state.name);
  return <div>Hello, {name}!</div>;
}
```

## Usage

Provide a more detailed usage example:

```javascript
import { createContext, useContextSelector } from 'react-ctx-selector';
import { useState } from 'react';

const MyContext = createContext({ name: 'John', age: 25 });

function Provider() {
  const [state, setState] = useState({ name: 'John', age: 25 });

  return <MyContext.Provider value={[state, setState]}>{children}</MyContext.Provider>;
}

function ComponentName() {
  // Only re-renders when 'name' changes, not when 'age' changes
  const name = useContextSelector(MyContext, (context) => context[0].name);
  return <div>Hello, {name}!</div>;
}

function ComponentAge() {
  // Only re-renders when 'name' changes, not when 'age' changes
  const age = useContextSelector(MyContext, (context) => context[0].name);
  return <div>You are, {age} old!</div>;
}

function Changer() {
  const set = useContextSelector(MyContext, (context) => context[1]);

  return (
    <>
      <button onClick={() => set(prev => ({...prev, name:prev.name+"-new"}))}>Change Name</button>
      <button onClick={() => set(prev => ({...prev, age:prev.age+1}))}>Increment Age</button>
    </>
  )
}

export default function Demo() {
  return (
    <Provider>
      <ComponentName />
      <ComponentAge />
      <Changer />
      {/* the rest ...*/}
    </Provider>
  )
}
```

## API Reference

### Function `createContext(initialValue)`

Creates a context with selector capabilities that prevents unnecessary re-renders.

**Parameters:**

| Parameter      | Type | Description                        |
|----------------|------|------------------------------------|
| `initialValue` | any  | The initial value for the context. |

**Returns:**

- Type: `MyContextType<V>`
- An object containing `Provider` component and `MyContext` for advanced usage.

**Example:**

```javascript
import { createContext } from 'react-ctx-selector';

const MyContext = createContext({ count: 0, name: 'Initial' });
```

### Function `useContextSelector(context, selector?, compareUsing?)`

Hook that subscribes to a specific part of context,
preventing re-renders when unselected parts change.

**Parameters:**

| Parameter      | Type                       | Description                                         |
|----------------|----------------------------|-----------------------------------------------------|
| `context`      | MyContextType<V>           | Context created with `createContext`                |
| `selector`     | (value: V) => T (optional) | Function to select specific part of context         |
| `compareUsing` | (a: T, b: T) => boolean    | Custom comparison function (defaults to deep equal) |

**Returns:**

- Type: `T` (selected value type)
- The selected value from context that will trigger re-renders only when it changes.

**Example:**

```javascript
import { useContextSelector } from 'react-ctx-selector';

// Select entire context
const fullState = useContextSelector(MyContext);

// Select specific property
const count = useContextSelector(MyContext, (state) => state.count);

// Custom comparison
const user = useContextSelector(
  MyContext, 
  (state) => state.user,
  (a, b) => a.id === b.id // Only re-render if user ID changes
);
```

### Function `useContext(context)`

Alternative hook that selects the entire context value
(equivalent to `useContextSelector` without a selector).

**Parameters:**

| Parameter | Type             | Description                          |
|-----------|------------------|--------------------------------------|
| `context` | MyContextType<V> | Context created with `createContext` |

**Returns:**

- Type: `V`
- The complete context value.

**Example:**

```javascript
import { useContext } from 'react-ctx-selector';

const entireContext = useContext(MyContext);
```

### Function `useContextStore(context, noContextCallback)`

Returns the context store instance. This is useful when you need to interact with the store directly, for example, to set a value from a component that doesn't need to subscribe to changes. While this can be achieved by using React's normal `useContext` on the `MyContext` object, `useContextStore` provides a more direct and explicit way to access the store.

**Parameters:**

| Parameter           | Type               | Description                                                                                          |
|---------------------|--------------------|------------------------------------------------------------------------------------------------------|
| `context`           | `MyContextType<V>` | The context created by `createContext`.                                                              |
| `noContextCallback` | `() => void`       | (Optional) A callback function that is called when the hook is used outside of the context provider. |

**Returns:**

The context store, which is an object with the following methods:
- `get(): V`: Returns the current value of the context.
- `set(newValue: V | ((prev: V) => V))`: Sets the value of the context. It can take a new value or a function that receives the previous value and returns the new one.
- `subscribe(callback: () => void): () => void`: Subscribes a listener to the store. Returns a function to unsubscribe.

**Example:**

```javascript
import { createContext, useContextStore } from 'react-ctx-selector';

const MyContext = createContext({ name: 'John', age: 25 });

function AgeChanger() {
  const store = useContextStore(MyContext);

  return (
    <button onClick={() => store.set(prev => ({...prev, age: prev.age + 1}))}>
      Increment Age
    </button>
  );
}
```

### `quickContextFactory<ContextDataType>()`

A utility that provides a `create` method to simplify the creation of a context, provider, and hook. It's a quick way to set up a context without boilerplate, with type inference for the returned objects.

**Returns:**

An object with a `create` method.

#### `create(options?)`

**Parameters:**

| Parameter | Type                | Description                                                                                                                                                              |
|-----------|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `options` | `{ name?: string }` | Optional configuration. `name` is used to generate the names of the returned context, provider, and hook (e.g., `name: 'Shared'` results in `SharedContext`, `SharedContextProvider`, and `useSharedContext`). |

**Returns:**

- If `name` is **not** provided, an object containing:
    - `QuickContext`: The created React context.
    - `QuickContextProvider`: A provider component.
    - `useQuickContext`: A hook to access the context value.
    - `useQuickContextStore`: A hook to access the context store.
- If `name` **is** provided (e.g., `'Shared'`), an object containing:
    - `SharedContext`: The created React context.
    - `SharedContextProvider`: A provider component.
    - `useSharedContext`: A hook to access the context value.
    - `useSharedContextStore`: A hook to access the context store.

**Example (Default):**

```tsx
import { quickContextFactory } from 'react-ctx-selector';

// 1. Create the context
const { QuickContextProvider, useQuickContext, useQuickContextStore } = quickContextFactory<{
  user: { name: string; age: number };
  theme: string;
}>().create();

// 2. Use the provider
function App() {
  const data = {
    user: { name: 'Hichem', age: 25 },
    theme: 'dark',
  };

  return (
    <QuickContextProvider data={data}>
      <UserProfile />
      <ThemeChanger />
    </QuickContextProvider>
  );
}

// 3. Consume context with the hook
function UserProfile() {
  const user = useQuickContext((state) => state.user);
  return <div>Hello, {user.name}!</div>;
}

function ThemeChanger() {
    const store = useQuickContextStore();
    return <button onClick={() => store.set(s => ({...s, theme: s.theme === 'dark' ? 'light' : 'dark'}))}>Toggle Theme</button>
}
```

**Example (With Name):**

```tsx
import { quickContextFactory } from 'react-ctx-selector';

// 1. Create the context with a name
const { SharedContextProvider, useSharedContext, useSharedContextStore } = quickContextFactory<{
  user: { name: string; age: number };
}>().create({ name: 'Shared' });

// 2. Use the provider
function App() {
  const data = { user: { name: 'Hichem', age: 25 } };

  return (
    <SharedContextProvider data={data}>
      <UserProfile />
      <AgeChanger />
    </SharedContextProvider>
  );
}

// 3. Consume context with the named hook
function UserProfile() {
  const user = useSharedContext((state) => state.user);
  return <div>Hello, {user.name}!</div>;
}

function AgeChanger() {
    const store = useSharedContextStore();
    return <button onClick={() => store.set(s => ({...s, user: {...s.user, age: s.user.age + 1}}))}>Increment Age</button>
}
```

## 🎯 Best Practices

### Separate Provider State to Prevent Children Re-renders

**Important:** To maximize performance and prevent unnecessary re-renders of all children, it's recommended to separate the Provider component and its state management into different components.

#### ❌ Not Recommended - Provider with inline state

```javascript
function App() {
  const [state, setState] = useState({ name: 'John', age: 25 });
  
  return (
    <MyContext.Provider value={[state, setState]}>
      <ChildComponent1 />
      <ChildComponent2 />
      <ChildComponent3 />
      {/* All these children will re-render when App re-renders */}
    </MyContext.Provider>
  );
}
```

#### ✅ Recommended - Separated Provider Component

```javascript
// Separate Provider component
function MyProvider({ children }) {
  const [state, setState] = useState({ name: 'John', age: 25 });
  
  return (
    <MyContext.Provider value={[state, setState]}>
      {children}
    </MyContext.Provider>
  );
}

// Main App component
function App() {
  // This component can re-render without affecting the context children
  return (
    <MyProvider>
      <ChildComponent1 />
      <ChildComponent2 />
      <ChildComponent3 />
      {/* These children won't re-render when App re-renders */}
    </MyProvider>
  );
}
```

**Why this matters:**
- When the Provider's state is managed in the same component as other UI logic, any re-render of that component will also re-render all Provider children
- By separating the Provider into its own component, you isolate the context state management from other rendering triggers
- This pattern works perfectly with `useContextSelector` to provide maximum performance optimization

## ❓ FAQ

**How is this different from use-context-selector?**
This package uses deep equality comparison (react-fast-compare) instead of Object.is,
providing true re-render prevention when context values are objects or arrays that may be recreated but contain the same data.

**Can I use custom comparison functions?**
Yes!
The `useContextSelector` hook accepts a third parameter `compareUsing` where you can provide your own comparison logic.

**Does this work with Server-Side Rendering (SSR)?**
Yes,
the package uses `useSyncExternalStore` with proper server-side snapshot handling to ensure SSR compatibility.

**What's the performance impact?**
Minimal.
The package uses efficient subscription patterns and only runs comparisons when the context value changes,
not on every render.

## Issues

If you encounter any issue,
please open an issue [here](https://github.com/HichemTab-tech/react-context-selector/issues).

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) file for more details.

&copy; 2025 [Hichem Taboukouyout](mailto:hichem.taboukouyout@hichemtab-tech.me)

---

_If you found this package helpful, consider leaving a star! ⭐️_

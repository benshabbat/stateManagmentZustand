# מדריך Zustand למתחילים - State Management גלובלי ב-React

> תרגיל מעשי שלב-שלב | React + Vite + Zustand

---

## מה זה Zustand?

**Zustand** (גרמנית: "מצב") היא ספרייה קטנה וקלה לניהול State גלובלי ב-React.  
במקום להעביר props מקומפוננטה לקומפוננטה (prop drilling), אתה מגדיר **חנות מרכזית (store)** שכל קומפוננטה יכולה לגשת אליה ישירות.

**למה Zustand ולא Redux?**
- פחות boilerplate
- API פשוט ואינטואיטיבי
- גודל קטן מאוד (1KB)
- אין צורך ב-Provider

---

## מבנה הפרויקט הסופי

```
src/
├── stores/
│   ├── useCounterStore.js     ← Store 1: Counter פשוט
│   └── useTodoStore.js        ← Store 2: רשימת מטלות
├── components/
│   ├── counter/
│   │   ├── Counter.jsx        ← מציג את הספירה
│   │   ├── CounterControls.jsx ← כפתורי +/-/reset
│   │   └── CounterDisplay.jsx  ← תצוגה מעוצבת
│   └── todo/
│       ├── TodoApp.jsx        ← ראשי Todo
│       ├── TodoInput.jsx      ← שדה הוספת מטלה
│       ├── TodoList.jsx       ← רשימת מטלות
│       └── TodoItem.jsx       ← פריט בודד
├── App.jsx
└── App.css
```

---

## שלב 0 - הכנה

```bash
# צור פרויקט חדש
npm create vite@latest my-zustand-app
cd my-zustand-app
npm install

# התקן Zustand
npm install zustand
```
3 minutes [v]

---

## שלב 1 - Counter Store (הכרת הבסיס)

> **מטרה:** להבין איך Zustand עובד עם דוגמה פשוטה.

### 1.1 - צור את הקובץ `src/stores/useCounterStore.js`

```js
import { create } from 'zustand'

const useCounterStore = create((set) => ({
  // STATE - המצב הנוכחי
  count: 0,

  // ACTIONS - פעולות שמשנות את ה-state
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  incrementByAmount: (amount) => set((state) => ({ count: state.count + amount })),
}))

export default useCounterStore
```

**הסבר:**
- `create()` - יוצר חנות (store) חדשה
- `set` - פונקציה לעדכון ה-state (כמו setState ב-useState)
- ה-store מחזיר hook שאפשר להשתמש בו בכל קומפוננטה

---

### 1.2 - צור `src/components/counter/Counter.jsx`

```jsx
import useCounterStore from '../../stores/useCounterStore'

function Counter() {
  // שולף מה-store רק את מה שצריך
  const count = useCounterStore((state) => state.count)
  const increment = useCounterStore((state) => state.increment)
  const decrement = useCounterStore((state) => state.decrement)
  const reset = useCounterStore((state) => state.reset)

  return (
    <div className="counter-card">
      <h2>Counter פשוט</h2>
      <div className="count-display">{count}</div>
      <div className="counter-buttons">
        <button onClick={decrement}>-</button>
        <button onClick={reset} className="reset-btn">Reset</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  )
}

export default Counter
```

> **טיפ חשוב:** `useCounterStore((state) => state.count)` - כך בוחרים רק חלק מה-store (selector).  
> הקומפוננטה תרנדר מחדש **רק** כשה-`count` משתנה, לא כשפעולות אחרות קורות.

---

### 1.3 - תרגיל: CounterControls מופרד

צור `src/components/counter/CounterControls.jsx` - קומפוננטה שמכילה **רק** את הכפתורים, **ללא** הצגת הספירה:

```jsx
import useCounterStore from '../../stores/useCounterStore'

function CounterControls() {
  const { increment, decrement, reset, incrementByAmount } = useCounterStore()

  return (
    <div className="counter-controls">
      <button onClick={() => incrementByAmount(5)}>+5</button>
      <button onClick={() => incrementByAmount(10)}>+10</button>
      <button onClick={() => incrementByAmount(-5)}>-5</button>
      <button onClick={reset}>איפוס</button>
    </div>
  )
}

export default CounterControls
```

> **שים לב:** שתי הקומפוננטות (`Counter` ו-`CounterControls`) מחוברות לאותו store.  
> לחיצה בכל אחת מהן תעדכן את שתיהן - **זה הכוח של State גלובלי!**

---

### 1.4 - תרגיל: CounterDisplay - קומפוננטה "טיפשה"

צור `src/components/counter/CounterDisplay.jsx` - קומפוננטה שמציגה הודעה לפי ערך הספירה:

```jsx
import useCounterStore from '../../stores/useCounterStore'

function CounterDisplay() {
  const count = useCounterStore((state) => state.count)

  const getMessage = () => {
    if (count > 10) return '🔥 גבוה!'
    if (count < 0) return '❄️ שלילי!'
    if (count === 0) return '⚡ אפס'
    return '✅ חיובי'
  }

  return (
    <div className="counter-display-panel">
      <p>ערך נוכחי: <strong>{count}</strong></p>
      <p>סטטוס: {getMessage()}</p>
    </div>
  )
}

export default CounterDisplay
```

---

## שלב 2 - Todo Store (רמה מתקדמת)

> **מטרה:** Store עם מערכים, פעולות מורכבות יותר, ו-derived state.

### 2.1 - צור `src/stores/useTodoStore.js`

```js
import { create } from 'zustand'

const useTodoStore = create((set, get) => ({
  // STATE
  todos: [],
  filter: 'all', // 'all' | 'active' | 'completed'

  // ACTIONS - ניהול מטלות
  addTodo: (text) => {
    if (!text.trim()) return // ולידציה
    set((state) => ({
      todos: [
        ...state.todos,
        {
          id: Date.now(),
          text: text.trim(),
          completed: false,
          createdAt: new Date().toLocaleDateString('he-IL'),
        },
      ],
    }))
  },

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  clearCompleted: () =>
    set((state) => ({
      todos: state.todos.filter((todo) => !todo.completed),
    })),

  // ACTIONS - פילטר
  setFilter: (filter) => set({ filter }),

  // DERIVED STATE - חישובים על בסיס ה-state
  getFilteredTodos: () => {
    const { todos, filter } = get() // get() קורא את ה-state הנוכחי
    if (filter === 'active') return todos.filter((t) => !t.completed)
    if (filter === 'completed') return todos.filter((t) => t.completed)
    return todos
  },

  getStats: () => {
    const { todos } = get()
    return {
      total: todos.length,
      completed: todos.filter((t) => t.completed).length,
      active: todos.filter((t) => !t.completed).length,
    }
  },
}))

export default useTodoStore
```

**חדש כאן:**
- `get` - מאפשר לקרוא את ה-state הנוכחי מתוך פונקציות
- Derived state - פונקציות שמחשבות ערכים מה-state
- ולידציה (`if (!text.trim()) return`)

---

### 2.2 - צור `src/components/todo/TodoInput.jsx`

```jsx
import { useState } from 'react'
import useTodoStore from '../../stores/useTodoStore'

function TodoInput() {
  const [inputValue, setInputValue] = useState('') // state לוקלי לשדה הקלט
  const addTodo = useTodoStore((state) => state.addTodo)

  const handleSubmit = (e) => {
    e.preventDefault()
    addTodo(inputValue)
    setInputValue('') // ניקוי השדה
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="הוסף מטלה חדשה..."
        className="todo-input"
      />
      <button type="submit" className="add-btn">הוסף</button>
    </form>
  )
}

export default TodoInput
```

> **מושג חשוב:** `inputValue` הוא state **לוקלי** (useState) כי הוא שייך רק לקומפוננטה הזו.  
> המטלות עצמן הן state **גלובלי** (Zustand) כי כולם צריכים גישה אליהן.

---

### 2.3 - צור `src/components/todo/TodoItem.jsx`

```jsx
import useTodoStore from '../../stores/useTodoStore'

function TodoItem({ todo }) {
  const toggleTodo = useTodoStore((state) => state.toggleTodo)
  const deleteTodo = useTodoStore((state) => state.deleteTodo)

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
      />
      <span className="todo-text">{todo.text}</span>
      <span className="todo-date">{todo.createdAt}</span>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="delete-btn"
        aria-label="מחק מטלה"
      >
        ✕
      </button>
    </li>
  )
}

export default TodoItem
```

---

### 2.4 - צור `src/components/todo/TodoList.jsx`

```jsx
import useTodoStore from '../../stores/useTodoStore'
import TodoItem from './TodoItem'

function TodoList() {
  const getFilteredTodos = useTodoStore((state) => state.getFilteredTodos)
  const filter = useTodoStore((state) => state.filter)
  const setFilter = useTodoStore((state) => state.setFilter)
  const getStats = useTodoStore((state) => state.getStats)
  const clearCompleted = useTodoStore((state) => state.clearCompleted)

  const filteredTodos = getFilteredTodos()
  const stats = getStats()

  return (
    <div className="todo-list-container">
      {/* סטטיסטיקות */}
      <div className="todo-stats">
        <span>סה״כ: {stats.total}</span>
        <span>פעילות: {stats.active}</span>
        <span>הושלמו: {stats.completed}</span>
      </div>

      {/* פילטרים */}
      <div className="todo-filters">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
          >
            {f === 'all' ? 'הכל' : f === 'active' ? 'פעילות' : 'הושלמו'}
          </button>
        ))}
      </div>

      {/* רשימה */}
      {filteredTodos.length === 0 ? (
        <p className="empty-message">אין מטלות להציג 🎉</p>
      ) : (
        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}

      {/* ניקוי */}
      {stats.completed > 0 && (
        <button onClick={clearCompleted} className="clear-btn">
          נקה הושלמו ({stats.completed})
        </button>
      )}
    </div>
  )
}

export default TodoList
```

---

### 2.5 - צור `src/components/todo/TodoApp.jsx`

```jsx
import TodoInput from './TodoInput'
import TodoList from './TodoList'

function TodoApp() {
  return (
    <div className="todo-app">
      <h2>רשימת מטלות</h2>
      <TodoInput />
      <TodoList />
    </div>
  )
}

export default TodoApp
```

---

## שלב 3 - חיבור ב-App.jsx

### 3.1 - עדכן `src/App.jsx`

```jsx
import Counter from './components/counter/Counter'
import CounterControls from './components/counter/CounterControls'
import CounterDisplay from './components/counter/CounterDisplay'
import TodoApp from './components/todo/TodoApp'
import './App.css'

function App() {
  return (
    <div className="app">
      <header>
        <h1>Zustand - State Management</h1>
        <p>תרגיל מעשי למתחילים</p>
      </header>

      <main>
        {/* חלק 1: Counter */}
        <section className="section">
          <h2 className="section-title">חלק 1: Counter גלובלי</h2>
          <p className="section-desc">
            שלוש קומפוננטות שמחוברות לאותו store - שנה ערך באחת וראה את האחרות מתעדכנות!
          </p>
          <div className="counter-grid">
            <Counter />
            <CounterDisplay />
            <CounterControls />
          </div>
        </section>

        {/* חלק 2: Todo */}
        <section className="section">
          <h2 className="section-title">חלק 2: רשימת מטלות</h2>
          <p className="section-desc">
            Store מורכב עם מערכים, פילטרים וסטטיסטיקות.
          </p>
          <TodoApp />
        </section>
      </main>
    </div>
  )
}

export default App
```

---

### 3.2 - עדכן `src/App.css`

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background: #f0f4f8;
  direction: rtl;
  color: #2d3748;
}

.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

header h1 {
  font-size: 2rem;
  color: #5b4fcf;
}

header p {
  color: #718096;
  margin-top: 0.5rem;
}

/* Sections */
.section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.section-title {
  font-size: 1.3rem;
  color: #5b4fcf;
  margin-bottom: 0.5rem;
}

.section-desc {
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

/* Counter */
.counter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.counter-card {
  background: #f7f5ff;
  border: 2px solid #e9e3ff;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
}

.counter-card h2 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #5b4fcf;
}

.count-display {
  font-size: 3rem;
  font-weight: bold;
  color: #5b4fcf;
  margin: 1rem 0;
}

.counter-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.counter-buttons button,
.counter-controls button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: #5b4fcf;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.counter-buttons button:hover,
.counter-controls button:hover {
  background: #4a3db5;
}

.reset-btn {
  background: #e53e3e !important;
}

.counter-display-panel {
  background: #f7f5ff;
  border: 2px solid #e9e3ff;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  justify-content: center;
}

.counter-controls {
  background: #f7f5ff;
  border: 2px solid #e9e3ff;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-content: center;
  justify-content: center;
}

/* Todo */
.todo-app {
  max-width: 600px;
  margin: 0 auto;
}

.todo-app h2 {
  margin-bottom: 1rem;
  color: #5b4fcf;
}

.todo-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.todo-input {
  flex: 1;
  padding: 0.6rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.todo-input:focus {
  outline: none;
  border-color: #5b4fcf;
}

.add-btn {
  padding: 0.6rem 1.2rem;
  background: #5b4fcf;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.add-btn:hover {
  background: #4a3db5;
}

.todo-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 0.75rem;
}

.todo-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-btn {
  padding: 0.3rem 0.8rem;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #5b4fcf;
  color: white;
  border-color: #5b4fcf;
}

.todo-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #a0aec0;
}

.todo-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #5b4fcf;
}

.todo-text {
  flex: 1;
}

.todo-date {
  font-size: 0.75rem;
  color: #a0aec0;
}

.delete-btn {
  padding: 0.2rem 0.5rem;
  background: #fed7d7;
  color: #e53e3e;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.delete-btn:hover {
  background: #e53e3e;
  color: white;
}

.empty-message {
  text-align: center;
  color: #a0aec0;
  padding: 2rem;
}

.clear-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #fed7d7;
  color: #e53e3e;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
}

.clear-btn:hover {
  background: #e53e3e;
  color: white;
}
```

---

## שלב 4 - הרצה

```bash
npm run dev
```

פתח `http://localhost:5173` בדפדפן.

---

## שלב 5 - תרגילים להרחבה

### תרגיל א׳ - Easy: הוסף Step לCounter
הוסף ל-`useCounterStore` שדה `step` (ברירת מחדל: 1), כפתורים לשינוי ה-step, ועדכן את `increment`/`decrement` להשתמש בו.

### תרגיל ב׳ - Medium: עריכת מטלה
הוסף לכל `TodoItem` כפתור "ערוך" שמאפשר לשנות את טקסט המטלה inline.  
תצטרך להוסיף action `editTodo(id, newText)` ל-store.

### תרגיל ג׳ - Medium: שמירה ב-LocalStorage
הוסף ל-`useTodoStore` שמירה אוטומטית ב-LocalStorage.  
בדוק את Zustand middleware: `persist` מ-`zustand/middleware`:

```js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useTodoStore = create(
  persist(
    (set, get) => ({
      // ... אותו קוד של קודם
    }),
    {
      name: 'todo-storage', // שם המפתח ב-localStorage
    }
  )
)
```

### תרגיל ד׳ - Hard: Theme Store
צור `useThemeStore.js` עם:
- שדה `theme`: `'light' | 'dark'`
- action: `toggleTheme()`
- החל את ה-theme על ה-body של הדף דרך `useEffect` באחת מהקומפוננטות

---

## סיכום מושגים

| מושג | הסבר | קוד |
|------|------|-----|
| `create()` | יצירת store | `create((set) => ({ ... }))` |
| `set` | עדכון state | `set({ count: 0 })` |
| `get` | קריאת state מתוך action | `get().todos` |
| Selector | בחירת חלק מה-store | `useStore((s) => s.count)` |
| Action | פונקציה שמשנה state | `increment: () => set(...)` |
| `persist` | שמירה ב-localStorage | middleware מובנה |

---

## שגיאות נפוצות

```js
// ❌ שגוי - מחזיר את כל ה-store (גורם לרנדור מיותר)
const store = useCounterStore()

// ✅ נכון - selector - מחזיר רק את מה שצריך
const count = useCounterStore((state) => state.count)

// ❌ שגוי - mutation ישיר של state
set((state) => { state.count++ })

// ✅ נכון - יצירת אובייקט חדש
set((state) => ({ count: state.count + 1 }))
```

---

*בהצלחה! 🚀*

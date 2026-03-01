import useCounterStore from "../stores/useCounterStore";

function Counter() {
    const { count, increment, decrement, reset } = useCounterStore()

//   const count = useCounterStore((state) => state.count);
//   const increment = useCounterStore((state) => state.increment);
//   const decrement = useCounterStore((state) => state.decrement);
//   const reset = useCounterStore((state) => state.reset);
  return (
    <div className="counter-card">
      <h2>Counter פשוט</h2>
      <div className="count-display">{count}</div>
      <div className="counter-buttons">
        <button onClick={decrement}>-</button>
        <button onClick={reset} className="reset-btn">
          Reset
        </button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
}

export default Counter;

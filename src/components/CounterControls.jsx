import { useCounterStore } from "../stores/useCounterStore";

export default function CounterControls() {
  const { increment, decrement, reset, incrementByAmount } = useCounterStore();

  //   const increment = useCounterStore((state) => state.increment)
  //   const decrement = useCounterStore((state) => state.decrement)
  //   const reset = useCounterStore((state) => state.reset)
  
  return (
    <div className="counter-buttons">
      <button onClick={decrement}>-</button>
      <button onClick={reset} className="reset-btn">
        Reset
      </button>
      <button onClick={increment}>+</button>
      <button onClick={() => incrementByAmount(5)}>+5</button>
    </div>
  );
}

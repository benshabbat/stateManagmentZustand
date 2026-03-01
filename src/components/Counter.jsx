import { useCounterStore } from "../stores/useCounterStore";
import CounterControls from "./CounterControls";

function Counter() {
  const { count } = useCounterStore();

  //   const count = useCounterStore((state) => state.count)


  return (
    <div className="counter-card">
      <h2>Counter פשוט</h2>
      <div className="count-display">{count}
        <CounterControls />
      </div>
    </div>
  );
}

export default Counter;

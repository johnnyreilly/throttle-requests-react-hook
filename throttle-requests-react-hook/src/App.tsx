import React, { useState } from "react";
import { useAsync } from "react-use";
import { useThrottleRequests } from "./useThrottleRequests";
import "./App.css";

// function timeout(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

function use10_000Requests(startedAt: string) {
  const { throttle, updateThrottle } = useThrottleRequests();
  const [progressMessage, setProgressMessage] = useState("not started");

  useAsync(async() => {
      if (!startedAt) return;

      setProgressMessage("preparing");

      const requestsToMake = Array.from(Array(10_000)).map(
        (_, index) => async () => {
          try {
            setProgressMessage(`loading ${index}...`);

            const response = await fetch(
              `/manifest.json?querystringValueToPreventCaching=${startedAt}_request-${index}`
            );
            const json = await response.json();
            updateThrottle.requestSucceededWithData(json);

            return json;
          } catch (error) {
            updateThrottle.requestFailedWithError(error);
            console.error(`failed to load ${index}`, error);
          }
        }
      );

      await updateThrottle.queueRequests(requestsToMake);

  }, [startedAt, updateThrottle, setProgressMessage]);

  return { throttle, progressMessage };
}

function App() {
  const [startedAt, setStartedAt] = useState("");

  const { progressMessage, throttle } = use10_000Requests(startedAt);

  return (
    <div className="App">
      <header className="App-header">
        <h1>The HTTP request machine</h1>
        <button
          className="App-button"
          onClick={(_) => setStartedAt(new Date().toISOString())}
        >
          Make 10,000 requests
        </button>
        {throttle.loading && <div>{progressMessage}</div>}
        {throttle.values.length > 0 && (
          <div className="App-results">
            {throttle.values.length} requests completed successfully
          </div>
        )}
        {throttle.errors.length > 0 && (
          <div className="App-results">
            {throttle.errors.length} requests errored
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

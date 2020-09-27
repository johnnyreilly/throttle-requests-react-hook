import React, { useCallback, useState } from "react";
import { useAsync } from "react-use";
import "./App.css";

function App() {
  // The owner and repo to query; we're going to default
  // to using DefinitelyTyped as an example repo as it 
  // is one of the most contributed to repos on GitHub
  const [owner, setOwner] = useState("DefinitelyTyped");
  const [repo, setRepo] = useState("DefinitelyTyped");
  const handleOwnerChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setOwner(event.target.value),
    [setOwner]
  );
  const handleRepoChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setRepo(event.target.value),
    [setRepo]
  );

  const contributorsUrl = `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`;

  const [contributorsUrlToLoad, setUrlToLoad] = useState("");
  const contributors = useAsync(async () => {
    if (!contributorsUrlToLoad) return;

    // load contributors from GitHub
    const response = await fetch(contributorsUrlToLoad);
    const result: { url: string }[] = await response.json();

    // For each entry in result, retrieve the given user from GitHub
    const results = await Promise.all(
      result.map(({ url }) => fetch(url).then((response) => response.json()))
    );

    return results;
  }, [contributorsUrlToLoad]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Blogging devs</h1>
        <div className="App-labelinput">
          <label htmlFor="owner">GitHub Owner</label>
          <input
            id="owner"
            type="text"
            value={owner}
            onChange={handleOwnerChange}
          />
        </div>
        <div className="App-labelinput">
          <label htmlFor="repo">GitHub Repo</label>
          <input
            id="repo"
            type="text"
            value={repo}
            onChange={handleRepoChange}
          />
        </div>
        <p>
          <a
            className="App-link"
            href={contributorsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {contributorsUrl}
          </a>
        </p>
        <button
          className="App-button"
          onClick={(e) => setUrlToLoad(contributorsUrl)}
        >
          Load contributors from GitHub
        </button>
        {contributors.loading ? "Loading..." : null}
        {contributors.error ? "Something went wrong" : null}
        {contributors.value
          ? contributors.value.map((cont) => (
              <li>
                {cont.login} - {cont.blog}
              </li>
            ))
          : null}
      </header>
    </div>
  );
}

export default App;

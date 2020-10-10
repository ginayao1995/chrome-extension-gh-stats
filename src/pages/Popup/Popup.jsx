import React from 'react';
import './Popup.css';

import secrets from 'secrets';

const makeSearchQuery = (options) => {
  return (
    '?q=' +
    Object.keys(options)
      .map((key, idx) => `${key}:${options[key]}`)
      .join('+')
  );
};

const requestOptions = {
  headers: {
    Authorization: `token ${secrets['github_key']}`,
  },
};

const formattedFirstDateOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split('T')[0];
};

const Popup = () => {
  const [name, setName] = React.useState();
  const [date, setDate] = React.useState(formattedFirstDateOfMonth());
  const [avatarUrl, setAvatarUrl] = React.useState();
  const [profileUrl, setProfileUrl] = React.useState();
  const [authoredCount, setAuthoredCount] = React.useState();
  const [commentedCount, setCommentedCount] = React.useState();

  React.useEffect(() => {
    const userUrl = name ? `users/${name}` : 'user';
    (async function () {
      const response = await fetch(
        `https://api.github.com/${userUrl}`,
        requestOptions
      );

      const {
        login: name,
        avatar_url: avatarUrl,
        html_url: profileUrl,
      } = await response.json();
      setName(name);
      setAvatarUrl(avatarUrl);
      setProfileUrl(profileUrl);
    })();
  }, [name]);

  React.useEffect(() => {
    if (name) {
      (async function () {
        const response = await fetch(
          'https://api.github.com/search/issues' +
            makeSearchQuery({
              type: 'pr',
              org: 'change',
              author: name,
              created: `${date}..*`,
            }),
          requestOptions
        );

        const { total_count: issueCount } = await response.json();
        setAuthoredCount(issueCount);
      })();
    }
  }, [name, date]);

  React.useEffect(() => {
    if (name) {
      (async function () {
        const response = await fetch(
          'https://api.github.com/search/issues' +
            makeSearchQuery({
              type: 'pr',
              org: 'change',
              'reviewed-by': name,
              '-author': name,
              created: `${date}..*`,
            }),
          requestOptions
        );

        const { total_count: issueCount } = await response.json();
        setCommentedCount(issueCount);
      })();
    }
  }, [name, date]);

  return (
    <div className="App">
      <header className="App-header">
        {name && authoredCount >= 0 && (
          <React.Fragment>
            <span>
              <label>
                <input
                  type="text"
                  name="name"
                  placeholder={name}
                  onBlur={(event) => {
                    if (name !== event.target.value)
                      setName(event.target.value);
                  }}
                ></input>
              </label>
              <label>
                <input
                  type="date"
                  name="from"
                  defaultValue={date}
                  onBlur={(event) => {
                    if (date !== event.target.value)
                      setDate(event.target.value);
                  }}
                ></input>
              </label>
            </span>

            <hr style={{ width: '100%' }}></hr>

            <img src={avatarUrl} className="avatar" />
            <a
              className="App-link"
              href="#"
              onClick={() => {
                chrome.tabs.update({
                  url: profileUrl,
                });
              }}
            >
              {name}
            </a>
            <span>Authored: {authoredCount} issues</span>
            <span>Reviewed: {commentedCount} issues</span>
            <h2 style={{ marginBottom: 0 }}>
              {authoredCount &&
                commentedCount &&
                Math.round((commentedCount / authoredCount) * 100) / 100}
            </h2>
            <small>Reviewed/Authored</small>
            <h6>
              <a
                className="App-link"
                href="#"
                onClick={() => {
                  chrome.tabs.update({
                    url:
                      'https://github.com/ginayao1995/chrome-extension-gh-stats',
                  });
                }}
              >
                ginayao1995/chrome-extension-gh-stats
              </a>
            </h6>
          </React.Fragment>
        )}
      </header>
    </div>
  );
};

export default Popup;

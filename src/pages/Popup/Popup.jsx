import React from 'react';
import './Popup.css';

import secrets from 'secrets';

const makeSearchQuery = options => {
  return '?q=' + Object.keys(options).map((key, idx) => `${key}:${options[key]}`).join('+');

}

const Popup = () => {
  const [name, setName] = React.useState();
  const [avatarUrl, setAvatarUrl] = React.useState();
  const [profileUrl, setProfileUrl] = React.useState();
  const [authoredCount, setAuthoredCount] = React.useState();
  const [commentedCount, setCommentedCount] = React.useState();

  React.useEffect(() => {
    (async function () {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${secrets['github_key']}`,
        },
      });

      const { login: name, avatar_url: avatarUrl, html_url: profileUrl } = await response.json();
      setName(name);
      setAvatarUrl(avatarUrl);
      setProfileUrl(profileUrl)
    })();
  }, []);

  React.useEffect(() => {
    if (name) {
      (async function() {
        const response = await fetch('https://api.github.com/search/issues' + makeSearchQuery({
          type: 'pr',
          org: 'change',
          author: name,
          created: '2020-01-01..*'
        }), {
          headers: {
            Authorization: `token ${secrets['github_key']}`,
          },
        });

        const {total_count: issueCount} = await response.json();
        setAuthoredCount(issueCount)
      })();
    }
  }, [name]);

  React.useEffect(() => {
    if (name) {
      (async function() {
        const response = await fetch('https://api.github.com/search/issues' + makeSearchQuery({
          type: 'pr',
          org: 'change',
          'reviewed-by': name,
          '-author': name,
          created: '2020-01-01..*'
        }), {
          headers: {
            Authorization: `token ${secrets['github_key']}`,
          },
        });

        const {total_count: issueCount} = await response.json();
        setCommentedCount(issueCount);
      })();
    }
  }, [name]);

  return (
    <div className="App">
      <header className="App-header">
        {name && authoredCount >= 0 && <React.Fragment>
          <img src={avatarUrl} className="avatar"/>
          <span>Hi, <a className="App-link" href={profileUrl}>{name}</a>!</span>
          <span>Authored: {authoredCount} issues</span>
          <span>Reviewed: {commentedCount} issues</span>
          <h2>{authoredCount && commentedCount && commentedCount/authoredCount}</h2>
        </React.Fragment>}
      </header>
    </div>
  );
};

export default Popup;

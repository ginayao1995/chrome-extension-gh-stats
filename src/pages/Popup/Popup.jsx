import React from 'react';
import logo from '../../assets/img/logo.svg';
import './Popup.css';

import secrets from 'secrets';

const Popup = () => {
  const [name, setName] = React.useState();
  const [avatarUrl, setAvatarUrl] = React.useState();

  React.useEffect(() => {
    (async function () {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${secrets['github_key']}`,
        },
      });

      const { name, avatar_url: avatarUrl } = await response.json();
      setName(name);
      setAvatarUrl(avatarUrl);
    })();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={avatarUrl} className="App-logo" alt="logo" />
        Hi, {name}!
      </header>
    </div>
  );
};

export default Popup;

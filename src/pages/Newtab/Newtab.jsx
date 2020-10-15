import React from 'react';
import githubLogo from '../../assets/img/github-mark.png';
import './Newtab.scss';
import { getUser } from '../shared/api/getUser';
import HelloWorld from './tabs/HelloWorld';

const Newtab = () => {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [name, setName] = React.useState();
  const [avatarUrl, setAvatarUrl] = React.useState();
  const [profileUrl, setProfileUrl] = React.useState();

  React.useEffect(() => {
    (async function () {
      const { userName, profileUrl, avatarUrl } = await getUser()
      setName(userName);
      setAvatarUrl(avatarUrl);
      setProfileUrl(profileUrl);
    })();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {name && (
          <React.Fragment>
            <nav className="header">
              <img src={githubLogo} className="App-link logo" title="ginayao1995/chrome-extension-gh-stats"
                onClick={() => {
                  chrome.tabs.update({
                    url:
                      'https://github.com/ginayao1995/chrome-extension-gh-stats',
                  });
                }}
              />
              <h1>Github Stats</h1>
              <a className={`App-link nav-item ${ currentTab === 0 ? 'active' : ''}`} onClick={() => setCurrentTab(0)}>A Tab</a>
              <a className={`App-link nav-item ${ currentTab === 1 ? 'active' : ''}`} onClick={() => setCurrentTab(1)}>Another Tab</a>
              <a className={`App-link nav-item ${ currentTab === 2 ? 'active' : ''}`} onClick={() => setCurrentTab(2)}>A Third Tab</a>
              <div className="header-spacer"/>

              <a
                className="App-link"
                href={profileUrl}
                target="_blank "
              >
                <img src={avatarUrl} className="avatar" title={name} />
              </a>
            </nav>

            <hr style={{ width: '100%' }}/>

            {currentTab === 0 && <HelloWorld/>}
            {currentTab === 1 && <React.Fragment/>}
            {currentTab === 2 && <React.Fragment/>}
          </React.Fragment>
        )}
      </header>

    </div>
  );
};

export default Newtab;

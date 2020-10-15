import React from 'react';
import './Popup.css';
import { getUser } from '../shared/api/getUser';
import { getUserIssues } from '../shared/api/getUserIssues';

const formattedFirstDateOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split('T')[0];
};

const Popup = () => {
  const [name, setName] = React.useState();
  const [searchName, setSearchName] = React.useState();
  const [date, setDate] = React.useState(formattedFirstDateOfMonth());
  const [avatarUrl, setAvatarUrl] = React.useState();
  const [profileUrl, setProfileUrl] = React.useState();
  const [authoredCount, setAuthoredCount] = React.useState();
  const [commentedCount, setCommentedCount] = React.useState();

  React.useEffect(() => {
    (async function () {
      const { userName, profileUrl, avatarUrl } = await getUser(searchName)
      setName(userName);
      setAvatarUrl(avatarUrl);
      setProfileUrl(profileUrl);
    })();
  }, [searchName]);

  React.useEffect(() => {
    if (name) {
      (async function () {
        const { authored, reviewed } = await getUserIssues(name, { startDate: date, countOnly: true, })
        setAuthoredCount(authored.totalCount)
        setCommentedCount(reviewed.totalCount)
        console.log(authored, reviewed)
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
                      setSearchName(event.target.value);
                  }}
                />
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
                />
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

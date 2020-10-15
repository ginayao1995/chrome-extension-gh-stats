import secrets from 'secrets';

const requestOptions = {
  method: 'POST',
  headers: {
    Authorization: `token ${secrets['github_key']}`,
  },
};

/**
 * @param user Github user to look up (optional)
 * @returns {Promise<{profileUrl, avatarUrl, userName}>}
 */
export async function getUser(user) {
  const query =
    `query${ user ? '($username: String!)' : ''} { ${ user ? 'user(login: $username)' : 'viewer'} { login, avatarUrl, url } }`;

  const response = await fetch(
    `https://api.github.com/graphql`,
    //
    {
      ...requestOptions,
      body: JSON.stringify({ query, variables: { username: user } }),
    },
  );

  const { data: { [ user ? 'user' : 'viewer']: { login: userName, avatarUrl, url: profileUrl } } } = await response.json();
  return { userName, avatarUrl, profileUrl };
}

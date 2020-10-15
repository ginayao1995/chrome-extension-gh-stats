import secrets from 'secrets';

/**
 * @typedef GithubUser
 * @property {string} profileUrl
 * @property {string} avatarUrl
 * @property {string} userName
 *
 */

/**
 * Get user data from Github
 *
 * @param {string} user Github user to look up (optional) - defaults to authenticated user.
 * @returns {Promise<GithubUser>}
 */
export async function getUser(user) {
  const query =
    `query${ user ? '($username: String!)' : ''} { ${ user ? 'user(login: $username)' : 'viewer'} { login, avatarUrl, url } }`;

  const response = await fetch(
    `https://api.github.com/graphql`,
    //
    {
      method: 'POST',
      headers: {
        Authorization: `token ${secrets['github_key']}`,
      },
      body: JSON.stringify({ query, variables: { username: user } }),
    },
  );

  const { data: { [ user ? 'user' : 'viewer']: { login: userName, avatarUrl, url: profileUrl } } } = await response.json();
  return { userName, avatarUrl, profileUrl };
}

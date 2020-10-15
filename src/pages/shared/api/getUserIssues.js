import secrets from 'secrets';

const makeSearchQuery = (options) => {
  return (
    Object.keys(options)
      .map((key, idx) => `${key}:${options[key]}`)
      .join(' ')
  );
};

const formatIssues = (result) => ({
  totalCount: result.issueCount,
  items: result.nodes,
  cursor: result.pageInfo?.endCursor,
  hasMore: result.pageInfo?.hasNextPage
});

const firstDateOfYear = () => {
  const date = new Date();
  return new Date(date.getFullYear(), 0, 1)
    .toISOString()
    .split('T')[0];
};

/**
 * @typedef Issue
 * @property {string} createdAt
 */

/**
 * @typedef IssueCollection
 * @property {number} totalCount
 * @property {string} cursor
 * @property {boolean} hasMore
 * @property {[Issue]} items
 */

/**
 * @typedef UserIssues
 * @property {IssueCollection} authored - Authored PRs
 * @property {IssueCollection} reviewed - Reviewed PRs
 */

/**
 *
 * @param user {string} - Github user
 * @param [startDate] {string}
 * @param [fetchAuthored] {boolean} - fetch authored PRs
 * @param [fetchReviewed] {boolean} - fetch reviewed PRs
 * @param [authoredCursor] {string} - fetch authored PRs after this cursor
 * @param [reviewedCursor] {string} - fetch reviewed PRs after this cursor
 * @param [countOnly] {boolean} - only fetch counts
 * @returns {Promise<UserIssues>}
 */
export async function getUserIssues(user, {
  startDate = firstDateOfYear(),
  fetchAuthored = true,
  fetchReviewed = true,
  authoredCursor,
  reviewedCursor,
  countOnly = false
}) {
  const query = `
          query(
            $authoredSearch: String!, 
            $reviewedSearch: String!, 
            $fetchAuthored: Boolean!, 
            $authoredCursor: String, 
            $fetchReviewed: Boolean!, 
            $reviewedCursor: String,
            $fetchItems: Boolean!
          ) { 
            authored: search(query: $authoredSearch, type: ISSUE, first: 50, after: $authoredCursor)  @include(if: $fetchAuthored) {
              issueCount
              pageInfo @include(if: $fetchItems){
                endCursor
                hasNextPage
              }
              nodes @include(if: $fetchItems) {
                ... on PullRequest {
                  createdAt
                }
              }
            }
            reviewed: search(query: $reviewedSearch, type: ISSUE, first: 50, after: $reviewedCursor)  @include(if: $fetchReviewed) {
              issueCount
              pageInfo @include(if: $fetchItems){
                endCursor
                hasNextPage
              }
              
              nodes @include(if: $fetchItems) {
                ... on PullRequest {
                  createdAt
                }
              }
            }
          }
        `;

  const response = await fetch(
    `https://api.github.com/graphql`,
    //
    {
      method: 'POST',
      headers: {
        Authorization: `token ${secrets['github_key']}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          authoredSearch: makeSearchQuery({
            type: 'pr',
            org: 'change',
            author: user,
            created: `${startDate}..*`,
          }),
          reviewedSearch: makeSearchQuery({
            type: 'pr',
            org: 'change',
            'reviewed-by': user,
            '-author': user,
            created: `${startDate}..*`,
          }),
          authoredCursor,
          reviewedCursor,
          fetchAuthored,
          fetchReviewed,
          fetchItems: !countOnly
        },
      }), },
  );

  const { data: { authored, reviewed } } = await response.json();

  return {
    ...(fetchAuthored && { authored: formatIssues(authored)}),
    ...(fetchReviewed && { reviewed: formatIssues(reviewed)}) };
}

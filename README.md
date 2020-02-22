# GitHub Issue Collector

Issue collector module using the entry point provided by GitHub on its [API version 4](https://developer.github.com/v4/).

## Usage

To be able to use the Github API methods for command lines, an OAUTH token is needed. Github provides [an article](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) showing the request procedure.

Once the token is provided, it should be placed on a `.env` file as follows:

```js
  GH_OAUTH=[github-access-token]
```

### Repositories

For the scope of this research, 5 repositories were scraped. To customize the projects of interest, the `repositories.json` must be edited with the `owner` and `name`.

```js
  [
    {
        "name": "go",
        "owner": "golang"
    },
    {
        "name": "rust",
        "owner": "rust-lang"
    }
  ]
```

### Query

The `graphql` query made for this module, only collects the last 100 issues, ordered by date. To modify this behavior, another limit can be set on `fetchRepoIssues.graphql`, as well as the fields of interest. Custom queries can be tested using the [Github GraphQL Explorer](https://developer.github.com/v4/explorer/)

```graphql
  query fetchRepoIssues($name: String!, $owner: String!) {
  repository(name: $name, owner: $owner) {
    issues(last: 100) {
      ...
    }
  }
}
```

### Install and Run

Install dependencies

```sh
  yarn install
```

Run scraper.

```sh
  yarn run start
```

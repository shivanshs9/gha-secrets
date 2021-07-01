# gha-secrets

A utility script to CRUD repository secrets

## Usage

1. Clone the repository
2. Make sure NodeJs is installed
3. Install dependencies, run: `npm i`
4. Run the script, `./secrets.js`

## Commands

### List

```
Usage: secrets list [options] <repository>

List the repository secrets

Options:
  -h, --help  display help for command
```

Example: `./secrets.js -t <TOKEN> list <REPO_NAME>`

### Create/Update

```
Usage: secrets add [options] <name> <value>

Add/Modify the repository secrets

Arguments:
  name                    Name of the secret
  value                   Plain text secret value

Options:
  -r --repo <repository>  Repository name
  -h, --help              display help for command
```

Example: `./secrets.js -t <TOKEN> add <SECRET_NAME> <PLAIN_VALUE> -r <REPO_NAME>`

### Delete

```
Usage: secrets remove [options] <name>

Remove the specified repository secret

Options:
  -r --repo <repository>  Repository name
  -h, --help              display help for command
```

Example: `./secrets.js -t <TOKEN> remove <SECRET_NAME> -r <REPO_NAME>`

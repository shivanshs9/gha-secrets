#!/usr/bin/env node
'use strict';

const { Octokit } = require('@octokit/rest');
const { program } = require('commander');
const sodium = require('tweetsodium');

program.version('0.0.1')
    .option('-a --actor <actor>', 'Username of actor')
    .option('-t --token <token>', 'Token of actor (with relevant permissions)')
    .option('-o --org <organisation>', 'Username of organisation', 'headout')

var octokit, globalOpts

async function init(thisCommand, actionCommand) {
    globalOpts = thisCommand.opts()
    octokit = new Octokit({
        auth: globalOpts.token
    })
}
program.hook('preAction', init)

async function listSecrets(repo) {
    const resp = await octokit.rest.actions.listRepoSecrets({
        owner: globalOpts.org,
        repo
    })
    console.log(resp.data)
}
program.command('list <repository>')
    .description('List the repository secrets')
    .action(listSecrets)

async function addSecret(name, value, { repo }) {
    process.stdout.write('Fetching repo public key... ')
    var resp = await octokit.rest.actions.getRepoPublicKey({
        owner: globalOpts.org,
        repo,
    });
    const repoPublicKey = resp.data.key
    const repoKeyId = resp.data.key_id
    console.log('Done.')

    process.stdout.write('Encrypting value with public key... ')
    const keyBytes = Buffer.from(repoPublicKey, 'base64')
    const valueBytes = Buffer.from(value)

    const encryptedBytes = sodium.seal(valueBytes, keyBytes)
    const encryptedValue = Buffer.from(encryptedBytes).toString('base64')
    console.log('Done.')

    resp = await octokit.rest.actions.createOrUpdateRepoSecret({
        owner: globalOpts.org,
        repo,
        secret_name: name,
        encrypted_value: encryptedValue,
        key_id: repoKeyId
    });
    if (resp.status == 201) {
        console.log('Created a new secret')
    } else if (resp.status == 204) {
        console.log('Updated an existing secret')
    } else {
        console.log(resp)
    }
}
program.command('add')
    .option('-r --repo <repository>', 'Repository name')
    .argument('<name>', 'Name of the secret')
    .argument('<value>', 'Plain text secret value')
    .description('Add/Modify the repository secrets')
    .action(addSecret)

async function removeSecret(name, { repo }) {
    const resp = await octokit.rest.actions.deleteRepoSecret({
        owner: globalOpts.org,
        repo,
        secret_name: name,
    });
    if (resp.status == 204) {
        console.log('Successfully deleted a repo secret')
    } else {
        console.log(resp)
    }
}
program.command('remove <name>')
    .option('-r --repo <repository>', 'Repository name')
    .description('Remove the specified repository secret')
    .action(removeSecret)

async function main() {
    await program.parseAsync()
}

if (require.main == module) {
    main()
}

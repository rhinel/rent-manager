const fs = require('fs')

const gitHEAD = fs.readFileSync('.git/HEAD', 'utf-8').trim()
const ref = gitHEAD.split(': ')[1]
const gitVersion = fs.readFileSync(`.git/${ref}`, 'utf-8').trim()
const gitCommitVersion = `${ref}: ${gitVersion}`

module.exports = gitCommitVersion

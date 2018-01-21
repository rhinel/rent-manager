const fs = require('fs')

const gitHEAD = fs.readFileSync('.git/HEAD', 'utf-8').trim()
console.log(gitHEAD)
const ref = gitHEAD.split(': ')[1]
console.log(ref)
const gitVersion = fs.readFileSync(`.git/${ref}`, 'utf-8').trim()
console.log(gitVersion)
const gitCommitVersion = `${ref}: ${gitVersion}`

module.exports = gitCommitVersion

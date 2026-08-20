# Security Policy

## Reporting a Vulnerability

We take the security of LEXIS Language Workspace seriously. If you believe you have found a security vulnerability, please report it responsibly.

### How to Report
Please open a private security report via [GitHub Security Advisories](https://github.com/tuandatdl/quizletapp/security/advisories/new) or contact the project maintainer.

Please include:
- A description of the vulnerability and its potential impact.
- Steps or a proof-of-concept to reproduce the issue.
- Any suggested remediations if available.

### Automated Protections
This repository employs automated security controls:
- **CodeQL**: Continuous static analysis for JavaScript and TypeScript.
- **Gitleaks**: Continuous secret scanning across commits and pull requests.
- **Dependabot**: Automated vulnerability alerts and dependency version updates.
- **Branch Protection**: Strict status checks and administrative enforcement on the `main` branch.
- **Cryptographic Commit Signing**: All official maintainer commits are signed with verified SSH keys.
- **Privacy & Identity Protection**: Maintainer commits utilize verified GitHub privacy identities for audit integrity.

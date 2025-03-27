import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

type CommitType = 'major' | 'minor' | 'patch';
type CommitTypeMap = Record<string, CommitType>;

const COMMIT_TYPE_MAP: CommitTypeMap = {
	feat: 'minor',
	fix: 'patch',
	perf: 'patch',
	docs: 'patch',
	refactor: 'patch',
	test: 'patch',
	chore: 'patch',
	build: 'patch',
	ci: 'patch',
	breaking: 'major',
};

function getLastCommitMessage(): string {
	try {
		return execSync('git log -1 --pretty=%B').toString().trim();
	} catch (error) {
		console.error('Errore nel recuperare il messaggio di commit:', error);
		return '';
	}
}

function determineChangesetType(commitMessage: string): CommitType {
	const commitType = commitMessage.split(':')[0].toLowerCase();

	// Controllo per breaking changes
	if (commitMessage.includes('BREAKING CHANGE')) {
		return 'major';
	}

	return COMMIT_TYPE_MAP[commitType] ?? 'patch';
}

function createChangesetDirectory(): void {
	const changesetDir = path.resolve(process.cwd(), '.changeset');
	if (!fs.existsSync(changesetDir)) {
		fs.mkdirSync(changesetDir);
	}
}

function generateChangesetFileName(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(7)}.md`;
}

function writeChangesetFile(type: CommitType, description: string): void {
	createChangesetDirectory();

	const changesetFileName = generateChangesetFileName();
	const changesetPath = path.resolve(process.cwd(), '.changeset', changesetFileName);

	const packageName = process.env.npm_package_name ?? 'unnamed-package';

	const changesetContent = `---
"${packageName}": ${type}
---

${description}
`;

	fs.writeFileSync(changesetPath, changesetContent);

	console.log(`Changeset creato: ${changesetFileName} con tipo ${type}`);
}

function generate(): void {
	try {
		const lastCommitMessage = getLastCommitMessage();

		if (!lastCommitMessage) {
			console.log('Nessun messaggio di commit trovato. Salto la generazione del changeset.');
			return;
		}

		const changesetType = determineChangesetType(lastCommitMessage);

		writeChangesetFile(changesetType, lastCommitMessage);
	} catch (error) {
		console.error('Errore nella generazione del changeset:', error);
	}
}

// Esecuzione immediata
generate();
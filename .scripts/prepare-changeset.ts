import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

type CommitType = "major" | "minor" | "patch";
type CommitTypeMap = Record<string, CommitType>;

const COMMIT_TYPE_MAP: CommitTypeMap = {
	feat: "minor",
	fix: "patch",
	perf: "patch",
	docs: "patch",
	refactor: "patch",
	test: "patch",
	chore: "patch",
	build: "patch",
	ci: "patch",
	breaking: "major",
};

function getLastCommitMessage(): string {
	try {
		return execSync("git log -1 --pretty=%B").toString().trim();
	} catch (error) {
		console.error("Errore nel recuperare il messaggio di commit:", error);
		return "";
	}
}

function determineChangesetType(commitMessage: string): CommitType {
	const commitType = commitMessage.split(":")[0].toLowerCase();

	// Controllo per breaking changes
	if (commitMessage.includes("BREAKING CHANGE")) {
		return "major";
	}

	return COMMIT_TYPE_MAP[commitType] ?? "patch";
}

function createChangesetDirectory(): void {
	const changesetDir = path.resolve(process.cwd(), ".changeset");
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
	const changesetPath = path.resolve(
		process.cwd(),
		".changeset",
		changesetFileName,
	);

	// Debug: stampa informazioni dettagliate
	console.log('Current working directory:', process.cwd());
	console.log('Environment variables:', process.env);

	// Leggi i pacchetti nel workspace
	const workspacePackages = getWorkspacePackages();
	console.log('Workspace packages:', workspacePackages);

	// Scegli un pacchetto specifico o usa un nome di fallback
	const packageName = workspacePackages.length > 0
		? workspacePackages[0]
		: "opstdio";

	const changesetContent = `---
"${packageName}": ${type}
---

${description}
`;

	fs.writeFileSync(changesetPath, changesetContent);

	console.log(`Changeset creato: ${changesetFileName} con tipo ${type} per pacchetto ${packageName}`);
}

function getWorkspacePackages(): string[] {
	try {
		// Leggi i pacchetti dal file pnpm-workspace.yaml
		const workspaceConfigPath = path.resolve(process.cwd(), 'pnpm-workspace.yaml');
		const workspaceConfig = fs.readFileSync(workspaceConfigPath, 'utf8');

		// Estrai i path dei pacchetti
		const packagePaths = workspaceConfig
			.split('\n')
			.filter(line => line.trim().startsWith('- '))
			.map(line => line.trim().replace('- ', '').replace(/'/g, ''));

		// Trova i pacchetti effettivi
		const packages: string[] = [];
		for (const packagePath of packagePaths) {
			const fullPath = path.resolve(process.cwd(), packagePath);
			const directories = fs.readdirSync(fullPath, { withFileTypes: true })
				.filter(dirent => dirent.isDirectory())
				.map(dirent => {
					const packageJsonPath = path.join(fullPath, dirent.name, 'package.json');
					if (fs.existsSync(packageJsonPath)) {
						const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
						return packageJson.name;
					}
					return null;
				})
				.filter(name => name !== null);

			packages.push(...directories);
		}

		return packages;
	} catch (error) {
		console.error('Errore nel recuperare i pacchetti del workspace:', error);
		return [];
	}
}


function generate(): void {
	try {
		const lastCommitMessage = getLastCommitMessage();

		if (!lastCommitMessage) {
			console.log(
				"Nessun messaggio di commit trovato. Salto la generazione del changeset.",
			);
			return;
		}

		const changesetType = determineChangesetType(lastCommitMessage);

		writeChangesetFile(changesetType, lastCommitMessage);
	} catch (error) {
		console.error("Errore nella generazione del changeset:", error);
	}
}

// Esecuzione immediata
generate();

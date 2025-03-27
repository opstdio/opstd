import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function getWorkspacePackages(): string[] {
	try {
		// Ottieni il percorso della directory corrente in modo affidabile
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		const projectRoot = path.resolve(__dirname, '..');

		console.log('Project root:', projectRoot);

		// Cerca package.json nei percorsi del workspace
		const workspacePaths = [
			path.join(projectRoot, 'apps'),
			path.join(projectRoot, 'packages')
		];

		const packages: string[] = [];

		for (const workspacePath of workspacePaths) {
		    console.log('Checking workspace path:', workspacePath);

		    if (!fs.existsSync(workspacePath)) {
		        console.log(`Path does not exist: ${workspacePath}`);
		        continue;
		    }

		    const directories = fs.readdirSync(workspacePath, { withFileTypes: true })
		        .filter(dirent => dirent.isDirectory());

		    for (const dir of directories) {
		        const packageJsonPath = path.join(workspacePath, dir.name, 'package.json');

		        if (fs.existsSync(packageJsonPath)) {
		            try {
		                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
		                if (packageJson.name) {
		                    packages.push(packageJson.name);
		                    console.log(`Found package: ${packageJson.name}`);
		                }
		            } catch (error) {
		                console.error(`Error reading package.json for ${dir.name}:`, error);
		            }
		        }
		    }
		}

		console.log('Workspace packages found:', packages);
		return packages;
	} catch (error) {
		console.error('Errore nel recuperare i pacchetti del workspace:', error);
		return [];
	}
}

function writeChangesetFile(type: 'patch' | 'minor' | 'major' = 'patch', description = 'Update package') {
	// Trova i pacchetti del workspace
	const workspacePackages = getWorkspacePackages();

	// Scegli il primo pacchetto trovato o usa un nome di fallback
	const packageName = workspacePackages.length > 0
		? workspacePackages[0]
		: '@opstdio/core';

	// Percorso per il file changeset
	const changesetDir = path.resolve(process.cwd(), '.changeset');
	if (!fs.existsSync(changesetDir)) {
		fs.mkdirSync(changesetDir);
	}

	const changesetFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.md`;
	const changesetPath = path.resolve(changesetDir, changesetFileName);

	const changesetContent = `---
"${packageName}": ${type}
---

${description}
`;

	fs.writeFileSync(changesetPath, changesetContent);

	console.log(`Changeset creato: ${changesetFileName} con tipo ${type} per pacchetto ${packageName}`);
}

// Esegui la funzione
writeChangesetFile();
// To compact into .exe use 'pkg .'

const readline = require('readline');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const os = require('os');

// Define the GitHub script URLs
const SCRIPT_URLS = [
    'https://raw.githubusercontent.com/Eeems/bar-widgets/main/gui_build_eta.lua',
    'https://raw.githubusercontent.com/zxbc/BAR_widgets/main/cmd_better_build_pathing.lua',
    'https://raw.githubusercontent.com/zxbc/BAR_widgets/main/gui_healthbars_gl4.lua',
];

// Determine the target directory based on the user's operating system
const TARGET_DIRECTORY = determineTargetDirectory();

async function fetchAndInstallScripts() {
    try {
        await createWidgetsFolderIfNotExists();

        // Display the script options and get user input
        const selectedScripts = await selectScripts();

        for (const scriptIndex of selectedScripts) {
            const url = SCRIPT_URLS[scriptIndex];
            const response = await fetch(url);
            if (response.ok) {
                const scriptName = path.basename(url);
                const scriptContent = await response.text();
                const filePath = path.join(TARGET_DIRECTORY, scriptName);

                fs.writeFile(filePath, scriptContent, (error) => {
                    if (error) {
                        console.error(`Error saving script ${scriptName}:`, error);
                    } else {
                        console.log(`Script ${scriptName} saved successfully!`);
                    }
                });
            } else {
                console.error(`Failed to fetch script ${url}:`, response.status, response.statusText);
            }
        }
    } catch (error) {
        console.error('Error fetching and installing scripts:', error);
    }

}

function determineTargetDirectory() {
    const platform = os.platform();
    switch (platform) {
        case 'win32':
            return path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Beyond-All-Reason', 'data', 'LuaUI', 'Widgets');
        case 'darwin':
            return path.join(os.homedir(), 'Library', 'Application Support', 'Beyond-All-Reason', 'data', 'LuaUI', 'Widgets');
        case 'linux':
            return path.join(os.homedir(), '.config', 'Beyond-All-Reason', 'data', 'LuaUI', 'Widgets');
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }
}

function createWidgetsFolderIfNotExists() {
    return new Promise((resolve, reject) => {
        fs.mkdir(TARGET_DIRECTORY, { recursive: true }, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

function selectScripts() {
    return new Promise((resolve) => {
        const scriptCount = SCRIPT_URLS.length;
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const colors = {
            reset: '\x1b[0m',
            bright: '\x1b[1m',
            cyan: '\x1b[36m',
            bgBlue: '\x1b[44m',
            green: '\x1b[32m',
            yellow: '\x1b[93m',
        };

        console.log(`${colors.yellow}Welcome to EZ-Widgets Installer${colors.reset}`);
        console.log(`${colors.yellow}Made by Insanopatato${colors.reset}`);
        console.log(`${colors.yellow}Version 0.1.0${colors.reset}`);
        console.log();
        console.log(`${colors.cyan}Please select the scripts you want to install:${colors.reset}`);
        console.log();

        console.log(`${colors.cyan}Available Scripts:${colors.reset}`);
        console.log();
        for (let i = 0; i < scriptCount; i++) {
            const scriptName = path.basename(SCRIPT_URLS[i]);
            console.log(`${i + 1}. ${scriptName}`);
        }

        console.log();

        rl.question(`${colors.cyan}Enter the numbers of the scripts you want to install then press enter (comma-separated ex. '1,2,3') or type 'all' to install all scripts: ${colors.reset}`, (answer) => {
            rl.close();
            if (answer.toLowerCase() === 'all') {
                resolve(Array.from({ length: scriptCount }, (_, i) => i));
            } else {
                const selectedScripts = answer
                    .split(',')
                    .map((num) => parseInt(num.trim()))
                    .filter((num) => num >= 1 && num <= scriptCount);

                resolve(selectedScripts.map((num) => num - 1));
            }
        });
    });
}

fetchAndInstallScripts();
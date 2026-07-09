import fs from 'fs';
import puppeteer from 'puppeteer';

const SYSTEM_CHROME_PATHS = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
];

function resolveExecutablePath() {
    if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
        return process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    for (const chromePath of SYSTEM_CHROME_PATHS) {
        if (fs.existsSync(chromePath)) {
            return chromePath;
        }
    }

    try {
        const bundledPath = puppeteer.executablePath();
        if (fs.existsSync(bundledPath)) {
            return bundledPath;
        }
    } catch {
        // Bundled Chromium is not installed.
    }

    throw new Error(
        'No Chrome/Chromium found. Install Google Chrome, set PUPPETEER_EXECUTABLE_PATH, or run: node node_modules/puppeteer/install.js'
    );
}

export default async function launchBrowser(options = {}) {
    return puppeteer.launch({
        headless: 'new',
        executablePath: resolveExecutablePath(),
        ...options,
    });
}

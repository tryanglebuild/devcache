// 'devcache guide' command — interactive in-terminal help guide.
// Presents a menu-driven navigation through topics (getting started, auth,
// generation, best practices, workflow, commands, troubleshooting, tips).

import chalk from 'chalk';
import inquirer from 'inquirer';

interface GuideSection {
  title: string;
  content: string[];
}

const sections: Record<string, GuideSection> = {
  'getting-started': {
    title: '🚀 Getting Started',
    content: [
      'DevCache is an intelligent documentation generator that helps you create, manage, and sync project documentation.',
      '',
      chalk.bold('Quick Start:'),
      '1. Install globally: ' + chalk.cyan('npm install -g devcache-hub'),
      '2. Authenticate: ' + chalk.cyan('devcache login'),
      '3. Initialize project: ' + chalk.cyan('devcache init'),
      '4. Generate docs: ' + chalk.cyan('devcache generate'),
      '5. Push to cloud: ' + chalk.cyan('devcache push'),
      '',
      chalk.gray('💡 Tip: Run commands from your project root directory'),
    ],
  },
  'authentication': {
    title: '🔐 Authentication',
    content: [
      'DevCache requires authentication to sync documentation to the cloud.',
      '',
      chalk.bold('Login Methods:'),
      '• ' + chalk.cyan('Browser OAuth') + ' (Recommended) - Secure browser-based login',
      '• ' + chalk.cyan('Email & Password') + ' - Direct credential login',
      '',
      chalk.bold('Commands:'),
      chalk.cyan('devcache login') + '  - Authenticate with DevCache',
      chalk.cyan('devcache logout') + ' - Clear local session',
      chalk.cyan('devcache profile') + ' - View current user info',
      '',
      chalk.bold('How it works:'),
      '1. Run ' + chalk.cyan('devcache login'),
      '2. Choose authentication method',
      '3. Complete authentication flow',
      '4. Credentials saved to ' + chalk.gray('~/.devcache/session.json'),
      '5. Session valid across all projects',
      '',
      chalk.yellow('⚠️  Important: ') + 'Your session is stored locally and securely.',
    ],
  },
  'initialization': {
    title: '📁 Project Initialization',
    content: [
      'Initialize DevCache in your project to set up the documentation structure.',
      '',
      chalk.bold('Command:'),
      chalk.cyan('devcache init'),
      '',
      chalk.bold('What it does:'),
      '• Creates ' + chalk.gray('.devcache.json') + ' configuration file',
      '• Sets up folder structure in ' + chalk.gray('devcache_docs/'),
      '• Creates ' + chalk.gray('index.md') + ' with instructions',
      '• Prepares ' + chalk.gray('general/') + ', ' + chalk.gray('tech/') + ', and ' + chalk.gray('features/') + ' folders',
      '',
      chalk.bold('Configuration (.devcache.json):'),
      '• ' + chalk.cyan('projectName') + ' - Your project identifier',
      '• ' + chalk.cyan('description') + ' - Brief project description',
      '• ' + chalk.cyan('outputDir') + ' - Where docs are stored (default: devcache_docs)',
      '',
      chalk.gray('💡 Tip: Run this once per project'),
    ],
  },
  'generation': {
    title: '✨ Documentation Generation',
    content: [
      'Generate comprehensive documentation using AI-powered analysis.',
      '',
      chalk.bold('Command:'),
      chalk.cyan('devcache generate'),
      '',
      chalk.bold('What gets generated:'),
      '',
      chalk.bold('General Documentation:'),
      '• ' + chalk.gray('project-overview.md') + ' - High-level project summary',
      '• ' + chalk.gray('project-impact.md') + ' - Business value and impact',
      '',
      chalk.bold('Technical Documentation:'),
      '• ' + chalk.gray('stack-project.md') + ' - Technology stack details',
      '• ' + chalk.gray('architecture-project.md') + ' - System architecture',
      '• ' + chalk.gray('features.md') + ' - Feature overview',
      '• ' + chalk.gray('features/{feature}.md') + ' - Individual feature docs',
      '',
      chalk.bold('Best Practices:'),
      '✓ Run from project root directory',
      '✓ Ensure codebase is up to date',
      '✓ Review generated docs before pushing',
      '✓ Customize templates if needed',
      '',
      chalk.yellow('⚠️  Note: ') + 'Generation uses AI and may take a few minutes',
    ],
  },
  'best-practices': {
    title: '⭐ Best Practices for Quality Documentation',
    content: [
      chalk.bold('1. Project Structure:'),
      '✓ Keep code organized and well-commented',
      '✓ Use meaningful file and folder names',
      '✓ Maintain a clear project hierarchy',
      '',
      chalk.bold('2. Before Generation:'),
      '✓ Update README.md with current info',
      '✓ Ensure package.json is accurate',
      '✓ Remove outdated or unused code',
      '✓ Add inline comments for complex logic',
      '',
      chalk.bold('3. Documentation Quality:'),
      '✓ Review AI-generated content',
      '✓ Add project-specific context',
      '✓ Include examples and use cases',
      '✓ Keep technical details accurate',
      '',
      chalk.bold('4. Regular Updates:'),
      '✓ Regenerate after major changes',
      '✓ Use ' + chalk.cyan('devcache status') + ' to track changes',
      '✓ Push updates regularly',
      '✓ Version your documentation',
      '',
      chalk.bold('5. Team Collaboration:'),
      '✓ Share documentation with team',
      '✓ Establish documentation standards',
      '✓ Review docs in code reviews',
      '✓ Keep docs in sync with code',
    ],
  },
  'workflow': {
    title: '🔄 Recommended Workflow',
    content: [
      chalk.bold('Initial Setup (Once):'),
      '1. ' + chalk.cyan('npm install -g devcache-hub') + ' - Install CLI',
      '2. ' + chalk.cyan('devcache login') + ' - Authenticate',
      '',
      chalk.bold('Per Project (Once):'),
      '3. ' + chalk.cyan('cd your-project') + ' - Navigate to project',
      '4. ' + chalk.cyan('devcache init') + ' - Initialize DevCache',
      '',
      chalk.bold('Regular Documentation Cycle:'),
      '5. ' + chalk.cyan('devcache generate') + ' - Generate/update docs',
      '6. Review generated documentation',
      '7. ' + chalk.cyan('devcache status') + ' - Check pending changes',
      '8. ' + chalk.cyan('devcache push') + ' - Sync to cloud',
      '',
      chalk.bold('Troubleshooting:'),
      '• ' + chalk.cyan('devcache connection') + ' - Test database connection',
      '• ' + chalk.cyan('devcache profile') + ' - Verify authentication',
      '• ' + chalk.cyan('devcache logout') + ' + ' + chalk.cyan('login') + ' - Refresh session',
      '',
      chalk.bold('Maintenance:'),
      '• Run ' + chalk.cyan('devcache generate') + ' after major code changes',
      '• Use ' + chalk.cyan('devcache status') + ' before pushing',
      '• Keep documentation in sync with codebase',
    ],
  },
  'commands': {
    title: '📋 Command Reference',
    content: [
      chalk.bold('Authentication:'),
      chalk.cyan('devcache login') + '      - Authenticate with DevCache',
      chalk.cyan('devcache logout') + '     - Clear session and logout',
      chalk.cyan('devcache profile') + '    - Display user profile',
      '',
      chalk.bold('Project Setup:'),
      chalk.cyan('devcache init') + '       - Initialize project',
      '',
      chalk.bold('Documentation:'),
      chalk.cyan('devcache generate') + '   - Generate documentation',
      chalk.cyan('devcache status') + '     - Check pending changes',
      chalk.cyan('devcache push') + '       - Push to cloud',
      '',
      chalk.bold('Utilities:'),
      chalk.cyan('devcache connection') + ' - Test database connection',
      chalk.cyan('devcache guide') + '      - Show this guide',
      chalk.cyan('devcache --help') + '    - Show command help',
      chalk.cyan('devcache --version') + ' - Show version',
      '',
      chalk.gray('💡 Tip: Add --help to any command for detailed usage'),
    ],
  },
  'troubleshooting': {
    title: '🔧 Troubleshooting',
    content: [
      chalk.bold('Common Issues:'),
      '',
      chalk.yellow('1. "Not authenticated" error:'),
      '   → Run ' + chalk.cyan('devcache login') + ' to authenticate',
      '',
      chalk.yellow('2. "No documentation found" error:'),
      '   → Run ' + chalk.cyan('devcache init') + ' first',
      '   → Then run ' + chalk.cyan('devcache generate'),
      '',
      chalk.yellow('3. "Database connection failed":'),
      '   → Run ' + chalk.cyan('devcache connection') + ' to diagnose',
      '   → Check internet connection',
      '   → Try ' + chalk.cyan('devcache logout') + ' and ' + chalk.cyan('login') + ' again',
      '',
      chalk.yellow('4. "Push failed" error:'),
      '   → Verify authentication: ' + chalk.cyan('devcache profile'),
      '   → Test connection: ' + chalk.cyan('devcache connection'),
      '   → Check for pending changes: ' + chalk.cyan('devcache status'),
      '',
      chalk.yellow('5. Session expired:'),
      '   → Run ' + chalk.cyan('devcache login') + ' to refresh',
      '',
      chalk.bold('Still having issues?'),
      '• Check GitHub issues: ' + chalk.blue('https://github.com/tryanglebuild/devcache/issues'),
      '• Contact support: ' + chalk.blue('support@devcache.dev'),
    ],
  },
  'tips': {
    title: '💡 Pro Tips',
    content: [
      chalk.bold('Productivity Tips:'),
      '',
      '1. ' + chalk.bold('Use status before push:'),
      '   ' + chalk.cyan('devcache status && devcache push'),
      '   See what changed before syncing',
      '',
      '2. ' + chalk.bold('Automate with scripts:'),
      '   Add to package.json:',
      '   ' + chalk.gray('"scripts": { "docs": "devcache generate && devcache push" }'),
      '',
      '3. ' + chalk.bold('Regular updates:'),
      '   Generate docs after each sprint/release',
      '   Keep documentation fresh and accurate',
      '',
      '4. ' + chalk.bold('Team workflow:'),
      '   One person runs ' + chalk.cyan('devcache generate'),
      '   Team reviews before ' + chalk.cyan('devcache push'),
      '',
      '5. ' + chalk.bold('Version control:'),
      '   Commit ' + chalk.gray('.devcache.json') + ' to git',
      '   Add ' + chalk.gray('devcache_docs/') + ' to .gitignore (optional)',
      '',
      '6. ' + chalk.bold('Quick health check:'),
      '   ' + chalk.cyan('devcache connection') + ' - Test everything at once',
      '',
      '7. ' + chalk.bold('Documentation quality:'),
      '   Review and edit generated docs',
      '   Add project-specific context',
      '   Include examples and diagrams',
    ],
  },
};

// Renders the interactive guide loop: shows the topic menu, displays the selected
// section's content, then loops back to the menu until the user chooses to exit.
export async function guideCommand() {
  console.log(chalk.blue.bold('\n📚 DevCache Guide\n'));
  console.log(chalk.gray('Learn how to use DevCache effectively\n'));

  const choices = [
    { name: '🚀 Getting Started', value: 'getting-started' },
    { name: '🔐 Authentication', value: 'authentication' },
    { name: '📁 Project Initialization', value: 'initialization' },
    { name: '✨ Documentation Generation', value: 'generation' },
    { name: '⭐ Best Practices', value: 'best-practices' },
    { name: '🔄 Recommended Workflow', value: 'workflow' },
    { name: '📋 Command Reference', value: 'commands' },
    { name: '🔧 Troubleshooting', value: 'troubleshooting' },
    { name: '💡 Pro Tips', value: 'tips' },
    { name: '❌ Exit', value: 'exit' },
  ];

  let continueGuide = true;

  while (continueGuide) {
    const { section } = await inquirer.prompt([
      {
        type: 'list',
        name: 'section',
        message: 'Choose a topic:',
        choices,
        pageSize: 12,
      },
    ]);

    if (section === 'exit') {
      console.log(chalk.gray('\n👋 Happy documenting!\n'));
      continueGuide = false;
      break;
    }

    const guide = sections[section];
    
    console.log('\n' + chalk.bold(guide.title));
    console.log(chalk.gray('─'.repeat(50)));
    console.log();
    
    guide.content.forEach(line => {
      console.log(line);
    });
    
    console.log();
    console.log(chalk.gray('─'.repeat(50)));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What next?',
        choices: [
          { name: '← Back to menu', value: 'back' },
          { name: '❌ Exit guide', value: 'exit' },
        ],
      },
    ]);

    if (action === 'exit') {
      console.log(chalk.gray('\n👋 Happy documenting!\n'));
      continueGuide = false;
    }

    console.log();
  }
}

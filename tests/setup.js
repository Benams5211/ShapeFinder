/**
 * Test Environment Setup File
 * 
 * This file configures a simulated browser environment for running p5.js unit tests in Node.js.
 * It provides all the necessary global variables, mocks, and dependencies that the application
 * expects to find in a browser environment, allowing tests to run without an actual browser.
 * 
 * Key Setup Activities:
 * - Creates mock browser APIs (window, document, localStorage)
 * - Provides p5.js global function mocks (millis, print)
 * - Sets up game event system and application constants
 * - Loads application source code into the test context
 * - Configures Chai assertion library for testing
 * 
 * This file must be required at the top of all test files to ensure consistent test environment.
 */

const MockLocalStorage = require('./mockLocalstorage');
const fs = require('fs');
const path = require('path');

global.localStorage = new MockLocalStorage();
global.millis = () => Date.now();
global.print = console.log;

// Mock other globals
global.round = 100;
global.localstorageRoundObjectsKey = 'roundObjects';
global.localstorageDateKey = 'date';
global.localstorageIDKey = 'id'; 
global.localstorageValueKey = 'value';

// Minimal DOM globals
global.window = global;
global.document = {
  createElement: () => ({})
};

// Load the source code as a string
const sourceCode = fs.readFileSync(path.join(__dirname, '../localstorageManager.js'), 'utf8');

// Wrap the source code to explicitly assign classes to global scope
const wrappedCode = `
// Start of wrapped code
${sourceCode}

// Explicitly assign to global scope
if (typeof LocalStorageManager !== 'undefined') {
  global.LocalStorageManager = LocalStorageManager;
}
if (typeof LocalStorageRoundManager !== 'undefined') {
  global.LocalStorageRoundManager = LocalStorageRoundManager;
}
if (typeof SessionStats !== 'undefined') {
  global.SessionStats = SessionStats;
}
if (typeof LifetimeStats !== 'undefined') {
  global.LifetimeStats = LifetimeStats;
}
if (typeof StatTracker !== 'undefined') {
  global.StatTracker = StatTracker;
}
// End of wrapped code
`;

// Execute the wrapped code
eval(wrappedCode);

// Set up Chai
global.chai = require('chai');
global.expect = chai.expect;
global.assert = chai.assert;

console.log('✓ Setup completed. Available classes:');
console.log('  - LocalStorageManager:', typeof global.LocalStorageManager);
console.log('  - LocalStorageRoundManager:', typeof global.LocalStorageRoundManager);
console.log('  - SessionStats:', typeof global.SessionStats);
console.log('  - LifetimeStats:', typeof global.LifetimeStats);
console.log('  - StatTracker:', typeof global.StatTracker);
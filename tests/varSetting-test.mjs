//tests to see if variables are what they are supposed to be between rounds and stuff

import { 
  startGame,
  round,
  combo,
  gameState
} from '../testImports/sketchSetup.js';

import {
    TestRunner
} from './testClass.js';

global.random = () => Math.random();

const runner = new TestRunner();

startGame();

runner.test('Our variables are properly initialized', function() {
    this.assertTrue(round==1 , 'Starts at first round');
    this.assertTrue(combo==0 , 'Combo starts at zero');
    this.assertTrue(gameState=='game' , 'We are in \'game\' state');
});

if (typeof window === 'undefined') {
    // Node.js environment - run immediately
    runner.run();
}

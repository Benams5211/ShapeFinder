//makes sure the formula for clicking on an object is sound

import { 
    ClickRect,
    ClickCircle,
    ClickTri
} from '../interactiveObject.js';

import {
    TestRunner
} from './testClass.js';

const runner = new TestRunner();

runner.test('We can properly click inside a rectangle ', function() {
    const rect = new ClickRect(0,0,10,10);
    this.assertTrue(rect.contains(2,25) , '(2,2) should be inside this rectangle');
});

// Auto-run tests in Node.js, but not in browser (browser imports explicitly)
if (typeof window === 'undefined') {
    // Node.js environment - run immediately
    runner.run();
}

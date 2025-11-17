// Simple test framework
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(name, fn) {
        this.tests.push({ name, fn });
    }
    
    assertEquals(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
        }
    }
    
    assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(message || 'Expected true but got false');
        }
    }
    
    assertFalse(condition, message = '') {
        if (condition) {
            throw new Error(message || 'Expected false but got true');
        }
    }
    
    assertApprox(actual, expected, tolerance = 0.01, message = '') {
        if (Math.abs(actual - expected) > tolerance) {
            throw new Error(`${message}\n  Expected: ~${expected}\n  Actual: ${actual}`);
        }
    }
    
    run() {
        console.log('Running tests...\n');
        
        for (let test of this.tests) {
            try {
                test.fn.call(this);
                this.passed++;
                console.log(`Pass: ${test.name}`);
            } catch (error) {
                this.failed++;
                console.log(`Fail: ${test.name}`);
                console.log(`  ${error.message}\n`);
            }
        }
        
        console.log(`\n${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
}

export {
  TestRunner,
};

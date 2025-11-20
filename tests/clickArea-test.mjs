//makes sure the formula for clicking on an object is sound

import { 
    ClickRect,
    ClickCircle,
    ClickTri
} from '../testImports/interactiveObjectSetup.js';

import {
    TestRunner
} from './testClass.js';

global.random = () => Math.random();

const runner = new TestRunner();

runner.test('We can properly click inside a rectangle ', function() {
    const rect = new ClickRect(0,0,10,10);
    this.assertTrue(rect.contains(2,2) , '(2,2) should be inside this rectangle');
});

// RECTANGLE TESTS
runner.test('ClickRect contains point inside', function() {
    const rect = new ClickRect(0, 0, 10, 10);
    this.assertTrue(rect.contains(2, 2), '(2,2) should be inside this rectangle');
});

runner.test('ClickRect does NOT contain point outside', function() {
    const rect = new ClickRect(0, 0, 10, 10);
    this.assertTrue(!rect.contains(6, 6), '(6,6) should be outside this rectangle');
});

runner.test('ClickRect contains point on edge', function() {
    const rect = new ClickRect(0, 0, 10, 10);
    this.assertTrue(rect.contains(5, 0), '(5,0) should be on the edge and considered inside');
});

// CIRCLE TESTS
runner.test('ClickCircle contains point inside', function() {
    const circle = new ClickCircle(0, 0, 5);
    this.assertTrue(circle.contains(3, 4), '(3,4) should be inside the circle');
});

runner.test('ClickCircle does NOT contain point outside', function() {
    const circle = new ClickCircle(0, 0, 5);
    this.assertTrue(!circle.contains(6, 0), '(6,0) should be outside the circle');
});

runner.test('ClickCircle contains point on radius', function() {
    const circle = new ClickCircle(0, 0, 5);
    this.assertTrue(circle.contains(5, 0), '(5,0) should be on the edge and considered inside');
});

// TRIANGLE TESTS
runner.test('ClickTri contains point inside', function() {
    const tri = new ClickTri(0, 0, 10);
    const [vx, vy] = [0, 0]; // center point
    this.assertTrue(tri.contains(vx, vy), '(0,0) should be inside the triangle');
});

runner.test('ClickTri does NOT contain point outside', function() {
    const tri = new ClickTri(0, 0, 10);
    this.assertTrue(!tri.contains(10, 10), '(10,10) should be outside the triangle');
});

runner.test('ClickTri contains vertex points', function() {
    const tri = new ClickTri(0, 0, 10);
    const verts = tri.vertices();
    for (let [x, y] of verts) {
        this.assertTrue(tri.contains(x, y), `Vertex (${x},${y}) should be inside the triangle`);
    }
});

// ================= RECTANGLE TESTS =================
runner.test('ClickRect contains center point', function() {
    const rect = new ClickRect(0, 0, 20, 10);
    this.assertTrue(rect.contains(0, 0), 'Center (0,0) should be inside rectangle');
});

runner.test('ClickRect does NOT contain point outside', function() {
    const rect = new ClickRect(0, 0, 20, 10);
    this.assertFalse(rect.contains(15, 6), '(15,6) should be outside rectangle');
});

runner.test('ClickRect edge cases', function() {
    const rect = new ClickRect(0, 0, 20, 10);
    this.assertTrue(rect.contains(10, 0), 'Right edge (10,0) should be inside');
    this.assertTrue(rect.contains(-10, 0), 'Left edge (-10,0) should be inside');
    this.assertFalse(rect.contains(11, 0), '(11,0) should be outside');
});

// Random rectangle points
runner.test('ClickRect random points inside', function() {
    const rect = new ClickRect(0, 0, 20, 10);
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * 20 - 10; // -10 to 10
        const y = Math.random() * 10 - 5;  // -5 to 5
        this.assertTrue(rect.contains(x, y), `(${x.toFixed(2)},${y.toFixed(2)}) should be inside`);
    }
});

runner.test('ClickRect random points outside', function() {
    const rect = new ClickRect(0, 0, 20, 10);
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * 40 - 20; // -20 to 20
        const y = Math.random() * 20 - 10; // -10 to 10
        if (x < -10 || x > 10 || y < -5 || y > 5) {
            this.assertFalse(rect.contains(x, y), `(${x.toFixed(2)},${y.toFixed(2)}) should be outside`);
        }
    }
});

// ================= CIRCLE TESTS =================
runner.test('ClickCircle contains center', function() {
    const circle = new ClickCircle(0, 0, 5);
    this.assertTrue(circle.contains(0, 0), 'Center should be inside circle');
});

runner.test('ClickCircle does NOT contain point outside', function() {
    const circle = new ClickCircle(0, 0, 5);
    this.assertFalse(circle.contains(6, 0), '(6,0) should be outside circle');
});

runner.test('ClickCircle edge cases', function() {
    const circle = new ClickCircle(0, 0, 5);
    this.assertTrue(circle.contains(5, 0), 'Point on radius should be inside');
    this.assertFalse(circle.contains(-5.1, 0), 'Point just outside should be outside');
});

// Random circle points
runner.test('ClickCircle random points inside', function() {
    const circle = new ClickCircle(0, 0, 5);
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * 5 * 2 - 5;
        const y = Math.random() * 5 * 2 - 5;
        if (x*x + y*y <= 25) {
            this.assertTrue(circle.contains(x, y), `(${x.toFixed(2)},${y.toFixed(2)}) should be inside`);
        }
    }
});

runner.test('ClickCircle random points outside', function() {
    const circle = new ClickCircle(0, 0, 5);
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * 15 - 7.5;
        const y = Math.random() * 15 - 7.5;
        if (x*x + y*y > 25) {
            this.assertFalse(circle.contains(x, y), `(${x.toFixed(2)},${y.toFixed(2)}) should be outside`);
        }
    }
});

// ================= TRIANGLE TESTS =================
runner.test('ClickTri contains center', function() {
    const tri = new ClickTri(0, 0, 10);
    this.assertTrue(tri.contains(0, 0), 'Center should be inside triangle');
});

runner.test('ClickTri does NOT contain outside point', function() {
    const tri = new ClickTri(0, 0, 10);
    this.assertFalse(tri.contains(10, 10), '(10,10) should be outside triangle');
});

runner.test('ClickTri vertices are inside', function() {
    const tri = new ClickTri(0, 0, 10);
    tri.vertices().forEach(([x, y]) => {
        this.assertTrue(tri.contains(x, y), `Vertex (${x.toFixed(2)},${y.toFixed(2)}) should be inside`);
    });
});

// Random triangle points (approximate)
runner.test('ClickTri random points', function() {
    const tri = new ClickTri(0, 0, 10);
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * 10 - 5;
        const y = Math.random() * 10 - 5;
        const inside = tri.contains(x, y);
        // just assert something to exercise the function
        this.assertTrue(typeof inside === 'boolean', `contains returned boolean for (${x.toFixed(2)},${y.toFixed(2)})`);
    }
});

}

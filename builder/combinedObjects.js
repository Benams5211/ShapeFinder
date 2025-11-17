// Given : A list of interactors, index 0 being the main object
// Offset (x,y) from the main object's position
// Shapes will move connected 

// objectList 
// [Object] = { Offset }
let combinedObjectList = [];

class CombinedObjects {
    constructor(mainObject, objectList) {
        this.objectList = objectList;

        this.mainObject = mainObject
    }

    update() {
        const r = this.getBoundsRadius();
        //  Update children positions first 
        for (const o of this.objectList) {
            o.Shape.x = this.mainObject.x + o.offsetX;
            o.Shape.y = this.mainObject.y + o.offsetY;
        }

        // Bounds handling for the entire combined object
        // We use the main object's velocity to determine bounce direction
        if (!this.mainObject.vx) this.mainObject.vx = 0;
        if (!this.mainObject.vy) this.mainObject.vy = 0;

        if (this.mainObject.x < r) {
            this.mainObject.x = r;
            this.mainObject.vx *= -1;
            this.mainObject.targetVx *= -1;
        }
        if (this.mainObject.x > windowWidth - r) {
            this.mainObject.x = windowWidth - r;
            this.mainObject.vx *= -1;
            this.mainObject.targetVx *= -1;
        }
        if (this.mainObject.y <  r) {
            this.mainObject.y =  r;
            this.mainObject.vy *= -1;
            this.mainObject.targetVy *= -1;
        }
        if (this.mainObject.y > windowHeight - r) {
            this.mainObject.y = windowHeight - r;
            this.mainObject.vy *= -1;
            this.mainObject.targetVy *= -1;
        }
    }
    // It's a bit broken for certain builds
    getBoundsRadius() {
        // Compute max distance from mainObject center
        let maxDist = this.mainObject.getBoundsRadius();
        for (const c of this.objectList) {
            const dx = c.offsetX;
            const dy = c.offsetY;
            const dist = Math.sqrt(dx*dx + dy*dy) + c.Shape.getBoundsRadius();
            if (dist > maxDist) maxDist = dist;
        }
        return maxDist;
    }

    serialize() {
        return {
            type: 'combined',
            main: this.mainObject.serialize(),
            children: this.objectList.map(o => ({
                shape: o.Shape.serialize(),
                offsetX: o.offsetX,
                offsetY: o.offsetY
            }))
        };
    }

    static fromData(data, enableMovement = false) {
        const mainShape = shapeFromData(data.main);
        if(enableMovement) {
            mainShape.movement.enabled = true;
            mainShape.vx = 0
            mainShape.vy = 0
            mainShape.targetVx = 0
            mainShape.targetVy = 0
        }

        const childList = data.children.map(c => {
            const shape = shapeFromData(c.shape);
            if(enableMovement) {
                shape.movement.enabled = false;
                shape.vx = 0
                shape.vy = 0
                shape.targetVx = 0
                shape.targetVy = 0
            }
            return {
                Shape: shape,
                offsetX: c.offsetX,
                offsetY: c.offsetY
            };
        });

        return new CombinedObjects(mainShape, childList);
    }
}

// Will re-factor later to inherit CombinedObjects and its update
// so animations can be created as well for each individual part
// todo: key identifier for children shapes?
class Alien {
    constructor() {
        this.object = null;
    }
    async spawn() {
        this.object = await loadCombinedObjectFromFile("/ShapingBad/assets/combinedObjects/alien.json");
        combinedObjectList.push(this.object);

        interactors.push(this.object.mainObject);
        for (const child of this.object.objectList) interactors.push(child.Shape);   
    }
}

class Cloud {
    constructor() {
        this.object = null;
    }
    async spawn() {
        this.object = await loadCombinedObjectFromFile("/ShapingBad/assets/combinedObjects/cloud.json");
        combinedObjectList.push(this.object);

        interactors.push(this.object.mainObject);
        for (const child of this.object.objectList) interactors.push(child.Shape);
    }
}

class Angel {
    constructor() {
        this.object = null;
    }
    async spawn() {
        this.object = await loadCombinedObjectFromFile("/ShapingBad/assets/combinedObjects/angel.json");
        combinedObjectList.push(this.object);

        interactors.push(this.object.mainObject);
        for (const child of this.object.objectList) interactors.push(child.Shape);
    }
}
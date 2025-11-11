// Unit tests for LocalStorageManager.js
// Run by: 
// node LocalStorageManager-test.js
// Model is with P5.js dependencies!

require('./setup.js');

describe('MockLocalStorage', function() {
  beforeEach(function() {
    localStorage.clear();
  });

  it('should store and retrieve string values', function() {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).to.equal('value');
  });

  it('should handle JSON data correctly', function() {
    const testData = { array: [1, 2, 3] };
    localStorage.setItem('json', JSON.stringify(testData));
    const retrieved = JSON.parse(localStorage.getItem('json'));
    expect(retrieved).to.deep.equal(testData);
  });

  it('should track length correctly', function() {
    expect(localStorage.length).to.equal(0);
    localStorage.setItem('key1', 'value1');
    expect(localStorage.length).to.equal(1);
    localStorage.setItem('key2', 'value2');
    expect(localStorage.length).to.equal(2);
    localStorage.removeItem('key1');
    expect(localStorage.length).to.equal(1);
  });
});

describe('LocalStorageManager with Mock Storage', function() {
  beforeEach(function() {
    localStorage.clear();
  });

  describe('getArrayObject', function() {
    it('should handle empty storage gracefully', function() {
      const manager = new LocalStorageManager();
      const result = manager.getArrayObject('empty');
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });

    it('should parse stored arrays correctly', function() {
      localStorage.setItem('arrayKey', JSON.stringify([{ id: 1 }, { id: 2 }]));
      const manager = new LocalStorageManager();
      const result = manager.getArrayObject('arrayKey');
      expect(result).to.deep.equal([{ id: 1 }, { id: 2 }]);
    });

    it('should handle malformed JSON by returning empty array', function() {
      localStorage.setItem('badJson', 'not valid json');
      const manager = new LocalStorageManager();
      const result = manager.getArrayObject('badJson');
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });

    it('should handle null values from storage', function() {
      // Simulate what happens when key doesn't exist
      const manager = new LocalStorageManager();
      const result = manager.getArrayObject('nonexistent');
      expect(result).to.deep.equal([]);
    });
  });

  describe('setItem', function() {
    it('should store data as JSON string', function() {
      const manager = new LocalStorageManager();
      const testData = [{ name: 'test' }, { name: 'test2' }];
      manager.setItem('testKey', testData);
      
      const stored = localStorage.getItem('testKey');
      expect(stored).to.equal(JSON.stringify(testData));
    });

    it('should overwrite existing data', function() {
      const manager = new LocalStorageManager();
      manager.setItem('key', 'first');
      manager.setItem('key', 'second');
      
      expect(localStorage.getItem('key')).to.equal('"second"');
    });
  });
});

describe('LocalStorageRoundManager with Mock Storage', function() {
  beforeEach(function() {
    localStorage.clear();
    global.round = 100;
  });

  it('should store rounds with sequential IDs', function() {
    const manager = new LocalStorageRoundManager();
    
    manager.storeRound();
    global.round = 150;
    manager.storeRound();
    global.round = 75;
    manager.storeRound();
    
    const rounds = manager.getArrayObject(localstorageRoundObjectsKey);
    expect(rounds).to.have.lengthOf(3);
    expect(rounds[0].id).to.equal(1);
    expect(rounds[1].id).to.equal(2);
    expect(rounds[2].id).to.equal(3);
    expect(rounds[0].value).to.equal(100);
    expect(rounds[1].value).to.equal(150);
    expect(rounds[2].value).to.equal(75);
  });

  it('should handle empty storage when storing first round', function() {
    const manager = new LocalStorageRoundManager();
    
    manager.storeRound();
    
    const rounds = manager.getArrayObject(localstorageRoundObjectsKey);
    expect(rounds).to.have.lengthOf(1);
    expect(rounds[0].id).to.equal(1);
    expect(rounds[0].value).to.equal(100);
    expect(rounds[0]).to.have.property('date');
  });

  it('should get top rounds in correct order', function() {
    const manager = new LocalStorageRoundManager();
    
    // Store rounds with different values
    const testRounds = [50, 200, 100, 300, 75];
    testRounds.forEach(value => {
      global.round = value;
      manager.storeRound();
    });
    
    const top3 = manager.getTopRounds(3);
    expect(top3).to.have.lengthOf(3);
    expect(top3[0].value).to.equal(300);
    expect(top3[1].value).to.equal(200);
    expect(top3[2].value).to.equal(100);
    
    const top5 = manager.getTopRounds(5);
    expect(top5).to.have.lengthOf(5);
    expect(top5[4].value).to.equal(50);
  });

  it('should handle getTopRounds with fewer rounds than limit', function() {
    const manager = new LocalStorageRoundManager();
    
    global.round = 100;
    manager.storeRound();
    
    const top5 = manager.getTopRounds(5);
    expect(top5).to.have.lengthOf(1);
    expect(top5[0].value).to.equal(100);
  });

  it('should handle getTopRounds with no rounds', function() {
    const manager = new LocalStorageRoundManager();
    
    const topRounds = manager.getTopRounds(3);
    expect(topRounds).to.be.an('array');
    expect(topRounds).to.have.lengthOf(0);
  });
});

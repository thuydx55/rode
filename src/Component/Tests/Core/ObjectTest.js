var expect = require('expect.js');
var rode = require('../../../../rode');

describe('rode.Object', function () {

    /**
     * Check if new instances of Object can be created
     */
    it('should allow new instances', function () {
        var object = new rode.Object({
            key: 'value'
        });
        expect(object instanceof rode.Object).to.be(true);
        expect(object.key).to.be('value');
    });

    /**
     * Check if Object can be extended
     */
    it('should be extensible', function () {
        var MyClass = rode.Object.extend({
            getName: function () {
                return this.name
            }
        });
        var myInstance = new MyClass({
            name: 'my name'
        });
        expect(myInstance instanceof MyClass).to.be(true);
        expect(myInstance.getName()).to.be('my name');
        expect(MyClass.extend).to.be.a('function');
    });
});
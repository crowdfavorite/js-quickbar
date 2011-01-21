describe("SelectionList", function() {

    var $ = jQuery,
        cont,
        field;

    // utility function for initializing a field with a selectionList attached
    function makeSelectionList(cfg) {
        cont = document.createElement('div');
        document.body.appendChild(cont);
        field = document.createElement("input");
        field.type = 'text';
        field.id = 'tester';
        cont.appendChild(field);
        $(field).selectionList(cfg || {});
    }

    // cleanup
    afterEach(function() {
        if (field) {
            $(field).remove();
            field = null;
        }
        if (cont) {
            $(cont).remove();
            cont = null;
        }
    });




    ///// Specs /////

    describe("API", function() {
        it("should expose a selectionList method to the jQuery instance", function() {
            expect(typeof $('<div></div>').selectionList).toEqual('function');
        });

        it("should add the internal class constructor as a property to the selectionList method", function() {
            expect(typeof $('<div></div>').selectionList.cls).toEqual('function');
        });
    });

    describe("basic creation", function() {
        it("should associate a SelectionList instance to the element", function() {
            makeSelectionList();
            var inst = $(field).data('selectionList');
            expect(inst).toBeDefined();
            expect(inst instanceof $.fn.selectionList.cls).toBe(true);
        });

        it("should not create the dropdown element at first", function() {
            makeSelectionList();
            expect($(field).next('ul')[0]).not.toBeDefined();
        });
    });

    describe("show method", function() {
        it("should create a ul element after the input", function() {
            makeSelectionList();
            $(field).selectionList('show');
            expect($(field).next('ul')[0]).toBeDefined();
            expect($(field).next('ul')[0].className).toEqual('selectionList');
        });

        it("should show the ul", function() {
            makeSelectionList();
            runs(function() {
                $(field).selectionList('show');
            });
            waitsFor(function() {
                return !$(field).next('ul').is(':hidden');
            }, 'dropdown was not shown');
        });

        it("should invoke a callback argument", function() {
            makeSelectionList();
            var spy = jasmine.createSpy();
            runs(function() {
                $(field).selectionList('show', spy);
            });
            waitsFor(function() {
                return spy.callCount > 0;
            }, 'show method callback was not called');
        });
    });

    describe("hide method", function() {
        it("should hide the ul", function() {
            makeSelectionList();
            runs(function() {
                $(field).selectionList('show');
            });
            waitsFor(function() {
                return !$(field).next('ul').is(':hidden');
            }, 'dropdown was not shown');
            runs(function() {
                $(field).selectionList('hide');
            });
            waitsFor(function() {
                return $(field).next('ul').is(':hidden');
            }, 'dropdown was not hidden');
        });

        it("should invoke a callback argument", function() {
            makeSelectionList();
            var spy = jasmine.createSpy();
            runs(function() {
                $(field).selectionList('show');
            });
            waitsFor(function() {
                return !$(field).next('ul').is(':hidden');
            }, 'show method callback was not called');
            runs(function() {
                $(field).selectionList('hide', spy);
            });
            waitsFor(function() {
                return spy.callCount > 0;
            }, 'hide method callback was not called');
        });
    });

    describe("items config", function() {
        it("should add each item as a li", function() {
            makeSelectionList({items: ['one', 'two', 'three']});
            $(field).selectionList('show');
            var lis = $(field).next('ul').find('li');
            expect(lis.size()).toEqual(3);
            expect(lis.eq(0).text()).toEqual('one');
        });
    });

    describe("addItem method", function() {
        it("should add a li to the list", function() {
            makeSelectionList({items: ['one', 'two', 'three']});
            $(field).selectionList('addItem', 'four');
            var lis = $(field).next('ul').find('li');
            expect(lis.size()).toEqual(4);
            expect(lis.eq(3).text()).toEqual('four');
        });
    });

    describe("removeItem method", function() {
        it("should remove the li from the list", function() {
            makeSelectionList({items: ['one', 'two', 'three', 'four']});
            $(field).selectionList('removeItem', 'four');
            var lis = $(field).next('ul').find('li');
            expect(lis.size()).toEqual(3);
        });
    });

    describe("keys", function() {
        beforeEach(function() {
            makeSelectionList({items: ['one', 'two', 'three']});
        });

        describe("down", function() {
            it("should show the dropdown", function() {
                runs(function() {
                    $(field).trigger({type: 'keydown', which: 40});
                });
                waitsFor(function() {
                    return !$(field).next('ul').is(':hidden');
                }, 'dropdown was not shown');
            });
            it("should highlight the first item if none already highlighted", function() {
                $(field).trigger({type: 'keydown', which: 40});
                expect($(field).next('ul').find('li').eq(0).hasClass('highlight')).toBe(true);
            });
            it("should highlight the next item if one is already highlighted", function() {
                $(field).trigger({type: 'keydown', which: 40})
                        .trigger({type: 'keydown', which: 40});
                expect($(field).next('ul').find('li').eq(1).hasClass('highlight')).toBe(true);
            });
            it("should wrap around when reaching the end", function() {
                $(field).trigger({type: 'keydown', which: 40})
                        .trigger({type: 'keydown', which: 40})
                        .trigger({type: 'keydown', which: 40})
                        .trigger({type: 'keydown', which: 40});
                expect($(field).next('ul').find('li').eq(0).hasClass('highlight')).toBe(true);
            });
        });

        describe("up", function() {
            it("should show the dropdown", function() {
                runs(function() {
                    $(field).trigger({type: 'keydown', which: 38});
                });
                waitsFor(function() {
                    return !$(field).next('ul').is(':hidden');
                }, 'dropdown was not shown');
            });
            it("should highlight the last item if none already highlighted", function() {
                $(field).trigger({type: 'keydown', which: 38});
                expect($(field).next('ul').find('li').eq(2).hasClass('highlight')).toBe(true);
            });
            it("should highlight the previous item if one is already highlighted", function() {
                $(field).trigger({type: 'keydown', which: 38})
                        .trigger({type: 'keydown', which: 38});
                expect($(field).next('ul').find('li').eq(1).hasClass('highlight')).toBe(true);
            });
            it("should wrap around when reaching the beginning", function() {
                $(field).trigger({type: 'keydown', which: 38})
                        .trigger({type: 'keydown', which: 38})
                        .trigger({type: 'keydown', which: 38})
                        .trigger({type: 'keydown', which: 38});
                expect($(field).next('ul').find('li').eq(2).hasClass('highlight')).toBe(true);
            });
        });

        describe("enter", function() {
            it("should not fire the 'select' event if nothing is highlighted", function() {
                var spy = jasmine.createSpy();
                $(field).bind('select', spy);
                $(field).trigger({type: 'keyup', which: 13});
                expect(spy).not.toHaveBeenCalled();
            });

            it("should not fire the 'select' event if the dropdown is hidden", function() {
                var spy = jasmine.createSpy();
                $(field).bind('select', spy);
                $(field).trigger({type: 'keydown', which: 40});
                $(field).selectionList('hide');
                $(field).trigger({type: 'keyup', which: 13});
                expect(spy).not.toHaveBeenCalled();
            });

            it("should fire the 'select' event with the highlighted item", function() {
                var spy = jasmine.createSpy();
                $(field).bind('select', spy);
                $(field).trigger({type: 'keydown', which: 40});
                $(field).trigger({type: 'keyup', which: 13});
                expect(spy).toHaveBeenCalled();
                expect(spy.argsForCall[0][1]).toEqual(0);
                expect(spy.argsForCall[0][2]).toEqual('one');
                $(field).trigger({type: 'keydown', which: 40});
                $(field).trigger({type: 'keyup', which: 13});
                expect(spy.argsForCall[1][1]).toEqual(1);
                expect(spy.argsForCall[1][2]).toEqual('two');
            });
        });

        describe('escape', function() {
            it("should hide the dropdown", function() {
                runs(function() {
                    $(field).selectionList('show');
                });
                waitsFor(function() {
                    return !$(field).next('ul').is(':hidden');
                }, 'dropdown was not shown');
                runs(function() {
                    $(field).trigger({type: 'keyup', which: 27});
                });
                waitsFor(function() {
                    return $(field).next('ul').is(':hidden');
                }, 'dropdown was not hidden');
            });
        });
    });

    describe("destroy", function() {
        it("should remove the dropdown element", function() {
            makeSelectionList();
            $(field).selectionList('show');
            $(field).selectionList('destroy');
            expect($(field).next('ul')[0]).not.toBeDefined();
        });
    });


});
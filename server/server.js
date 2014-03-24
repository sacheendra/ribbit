/**
 * Created by dystopian on 3/24/14.
 */
Ribbits = new Meteor.Collection('ribbits');
Meteor.publish('ribbits', function () {
    return Ribbits.find({});
});


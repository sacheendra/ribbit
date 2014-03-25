/**
 * Created by dystopian on 3/24/14.
 */
Ribbits = new Meteor.Collection('ribbits');
Follows = new Meteor.Collection('follows');

Meteor.publish('ribbits', function () {
    return Ribbits.find({});
});
Meteor.publish('follows', function () {
    return Follows.find({});
});

Ribbits.allow({
    insert: function() {
        return true;
    }
});
Ribbits.deny({
    insert: function(userId, doc) {
        return !(doc.user_id === userId);
    }
});

Follows.allow({
    insert: function() {
        return true;
    }
});
Follows.deny({
    insert: function(userId, doc) {
        return !(doc.followee_id === userId);
    },
    remove: function(userId, doc) {
        return !(doc.followee_id === userId);
    }
});


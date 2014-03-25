/**
 * Created by dystopian on 3/24/14.
 */
Ribbits = new Meteor.Collection('ribbits');
Follows = new Meteor.Collection('follows');
Meteor.subscribe('ribbits');
Meteor.subscribe('follows');

Template.header.events({
    'click #btnLogOut': function (event, template) {
        if (Meteor.userId()) {
            Meteor.logout();
        } else {
            var userName     = template.find('#username').value,
                userPassword = template.find('#password').value;
            Meteor.loginWithPassword(userName, userPassword, function (error) {
                if (error) {
                    console.log(error);
                }
            });
        }
    },

    'click #public': function (event, template) {
        Session.set("currentPage", "public");
    },

    'click #buddies': function (event, template) {
        Session.set("currentPage", "buddies");
    },

    'click #profile': function (event, template) {
        Session.set("currentPage", "profile");
    }
});

Template.homecontent.events({
    'click #btnCreateAccount': function (event, template) {
        var userEmail = template.find('#email').value,
            userName  = template.find('#newusername').value,
            password  = template.find('#newpassword').value,
            password2 = template.find('#password2').value,
            name      = template.find('#fullname').value;

        Accounts.createUser({
            username: userName,
            email:    userEmail,
            password: password,
            profile: {
                name: name
            }
        }, function (error) {
            if (error) {
                console.log("Cannot create user");
            }
        });
    }
});

Template.buddiescontent.events({
    'click #createRibbit': function (event, template) {
        var ribbitContent= template.find('.ribbitText').value;

        Ribbits.insert({
            user_id: Meteor.user()._id,
            ribbit: ribbitContent,
            created_at: new Date()
        });
        template.find('.ribbitText').value = "";
    }
});

Template.public.events({
    'click #createRibbit': function (event, template) {
        var ribbitContent= template.find('.ribbitText').value;

        Ribbits.insert({
            user_id: Meteor.user()._id,
            ribbit: ribbitContent,
            created_at: new Date()
        });
        template.find('.ribbitText').value = "";
    }
});

Template.profile.events({
    'click input[type="submit"]': function(event, template) {
        var searchedUser = template.find('input[type="text"]').value;
        if (searchedUser !== "") {
            Session.set('searchedName', searchedUser);
        } else {
            Session.set('searchedName', undefined);
        }
        Template.profile();
    },

    'click .follow': function(event, template) {
        var isFollowed, theClickedUserId = event.currentTarget.id,
            theFollowees = Follows.find({user_id: theClickedUserId});

        theFollowees.forEach(function (theFollowee) {
            if (theFollowee.followee_id === Meteor.userId()) {
                isFollowed = true;
            } else {
                isFollowed = false;
            }
        });

        if (!isFollowed) {
            Follows.insert({
                user_id: theClickedUserId,
                followee_id: Meteor.userId()
            });
        } else {
            Follows.remove({
                $and: [
                    {user_id: theClickedUserId},
                    {followee_id: Meteor.user()._id}
                ]
            });
        }
    }
});

Template.buddiescontent.helpers({
    fullName: function () {
        return Meteor.user().profile.name;
    },

    userName: function () {
        return Meteor.user().username;
    },

    noOfRibbits: function () {
        var ribbits = Ribbits.find({user_id: Meteor.userId()}),
            retVal;
        if (ribbits.count() === 1) {
            retVal = "1";
        } else {
            retVal = ribbits.count();
        }
        return retVal;
    },

    lastRibbit: function () {
        var lastRibbit = Ribbits.findOne({user_id: Meteor.userId()}, {sort: {created_at: -1}}),
            retVal;

        if (lastRibbit) {
            retVal = lastRibbit.ribbit;
        } else {
            retVal = 'This user has no Ribbits';
        }

        return retVal;
    },

    ribbits: function () {
        return Ribbits.find({}, {sort: {created_at: -1}});
    },

    buddyFullName: function (ribbitUserId) {
        var theUser = Meteor.users.findOne({_id: ribbitUserId});
        return theUser.profile.name;
    },

    buddyUserName: function (ribbitUserId) {
        var theUser = Meteor.users.findOne({_id: ribbitUserId});
        return theUser.username;
    },

    elapsedTime: function (text) {
        var currentDate = new Date(),
            ribbitDate,
            minutes_elapsed,
            hours_elapsed,
            days_elapsed,
            retVal,
            record = Ribbits.findOne({ribbit: text});

        ribbitDate = new Date(record.created_at);
        minutes_elapsed = (currentDate - ribbitDate) / 60000;
        if (minutes_elapsed > 60) {
            hours_elapsed = minutes_elapsed / 60;
            if (hours_elapsed > 24) {
                days_elapsed = hours_elapsed / 24;
                retVal = parseInt(days_elapsed, 10) + "d";
            } else {
                retVal = parseInt(hours_elapsed, 10) + "h";
            }
        } else {
            retVal = parseInt(minutes_elapsed, 10) + "m";
        }
        return retVal;
    }
});

Template.content.helpers({
    currentPage: function (type) {
        var thePage = Session.get("currentPage");
        return thePage === type;
    },

    testhelper: "abcdefghijklmnopqrstuvwxyz"
});

Template.profile.helpers({
    users: function () {
        if (Session.get('searchedName') !== undefined) {
            return Meteor.users.find({
                $and: [
                    {_id: {$ne: Meteor.userId()}},
                    {username: Session.get('searchedName')}
                ]
            });
        } else {
            return Meteor.users.find({_id: {$ne: Meteor.userId()}});
        }
    },

    followText: function (userId) {
        var followee = Follows.findOne({
            $and: [
                {followee_id: Meteor.userId()},
                {user_id: userId}
            ]
        });
        if (followee) {
            return 'unfollow';
        } else {
            return 'follow';
        }
    },

    publicUserFull: function (currentRibbitId) {
        var theUser = Meteor.users.findOne({_id: currentRibbitId});

        return theUser.profile.name;
    },

    lastRibbit: function (id) {
        var lastRibbit = Ribbits.findOne({user_id: id}, {sort: {created_at: -1}}),
            retVal;

        if (lastRibbit) {
            retVal = lastRibbit.ribbit;
        } else {
            retVal = 'This user has no Ribbits';
        }

        return retVal;
    }
});

Template.public.helpers({
    ribbits: function () {
        return Ribbits.find({}, {sort: {created_at: -1}});
    },

    publicUserFull: function (currentRibbitId) {
        var theUser = Meteor.users.findOne({_id: currentRibbitId});

        return theUser.profile.name;
    },

    publicUserName: function (currentRibbitId) {
        var theUser = Meteor.users.findOne({_id: currentRibbitId});

        return theUser.username;
    },

    elapsedTime: function (text) {
        var currentDate = new Date(),
            ribbitDate,
            minutes_elapsed,
            hours_elapsed,
            days_elapsed,
            retVal,
            record = Ribbits.findOne({ribbit: text});

        ribbitDate = new Date(record.created_at);
        minutes_elapsed = (currentDate - ribbitDate) / 60000;
        if (minutes_elapsed > 60) {
            hours_elapsed = minutes_elapsed / 60;
            if (hours_elapsed > 24) {
                days_elapsed = hours_elapsed / 24;
                retVal = parseInt(days_elapsed, 10) + "d";
            } else {
                retVal = parseInt(hours_elapsed, 10) + "h";
            }
        } else {
            retVal = parseInt(minutes_elapsed, 10) + "m";
        }
        return retVal;
    }
});

Session.set("currentPage", "buddies");

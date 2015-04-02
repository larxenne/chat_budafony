Messages = new Mongo.Collection("messages");

if (Meteor.isClient) {

  Meteor.subscribe("messages");

  Template.body.helpers({
    messages:function() {
      return Messages.find({}, {sort: {createdAt: -1}});
    }


  });

  Template.body.events({
    'submit .new-message': function (event) {

      var text = document.getElementById("message").value;
      var target = document.getElementById("target").value;

      console.log(message);

      Meteor.call("addMessage", text, target);

      event.target.text.value = "";
      return false;
    }
  });


  Template.message.helpers({
    isOwner: function() {
      return this.owner === Meteor.userId();
    }
  });


  Template.message.events({
    "click .delete": function(event){
      Meteor.call("deleteMessage", this._id);

      var user = Meteor.user().username;

      console.log(user);
    },

    'submit .new-answer': function(event) {

      var answer = event.target.answer.value;

      if (this.owner === Meteor.userId()) {
        var target = this.target;
      }
      else {
        var target = this.owner_username;
      }
      

      Meteor.call("addAnswer", this._id, target, answer)

      return false;
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {

    Meteor.publish("messages", function() {

      var user = Meteor.users.findOne(this.userId);

      return Messages.find({
        $or: [
        { target: user.username},
        { owner: user._id}
        ]
      });
    })
  });
}

Meteor.methods({

  addMessage: function(text, target) {

    isConnected();

    var user = Meteor.users.findOne(this.userId);

    Messages.insert({
      text: text,
      owner: Meteor.userId(),
      owner_username: user.username, 
      target: target,
      createdAt: new Date()
    })
  },

  deleteMessage: function(taskId) {

    isOwner(taskId);

    Messages.remove(taskId);

  },

  addAnswer: function (taskId, target, answer) {
    isConnected(taskId);

    var user = Meteor.users.findOne(this.userId);

    Messages.insert({
      text: answer,
      owner: Meteor.userId(),
      owner_username: user.username,
      parent: taskId,
      target: target,
      createdAt: new Date()
    })
  },
});

function isConnected() {
  if (! Meteor.userId()) {
    throw new Meteor.Error("not-authorized");
  }
}

function isOwner(taskId) {

  var message = Messages.findOne(taskId);

  if (message.owner !== Meteor.userId()) {
    throw new Meteor.Error("not-authorized");
  }
}
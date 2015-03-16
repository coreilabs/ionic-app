angular.module('app')

.controller('PollsCtrl', function($scope, PollSrv,UserSrv){
  'use strict';

  var fn = {};
  $scope.displayForm = false;
  $scope.fn = fn;
  $scope.polls = [];

  $scope.choices = [
	  {
	  	id : 'choice1'
	  },
	  {
	  	id : 'choice2'
	  }
  ];

    fn.init = function(){
      UserSrv.getCurrent().then(function(user){
        $scope.user = user;
        fn.getAroundPolls();
      });
    };

  $scope.selectedChoices = {};

  fn.initForm = function(){
  	$scope.displayForm = true;
  };

  fn.addChoice = function(){
  	var newIdChoice = $scope.choices.length + 1;
  	$scope.choices.push({
  		id : 'choice' + newIdChoice
  	});
  };

  fn.removeChoice = function(id){
  	$scope.choices = _.filter($scope.choices, function(elt){
  		return elt.id !== id;
  	});
  };

  fn.submitForm = function(poll){
    poll.choices = $scope.choices;
  	UserSrv.getCurrent().then(function(user){
  		PollSrv.setPollsData(poll, user);
  	});

  };

    //get Active Polls.
  fn.getAroundPolls = function(){
  	PollSrv.getPollsAround().then(function(polls){
      fn.getAnswers(polls);

    });
  };
    //get Answers for active polls
    fn.getAnswers = function(polls){
      $scope.polls = polls;
      PollSrv.getAnwsersForPolls(polls).then(function(result){
        $scope.polls = result;
        console.log(result);

      });
    };


  fn.submitChoice = function(poll, choices){
  	var selected = null;
  	if(poll.singleChoise === true){
  		  selected = _.filter(choices, {selected : "selected"});
  	}else{
  		selected = _.filter(choices, {selected:true});
  	}
    UserSrv.getCurrent().then(function(user){

      PollSrv.saveAnswer(poll,selected,user).then(function(result){
        console.log(result);
        $scope.polls[_.findIndex($scope.polls, {'pollid' : poll.objectId})] = result;
      });

    });
  };

 fn.init();

    fn.getIndexBy$Id = function(poll, choiceId){
      console.log("totot");
      console.log("index", _.findIndex(poll.answersStats,function(chr){ return chr.$id == choiceId;}));
      return  _.findIndex(poll.answersStats,function(chr){ return chr.$id == choiceId;});
    };

    fn.getValue = function(array, index){
      if(index < 0){
        return 0;
      }
      return array[index].$value;
    }


});
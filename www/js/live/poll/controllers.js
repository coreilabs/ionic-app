angular.module('app')

.controller('PollsCtrl', function($scope, PollSrv,UserSrv, $state){
  'use strict';
  var fn = {};

  $scope.fn = fn;
  $scope.polls = [];
    $scope.initiated = false;

    $scope.lastUpdate = Date.now();

  fn.init = function(){
    $scope.initiated = false;
    UserSrv.getCurrent().then(function(user){
      $scope.user = user;
      fn.getAroundPolls();
    });
  };

    //get Active Polls.
  fn.getAroundPolls = function(lastUpdate){
  	return PollSrv.getPollsAround().then(function(polls){
      fn.getAnswers(polls);

    });
  };
    //get Answers for active polls
    fn.getAnswers = function(polls){
      $scope.initiated = true;
      $scope.polls = polls;
      $scope.loadingAnswers = true;
      PollSrv.getAnwsersForPolls(polls,$scope.user).then(function(result){
        $scope.loadingAnswers = false;
        $scope.polls = result;
        $scope.lastUpdated = Date.now();

        console.log(result);

      });
    };

    fn.refresh = function(){
      fn.getAroundPolls($scope.lastUpdate).then(function(result) {
        if(result !== undefined){
          $scope.polls.push(result);
        }
      }).finally(function(){
        $scope.$broadcast('scroll.refreshComplete');
      });
    };
    fn.getSelectedChoice = function(poll, choices){
      var selected = null;
      if(poll.singleChoise === true){
        selected = _.filter(choices, {selected : "selected"});
      }else{
        selected = _.filter(choices, {selected:true});
      }
      return selected;
    };
    fn.submitChoice = function(poll, choices){
      var selected = fn.getSelectedChoice(poll, choices);
      UserSrv.getCurrent().then(function(user){
        PollSrv.saveAnswer(poll,selected,user).then(function(result){
          $scope.polls[_.findIndex($scope.polls, {'pollid' : poll.objectId})] = result;
        });

      });
    };
    $scope.$on('$ionicView.enter', function() {
      fn.init();
    });

  fn.getIndexBy$Id = function(poll, choiceId){
    return  _.findIndex(poll.answersStats,function(chr){ return chr.$id == choiceId;});
  };

  fn.getValue = function(array, index){
    if(index < 0){
      return 0;
    }
    return array[index].$value;
  };
    fn.create = function(){
      $state.go('app.live.pollcreate');
    };

    fn.getPercent = function(poll, choiceid){
      var nbVotes = fn.getValue(poll.answersStats,fn.getIndexBy$Id(poll, choiceid));
      var totalVotes = fn.getValue(poll.answersStats,fn.getIndexBy$Id(poll, 'totalVotes'));
      return parseInt( (nbVotes / totalVotes) * 100);
  };

})
.controller('PollCreationCtrl', function($scope, PollSrv,UserSrv, $state) {
  'use strict';
    var fn = {};
    $scope.fn = fn;
    $scope.choices = [
      {
        id : 'choice1'
      },
      {
        id : 'choice2'
      }
    ];

    $scope.choiceId = 2;

    fn.addChoice = function(){
      $scope.choiceId++;
      $scope.choices.push({
        id : 'choice' + $scope.choiceId
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
        PollSrv.setPollsData(poll, user).then(function(result){
          $state.go('app.live.polls')
        });
      });
    };
});

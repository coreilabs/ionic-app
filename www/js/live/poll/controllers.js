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

    fn.create = function(){
      $state.go('tabs.pollcreate');
    };

  fn.getIndexBy$Id = function(poll, choiceId){
    return  PollSrv.getIndexBy$Id(poll, choiceId);
  };

  fn.getValue = function(array, index){
    return PollSrv.getValue(array, index);
  };

    fn.create = function(){
      $state.go('app.live.pollcreate');
    };

    fn.getPercent = function(poll, choiceid){
      return PollSrv.getPercent(poll, choiceid);
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
})
  .controller('MyPollCtrl', function(PollSrv, UserSrv, $scope){
    'use strict';
    var fn = {};
    $scope.fn = fn;
    $scope.initiated = false;

    UserSrv.getCurrent().then(function(user) {
      fn.init(user);
    });

    fn.init = function(user){
      $scope.user = user;
      PollSrv.getPollsByUser(user).then(function(polls){
        $scope.initiated = true;
        $scope.polls = polls;
        PollSrv.getAnwsersForPolls(polls, $scope.user).then(function(result){
          $scope.polls = result;
        })
      });
    };
    fn.getIndexBy$Id = function(poll, choiceId){
      return  PollSrv.getIndexBy$Id(poll, choiceId);
    };

    fn.getValue = function(array, index){
      return PollSrv.getValue(array, index);
    };
    $scope.$on('$ionicView.enter', function() {
      $scope.initiated = false;
      $scope.polls = {};
      UserSrv.getCurrent().then(function(user) {
        fn.init(user);
      });
    });
  })
  .controller('PollCtrl', function(PollSrv,UserSrv, $scope, $stateParams, $state){
    'use strict';
    var fn = {};
    $scope.fn = fn;
    $scope.initiated = false;

    UserSrv.getCurrent().then(function(user){
      fn.init(user);
    });

    fn.init = function(user){
      $scope.user = user;
      fn.getDetails($stateParams.poll);
    };

    fn.getDetails = function(pollId){
      PollSrv.getPollById(pollId).then(function(poll){
        if(poll !== undefined){
          $scope.initiated = true;
          $scope.poll = poll;
          PollSrv.getAnswers(poll, $scope.user).then(function(result){
            $scope.poll = result;
          });
        }else{
          //!TODO How to deal with error?
          alert('Erreur');
        }
      });
    };

    fn.remove = function(poll){
      $scope.deleting = true;
      PollSrv.remove(poll).then(function(result){
        if(result === false){
          alert('Erreur');
        }
        $state.go('tabs.mypoll');
      });
    };

    fn.getIndexBy$Id = function(poll, choiceId){
      return  PollSrv.getIndexBy$Id(poll, choiceId);
    };

    fn.getValue = function(array, index){
      return PollSrv.getValue(array, index);
    };

    fn.getPercent = function(poll, choiceid){
      return PollSrv.getPercent(poll, choiceid);
    };
  });

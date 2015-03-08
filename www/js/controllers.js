angular.module('app')

.controller('TabsCtrl', function($scope, $state, $ionicPopover, $ionicModal, TabSrv, UserSrv, ToastPlugin){
  'use strict';
  var loaded = false; // TODO : $ionicView.loaded is fired twice... :(
  $scope.$on('$ionicView.loaded', function(){
    if(!loaded){
      loaded = true;
      UserSrv.updatePosition();
    }
  });
  $scope.$on('$ionicView.enter', function(){
    UserSrv.getCurrent().then(function(user){
      $scope.user = user;
    });
  });
  $scope.$on('$ionicView.leave', function(){
    delete $scope.user;
  });

  $scope.badges = TabSrv.badges;

  $ionicPopover.fromTemplateUrl('views/partials/menu-popover.html', {
    scope: $scope
  }).then(function(popover){
    $scope.menuPopover = popover;
  });
  $ionicModal.fromTemplateUrl('views/partials/profile-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.profileModal = modal;
  });
  /*$ionicModal.fromTemplateUrl('views/partials/notifications-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.notificationsModal = modal;
  });*/

  $scope.logout = function(){
    UserSrv.logout().then(function(){
      $state.go('login_welcome');
    });
  };

  var welcomeSentences = [
    'If you want to achieve greatness stop asking for permission',
    'Mistakes are proof that you are trying',
    'Always be positive !',
    'Stay focused and never give up',
    'Sometimes you win, sometimes you learn'
  ];
  $scope.$watch('user.active', function(value, oldValue){
    if(value !== oldValue && oldValue !== undefined){
      UserSrv.updateStatus(value);
      if(value){
        ToastPlugin.show(welcomeSentences[Math.floor(Math.random()*welcomeSentences.length)]);
      } else {
        ToastPlugin.show('A bientôt :)');
      }
    }
  });

  $scope.$on('$destroy', function(){
    if($scope.menuPopover)  { $scope.menuPopover.remove();  }
    if($scope.profileModal) { $scope.profileModal.remove(); }
  });
})

.controller('UsersCtrl', function($scope, TabSrv, UserSrv, UsersSrv){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  $scope.$on('$ionicView.enter', function(){
    if(!data.users){
      fn.refresh();
    }
  });

  fn.refresh = function(){
    UserSrv.getCurrent().then(function(user){
      if(user.active){
        UsersSrv.getNearUsers().then(function(users){
          TabSrv.badges.users = users.length;
          data.users = users;
          $scope.$broadcast('scroll.refreshComplete');
        });
        UserSrv.updatePosition();
      } else {
        $scope.$broadcast('scroll.refreshComplete');
      }
    });
  };

  $scope.$watch('user.active', function(value, oldValue){
    if(value !== oldValue && oldValue !== undefined){
      if(value){
        fn.refresh();
      } else {
        TabSrv.badges.users = 0;
        delete data.users;
      }
    }
  });
})

.controller('UserCtrl', function($scope, $state, $stateParams, UserSrv, UsersSrv, RelationsSrv, ToastPlugin){
  'use strict';
  var userId = $stateParams.id;
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.user = null;
  data.relation = null;
  UserSrv.getCurrent().then(function(currentUser){
    data.currentUser = currentUser;
  });
  UsersSrv.get(userId).then(function(user){
    if(user){
      console.log('user', user);
      data.user = user;
      RelationsSrv.get(user).then(function(relation){
        console.log('relation', relation);
        data.relation = relation;
      });
    } else {
      $state.go('tabs.users');
    }
  });

  fn.hasNoRelation = function(relation){ return relation !== null && !relation; };
  fn.hasRelation = function(relation){ return relation !== null && !!relation; };
  fn.isInitiator = function(relation, user){ return relation && relation.from && relation.from.objectId === user.objectId; };
  fn.isPending = function(relation){ return relation && relation.status === RelationsSrv.status.INVITED; };
  fn.isAccepted = function(relation){ return relation && relation.status === RelationsSrv.status.ACCEPTED; };
  fn.isDeclined = function(relation){ return relation && relation.status === RelationsSrv.status.DECLINED; };

  fn.invite = function(user){
    RelationsSrv.invite(user).then(function(relationCreated){
      data.relation = relationCreated;
      ToastPlugin.show('Invitation envoyée :)');
    });
  };
  fn.acceptInvite = function(relation){
    RelationsSrv.acceptInvite(relation).then(function(){
      data.relation.status = RelationsSrv.status.ACCEPTED;
      ToastPlugin.show('Invitation acceptée :)');
    });
  };
  fn.declineInvite = function(relation){
    RelationsSrv.declineInvite(relation).then(function(){
      data.relation.status = RelationsSrv.status.DECLINED;
      ToastPlugin.show('Invitation refusée :(');
    });
  };
})

.controller('ChatsCtrl', function($scope){
  'use strict';
})

.controller('PollsCtrl', function($scope){
  'use strict';
})

.controller('IssuesCtrl', function($scope){
  'use strict';
})

/*.controller('NotificationsCtrl', function($scope, UserSrv, PushPlugin, ToastPlugin){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.notifications = [];
  // /!\ To use this, you should add Push plugin : ionic plugin add https://github.com/phonegap-build/PushPlugin
  PushPlugin.onNotification(function(notification){
    notification.time = new Date();
    data.notifications.push(notification);
  });

  fn.sendPush = function(infos){
    UserSrv.getCurrent().then(function(user){
      PushPlugin.sendPush([user.pushId], infos).then(function(sent){
        if(sent){
          ToastPlugin.show('Notification posted !');
        }
      });
    });
  };
})*/;

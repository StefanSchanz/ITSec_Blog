var app = angular.module("DataManagerApp", []);

app.controller("UserDataController", function ($scope) {
  $scope.data = [];
  $scope.request = function () {
    setTimeout(() => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/getUsers", true);
      xhr.responseText = "text";
      xhr.onload = function () {
        if (xhr.readyState == xhr.DONE) {
          if (xhr.status == 200) {
            var obj = JSON.parse(xhr.responseText);
            $scope.$apply(function () {
              $scope.data = obj;
            });
            console.log("output: ", $scope.data);
          }
        }
      };
      xhr.send();
    });
  };
  $scope.sendrequest = setTimeout($scope.request, 100);
});

app.controller("BlogDataController", function ($scope) {
  $scope.data = [];
  $scope.request = function () {
    setTimeout(() => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/getBlogEntries", true);
      xhr.responseText = "text";
      xhr.onload = function () {
        if (xhr.readyState == xhr.DONE) {
          if (xhr.status == 200) {
            var obj = JSON.parse(xhr.responseText);
            $scope.$apply(function () {
              $scope.data = obj;
            });
          }
        }
      };
      xhr.send();
    });
  };
  $scope.sendrequest = setTimeout($scope.request, 100);
});

app.controller("LoginController", function ($scope) {
  $scope.data = "";
  $scope.request = function () {
    setTimeout(() => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/getloggeduser", true);
      xhr.responseText = "text";
      xhr.onload = function () {
        if (xhr.readyState == xhr.DONE) {
          if (xhr.status == 200) {
            var obj = xhr.responseText;
            if (obj.length) {
              $scope.$apply(function () {
                $scope.data = obj;
              });
            }
          }
        }
      };
      xhr.send();
    });
  };
  $scope.logout = function () {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/logout", false);
    xhr.send();
    $scope.data = "";
  };
  $scope.sendrequest = setTimeout($scope.request, 100);
});

app.controller("BlogDataUserController", function ($scope) {
  $scope.data = [];
  $scope.request = function () {
    setTimeout(() => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/listBlogs", true);
      xhr.responseText = "text";
      xhr.onload = function () {
        if (xhr.readyState == xhr.DONE) {
          if (xhr.status == 200) {
            var obj = JSON.parse(xhr.responseText);
            console.log(obj);
            $scope.$apply(function () {
              $scope.data = obj;
            });
          }
        }
      };
      xhr.send();
    });
  };

  $scope.delete = function (id_blog) {
    console.log(id_blog);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/deleteBlogEntry", false);
    xhr.setRequestHeader("Content-Type", "application/json");
    var sendstr = JSON.stringify({ id_blog: id_blog });
    console.log(sendstr);
    xhr.send(sendstr);
  };

  $scope.sendrequest = setTimeout($scope.request, 100);
});

app.controller("");
